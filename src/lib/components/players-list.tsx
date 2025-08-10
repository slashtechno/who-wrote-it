type Player = { id: string; name: string; };
type Lobby = { id: string; players: Player[]; gameState: any; };

type PlayersListProps = {
  lobby: Lobby;
};

export function PlayersList({ lobby }: PlayersListProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Players ({lobby.players.length})</h2>
        <div className="space-y-2">
          {lobby.players.map((player) => (
            <div key={player.id} className="bg-base-100 p-3 rounded border flex items-center justify-between">
              <span className="font-medium">{player.name}</span>
              <div className="flex items-center gap-2">
                {player.id === lobby.players[0]?.id && <span className="badge badge-primary">Host</span>}
                {/* Don't show sitting out badge - keep it private */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 