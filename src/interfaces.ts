export interface NosHTMLElement extends HTMLElement {
    [key: string]: any;
}

export interface NosEventListenerArgs {
    passive?: boolean;
    once?: boolean;
}

export type NosEventListener = (
    type: string,
    listener: (event: Event) => void,
    options?: NosEventListenerArgs | boolean
) => void;

export type NosCustomEventListener = (
    type: string,
    listener: (event: CustomEvent) => void,
    options?: NosEventListenerArgs | boolean
) => void;

export type NosMouseEventListener = (
    type: string,
    listener: (event: MouseEvent) => void,
    options?: NosEventListenerArgs | boolean
) => void;

export type NosKeyboardEventListener = (
    type: string,
    listener: (event: KeyboardEvent) => void,
    options?: NosEventListenerArgs | boolean
) => void;

export enum NOS_PICKER_MODE {
    'SINGLE',
    'MULTI',
    'STRING'
}

export enum NOS_PICKER_STATE {
    'INIT',
    'SELECTED',
    'SEARCH',
}

export interface NOS_EVENT_HANDLERS {
    [key: string]: any;
}