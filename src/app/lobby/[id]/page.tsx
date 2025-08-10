"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { GameState, GamePhase, Response } from "@/lib/types";
import { getLobby, startGame, submitResponse, submitGuess, resetGame, leaveLobby } from "@/lib/api";
import { GamePhases } from "@/lib/components/game-phases";
import { PlayersList } from "@/lib/components/players-list";
import { LobbyHeader } from "@/lib/components/lobby-header";

type Player = { id: string; name: string; };
type Lobby = { id: string; joinCode: string; players: Player[]; gameState: GameState; };

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const lastGameStateRef = useRef<GameState | null>(null);

  // Set currentPlayerId immediately when component mounts
  useEffect(() => {
    const playerId = localStorage.getItem(`currentPlayer_${params.id}`);
    if (playerId) {
      setCurrentPlayerId(playerId);
    } else {
      // If no player ID found, redirect to home
      toast.error("No player ID found. Please join the lobby again.");
      router.push('/');
      return;
    }
  }, [params.id, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLobby(params.id as string);
        
        // Don't override local state if we're in the middle of starting a game
        if (!isStartingGame || data.lobby.gameState.phase !== 'waiting') {
          setLobby(data.lobby);
          lastGameStateRef.current = data.lobby.gameState;
        }
      } catch (error) {
        console.error("Error fetching lobby data:", error);
      }
      setLoading(false);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [params.id, isStartingGame]);

  const handleStartGame = async () => {
    if (!lobby) return;
    
    setIsStartingGame(true);
    try {
      toast.loading("Starting game...");
      const data = await startGame({ lobbyId: lobby.id });
      
      // Update local state immediately
      const updatedLobby = { ...lobby, gameState: data.gameState };
      setLobby(updatedLobby);
      lastGameStateRef.current = data.gameState;
      
      toast.dismiss();
      toast.success("Game started!");
      
      // Allow polling to resume after a short delay
      setTimeout(() => setIsStartingGame(false), 1000);
    } catch (error) {
      setIsStartingGame(false);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : "Failed to start game");
    }
  };

  const handleSubmitResponse = async () => {
    if (!lobby || !currentPlayerId || !responseText.trim()) return;
    
    setSubmitting(true);
    try {
      const data = await submitResponse({ lobbyId: lobby.id, playerId: currentPlayerId, responseText: responseText.trim() });
      setLobby({ ...lobby, gameState: data.gameState });
      setResponseText("");
      toast.success("Response submitted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (!lobby || !currentPlayerId) return;
    try {
      await leaveLobby({ lobbyId: lobby.id, playerId: currentPlayerId });
      localStorage.removeItem(`lobby_${lobby.id}`);
      localStorage.removeItem(`currentPlayer_${lobby.id}`);
      toast.success("Left lobby successfully");
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to leave lobby");
    }
  };

  const handleSubmitGuess = async (responseId: string, guessedPlayerId: string | null) => {
    if (!lobby || !currentPlayerId) return;
    setSubmitting(true);
    try {
      await submitGuess({ lobbyId: lobby.id, responseId, guessedPlayerId, guessingPlayerId: currentPlayerId });
      const lobbyData = await getLobby(lobby.id);
      setLobby(lobbyData.lobby);
      toast.success("Guess submitted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit guess");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetGame = async () => {
    if (!lobby) return;
    try {
      const data = await resetGame({ lobbyId: lobby.id });
      setLobby({ ...lobby, gameState: data.gameState });
      toast.success("Game reset! Ready for another round.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset game");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="loading loading-spinner loading-lg"></div></div>;
  if (!lobby) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><h1 className="text-2xl font-bold mb-4">Lobby Not Found</h1><p className="mb-4">This lobby doesn't exist or you don't have access to it.</p><a href="/" className="btn btn-primary">Go Home</a></div></div>;

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <LobbyHeader lobby={lobby} />
        <PlayersList lobby={lobby} />
        
        {lobby.gameState && (
          <GamePhases
            gameState={lobby.gameState}
            lobby={lobby}
            currentPlayerId={currentPlayerId}
            responseText={responseText}
            setResponseText={setResponseText}
            submitting={submitting}
            onStartGame={handleStartGame}
            onSubmitResponse={handleSubmitResponse}
            onSubmitGuess={handleSubmitGuess}
            onResetGame={handleResetGame}
            onLeaveLobby={handleLeaveLobby}
          />
        )}
      </div>
    </div>
  );
} 