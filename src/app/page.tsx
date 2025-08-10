"use client";
import { useState } from "react";
import JoinLobby from "@/lib/components/join-lobby";
import CreateLobby from "@/lib/components/create-lobby";

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-4">Who Wrote It?</h1>
    <div className="flex flex-col items-center justify-center">
      <JoinLobby />
      <CreateLobby />
    </div>
    </>
  );
}
