import { NextRequest, NextResponse } from "next/server";
import { submitGuess } from "@/lib/lobby";

export async function POST(request: NextRequest) {
  try {
    const { lobbyId, responseId, guessedPlayerId, guessingPlayerId } = await request.json();
    
    if (!lobbyId || !responseId || guessingPlayerId === undefined) {
      return NextResponse.json({ error: "Lobby ID, response ID, and guessing player ID are required" }, { status: 400 });
    }
    
    const guess = await submitGuess(lobbyId, responseId, guessedPlayerId, guessingPlayerId);
    
    return NextResponse.json({ success: true, guess });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to submit guess";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
} 