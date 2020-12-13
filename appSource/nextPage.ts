

// Desktop
import {AppCore} from '../src/app-core/AppCore'

export function appStart(app:AppCore) {
    console.log('appStart')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from The next page!')
    setTimeout(() => {
        model.setAtPath('testValues.mainLabel', 'Next Page after a second!')
    }, 1000)
}

