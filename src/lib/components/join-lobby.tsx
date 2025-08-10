"use client";
import { useState } from "react";
import { toast } from "sonner";
import { joinLobby } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function JoinLobby() {
  const [joinForm, setJoinForm] = useState({
    joinCode: "",
    playerName: "",
  });
  const router = useRouter();
  
  return (
    <div>
      <form onSubmit={async (e) => {e.preventDefault();
      try {
        const lobby = await joinLobby({
          joinCode: joinForm.joinCode,
          playerName: joinForm.playerName,
        });
        
        // Find the current player in the lobby data
        const currentPlayer = lobby.players.find(p => p.name === joinForm.playerName);
        if (currentPlayer) {
          localStorage.setItem(`currentPlayer_${lobby.id}`, currentPlayer.id);
        }
        
        // Store lobby data for the lobby page
        const lobbyData = {
          id: lobby.id,
          joinCode: lobby.joinCode,
          players: lobby.players, // Backend now includes the new player
        };
        
        localStorage.setItem(`lobby_${lobby.id}`, JSON.stringify(lobbyData));
        
        toast.success("Joined lobby successfully!");
        
        // Navigate to the lobby page
        router.push(`/lobby/${lobby.id}`);
      } catch (error: any) {
        if (error.message === "Lobby not found") {
          toast.error("Lobby not found", {
            description: "Please check your join code and try again"
          });
        } else {
          toast.error("Failed to join lobby", {
            description: error.message || "Unknown error occurred"
          });
        }
      }
    }}> 
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Join a Lobby</legend>
        <label className="label">Join Code</label>
        <input type="text" className="input" placeholder="Join Code" value={joinForm.joinCode} onChange={(e) => setJoinForm({...joinForm, joinCode: e.target.value})}/>
        <label className="label">Player Name</label>
        <input type="text" className="input" placeholder="Player Name" value={joinForm.playerName} onChange={(e) => setJoinForm({...joinForm, playerName: e.target.value})}/>
        <button className="btn btn-neutral mt-4">Join</button>
      </fieldset>
      </form>
    </div>
  );
}