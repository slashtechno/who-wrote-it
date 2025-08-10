"use client";
import { useState } from "react";
import { toast } from "sonner";
import { joinLobby } from "@/lib/api";

export default function JoinLobby() {
  const [joinForm, setJoinForm] = useState({
    joinCode: "",
    playerName: "",
  });
  
  return (
    <div>
      <form onSubmit={async (e) => {e.preventDefault();
      try {
        const lobby = await joinLobby({
          joinCode: joinForm.joinCode,
        });
        console.log(lobby);
        toast.success("Joined lobby");
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