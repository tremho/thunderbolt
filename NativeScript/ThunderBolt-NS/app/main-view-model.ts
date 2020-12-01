import { Observable } from '@nativescript/core';

export class HelloWorldModel extends Observable {
    private _message: string;

    constructor() {
        super();
        this._message = "Hello, World! This is NativeScript"
    }

    get mainLabel(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange('message', value);
        }
    }
}
