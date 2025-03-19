export interface State<T> {
    get(): T;
    set(newValue: T): void;
    _observers: Set<(value: T) => void>;
}

export function state<T>(initialValue: T): State<T>;
export function state<T>(): State<T | undefined>;
export function state<T>(initialValue?: T): State<T | undefined> {
    let value = initialValue;

    const observers = new Set<(value: T | undefined) => void>();

    return {
        get() {
            return value;
        },
        set(newValue: T | undefined) {
            if (newValue === value) return;

            value = newValue;

            for (const observer of observers) {
                task.spawn(observer, value);
            }
        },
        _observers: observers,
    };
}
