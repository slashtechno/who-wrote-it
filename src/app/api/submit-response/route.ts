import { NextRequest, NextResponse } from "next/server";
import { submitResponse } from "@/lib/lobby";

export async function POST(request: NextRequest) {
  try {
    const { lobbyId, playerId, responseText } = await request.json();
    
    if (!lobbyId || !playerId || !responseText) {
      return NextResponse.json({ error: "Lobby ID, player ID, and response text are required" }, { status: 400 });
    }
    
    const response = await submitResponse(lobbyId, playerId, responseText);
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to submit response";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
} 