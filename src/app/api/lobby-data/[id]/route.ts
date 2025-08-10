import { NextRequest, NextResponse } from "next/server";
import { getLobby } from "@/lib/lobby";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lobby = getLobby(id);
    
    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lobby });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to get lobby";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 