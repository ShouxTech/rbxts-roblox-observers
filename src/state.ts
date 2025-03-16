export interface State<T> {
    get(): T;
    set(newValue: T): void;
    _observers: Set<(value: T) => void>;
}

export function state<T>(initialValue: T): State<T> {
    let value = initialValue;

    const observers = new Set<(value: T) => void>();

    return {
        get() {
            return value;
        },
        set(newValue: T) {
            if (newValue === value) return;

            value = newValue;

            for (const observer of observers) {
                task.spawn(observer, value);
            }
        },
        _observers: observers,
    };
}
