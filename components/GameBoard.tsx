'use client';

import React, { useEffect, useState } from 'react';
import { renderInfo } from '../api/gameApi';
import MesaDeJogo from './MesaDeJogo'; // <-- Importe o componente real!

const GameBoard: React.FC = () => {
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [opponentPresent, setOpponentPresent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    setRoomKey(localStorage.getItem('room_key'));
    setPlayerToken(localStorage.getItem('player_token'));
  }, []);

  useEffect(() => {
    const fetchInfo = async () => {
      if (roomKey && playerToken) {
        try {
          const data = await renderInfo(roomKey, playerToken);
          const opponentJoined =
            (data.opponent_hand_count && data.opponent_hand_count > 0) ||
            (Array.isArray(data.opponent_field) && data.opponent_field.length > 0);
          setOpponentPresent(opponentJoined);
        } catch (err) {
          setOpponentPresent(false);
        }
      }
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 3000);
    return () => clearInterval(interval);
  }, [roomKey, playerToken]);

  const handleCopyRoomKey = () => {
    if (roomKey) {
      navigator.clipboard.writeText(roomKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlay = () => setShowOverlay(false);

  return (
    <div className="relative w-full h-screen">
      {/* Mesa de jogo REAL no fundo */}
      <MesaDeJogo />   {/* Agora este componente mostra cartas, mãos, campo, etc! */}

      {/* Overlay centralizado */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {/* Fundo blurado sobre a mesa */}
          <div className="fixed inset-0 backdrop-blur-md bg-white/40 z-0 transition-all" />

          {/* Painel central */}
          <div className="relative z-10 p-8 max-w-xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-2xl backdrop-blur-md border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Você está na sala:</h2>
            <div className="flex items-center mb-6">
              <span className="font-mono text-lg bg-gray-100 px-4 py-2 rounded border mr-2">{roomKey}</span>
              <button
                onClick={handleCopyRoomKey}
                className={`px-3 py-1 rounded text-white transition-colors duration-300 ${
                  copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="mb-3 text-gray-700">Envie o código acima para o outro jogador!</p>
            <hr className="my-6" />

            <div>
              <h3 className="font-semibold mb-2 text-gray-700">Jogadores na sala:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="rounded-full w-3 h-3 bg-green-500" />
                  <span className="font-semibold">Você</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className={`rounded-full w-3 h-3 ${opponentPresent ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="font-semibold">
                    {opponentPresent ? 'Jogador 2 conectado' : 'Aguardando outro jogador...'}
                  </span>
                </li>
              </ul>
            </div>

            <hr className="my-6" />
            <div className="mb-4 text-lg">
              <strong>Status do jogo:</strong>{' '}
              {opponentPresent ? (
                <span className="text-green-700 font-semibold">Jogo iniciado</span>
              ) : (
                <span className="text-gray-500 italic">Aguardando outro jogador...</span>
              )}
            </div>
            {opponentPresent && (
              <div className="mt-8 flex justify-center">
                <button
                  className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  onClick={handlePlay}
                >
                  Play
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
