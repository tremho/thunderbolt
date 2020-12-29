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
    if(menuEvent.id == 'TEST_NEWITEM') {
        const app = menuEvent.app;
        const newMenuItem = new MenuItem()
        newMenuItem.label = 'Newly Added Item'
        const menuApi = app.MenuApi
        menuApi.addMenuItem(app.model, "TEST", newMenuItem)
    }
}