type LobbyHeaderProps = {
  lobby: { id: string; joinCode: string; };
};

export function LobbyHeader({ lobby }: LobbyHeaderProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h1 className="text-3xl font-bold">Who Wrote It?</h1>
        <p className="text-base-content/70">Game ID: {lobby.id}</p>
        <p className="text-base-content/70">Share this code with friends: <span className="font-mono text-lg">{lobby.joinCode}</span></p>
      </div>
    </div>
  );
} 