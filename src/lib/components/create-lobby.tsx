"use client";
import { useState } from "react";
import { toast } from "sonner";
import { createLobby } from "@/lib/api";

export default function CreateLobby() {
  const [createForm, setCreateForm] = useState({
    playerName: "",
  });
  
  return (
    <div>
      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          // Now you get full IntelliSense here!
          const lobby = await createLobby({
            playerName: createForm.playerName,
          });
          
          console.log(lobby);
          // TypeScript knows lobby has: id, joinCode
          console.log(`Created lobby ${lobby.id} with join code ${lobby.joinCode}`);
          
          toast.success("Lobby created");
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