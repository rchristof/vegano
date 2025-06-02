'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { renderInfo } from '../api/gameApi';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

// ---------- Tipos -----------
interface CartaType {
  name: string;
  image?: string;
  id: UniqueIdentifier;
}

// ---------- DropZone ----------
const DropZone: React.FC<{
  id: string;
  isActiveDrop?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}> = ({ id, isActiveDrop, disabled, children }) => {
  const { setNodeRef, isOver } = require('@dnd-kit/core').useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[150px] min-w-[300px] md:min-h-[180px] md:min-w-[500px] rounded-2xl border-4
        ${isActiveDrop && isOver && !disabled ? 'border-purple-600 bg-purple-100/60' : 'border-gray-300 bg-white/30'}
        flex items-center justify-center transition-all duration-150 relative`}
      style={{ minHeight: '20vh', minWidth: '60vw', opacity: disabled ? 0.5 : 1 }}
    >
      {children}
      {disabled && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl pointer-events-none z-10">
          <span className="text-white text-xl font-bold">Aguarde sua vez</span>
        </div>
      )}
    </div>
  );
};

// ---------- Carta Draggable ----------
function DraggableCarta({
  id,
  carta,
  isActive,
  onHover,
  onUnhover,
  hovered,
  disabled,
}: {
  id: UniqueIdentifier;
  carta: CartaType;
  isActive?: boolean;
  onHover?: () => void;
  onUnhover?: () => void;
  hovered?: boolean;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  // Desabilita drag se não for sua vez
  const listenersSafe = disabled ? {} : listeners;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isActive ? 50 : 1,
      }}
      {...attributes}
      {...listenersSafe}
      className={`w-20 h-32 rounded-lg shadow-lg border-2 border-gray-300 bg-gradient-to-br from-white to-gray-200 flex items-center justify-center cursor-grab select-none transition-transform duration-150
        ${isActive ? 'scale-110 border-purple-600' : ''}
        ${hovered ? 'scale-125 border-blue-400 shadow-2xl' : ''}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}
      `}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
    >
      <span className="font-semibold text-xs text-center text-gray-700 pointer-events-none">
        {carta.name}
      </span>
    </div>
  );
}

// ---------- Mao arqueada (sutil e espaçada) ----------
const MaoArqueada: React.FC<{
  cartas: CartaType[];
  activeId: UniqueIdentifier | null;
  onHover: (idx: number) => void;
  onUnhover: () => void;
  hoveredIdx: number | null;
  disabled?: boolean;
}> = ({ cartas, activeId, onHover, onUnhover, hoveredIdx, disabled }) => {
  // Leve arqueado: -8° até 8°
  const minAngle = -8;
  const maxAngle = 8;
  const n = cartas.length;
  const angleStep = n > 1 ? (maxAngle - minAngle) / (n - 1) : 0;

  return (
    <SortableContext
      items={cartas.map((carta) => carta.id)}
      strategy={horizontalListSortingStrategy}
    >
      <div className="flex justify-center items-end gap-6 relative" style={{ height: 150 }}>
        {cartas.map((carta, idx) => {
          if (activeId === carta.id)
            return <div key={carta.id as string} style={{ width: 80, height: 128 }} />;
          const angle = minAngle + idx * angleStep;
          return (
            <div
              key={carta.id as string}
              style={{
                transform: `rotate(${angle}deg)`,
                zIndex: 10 + idx,
                transition: 'transform 0.15s',
              }}
              className="relative"
            >
              <DraggableCarta
                id={carta.id}
                carta={carta}
                isActive={activeId === carta.id}
                onHover={() => onHover(idx)}
                onUnhover={onUnhover}
                hovered={hoveredIdx === idx}
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
    </SortableContext>
  );
};

// ---------- MaoOponente (verso das cartas) ----------
const MaoOponente: React.FC<{ quantidade: number }> = ({ quantidade }) => (
  <div className="flex gap-2 mb-2">
    {Array.from({ length: quantidade }).map((_, idx) => (
      <div
        key={idx}
        className="w-12 h-16 bg-gray-700 rounded-lg shadow flex items-center justify-center border-2 border-gray-500"
      >
        <div className="w-8 h-12 bg-gray-300 rounded-sm" />
      </div>
    ))}
  </div>
);

// ---------- MesaDeJogo principal ----------
const MesaDeJogo: React.FC = () => {
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [mao, setMao] = useState<CartaType[]>([]);
  const [maoOponenteCount, setMaoOponenteCount] = useState<number>(0);
  const [playerField, setPlayerField] = useState<CartaType[]>([]);
  const [opponentField, setOpponentField] = useState<CartaType[]>([]);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [yourTurn, setYourTurn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Drag and drop
  const sensors = useSensors(useSensor(PointerSensor));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeCard, setActiveCard] = useState<CartaType | null>(null);
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  // Hover da carta
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Mapeia cartas do backend para garantir id único e estável
  function mapCartas(rawCartas: any[]): CartaType[] {
    return (rawCartas || []).map((carta: any) => ({
      ...carta,
      id: carta.id || uuidv4(),
    }));
  }

  // --- fetchMesa otimizado (para uso em vários lugares) ---
  const fetchMesa = useCallback(async () => {
    if (roomKey && playerToken) {
      try {
        const data = await renderInfo(roomKey, playerToken);
        setMao(mapCartas(data.player_hand));
        setMaoOponenteCount(data.opponent_hand_count || 0);
        setPlayerField(mapCartas(data.player_field));
        setOpponentField(mapCartas(data.opponent_field));
        setPlayerScore(data.player_score || 0);
        setOpponentScore(data.opponent_score || 0);
        setYourTurn(data.your_turn ?? false);
      } catch (err) {
        setMao([]);
        setMaoOponenteCount(0);
        setPlayerField([]);
        setOpponentField([]);
        setPlayerScore(0);
        setOpponentScore(0);
        setYourTurn(false);
      }
      setLoading(false);
    }
  }, [roomKey, playerToken]);

  useEffect(() => {
    setRoomKey(localStorage.getItem('room_key'));
    setPlayerToken(localStorage.getItem('player_token'));
  }, []);

  // Atualiza a mesa periodicamente
  useEffect(() => {
    fetchMesa();
    const interval = setInterval(fetchMesa, 3500);
    return () => clearInterval(interval);
  }, [fetchMesa]);

  // Drag and drop handlers
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);
    setDraggingOver(null);

    if (!over) return;

    // Jogar carta: só permite se for sua vez e área certa
    if (over.id === 'player-field' && active.id && yourTurn) {
      const fromIdx = mao.findIndex((c) => c.id === active.id);
      if (fromIdx === -1) return;

      try {
        const params = new URLSearchParams({
          room_key: roomKey!,
          player_token: playerToken!,
          action: 'play',
          card_index: String(fromIdx),
        });
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/player_action?${params.toString()}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success) {
          await fetchMesa();
        } else {
          // alert(result.error || result.message || 'Jogada inválida');
        }
      } catch (e) {
        // alert('Erro ao jogar carta');
      }
      return;
    }

    // Reordenar cartas na mão (drag dentro da mão)
    if (over.id && active.id) {
      const oldIndex = mao.findIndex((c) => c.id === active.id);
      const newIndex = mao.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const novoArray = arrayMove(mao, oldIndex, newIndex);
        setMao(novoArray);
      }
    }
  };

  const handleDragOver = (event: any) => {
    setDraggingOver(event.over?.id || null);
  };

  const handleDragStart = ({ active }: any) => {
    setActiveId(active.id);
    const idx = mao.findIndex((c) => c.id === active.id);
    if (idx !== -1) setActiveCard(mao[idx]);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-400">Carregando mesa...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-green-800 via-green-700 to-green-900">
      {/* Pontuação */}
      <div className="absolute top-6 left-12 text-white text-lg font-semibold">
        Pontuação Adversário: {opponentScore}
      </div>
      <div className="absolute bottom-24 left-12 text-white text-lg font-semibold">
        Sua Pontuação: {playerScore}
      </div>

      {/* Mesa em si */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-auto py-10">
          {/* Área do adversário */}
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto mb-4">
            <MaoOponente quantidade={maoOponenteCount} />
            <DropZone id="opponent-field" isActiveDrop={false} disabled>
              <div className="flex gap-2">
                {opponentField.map((carta) => (
                  <div key={carta.id as string} className="w-20 h-32 rounded-lg shadow border bg-gray-100 flex items-center justify-center text-xs text-gray-500">{carta.name}</div>
                ))}
              </div>
            </DropZone>
          </div>
          {/* Campo do jogador */}
          <div className="flex flex-col items-center w-full max-w-5xl mx-auto">
            <DropZone id="player-field" isActiveDrop={yourTurn && draggingOver === 'player-field'} disabled={!yourTurn}>
              <div className="flex gap-2">
                {playerField.map((carta) => (
                  <div key={carta.id as string} className="w-20 h-32 rounded-lg shadow border bg-white flex items-center justify-center text-xs font-bold">{carta.name}</div>
                ))}
              </div>
            </DropZone>
          </div>
        </div>
        {/* Mão do jogador, colada embaixo da mesa */}
        <div className="fixed bottom-0 left-0 w-full flex justify-center pb-4 pointer-events-auto z-20">
          <MaoArqueada
            cartas={mao}
            activeId={activeId}
            hoveredIdx={hoveredIdx}
            onHover={setHoveredIdx}
            onUnhover={() => setHoveredIdx(null)}
            disabled={!yourTurn}
          />
        </div>
        {/* Overlay arrastável */}
        <DragOverlay>
          {activeCard ? (
            <div className="w-20 h-32 rounded-lg shadow-lg border-2 border-purple-600 bg-white flex items-center justify-center z-50 scale-125">
              <span className="font-semibold text-xs text-center text-gray-700">{activeCard.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default MesaDeJogo;
