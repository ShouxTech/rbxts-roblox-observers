import { observePlayers } from './observe-players';

export function observeCharacters(callback: (char: Model, player: Player) => (() => void) | void) {
    const stopObservingPlayers = observePlayers((player: Player) => {
        let cleanFunc: (() => void) | void;

        if (player.Character) {
            task.spawn(() => {
                cleanFunc = callback(player.Character as Model, player);
            });
        }

        let characterRemovingConnection: RBXScriptConnection | undefined;
        const characterAddedConnection = player.CharacterAdded.Connect((char: Model) => {
            characterRemovingConnection = char.AncestryChanged.Connect((_, parent?: Instance) => {
                if (parent) return;

                characterRemovingConnection?.Disconnect();
                characterRemovingConnection = undefined;

                if (cleanFunc) {
                    cleanFunc();
                    cleanFunc = undefined;
                }
            });

            cleanFunc = callback(char, player);
        });

        return () => {
            if (cleanFunc) {
                task.spawn(cleanFunc);
            }
            characterAddedConnection.Disconnect();
            if (characterRemovingConnection) {
                characterRemovingConnection.Disconnect();
            }
        };
    });

    return () => {
        stopObservingPlayers();
    };
}
