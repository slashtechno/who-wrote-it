import { v4 as uuidv4 } from "uuid";

export let lobbies: {
  id: string;
  joinCode: string;
  players: {
    id: string;
    name: string;
  }[];
}[] = [];

export function createLobby(adminName: string): {
  id: string;
  joinCode: string;
} {
  const id = uuidv4();
  const joinCode = uuidv4();
  lobbies.push({
    id,
    joinCode,
    players: [
      {
        id: uuidv4(),
        name: adminName,
      }
    ],
  });
  return { id, joinCode };
}

export function joinLobby(joinCode: string): {
  id: string;
  joinCode: string;
  players: {
    id: string;
    name: string;
  }[];
} {
  const lobby = lobbies.find((lobby) => lobby.joinCode === joinCode);
  if (!lobby) {
    throw new Error("Lobby not found");
  }
  return {
    id: lobby.id,
    joinCode: lobby.joinCode,
    players: lobby.players,
  };
}
