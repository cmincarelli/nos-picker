///<reference path="optimal-select.d.ts"/>

import Vue from 'vue';
import { getMultiSelector, getSingleSelector } from 'optimal-select';

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

interface NOSPickerVue extends Vue {
    captureCurrentElement: (element: NosHTMLElement) => void,
    releaseCurrentElement: () => void,
    setState: (state: NOS_PICKER_STATE) => void,
    setMode: (mode: NOS_PICKER_MODE) => void
}

import { NosPickerEvents } from './events';

export class NosPicker {
    private vm: NOSPickerVue;
    private events: NosPickerEvents;

    public hasStarted: boolean;
    public pickerMode: NOS_PICKER_MODE;
    public pickerState: NOS_PICKER_STATE;

    constructor(events: NosPickerEvents) {
        this.events = events;
        this.hasStarted = false;
        this.pickerMode = this.events.getPickerMode();
        this.pickerState = this.events.getPickerState();

        this.events.on('captureCurrentElement', (element) => {
            this.vm.captureCurrentElement(element);
        });

        this.events.on('releaseCurrentElement', () => {
            this.vm.releaseCurrentElement();
        });

        this.events.on('modeChange', (mode) => {
            this.pickerMode = mode;
            this.vm.setMode(mode);
        });

        this.events.on('stateChange', (state) => {
            this.pickerState = state;
            this.vm.setState(state);
        });

        this.events.on('destroy', () => {
            this.destroyAppWindow();
        });
    }

    createAppWindow(mode: NOS_PICKER_MODE) {
        if (this.hasStarted) {
            // don't rerun this process
            return;
        }

        this.hasStarted = true;
        this.pickerMode = mode;
        this.events.setPickerMode(mode);

        const div: NosHTMLElement = document.createElement('div');
        div.id = 'nos-app';
        document.body.appendChild(div);

        this.vm = new Vue({
            el: "#nos-app",
            template: `
                <div id="nos-app" class="nos-body nos-outer">
                <div class="nos-container-fluid">
                    <div class="nos-inner">

                        <div class="nos-row">
                            <div class="nos-col-xs-12">
                                <span v-for="(item, index) in capturedElements" class="nos-badge">&gt; {{ item.tagName }}</span>
                            </div>
                        </div>

                        <hr>

                        <div class="nos-row">
                            <form>
                            <div class="nos-col-xs-4">
                                <div class="nos-form-group">
                                    <label class="nos-label" for="tagName">Tag:</label>
                                    <div class="nos-input">
                                        <input v-model="element.tagName" type="text" class="nos-form-control">
                                    </div>
                                </div>
                                <div class="nos-form-group">
                                    <label class="nos-label" for="selector">Selector:</label>
                                    <div class="nos-input-group">
                                        <input v-model="selector" type="text" class="nos-form-control">
                                        <div class="nos-input-group-addon">
                                            {{ selectorCount }}
                                        </div>
                                    </div>
                                </div>
                                <div class="nos-form-group">
                                    <label class="nos-label" for="attributes">Attributes:</label>
                                    <select class="nos-form-control" v-model="attributeIdx" @change="selectedAttributeIndex(attributeIdx)">
                                        <option v-for="(item, index) in attributes" v-bind:value="index">{{item.name}}</option>
                                    </select>
                                </div>
                                <div class="nos-form-group">
                                    <label class="nos-label" for="attributeValue">Attribute Value:</label>
                                    <input class="nos-form-control" v-model="attribute.value">
                                </div>
                            </div>
                            <div class="nos-col-xs-4">
                                <div class="nos-form-group">
                                    <input type="radio" name="regex-match" value="innerHTML" v-model="regexMode">InnerHTML</select>
                                    <textarea class="nos-form-control">{{ (element.innerHTML || '').trim() }}</textarea>
                                </div>
                                <div class="nos-form-group">
                                    <input type="radio" name="regex-match" value="innerText" v-model="regexMode" selected>InnerText</select>
                                    <textarea class="nos-form-control">{{ (element.innerText || '').trim() }}</textarea>
                                </div>
                            </div>
                            <div class="nos-col-xs-4">
                                <div class="nos-form-group">
                                    <label class="nos-label" for="Regexp">RegExp:</label>
                                    <div class="nos-input">
                                        <input v-model="regexp" type="text" class="nos-form-control">
                                    </div>
                                </div>
                                <div class="nos-form-group">
                                    <label class="nos-label" for="Replace">Replace:</label>
                                    <div class="nos-input">
                                        <input v-model="replace" type="text" class="nos-form-control">
                                    </div>
                                </div>
                                <div class="nos-form-group">
                                    <label class="nos-label" for="Final">Final:</label>
                                    <textarea class="nos-form-control">{{ (final || '').trim() }}</textarea>
                                </div>
                            </div>
                            </form>
                        </div>

                        <div class="nos-row">
                            <div class="nos-col-xs-12" v-if="0 == state">
                                <small class="nos-text-muted">Mouse over and click desired element.</small>
                            </div>
                            <div class="nos-col-xs-12" v-if="1 == state">
                                <small class="nos-small nos-text-muted">
                                    Use arrow keys to refine. UP to select parent, DOWN to select 1st child.
                                    LEFT and RIGHT to select previous and next siblings, and [ESC] to reset.
                                </small>
                            </div>
                        </div>

                    </div>
                </div>
                </div>
            `,
            data: {
                element: document.body,
                capturedElements: new Array<NosHTMLElement>(),
                attributeIdx: 0,
                attribute: { name: '', value: '' },
                state: 0,
                mode: 0,
                regexp: '',
                replace: '',
                regexMode: 'innerText',
            },
            computed: {
                final: function (): string {
                    try {
                        const re = new RegExp(this.regexp, 'g');
                        return ((<NosHTMLElement>this.element)[this.regexMode] || '').replace(re, this.replace);
                    } catch(e) {
                        return ((<NosHTMLElement>this.element)[this.regexMode] || '');
                    }
                },
                selectorCount: function (): number {
                    try {
                        return document.querySelectorAll(this.selector).length;
                    } catch(e) {
                        console.log('Could not execute querySelectorAll with', this.selector);
                        return 0;
                    }
                },
                selector: function (): string {
                    let selector: string = '';
                    if (this.capturedElements.length > 1) {
                        try {
                            selector = getMultiSelector(this.capturedElements, {
                                ignore: {
                                    style: true
                                }
                            });
                        } catch(e) {
                            // cannot get a selector
                            console.log('Could not execute getMultiSelector with', this.capturedElements, this.capturedElements.length);
                        }
                    } else {
                        try {
                            selector = getSingleSelector(this.element, {
                                ignore: {
                                    style: true
                                }
                            });
                        } catch (e) {
                            // cannot get a selector
                            console.log('Could not execute getSingleSelector with', this.element);
                        }
                    }
                    return selector;
                },
                attributes: function (): any[] {
                    return Array.prototype.slice.call(this.element.attributes).map((a: any) => { return { name: a.localName, value: a.value } })
                }
            },
            methods: {
                selectedAttributeIndex(idx: number) {
                    this.attribute = this.attributes[idx];
                },
                releaseCurrentElement() {
                    this.element = document.body;
                    this.capturedElements.splice(this.capturedElements.length - 1, 1);
                },
                captureCurrentElement(element: NosHTMLElement) {
                    // clean css selector
                    console.log('className before', element.className, element);
                    element.className = element.className.replace(/[^a-zA-Z0-9\s-]/g, '-').replace(/\s+/g, ' ');
                    console.log('className after', element.className, element);
                    this.element = element;
                    this.capturedElements.push(element);
                },
                setState(state: NOS_PICKER_STATE) {
                    console.log('vm:state', state);
                    this.state = state;
                },
                setMode(mode: NOS_PICKER_MODE) {
                    console.log('vm:mode', mode);
                    this.mode = mode;
                }
            },
            watch: {
                element: function () {
                    this.attributeIdx = 0;
                    this.attribute = this.attributes.length ? this.attributes[this.attributeIdx] : { name: '', value: '' };
                }
            },
            created: function () {
                this.attribute = this.attributes.length ? this.attributes[this.attributeIdx] : { name: '', value: '' };
            }
        });

        this.events.start();

        return this;
    }

    destroyAppWindow() {
        this.events.stop();
        if (this.vm && this.vm.$destroy) {
            this.vm.$destroy();
            const app = document.getElementById('nos-app');
            if (null !== app && null !== app.parentNode) {
                app.parentNode.removeChild(app);
            }
        }
        this.hasStarted = false;
    }
}