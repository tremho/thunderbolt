
import ComponentBase from './ComponentBase'

import {Label} from '@nativescript/core'

export class SimpleLabel extends ComponentBase {
    private label:Label

    // Override to create our label
    public createControl() {
        // no need to call super, because it doesn't exist
        this.label = new Label()
        this.label.text = this.get('text') || 'simple-label'
        this.container.addChild(this.label)
        this.addBinding(this.label, 'text', 'text')
    }


}

