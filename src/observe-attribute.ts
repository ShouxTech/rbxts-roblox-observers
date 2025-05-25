export function observeAttribute<T extends AttributeValue>(instance: Instance, attribute: string, callback: (value: T | undefined) => (() => void) | void) {
    let cleanup: (() => void) | void;

    function runCallback() {
        if (cleanup) {
            task.spawn(cleanup);
        }
        cleanup = callback(instance.GetAttribute(attribute) as T | undefined);
    }

    task.spawn(runCallback);

    const connection = instance.GetAttributeChangedSignal(attribute).Connect(runCallback);

    return () => {
        if (cleanup) {
            task.spawn(cleanup);
            cleanup = undefined;
        }
        connection.Disconnect();
    };
}
