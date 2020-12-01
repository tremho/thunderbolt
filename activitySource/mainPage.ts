

// Desktop
import AppCore from '../src/app-core/AppCore'

export function appStart(app:AppCore) {
    console.log('appStart')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Desktop!')
}

