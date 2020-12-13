import {EventData, Frame, Page} from '@nativescript/core';
import {AppCore, setTheApp} from '../Bridge/AppCore'
import * as PageLogic from './next-logic'


let coreApp
export function onLoaded(args: EventData) { // navigatedTo
    console.log('in onLoaded (NEXT)')
    const page = <Page>args.object;
    console.log('page frame ', page.frame, Frame.topmost())

    coreApp = new AppCore()
    setTheApp(coreApp, Frame.topmost())
}
export function onNavigatedTo() {
    console.log('in onNavigatedTo (NEXT)')

    coreApp.setupUIElements().then(() => {
        coreApp.startPageLogic('next', PageLogic)
    })
}
