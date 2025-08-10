import { CreateLobbyRequest, CreateLobbyResponse, JoinLobbyRequest, JoinLobbyResponse, JoinLobbyApiResponse } from "./types";

const API_BASE = "/api";
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export async function createLobby(data: CreateLobbyRequest): Promise<CreateLobbyResponse> {
  const response = await fetch(`${API_BASE}/create`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
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
    headers: DEFAULT_HEADERS,
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

export async function leaveLobby(data: { lobbyId: string; playerId: string }): Promise<void> {
  const response = await fetch(`${API_BASE}/leave`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to leave lobby: ${response.statusText}`);
  }
}

export async function startGame(data: { lobbyId: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/start-game`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to start game: ${response.statusText}`);
  }

  return response.json();
}

export async function submitResponse(data: { lobbyId: string; playerId: string; responseText: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/submit-response`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to submit response: ${response.statusText}`);
  }

  return response.json();
}

export async function submitGuess(data: { lobbyId: string; responseId: string; guessedPlayerId: string | null; guessingPlayerId: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/submit-guess`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to submit guess: ${response.statusText}`);
  }

  return response.json();
}

export async function resetGame(data: { lobbyId: string }): Promise<any> {
  const response = await fetch(`${API_BASE}/game-reset`, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to reset game: ${response.statusText}`);
  }

  return response.json();
}

export async function getLobby(lobbyId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/lobby-data/${lobbyId}`);

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error) {
      throw new Error(errorData.error);
    }
    throw new Error(`Failed to get lobby: ${response.statusText}`);
  }

  return response.json();
} 