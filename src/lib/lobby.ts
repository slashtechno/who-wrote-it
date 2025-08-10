import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import { GameState, Response, Guess } from "./types";
import { generateStuff } from "./ai";
import { getRedis } from "./redis";

type Player = { id: string; name: string };
type Lobby = { id: string; joinCode: string; players: Player[]; gameState: GameState };

// Redis key helpers
const lobbyKey = (id: string) => `lobby:${id}`;
const joinCodeKey = (code: string) => `joinCode:${code}`;
const lobbySetKey = "lobbies"; // Redis Set of lobby ids

async function saveLobby(lobby: Lobby): Promise<void> {
  const redis = await getRedis();
  await redis.multi()
    .set(lobbyKey(lobby.id), JSON.stringify(lobby))
    .sAdd(lobbySetKey, lobby.id)
    .set(joinCodeKey(lobby.joinCode), lobby.id)
    .exec();
}

async function loadLobbyById(lobbyId: string): Promise<Lobby | null> {
  const redis = await getRedis();
  const data = await redis.get(lobbyKey(lobbyId));
  return data ? (JSON.parse(data) as Lobby) : null;
}

async function loadLobbyByJoinCode(code: string): Promise<Lobby | null> {
  const redis = await getRedis();
  const lobbyId = await redis.get(joinCodeKey(code));
  if (!lobbyId) return null;
  return loadLobbyById(lobbyId);
}

// Helper functions to manage lobbies
export async function getAllLobbies(): Promise<Lobby[]> {
  const redis = await getRedis();
  const ids = await redis.sMembers(lobbySetKey);
  if (ids.length === 0) return [];
  const pipeline = redis.multi();
  for (const id of ids) {
    pipeline.get(lobbyKey(id));
  }
  const results = await pipeline.exec();
  const lobbies: Lobby[] = [];
  for (const res of results ?? []) {
    const str = res as unknown as string | null;
    if (typeof str === "string") {
      lobbies.push(JSON.parse(str) as Lobby);
    }
  }
  return lobbies;
}

export async function addLobby(lobby: Lobby): Promise<void> {
  await saveLobby(lobby);
}

export async function removeLobby(lobbyId: string): Promise<void> {
  const redis = await getRedis();
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) return;
  await redis.multi()
    .del(lobbyKey(lobbyId))
    .del(joinCodeKey(lobby.joinCode))
    .sRem(lobbySetKey, lobbyId)
    .exec();
}

export async function updateLobby(lobbyId: string, updates: Partial<Lobby>): Promise<void> {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) return;
  const updated: Lobby = { ...lobby, ...updates };
  await saveLobby(updated);
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

export async function createLobby(adminName: string) {
  const id = uuidv4();
  const joinCode = nanoid(6);
  const adminPlayerId = uuidv4();
  const lobby: Lobby = {
    id,
    joinCode,
    players: [{ id: adminPlayerId, name: adminName }],
    gameState: createInitialGameState(),
  };
  await addLobby(lobby);
  return { id, joinCode, players: lobby.players };
}

export async function joinLobby(joinCode: string, playerName: string) {
  const lobby = await loadLobbyByJoinCode(joinCode);
  if (!lobby) throw new Error("Lobby not found");
  lobby.players.push({ id: uuidv4(), name: playerName });
  await saveLobby(lobby);
  return { id: lobby.id, joinCode: lobby.joinCode, players: lobby.players };
}

export async function startGame(lobbyId: string) {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.players.length < 2) throw new Error("Need at least 2 players");

  const ai = await generateStuff();
  const promptText = ai.prompt ?? FALLBACK_PROMPTS[Math.floor(Math.random() * FALLBACK_PROMPTS.length)];

  const randomIndex = Math.floor(Math.random() * lobby.players.length);
  const sittingOutPlayer = lobby.players[randomIndex];

  lobby.gameState = {
    phase: 'writing',
    currentPrompt: { id: uuidv4(), text: promptText },
    responses: [],
    guesses: [],
    sittingOutPlayerId: sittingOutPlayer.id,
    roundNumber: 1,
    aiExampleResponse: ai.example_response ?? null,
  };
  await saveLobby(lobby);
  return lobby.gameState;
}

export async function submitResponse(lobbyId: string, playerId: string, responseText: string) {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.gameState.phase !== 'writing') throw new Error("Game not in writing phase");

  const player = lobby.players.find(p => p.id === playerId);
  if (!player) throw new Error("Player not found in lobby");

  const existingResponse = lobby.gameState.responses.find(r => r.playerId === playerId);
  if (existingResponse) throw new Error("Player already submitted response");

  const response: Response = { id: uuidv4(), text: responseText, playerId, isAI: false };
  lobby.gameState.responses.push(response);

  const activePlayers = lobby.players.filter(p => p.id !== lobby.gameState.sittingOutPlayerId);
  if (lobby.gameState.responses.length === activePlayers.length) {
    const aiText = lobby.gameState.aiExampleResponse ?? "This reminds me of similar scenarios I've encountered in my training data.";
    const aiResponse: Response = { id: uuidv4(), text: aiText, playerId: null, isAI: true };
    lobby.gameState.responses.push(aiResponse);
    lobby.gameState.phase = 'guessing';
  }

  await saveLobby(lobby);
  return response;
}

export async function submitGuess(lobbyId: string, responseId: string, guessedPlayerId: string | null, guessingPlayerId: string) {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  if (lobby.gameState.phase !== 'guessing') throw new Error("Game not in guessing phase");

  const guessingPlayer = lobby.players.find(p => p.id === guessingPlayerId);
  if (!guessingPlayer) throw new Error("Player not found in lobby");

  const existingGuess = lobby.gameState.guesses.find(g => g.responseId === responseId && g.guessingPlayerId === guessingPlayerId);
  if (existingGuess) throw new Error("Player already guessed this response");

  const guess: Guess = { id: uuidv4(), responseId, guessedPlayerId, guessingPlayerId };
  lobby.gameState.guesses.push(guess);

  const totalGuessesNeeded = lobby.players.length * lobby.gameState.responses.length;
  if (lobby.gameState.guesses.length === totalGuessesNeeded) {
    lobby.gameState.phase = 'results';
  }

  await saveLobby(lobby);
  return guess;
}

export async function resetGame(lobbyId: string) {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) throw new Error("Lobby not found");
  lobby.gameState = createInitialGameState();
  await saveLobby(lobby);
  return lobby.gameState;
}


export async function getLobby(lobbyId: string) {
  const lobby = await loadLobbyById(lobbyId);
  if (!lobby) return null;
  if (!lobby.gameState) {
    lobby.gameState = createInitialGameState();
    await saveLobby(lobby);
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
