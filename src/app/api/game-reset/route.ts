import { NextRequest, NextResponse } from "next/server";
import { resetGame } from "@/lib/lobby";

export async function POST(request: NextRequest) {
  try {
    const { lobbyId } = await request.json();
    
    if (!lobbyId) {
      return NextResponse.json({ error: "Lobby ID is required" }, { status: 400 });
    }
    
    const gameState = resetGame(lobbyId);
    
    return NextResponse.json({ success: true, gameState });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to reset game";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
} 