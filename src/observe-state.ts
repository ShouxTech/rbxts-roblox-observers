import { State } from './state';

export function observeState<T>(state: State<T>, callback: (value: T) => void): () => void {
    task.spawn(callback, state.get());

    state._observers.add(callback);

    return () => {
        state._observers.delete(callback);
    };
}
