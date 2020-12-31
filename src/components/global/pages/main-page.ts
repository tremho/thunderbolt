import {MenuItem} from "../../../application/MenuApi";


export function appStart(app:any) {
    console.log('appStart MainPage')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Main Activity!')
    setTimeout(() => {
        model.setAtPath('testValues.mainLabel', 'Main Activity after a second!')
    }, 1000)
}

export function onClick(ed:any) {
    console.log('We got clicked! ')
    ed.app.navigateToPage('next')

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