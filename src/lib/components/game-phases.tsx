import { GameState, GamePhase } from "@/lib/types";

type Player = { id: string; name: string; };
type Lobby = { id: string; joinCode: string; players: Player[]; gameState: GameState; };

type GamePhasesProps = {
  gameState: GameState;
  lobby: Lobby;
  currentPlayerId: string | null;
  responseText: string;
  setResponseText: (text: string) => void;
  submitting: boolean;
  onStartGame: () => void;
  onSubmitResponse: () => void;
  onSubmitGuess: (responseId: string, guessedPlayerId: string | null) => void;
  onResetGame: () => void;
  onLeaveLobby: () => void;
};

export function GamePhases({
  gameState,
  lobby,
  currentPlayerId,
  responseText,
  setResponseText,
  submitting,
  onStartGame,
  onSubmitResponse,
  onSubmitGuess,
  onResetGame,
  onLeaveLobby
}: GamePhasesProps) {
  switch (gameState.phase) {
    case 'waiting':
      return (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Waiting to Start</h2>
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={lobby.players.length < 2} onClick={onStartGame}>Start Game</button>
              <button className="btn btn-error" onClick={onLeaveLobby}>Leave Lobby</button>
            </div>
            {lobby.players.length < 2 && <p className="text-warning text-sm">Need at least 2 players</p>}
          </div>
        </div>
      );
      
    case 'writing':
      const isSittingOut = currentPlayerId === gameState.sittingOutPlayerId;
      const hasSubmitted = gameState.responses.some(r => r.playerId === currentPlayerId);
      
      return (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Writing Phase</h2>
            <div className="bg-base-100 p-4 rounded mb-4">
              <h3 className="font-medium mb-2">Prompt:</h3>
              <p>{gameState.currentPrompt?.text}</p>
            </div>
            
            {isSittingOut ? (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                <div>
                  <h3 className="font-bold">You're sitting out this round!</h3>
                  <div className="text-xs">The AI will respond for you. You can still participate in the guessing phase.</div>
                </div>
              </div>
            ) : hasSubmitted ? (
              <div className="alert alert-success">Response submitted! Waiting for other players...</div>
            ) : (
              <div className="space-y-4">
                <textarea className="textarea textarea-bordered w-full" placeholder="Type your response here..." value={responseText} onChange={(e) => setResponseText(e.target.value)} rows={4} />
                <button className="btn btn-primary" onClick={onSubmitResponse} disabled={!responseText.trim() || submitting}>
                  {submitting ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            )}
            
            <p className="text-sm text-base-content/70">Responses: {gameState.responses.length} / {lobby.players.length - 1}</p>
          </div>
        </div>
      );
      
    case 'guessing':
      return (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Guessing Phase</h2>
            <p className="mb-4">All responses are in! Time to guess who wrote what.</p>
            
            <div className="space-y-4">
              {gameState.responses.map((response) => {
                const hasGuessed = gameState.guesses.some(g => g.responseId === response.id && g.guessingPlayerId === currentPlayerId);
                
                return (
                  <div key={response.id} className="bg-base-100 p-4 rounded border">
                    <p className="mb-3 font-medium">{response.text}</p>
                    
                    {hasGuessed ? (
                      <div className="alert alert-success">Guess submitted!</div>
                    ) : (
                      <div>
                        <p className="text-sm text-base-content/70 mb-2">Who wrote this?</p>
                        <div className="flex flex-wrap gap-2">
                          <button className="btn btn-sm btn-outline" onClick={() => onSubmitGuess(response.id, null)}>AI</button>
                          {lobby.players.map((player: Player) => (
                            <button key={player.id} className="btn btn-sm btn-outline" onClick={() => onSubmitGuess(response.id, player.id)}>{player.name}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-sm text-base-content/70">Guesses: {gameState.guesses.length} / {lobby.players.length * gameState.responses.length}</p>
          </div>
        </div>
      );
      
    case 'results':
      return (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Results!</h2>
            <p className="mb-4">Here's how everyone did:</p>
            
            <div className="space-y-4">
              {gameState.responses.map((response) => {
                const correctAuthor = response.isAI ? null : response.playerId;
                const authorName = response.isAI ? "AI" : lobby.players.find(p => p.id === response.playerId)?.name || "Player";
                
                return (
                  <div key={response.id} className="bg-base-100 p-4 rounded border">
                    <p className="mb-2 font-medium">{response.text}</p>
                    <p className="text-sm text-base-content/70 mb-3"><strong>Author:</strong> {authorName}</p>
                    
                    <div className="space-y-1">
                      {lobby.players.map((player: Player) => {
                        const playerGuess = gameState.guesses.find(g => g.responseId === response.id && g.guessingPlayerId === player.id);
                        const guessedName = playerGuess?.guessedPlayerId === null ? "AI" : lobby.players.find(p => p.id === playerGuess?.guessedPlayerId)?.name || "Player";
                        const isCorrect = playerGuess?.guessedPlayerId === correctAuthor;
                        
                        return (
                          <div key={player.id} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{player.name}:</span>
                            <span className={isCorrect ? "text-success" : "text-error"}>{guessedName} {isCorrect ? "✓" : "✗"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 mt-6">
              <button className="btn btn-primary" onClick={onResetGame}>Play Again</button>
              <button className="btn btn-error" onClick={onLeaveLobby}>Leave Lobby</button>
            </div>
          </div>
        </div>
      );
      
    default:
      return null;
  }
} 