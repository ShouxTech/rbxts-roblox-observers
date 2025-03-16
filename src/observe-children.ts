export function observeChildren(instance: Instance, callback: (child: Instance) => (() => void) | void) {
    const cleanFuncs = new Map<Instance, () => void>();

    for (const child of instance.GetChildren()) {
        task.spawn(() => {
            const cleanFunc = callback(child);
            if (cleanFunc) {
                cleanFuncs.set(child, cleanFunc);
            }
        });
    }

    const connections: RBXScriptConnection[] = [];
    connections.push(instance.ChildAdded.Connect((child: Instance) => {
        const cleanFunc = callback(child);
        if (cleanFunc) {
            cleanFuncs.set(child, cleanFunc);
        }
    }));
    connections.push(instance.ChildRemoved.Connect((child: Instance) => {
        const cleanFunc = cleanFuncs.get(child);
        if (cleanFunc) {
            cleanFuncs.delete(child); // In case cleanFunc yields or errors, remove the table key first.
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
