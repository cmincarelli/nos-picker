import {
    NOS_PICKER_MODE,
    NOS_PICKER_STATE,
    NOS_EVENT_HANDLERS,
    NosEventListener,
    NosHTMLElement,
    NosCustomEventListener,
    NosKeyboardEventListener,
    NosMouseEventListener,
} from '../interfaces';

interface EventTrigger {
    [key: string]: Function[]
}

export class NosPickerEvents {

    private options: object | boolean;
    private pickerMode: NOS_PICKER_MODE;
    private pickerState: NOS_PICKER_STATE;
    private triggers: EventTrigger = {};

    private currentElement: NosHTMLElement = document.body;
    private capturedElements: NosHTMLElement[] = [];

    private eventsHandlers: NOS_EVENT_HANDLERS = {
        'mouseover': [],
        'mouseout': [],
        'click': [],
        'keydown_27': [],
        'keydown_32': [],
        'keydown_37': [],
        'keydown_38': [],
        'keydown_39': [],
        'keydown_40': [],
        'keyup_32': [],
    };

    constructor() {
        let passiveSupported: boolean = false;
        let eventOptions: object = {};

        this.pickerMode = NOS_PICKER_MODE.SINGLE;
        this.pickerState = NOS_PICKER_STATE.INIT;

        try {
            eventOptions = Object.defineProperty({}, 'passive', {
                get: () => {
                    passiveSupported = true;
                }
            });

            window.addEventListener('t', e => { }, eventOptions);
            window.removeEventListener('t', e => { }, eventOptions);
        } catch (err) {
            passiveSupported = false;
        }

        this.options = passiveSupported ? { passive: false } : false;
        // CLICK
        this.addHandler('click', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.clickSelectSingleElement.bind(this));
        this.addHandler('click', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.progressApplicationState.bind(this));
        this.addHandler('click', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.preventDefault.bind(this));

        this.addHandler('click', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.INIT, this.clickSelectSingleElement.bind(this));
        this.addHandler('click', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.INIT, this.progressApplicationState.bind(this));
        this.addHandler('click', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.clickSelectSingleElement.bind(this));

        // SPACE
        this.addHandler('keydown_32', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.highlightSelected.bind(this));
        this.addHandler('keyup_32', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.unlightSelected.bind(this));

        this.addHandler('keydown_32', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.highlightSelected.bind(this));
        this.addHandler('keyup_32', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.unlightSelected.bind(this));

        // ESC
        this.addHandler('keydown_27', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.resetApplicationState.bind(this));

        this.addHandler('keydown_27', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.INIT, this.resetApplicationState.bind(this));
        this.addHandler('keydown_27', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.releaseCurrentElement.bind(this));

        // ARROWS
        this.addHandler('keydown_37', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setPreviousElement.bind(this));
        this.addHandler('keydown_38', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setParentElement.bind(this));
        this.addHandler('keydown_39', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setNextElement.bind(this));
        this.addHandler('keydown_40', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setChildElement.bind(this));

        this.addHandler('keydown_37', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.setPreviousElement.bind(this));
        this.addHandler('keydown_38', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.setParentElement.bind(this));
        this.addHandler('keydown_39', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.setNextElement.bind(this));
        this.addHandler('keydown_40', NOS_PICKER_MODE.MULTI, NOS_PICKER_STATE.SELECTED, this.setChildElement.bind(this));
    }

    setPickerMode(mode: NOS_PICKER_MODE) {
        this.pickerMode = mode;
    }

    getPickerMode() {
        return this.pickerMode;
    }

    setPickerState(state: NOS_PICKER_STATE) {
        this.pickerState = state;
    }

    getPickerState() {
        return this.pickerState;
    }

    preventDefault(e: Event): void {
        e.preventDefault();
        //e.stopPropagation();
    }

    highlightSelected(e: KeyboardEvent): void {
        this.preventDefault(e);
        this.capturedElements.forEach(el => {
            el.style.outline = '2px solid red';
        });
    }

    unlightSelected(e: KeyboardEvent): void {
        this.preventDefault(e);
        this.capturedElements.forEach(el => {
            el.style.outline = 'none';
        });
    }

    clickSelectSingleElement(e: MouseEvent): void {
        this.preventDefault(e);
        const element = (<NosHTMLElement>e.target);
        this.capturedElements.push(element);
        this.currentElement = element;
        this.trigger('captureCurrentElement', element);
    }

    clickSelectMultiElement(e: MouseEvent): void {
        this.preventDefault(e);
        const element = (<NosHTMLElement>e.target);
        this.capturedElements.push(element);
        this.currentElement = element;
        console.log('clickSelectMultiElement', element);
        this.trigger('captureCurrentElement', element);
    }

    releaseCurrentElement(): void {
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            this.trigger('releaseCurrentElement');
            this.capturedElements.splice(idx, 1);
        } else {
            this.regressApplicationState();
        }
    }

    destroyApplication(e?: KeyboardEvent): void {
        if (e) {
            this.preventDefault(e);
        }
        this.trigger('destroy');
    }

    regressApplicationState(e?: KeyboardEvent): void {
        if (e) {
            this.preventDefault(e);
        }
        --this.pickerState;
        this.trigger('stateChange', this.pickerState);
    }

    progressApplicationState(e?: KeyboardEvent): void {
        if (e) {
            this.preventDefault(e);
        }
        ++this.pickerState;
        this.trigger('stateChange', this.pickerState);
    }

    resetApplicationState(e?: KeyboardEvent): void {
        if (e) {
            this.preventDefault(e);
        }
        for (let idx = this.capturedElements.length - 1; idx >= 0; idx--) {
            this.releaseCurrentElement();
            this.capturedElements.splice(idx, 1);
        }
        this.pickerState = NOS_PICKER_STATE.INIT;
        this.trigger('stateChange', this.pickerState);
    }

    setParentElement(e: KeyboardEvent): void {
        this.preventDefault(e);
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            const parent = element.parentElement;
            console.log('setParentElement', element, parent);
            if (parent) {
                this.releaseCurrentElement();
                this.currentElement = parent;
                this.trigger('captureCurrentElement', this.currentElement);
                this.capturedElements.push(this.currentElement);
            }
        }
    }

    setChildElement(e: KeyboardEvent): void {
        this.preventDefault(e);
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            const child = <HTMLElement>element.children[0];
            if (child) {
                this.releaseCurrentElement();
                this.currentElement = child;
                this.trigger('captureCurrentElement', this.currentElement);
                this.capturedElements.push(this.currentElement);
            }
        }
    }

    setNextElement(e: KeyboardEvent): void {
        this.preventDefault(e);
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            const sibling = <HTMLElement>element.nextElementSibling;
            if (sibling) {
                this.releaseCurrentElement();
                this.currentElement = sibling;
                this.trigger('captureCurrentElement', this.currentElement);
                this.capturedElements.push(this.currentElement);
            }
        }
    }

    setPreviousElement(e: KeyboardEvent): void {
        this.preventDefault(e);
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            const sibling = <HTMLElement>element.previousElementSibling;
            if (sibling) {
                this.releaseCurrentElement();
                this.currentElement = sibling;
                this.trigger('captureCurrentElement', this.currentElement);
                this.capturedElements.push(this.currentElement);
            }
        }
    }

    delegateEvent(type: string, mode: NOS_PICKER_MODE, state: NOS_PICKER_STATE, event: NosKeyboardEventListener | NosMouseEventListener): void {
        const appElement: NosHTMLElement | null = document.getElementById('nos-app');
        if (appElement) {
            if ('hidden' === window.getComputedStyle(appElement).getPropertyValue('border-top-style')) {
                return;
            }
        }
        console.log('delegateEvent', type, mode, state, event);
        if (this.eventsHandlers[type]
            && this.eventsHandlers[type][mode]
            && this.eventsHandlers[type][mode][state]) {
            this.eventsHandlers[type][mode][state].forEach((handler: (e: NosKeyboardEventListener | NosMouseEventListener) => void) => {
                handler(event);
            });
        }
    }

    // Event Handler Base

    handleNosMouseEvent(e: MouseEvent): void {
        const element = (<NosHTMLElement>e.target);
        const event = new CustomEvent('nos-event', {
            detail: {
                event: e,
                mode: this.pickerMode,
                state: this.pickerState,
                metaKey: e.metaKey,
            },
            bubbles: false,
            cancelable: false
        });
        document.dispatchEvent(event);
    }

    handleNosKeyboardEvent(e: KeyboardEvent): void {
        const event = new CustomEvent('nos-event', {
            detail: {
                event: e,
                mode: this.pickerMode,
                state: this.pickerState,
                keyCode: e.keyCode,
                metaKey: e.metaKey,
            },
            bubbles: false,
            cancelable: false
        });
        document.dispatchEvent(event);
    }

    handleCustomEvent(e: CustomEvent): void {
        const eventType = `${e.detail.event.type}${e.detail.keyCode ? '_' + e.detail.keyCode : ''}${e.detail.metaKey ? '_' + e.detail.metaKey : ''}`;
        const mode = e.detail.mode;
        const state = e.detail.state;
        this.delegateEvent(eventType, this.pickerMode, this.pickerState, e.detail.event);
    }

    addHandler(type: string, mode: NOS_PICKER_MODE, state: NOS_PICKER_STATE, handler: (e: any) => void): void {
        this.eventsHandlers[type][mode] = this.eventsHandlers[type][mode] || [];
        this.eventsHandlers[type][mode][state] = this.eventsHandlers[type][mode][state] || [];
        this.eventsHandlers[type][mode][state].push(handler);
    }

    start() {
        document.body.className = document.body.className + ' nos-active';
        (document.addEventListener as NosCustomEventListener)('nos-event', this.handleCustomEvent.bind(this));

        (document.addEventListener as NosMouseEventListener)('mouseover', this.handleNosMouseEvent, this.options);
        (document.addEventListener as NosMouseEventListener)('mouseout', this.handleNosMouseEvent, this.options);
        (document.addEventListener as NosKeyboardEventListener)('keydown', this.handleNosKeyboardEvent, this.options);
        (document.addEventListener as NosKeyboardEventListener)('keyup', this.handleNosKeyboardEvent, this.options);
        (document.addEventListener as NosMouseEventListener)('click', this.handleNosMouseEvent, this.options);
    }

    stop() {
        (document.removeEventListener as NosCustomEventListener)('nos-event', this.handleCustomEvent.bind(this));

        (document.removeEventListener as NosMouseEventListener)('mouseover', this.handleNosMouseEvent, this.options);
        (document.removeEventListener as NosMouseEventListener)('mouseout', this.handleNosMouseEvent, this.options);
        (document.removeEventListener as NosKeyboardEventListener)('keydown', this.handleNosKeyboardEvent, this.options);
        (document.removeEventListener as NosMouseEventListener)('click', this.handleNosMouseEvent, this.options);

        this.resetApplicationState();
    }

    on(type: string, callback: (result: any) => void): void {
        if ('undefined' === typeof this.triggers[type]) {
            this.triggers[type] = [];
        }
        this.triggers[type].push(callback);
    }

    trigger(type: string, payload?: any): void {
        if ('undefined' === typeof this.triggers[type]) {
            return;
        }
        this.triggers[type].forEach((trigger) => {
            trigger(payload);
        })
    }

}
