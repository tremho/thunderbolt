import {AppCore, EventData} from "~/Bridge/AppCore";

export function appStart(app:AppCore) {
    console.log('appStart MainPage')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Main Activity!')

    setTimeout(() => {
        console.log('Main timeout')
        model.setAtPath('testValues.mainLabel', 'Hello, World from a later time!')
    }, 2500)
}

export function onClick(evdata:EventData) {
    console.log('We got clicked! ')
    const app = evdata.app
    app.navigateToPage('next')
}
