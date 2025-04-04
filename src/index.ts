import { state } from "./state";
import { observeState } from "./observe-state";
import { observePlayers } from "./observe-players";
import { observeCharacters } from "./observe-characters";
import { observeAttribute } from "./observe-attribute";
import { observeChildren } from "./observe-children";
import { observeTag } from "./observe-tag";
import { observeProperty } from "./observe-property";

export class Observers {
    static state = state;
    static observeState = observeState;
    static observePlayers = observePlayers;
    static observeCharacters = observeCharacters;
    static observeAttribute = observeAttribute;
    static observeChildren = observeChildren;
    static observeTag = observeTag;
    static observeProperty = observeProperty;
}
