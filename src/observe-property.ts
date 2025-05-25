export function observeProperty<P extends Instance, K extends InstancePropertyNames<P>>(instance: P, property: K, callback: (value: P[K]) => (() => void) | void) {
    let cleanup: (() => void) | void;

    function runCallback() {
        if (cleanup) {
            task.spawn(cleanup);
        }
        cleanup = callback(instance[property]);
    }

    task.spawn(runCallback);

    const connection = instance.GetPropertyChangedSignal(property).Connect(runCallback);

    return () => {
        if (cleanup) {
            task.spawn(cleanup);
            cleanup = undefined;
        }
        connection.Disconnect();
    };
}
