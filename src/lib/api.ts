import { CreateLobbyRequest, CreateLobbyResponse, JoinLobbyRequest, JoinLobbyResponse, JoinLobbyApiResponse } from "./types";

const API_BASE = "/api";

export async function createLobby(data: CreateLobbyRequest): Promise<CreateLobbyResponse> {
  const response = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create lobby: ${response.statusText}`);
  }

  return response.json();
}

export async function joinLobby(data: JoinLobbyRequest): Promise<JoinLobbyResponse> {
  const response = await fetch(`${API_BASE}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to join lobby: ${response.statusText}`);
  }

  return response.json();
} 