'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom, joinRoom } from '../api/gameApi';

const RoomEntry: React.FC = () => {
  const [roomKey, setRoomKey] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const { room_key, first_player_token } = await createRoom();
      localStorage.setItem('room_key', room_key);
      localStorage.setItem('player_token', first_player_token);
      router.push('/game');
    } catch (err) {
      alert('Erro ao criar sala');
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    setLoading(true);
    try {
      const { second_player_token } = await joinRoom(roomKey.trim());
      localStorage.setItem('room_key', roomKey.trim());
      localStorage.setItem('player_token', second_player_token);
      router.push('/game');
    } catch (err) {
      alert('Erro ao entrar na sala');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto my-20 p-8 shadow-lg rounded-xl bg-white">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Jogo de Cartas</h1>
      <button onClick={handleCreateRoom} disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded mb-6 hover:bg-blue-700">
        Criar Sala
      </button>
      <hr className="my-6" />
      <input
        type="text"
        value={roomKey}
        onChange={e => setRoomKey(e.target.value.toUpperCase())}
        placeholder="Código da sala"
        className="w-full p-2 border rounded mb-3 text-center"
      />
      <button onClick={handleJoinRoom} disabled={!roomKey || loading} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Entrar na Sala
      </button>
    </div>
  );
};

export default RoomEntry;
