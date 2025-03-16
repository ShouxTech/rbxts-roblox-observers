export function observeAttribute<T extends AttributeValue>(instance: Instance, attribute: string, callback: (value: T | undefined) => void) {
    task.spawn(callback, instance.GetAttribute(attribute) as T | undefined);

    const connection = instance.GetAttributeChangedSignal(attribute).Connect(() => {
        task.spawn(callback, instance.GetAttribute(attribute) as T | undefined);
    });

    return () => {
        connection.Disconnect();
    };
}
