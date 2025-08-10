// API Types
export type CreateLobbyRequest = {
  playerName: string;
};

export type CreateLobbyResponse = {
  id: string;
  joinCode: string;
};

export type JoinLobbyRequest = {
  joinCode: string;
};

export type JoinLobbyResponse = {
  id: string;
  joinCode: string;
  players: {
    id: string;
    name: string;
  }[];
};

export type ErrorResponse = {
  error: string;
};

export type JoinLobbyApiResponse = JoinLobbyResponse | ErrorResponse; 