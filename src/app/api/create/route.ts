import { createLobby, joinLobby } from "@/lib/lobby";
import { NextRequest, NextResponse } from "next/server";
import { CreateLobbyRequest, CreateLobbyResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse<CreateLobbyResponse>> {
  const body: CreateLobbyRequest = await request.json();
  return NextResponse.json(createLobby(body.playerName));
}