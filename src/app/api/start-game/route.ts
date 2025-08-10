import { NextRequest, NextResponse } from "next/server";
import { startGame } from "@/lib/lobby";

export async function POST(request: NextRequest) {
  try {
    const { lobbyId } = await request.json();
    
    if (!lobbyId) {
      return NextResponse.json({ error: "Lobby ID is required" }, { status: 400 });
    }
    
    // Add timeout to the entire operation to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Start game operation timed out")), 10000)
    );
    
    const startGamePromise = startGame(lobbyId);
    const gameState = await Promise.race([startGamePromise, timeoutPromise]);
    
    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    console.error("Start game error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to start game";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
} 