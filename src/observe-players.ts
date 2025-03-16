const Players = game.GetService('Players');

export function observePlayers(callback: (player: Player) => (() => void) | undefined): () => void {
    const cleanFuncs = new Map<Player, () => void>();

    for (const player of Players.GetPlayers()) {
        task.spawn(() => {
            const cleanFunc = callback(player);
            if (cleanFunc) {
                cleanFuncs.set(player, cleanFunc);
            }
        });
    }

    const connections: RBXScriptConnection[] = [];
    connections.push(Players.PlayerAdded.Connect((player: Player) => {
        const cleanFunc = callback(player);
        if (cleanFunc) {
            cleanFuncs.set(player, cleanFunc);
        }
    }));
    connections.push(Players.PlayerRemoving.Connect((player: Player) => {
        const cleanFunc = cleanFuncs.get(player);
        if (cleanFunc) {
            cleanFuncs.delete(player);
            cleanFunc();
        }
    }));

    return () => {
        for (const [_, cleanFunc] of cleanFuncs) {
            task.spawn(cleanFunc);
        }
        for (const connection of connections) {
            connection.Disconnect();
        }
        connections.clear();
        cleanFuncs.clear();
    };
}
