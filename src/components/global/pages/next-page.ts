

export function appStart(app:any) {
    // console.log('appStart MainPage')
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World from Next Page!')
    setTimeout(() => {
        model.setAtPath('testValues.mainLabel', 'Next Page updates after 2 seconds!')
    }, 2000)
}
