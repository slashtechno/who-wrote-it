export type CreateLobbyRequest = { playerName: string; };
export type CreateLobbyResponse = { id: string; joinCode: string; players: { id: string; name: string; }[]; };

export type JoinLobbyRequest = { joinCode: string; playerName: string; };
export type JoinLobbyResponse = { id: string; joinCode: string; players: { id: string; name: string; }[]; };

export type ErrorResponse = { error: string; };
export type JoinLobbyApiResponse = JoinLobbyResponse | ErrorResponse; 

// Game types
export type GamePhase = 'waiting' | 'writing' | 'guessing' | 'results';

export type Prompt = {
  id: string;
  text: string;
};

export type Response = {
  id: string;
  text: string;
  playerId: string | null; // null means AI generated
  isAI: boolean;
};

export type Guess = {
  id: string;
  responseId: string;
  guessedPlayerId: string | null; // null means AI
  guessingPlayerId: string;
};

export type GameState = {
  phase: GamePhase;
  currentPrompt: Prompt | null;
  responses: Response[];
  guesses: Guess[];
  sittingOutPlayerId: string | null;
  roundNumber: number;
  aiExampleResponse?: string | null;
}; 