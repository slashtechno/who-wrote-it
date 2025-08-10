import { createLobby } from "@/lib/lobby";
import { NextRequest, NextResponse } from "next/server";
import { CreateLobbyRequest, CreateLobbyResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<CreateLobbyResponse>> {
  const body: CreateLobbyRequest = await request.json();
  const lobby = await createLobby(body.playerName);
  return NextResponse.json(lobby);
}