export function observeProperty<P extends Instance, K extends InstancePropertyNames<P>>(instance: P, property: K, callback: (value: P[K]) => void) {
    task.spawn(() => callback(instance[property]));

    const connection = instance.GetPropertyChangedSignal(property).Connect(() => {
        callback(instance[property]);
    });

    return () => {
        connection.Disconnect();
    };
}
