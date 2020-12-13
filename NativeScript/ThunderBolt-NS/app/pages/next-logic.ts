
import {AppCore, EventData} from "~/Bridge/AppCore";

export function appStart(app:AppCore) {
    console.log('appStart')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from The next page!')
    setTimeout(() => {
        console.log('Next timeout')
        model.setAtPath('testValues.mainLabel', 'From next at a later time!')
    }, 1000)
}

