import { joinLobby } from "@/lib/lobby";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { JoinLobbyRequest, JoinLobbyResponse, JoinLobbyApiResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<JoinLobbyApiResponse>> {
  try {
    const body: JoinLobbyRequest = await request.json();
    const lobby = joinLobby(body.joinCode, body.playerName);
    return NextResponse.json(lobby);
  } catch (error: any) {
    if (error.message === "Lobby not found") {
      return NextResponse.json(
        { error: "Lobby not found" },
        { status: 404 }
      );
    }
    // For other unexpected errors, return 500
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}