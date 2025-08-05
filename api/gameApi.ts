import axios from 'axios';

const BASE_URL = 'http://189.60.85.209:5000'; // Mude se seu backend rodar em outro host/porta

export interface CreateRoomResponse {
  room_key: string;
  first_player_token: string;
}

export interface JoinRoomResponse {
  second_player_token: string;
}

export async function createRoom(): Promise<CreateRoomResponse> {
  const response = await axios.get(`${BASE_URL}/create_room`);
  return response.data;
}

export async function joinRoom(roomKey: string): Promise<JoinRoomResponse> {
  const response = await axios.get(`${BASE_URL}/join_room/${roomKey}`);
  return response.data;
}

export async function renderInfo(roomKey: string, playerToken: string) {
  const response = await axios.get(`${BASE_URL}/render_info`, {
    params: { room_key: roomKey, player_token: playerToken },
  });
  return response.data;
}
