import {MenuItem} from "../../../application/MenuApi";


export function appStart(app:any) {
    console.log('appStart MainPage')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Main Activity!')
    setTimeout(() => {
        model.setAtPath('testValues.mainLabel', 'Main Activity after a second!')
    }, 1000)

    setMenuHandlers(app)
}

export function onClick(ed:any) {
    console.log('We got clicked! ')
    ed.app.navigateToPage('next')
}
export function onIndTest(ed:any) {
    console.log('toggle indicator')
    let current = ed.app.model.getAtPath('indicator-IN3.state')
    let next = (current !== 'on') ? 'on' : ''
    ed.app.model.setAtPath('indicator-IN3.state',next,true)
}
export function onToolAction(toolEvent) {
    console.log('tool action', toolEvent)
}
export function onMenuAction(menuEvent) {
    console.log('main sees a menu action for ',menuEvent.id)
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