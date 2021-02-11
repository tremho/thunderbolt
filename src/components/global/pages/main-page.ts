import {MenuItem} from "../../../application/MenuApi";
import Log from "../../../app-core/Log"
import LogTest from './logtest'

export function appStart(app:any) {

    const obj = {
        hello: 'world'
    }
    const dt = new Date()
    Log.debug('This is a debug line')
    Log.log('This is a log line')
    Log.info('This is an info line')
    Log.warn('This is your last warning')
    Log.debug('This is a debug line with two appended objects', obj, dt)
    Log.error("You didn't listen, now it's an error")
    try {
        let x = null
        x.foo = 'hello'
    } catch(e) {
        Log.exception('This is an exception', e)
    }
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Main Activity!')
    setTimeout(() => {
        model.setAtPath('testValues.mainLabel', 'Main Activity after a second!')
    }, 1000)

    setMenuHandlers(app)
}

export function onClick(ed:any) {
    Log.info('We got clicked! ')
    Log.crash('this is a crash log')
    ed.app.navigateToPage('next')
}
export function onIndTest(ed:any) {
    const obj = {
        foo:'foo',
        bar:'bar',
        num: 42
    }
    Log.warn('toggle indicator', obj)
    let current = ed.app.model.getAtPath('indicator-IN3.state')
    let next = (current !== 'on') ? 'on' : ''
    ed.app.model.setAtPath('indicator-IN3.state',next,true)

    LogTest()
}
export function onToolAction(toolEvent) {
    Log.warn('tool action', toolEvent)
}
export function onMenuAction(menuEvent) {
    Log.info('main sees a menu action for ',menuEvent.id)
    const app = menuEvent.app;
    const menuApi = app.MenuApi
    if(menuEvent.id === 'TEST_NEWITEM') {
        const newMenuItem = new MenuItem()
        newMenuItem.label = 'Newly Added Item'
        newMenuItem.id = 'TEST_ADDEDITEM'
        menuApi.addMenuItem("main-OPTIONS-TEST", newMenuItem)
    }
    if(menuEvent.id === 'TEST_ADDEDITEM') {
        menuApi.deleteMenuItem("main-OPTIONS-TEST", menuEvent.id)
    }
    if(menuEvent.id === 'TEST_DISABLE') {
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_NEWITEM', false)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ADDEDITEM', false)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_DISABLE', false)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ENABLE', true)
    }
    if(menuEvent.id === 'TEST_ENABLE') {
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_NEWITEM', true)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ADDEDITEM', true)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_DISABLE', true)
        menuApi.enableMenuItem("main-OPTIONS-TEST", 'TEST_ENABLE', false)
    }

}

function setMenuHandlers(app) {
    app.registerMenuHandler('VERTICAL_STACK', (menuEvent) => {
        app.navigateToPage('stack-test', {type:'vertical'})
    })
    app.registerMenuHandler('HORIZONTAL_STACK', (menuEvent) => {
        app.navigateToPage('stack-test', {type:'horizontal'})
    })
    app.registerMenuHandler('VERTICAL_STACK_ALIGNED', (menuEvent) => {
        app.navigateToPage('stack-test', {type:'vertical-spaced'})
    })
    app.registerMenuHandler('HORIZONTAL_STACK_ALIGNED', (menuEvent) => {
        app.navigateToPage('stack-test', {type:'horizontal-spaced'})
    })
}
