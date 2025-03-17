export function observeAttribute(instance: Instance, attribute: string, callback: (value: AttributeValue | undefined) => void) {
    task.spawn(callback, instance.GetAttribute(attribute));

    const connection = instance.GetAttributeChangedSignal(attribute).Connect(() => {
        task.spawn(callback, instance.GetAttribute(attribute));
    });

    return () => {
        connection.Disconnect();
    };
}
