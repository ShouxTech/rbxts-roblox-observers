const CollectionService = game.GetService('CollectionService');

type InstanceStatus = '__inflight__' | '__dead__';

type CleanupFunction = () => void;

export function observeTag<T extends Instance>(tag: string, callback: (instance: T) => CleanupFunction | void, ancestors: Instance[] | undefined) {
    const instances = new Map<Instance, InstanceStatus | CleanupFunction>();
    const ancestryConn = new Map<Instance, RBXScriptConnection>();

    function isGoodAncestor(instance: Instance) {
        if (!ancestors) return true;
        return ancestors.some((ancestor) => instance.IsDescendantOf(ancestor));
    }

    function attemptStartup(instance: Instance) {
        instances.set(instance, '__inflight__');

        task.defer(() => {
            if (instances.get(instance) !== '__inflight__') return;

            const [suc, cleanup] = pcall(() => {
                const clean = callback(instance as any);
                assert(clean === undefined || typeIs(clean, 'function'), 'callback must return a function or undefined');
                return clean;
            });
            if (!suc) {
                warn(`error while calling observeTag('${tag}') callback: ${cleanup}`);
                return;
            }

            if (instances.get(instance) !== '__inflight__') {
                if (cleanup) {
                    task.spawn(cleanup);
                }
            } else {
                instances.set(instance, cleanup as CleanupFunction);
            }
        });
    }

    function attemptCleanup(instance: Instance) {
        const cleanup = instances.get(instance);
        instances.set(instance, '__dead__');

        if (typeIs(cleanup, 'function')) {
            task.spawn(cleanup);
        }
    }

    function onAncestryChanged(instance: Instance) {
        if (isGoodAncestor(instance)) {
            if (instances.get(instance) === '__dead__') {
                attemptStartup(instance);
            }
        } else {
            attemptCleanup(instance);
        }
    }

    function onInstanceAdded(instance: Instance) {
        if (!onInstanceAddedConnection.Connected) return;
        if (instances.has(instance)) return;

        instances.set(instance, '__dead__');
        onAncestryChanged(instance);
        
        ancestryConn.set(instance, instance.AncestryChanged.Connect(() => {
            onAncestryChanged(instance);
        }));
    }

    function onInstanceRemoved(instance: Instance) {
        attemptCleanup(instance);

        const ancestry = ancestryConn.get(instance);
        if (ancestry) {
            ancestry.Disconnect();
            ancestryConn.delete(instance);
        }

        instances.delete(instance);
    }

    task.defer(() => {
        if (!onInstanceAddedConnection.Connected) return;
        for (const instance of CollectionService.GetTagged(tag)) {
            task.spawn(() => onInstanceAdded(instance));
        }
    });

    const onInstanceAddedConnection = CollectionService.GetInstanceAddedSignal(tag).Connect(onInstanceAdded);
    const onInstanceRemovedConnection = CollectionService.GetInstanceRemovedSignal(tag).Connect(onInstanceRemoved);

    return () => {
        onInstanceAddedConnection.Disconnect();
        onInstanceRemovedConnection.Disconnect();

        for (const [instance] of instances) {
            onInstanceRemoved(instance);
        }
    };
};
