

// Nativescript
import { EventData, Page, Frame } from '@nativescript/core';
import {AppCore, setTheApp} from '../Bridge/AppCore'
import * as PageLogic from './main-logic'

let coreApp
export function onLoaded(args: EventData) { // navigatedTo
    console.log('in onLoaded (MAIN)')
    const page = <Page>args.object;
    console.log('page frame ', page.frame, Frame.topmost())

    coreApp = new AppCore()
    setTheApp(coreApp, Frame.topmost())
}
export function onNavigatedTo() {
    console.log('in onNavigatedTo (MAIN)')

    coreApp.setupUIElements().then(() => {
        coreApp.startPageLogic('main', PageLogic)
    })
}
