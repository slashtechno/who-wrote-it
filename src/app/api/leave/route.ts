import { NextRequest, NextResponse } from "next/server";
import { getLobby, removeLobby, updateLobby } from "@/lib/lobby";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lobbyId, playerId } = body;
    
    const lobby = await getLobby(lobbyId);
    if (!lobby) {
      return NextResponse.json(
        { error: "Lobby not found" },
        { status: 404 }
      );
    }
    
    // Remove the player from the lobby
    const updatedPlayers = lobby.players.filter((p: { id: string }) => p.id !== playerId);
    
    // If no players left, remove the lobby
    if (updatedPlayers.length === 0) {
      await removeLobby(lobbyId);
    } else {
      // Update the lobby with the new player list
      await updateLobby(lobbyId, { players: updatedPlayers });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 