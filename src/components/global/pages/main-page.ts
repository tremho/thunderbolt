

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