"use client";
import { useState } from "react";
import { toast } from "sonner";
import { createLobby } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateLobby() {
  const [createForm, setCreateForm] = useState({
    playerName: "",
  });
  const router = useRouter();
  
  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          const lobby = await createLobby({
            playerName: createForm.playerName,
          });
          
          // Find the current player in the lobby data (use backend-generated ID)
          const currentPlayer = lobby.players.find(p => p.name === createForm.playerName);
          if (!currentPlayer) {
            throw new Error("Failed to create player");
          }
          
          // Store lobby data for the lobby page
          const lobbyData = {
            id: lobby.id,
            joinCode: lobby.joinCode,
            players: lobby.players
          };
          
          localStorage.setItem(`lobby_${lobby.id}`, JSON.stringify(lobbyData));
          localStorage.setItem(`currentPlayer_${lobby.id}`, currentPlayer.id);
          
          toast.success("Lobby created successfully!", {
            description: `Join code: ${lobby.joinCode}`
          });
          
          // Navigate to the lobby page
          router.push(`/lobby/${lobby.id}`);
        } catch (error: any) {
          toast.error("Failed to create lobby", {
            description: error.message || "Unknown error occurred"
          });
        }
      }}>
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend">Create a Lobby</legend>
          <label className="label">Player Name</label>
          <input type="text" className="input" placeholder="Player Name" value={createForm.playerName} onChange={(e) => setCreateForm({...createForm, playerName: e.target.value})}/>
          <button className="btn btn-neutral mt-4">Create a Lobby</button>
        </fieldset>
      </form>
    </div>
  );
}