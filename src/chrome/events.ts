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
        'keydown_37': [],
        'keydown_38': [],
        'keydown_39': [],
        'keydown_40': [],
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

        this.addHandler('mouseover', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.mouseoverAddBorder.bind(this));
        this.addHandler('mouseout', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.mouseooutRemoveBorder.bind(this));

        this.addHandler('click', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.clickSelectElement.bind(this));
        this.addHandler('click', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.preventDefault.bind(this));

        this.addHandler('keydown_27', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.INIT, this.destroyApplication.bind(this));
        this.addHandler('keydown_27', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.resetApplicationState.bind(this));

        this.addHandler('keydown_37', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setPreviousElement.bind(this));
        this.addHandler('keydown_38', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setParentElement.bind(this));
        this.addHandler('keydown_39', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setNextElement.bind(this));
        this.addHandler('keydown_40', NOS_PICKER_MODE.SINGLE, NOS_PICKER_STATE.SELECTED, this.setChildElement.bind(this));

        (<NosCustomEventListener>document.addEventListener)('nos-event', (e) => {
            const eventType = `${e.detail.event.type}${e.detail.keyCode ? '_' + e.detail.keyCode : ''}${e.detail.metaKey ? '_' + e.detail.metaKey : ''}`;
            const mode = e.detail.mode;
            const state = e.detail.state;
            this.delegateEvent(eventType, this.pickerMode, this.pickerState, e.detail.event);
        });
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

    setElementBorder(element: NosHTMLElement, color: string): void {
        console.log('setElementBorder', element);
        if ('undefined' === typeof element.style_outline) {
            element.style_outline = element.style.outline;
            element.style.outline = '3px solid ' + color;
        }
    }

    unsetElementBorder(element: NosHTMLElement): void {
        console.log('unsetElementBoarder', element);
        if ('undefined' !== typeof element.style_outline) {
            element.style.outline = element.style_outline;
            delete element.style_outline;
        }
    }

    preventDefault(e: Event): void {
        e.preventDefault();
        //e.stopPropagation();
    }

    mouseoverAddBorder(e: MouseEvent): void {
        // TODO - not in NOS app window
        const element = (<NosHTMLElement>e.target);
        this.setElementBorder(element, 'green');
    }

    mouseooutRemoveBorder(e: MouseEvent): void {
        const element = (<NosHTMLElement>e.target);
        this.unsetElementBorder(element);
    }

    clickSelectElement(e: MouseEvent): void {
        this.preventDefault(e);
        const element = (<NosHTMLElement>e.target);
        this.unsetElementBorder(element);
        this.setElementBackground(element, 'red');
        this.capturedElements.push(element);
        this.pickerState = NOS_PICKER_STATE.SELECTED;
        this.trigger('stateChange', this.pickerState);
        this.currentElement = element;
        this.trigger('captureCurrentElement', element);
    }

    setElementBackground(element: NosHTMLElement, color: string): void {
        console.log('setElementBackground', element);
        if (!element.style_backgroundColor) {
            element.style_backgroundColor = element.style.backgroundColor ? element.style.backgroundColor : false;
        }
        element.style.backgroundColor = color;
    }

    unsetElementBackground(element: NosHTMLElement): void {
        console.log('unsetElementBackground', element);
        if (element.style_backgroundColor) {
            // style_backgroundColor will be `string` if there was a style originally
            element.style.backgroundColor = element.style_backgroundColor;
        } else {
            // style_backgroundColor will be `false` if there was no style originally
            element.style.backgroundColor = '';
        }
        delete element.style_backgroundColor;
    }

    releaseCurrentElement(): void {
        if (this.capturedElements.length) {
            const idx: number = this.capturedElements.length - 1;
            const element: NosHTMLElement = this.capturedElements[idx];
            console.log('releaseCurrentElement', element);
            this.trigger('releaseCurrentElement');
            this.unsetElementBackground(element);
            this.capturedElements.splice(idx, 1);
        }
    }

    destroyApplication(e?: KeyboardEvent): void {
        if (e) {
            this.preventDefault(e);
        }
        this.trigger('destroy');
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
            //const parent = element.parentElement;
            if (parent) {
                this.releaseCurrentElement();
                this.currentElement = parent;
                this.trigger('captureCurrentElement', this.currentElement);
                this.setElementBackground(this.currentElement, 'red');
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
            console.log('setChildElement', element, child);
            //const parent = element.parentElement;
            if (child) {
                this.releaseCurrentElement();
                this.currentElement = child;
                this.trigger('captureCurrentElement', this.currentElement);
                this.setElementBackground(this.currentElement, 'red');
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
            console.log('setPreviousElement', element, sibling);
            //const parent = element.parentElement;
            if (sibling) {
                this.releaseCurrentElement();
                this.currentElement = sibling;
                this.trigger('captureCurrentElement', this.currentElement);
                this.setElementBackground(this.currentElement, 'red');
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
            console.log('setPreviousElement', element, sibling);
            //const parent = element.parentElement;
            if (sibling) {
                this.releaseCurrentElement();
                this.currentElement = sibling;
                this.trigger('captureCurrentElement', this.currentElement);
                this.setElementBackground(this.currentElement, 'red');
                this.capturedElements.push(this.currentElement);
            }
        }
    }

    delegateEvent(type: string, mode: NOS_PICKER_MODE, state: NOS_PICKER_STATE, event: NosKeyboardEventListener | NosMouseEventListener): void {
        console.log(arguments);
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

    addHandler(type: string, mode: NOS_PICKER_MODE, state: NOS_PICKER_STATE, handler: (e: any) => void): void {
        this.eventsHandlers[type][mode] = this.eventsHandlers[type][mode] || [];
        this.eventsHandlers[type][mode][state] = this.eventsHandlers[type][mode][state] || [];
        this.eventsHandlers[type][mode][state].push(handler);
    }

    start() {
        console.log('start');
        (document.addEventListener as NosMouseEventListener)('mouseover', this.handleNosMouseEvent, this.options);
        (document.addEventListener as NosMouseEventListener)('mouseout', this.handleNosMouseEvent, this.options);
        (document.addEventListener as NosKeyboardEventListener)('keydown', this.handleNosKeyboardEvent, this.options);
        (document.addEventListener as NosMouseEventListener)('click', this.handleNosMouseEvent, this.options);
    }

    stop() {
        console.log('stop');
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
            console.log('trigger called but none present');
            return;
        }
        this.triggers[type].forEach((trigger) => {
            console.log('trigger', type, payload);
            trigger(payload);
        })
    }

}