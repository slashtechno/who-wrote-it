import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import { GameState, GamePhase, Prompt, Response, Guess } from "./types";
import { generateStuff } from "./ai";

let lobbies: {
  id: string;
  joinCode: string;
  players: { id: string; name: string; }[];
  gameState: GameState;
}[] = [];

// Helper functions to manage lobbies
export function getAllLobbies() {
  return [...lobbies];
}

export function addLobby(lobby: typeof lobbies[0]) {
  lobbies.push(lobby);
}

export function removeLobby(lobbyId: string) {
  const index = lobbies.findIndex(l => l.id === lobbyId);
  if (index !== -1) {
    lobbies.splice(index, 1);
  }
}

export function updateLobby(lobbyId: string, updates: Partial<typeof lobbies[0]>) {
  const lobby = lobbies.find(l => l.id === lobbyId);
  if (lobby) {
    Object.assign(lobby, updates);
  }
}

// Fallback prompts if AI fails
const FALLBACK_PROMPTS = [
  "What would be the worst superpower to have?",
  "If you could only eat one food for the rest of your life, what would it be?",
  "What's the most embarrassing thing that happened to you in school?",
  "If you could time travel, what year would you go to and why?",
  "What's the weirdest dream you've ever had?",
  "If you had to describe yourself using only three words, what would they be?",
  "What's the most ridiculous thing you've ever bought?",
  "If you could be any fictional character for a day, who would you be?"
];

export function createLobby(adminName: string) {
  const id = uuidv4();
  const joinCode = nanoid(6);
  const adminPlayerId = uuidv4();
  const lobby = { 
    id, 
    joinCode, 
    players: [{ id: adminPlayerId, name: adminName }],
    gameState: createInitialGameState()
  };
  
  addLobby(lobby);
  
  return { id, joinCode, players: lobby.players };
}

export function joinLobby(joinCode: string, playerName: string) {
  const lobby = getAllLobbies().find(l => l.joinCode === joinCode);
  if (!lobby) throw new Error("Lobby not found");
  
  lobby.players.push({ id: uuidv4(), name: playerName });
  return { id: lobby.id, joinCode: lobby.joinCode, players: lobby.players };
}

export async function startGame(lobbyId: string) {
  const lobby = getAllLobbies().find(l => l.id === lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.players.length < 2) throw new Error("Need at least 2 players");
  
  // Always try AI first (with its own 10s timeout inside generateStuff),
  // and keep the example response for later use.
  const ai = await generateStuff();
  const promptText = ai.prompt ?? FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];
  
  // Pick a random player to sit out (AI round)
  const randomIndex = Math.floor(Math.random() * lobby.players.length);
  const sittingOutPlayer = lobby.players[randomIndex];
  
  // Clear any existing game state and start fresh
  lobby.gameState = {
    phase: 'writing',
    currentPrompt: {
      id: uuidv4(),
      text: promptText
    },
    responses: [],
    guesses: [],
    sittingOutPlayerId: sittingOutPlayer.id,
    roundNumber: 1,
    aiExampleResponse: ai.example_response ?? null
  };
  
  return lobby.gameState;
}

export function submitResponse(lobbyId: string, playerId: string, responseText: string) {
  const lobby = getAllLobbies().find(l => l.id === lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.gameState.phase !== 'writing') throw new Error("Game not in writing phase");
  
  // Verify the player is still in the lobby
  const player = lobby.players.find(p => p.id === playerId);
  if (!player) throw new Error("Player not found in lobby");
  
  // Check if this player already submitted
  const existingResponse = lobby.gameState.responses.find(r => r.playerId === playerId);
  if (existingResponse) throw new Error("Player already submitted response");
  
  // Add player response
  const response: Response = {
    id: uuidv4(),
    text: responseText,
    playerId: playerId,
    isAI: false
  };
  
  lobby.gameState.responses.push(response);
  
  // Check if all players (except sitting out) have responded
  const activePlayers = lobby.players.filter(p => p.id !== lobby.gameState.sittingOutPlayerId);
  if (lobby.gameState.responses.length === activePlayers.length) {
    // Use AI example response from prompt phase; if missing, use simple fallback text
    const aiText = lobby.gameState.aiExampleResponse ?? "This reminds me of similar scenarios I've encountered in my training data.";
    const aiResponse: Response = {
      id: uuidv4(),
      text: aiText,
      playerId: null,
      isAI: true
    };
    lobby.gameState.responses.push(aiResponse);
    lobby.gameState.phase = 'guessing';
  }
  
  return response;
}

export function submitGuess(lobbyId: string, responseId: string, guessedPlayerId: string | null, guessingPlayerId: string) {
  const lobby = getAllLobbies().find(l => l.id === lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.gameState.phase !== 'guessing') throw new Error("Game not in guessing phase");
  
  // Verify the guessing player is still in the lobby
  const guessingPlayer = lobby.players.find(p => p.id === guessingPlayerId);
  if (!guessingPlayer) throw new Error("Player not found in lobby");
  
  // Check if this player already guessed this response
  const existingGuess = lobby.gameState.guesses.find(g => 
    g.responseId === responseId && g.guessingPlayerId === guessingPlayerId
  );
  if (existingGuess) throw new Error("Player already guessed this response");
  
  // Add guess
  const guess: Guess = {
    id: uuidv4(),
    responseId,
    guessedPlayerId,
    guessingPlayerId
  };
  
  lobby.gameState.guesses.push(guess);
  
  // Check if all players have guessed all responses
  const totalGuessesNeeded = lobby.players.length * lobby.gameState.responses.length;
  if (lobby.gameState.guesses.length === totalGuessesNeeded) {
    lobby.gameState.phase = 'results';
  }
  
  return guess;
}

export function resetGame(lobbyId: string) {
  const lobby = getAllLobbies().find(l => l.id === lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  
  lobby.gameState = createInitialGameState();
  return lobby.gameState;
}


export function getLobby(lobbyId: string) {
  const lobby = getAllLobbies().find(l => l.id === lobbyId);
  
  if (!lobby) return null;
  
  // Ensure backward compatibility for existing lobbies
  if (!lobby.gameState) {
    lobby.gameState = createInitialGameState();
  }
  
  return lobby;
}

function createInitialGameState(): GameState {
  return {
    phase: 'waiting',
    currentPrompt: null,
    responses: [],
    guesses: [],
    sittingOutPlayerId: null,
    roundNumber: 0
  };
}
