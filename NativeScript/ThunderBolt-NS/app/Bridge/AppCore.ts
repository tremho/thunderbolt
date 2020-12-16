
import {environment, check} from './EnvCheck'

import {AppModel} from "./AppModel";
import {basename} from "path";
import {register, unregister} from "riot";
let StringParser, riot
let getInfoMessageRecorder, InfoMessageRecorder
if(!check.mobile) {
    try {
        StringParser = require('../general/StringParser')
        const Imr = require('./InfoMessageRecorder')
        getInfoMessageRecorder = Imr.getInfoMessageRecorder;
        InfoMessageRecorder = Imr.InfoMessageRecorder
        riot = require('riot')
    } catch(e) {}
}

let imrSingleton
if(getInfoMessageRecorder) {
    imrSingleton = getInfoMessageRecorder()
}

function writeMessage(subject:string, message:string) {
    imrSingleton.write(subject, message)
}
const mainApi = check.mobile ? null : (window as any).api;

export class EventData {
    public app:AppCore
    public sourceComponent:any
    public eventType:string
    public tag:string
    public platEvent:any
}

export class HistoryRecord {
    public pageId: string
    public context: object
}

// Singleton (used only by mobile side)
let theApp:any;
let theFrame:any;
export function setTheApp(app:any, frame:any) {
    theApp = app;
    theFrame = frame;
    // console.log('app and frame set', theApp, theFrame)
}
export function getTheApp() {
    return theApp
}

let componentGateCleared
let keyListenerBind;

/**
 *  Core object of the application.  Contains the app model and gateway functions for actions, which are
 *  mostly handled by action modules.
 */
export class AppCore {
    private appModel:AppModel = new AppModel()
    private rootPath:string;
    private currentActivity:any = null
    private history:HistoryRecord[] = []
    private pageMount:any // used only with riot
    // the gate items below are used only in the mobile version
    private componentGate:Promise<void>
    private modelGate:Promise<void>
    private componentGateResolver:any
    private modelGateResolver:any

    constructor() {
        this.modelGate = new Promise(resolve => {
            this.modelGateResolver = resolve
        })
        this.componentGate = new Promise(resolve => {
            this.componentGateResolver = resolve
        })

    }
    /**
     * get the model used for binding to the UI.
     */
    public get model() {
        return this.appModel
    }

    public waitForModel() {
        return this.modelGate
    }
    public componentIsReady() {
        this.componentGateResolver()
        componentGateCleared = true
    }
    public waitReady() {
        // console.log('waiting for ready...')
        if(componentGateCleared) return this.modelGate
        return Promise.all([this.componentGate, this.modelGate])
    }

    public setupUIElements() {
        // console.log('>>> setupUIElements >>>')

        // set the infomessage log handling
        if(!check.mobile) {
            this.componentIsReady() // not used in riot, so clear the gate

            mainApi.messageInit().then(() => {
                // console.log('messages wired')
                this.model.addSection('infoMessage', {messages: []})
                mainApi.addMessageListener('IM', data => {
                    writeMessage(data.subject, data.message)
                })
                mainApi.addMessageListener('EV', data => {
                    // console.log('event info incoming:', data)
                    let evName = data.subject;
                    let evData = data.data;
                    if (evName === 'resize') {
                        const env = this.model.getAtPath('environment')
                        if (!env.screen) env.screen = {}
                        env.screen.width = evData[0]
                        env.screen.height = evData[1]
                        this.model.setAtPath('environment', env)
                    }

                })
                imrSingleton.subscribe(msgArray => {
                    this.model.setAtPath('infoMessage.messages', msgArray)
                })
            })
        }
        this.model.addSection('navigation', {pageId: ''})


        // Set environment items
        // this will allow us to do platform branching and so on
        this.model.addSection('environment', environment)

        // Set up our app display
        // TODO: remove when done with initial setup testing
        this.model.addSection('testValues', {mainLabel: 'Hello, World! This is ThunderBolt!'})

        // console.log('<<<setupUIElements<<<')

        this.modelGateResolver()
        // console.log('model gate cleared')
        return this.waitReady()

    }

    // TODO: make part of a more defined util section
    public makeStringParser(string:string) {
        return StringParser && new StringParser(string)
    }


    private keyListener(event) {
        // console.log('key event seen '+event.key)
        if(event.isComposing || event.code === "229") {
            return;
        }
        if(event.key === "Backspace" || event.key === "Delete") {
            event.stopPropagation()
            event.preventDefault()
            this.navigateBack()
        }
    }

    private attachPageKeyListener() {
        if(!keyListenerBind) {
            keyListenerBind = this.keyListener.bind(this)
        }
        document.addEventListener('keydown', keyListenerBind)
    }
    private removePageKeyListener() {
        document.removeEventListener('keydown', keyListenerBind)
    }

    /**
     * Replaces the currently mounted page markup with the markup of the named page
     * and starts the associated activity.
     *
     * @param {string} pageId
     * @param {object} [context]
     */
    public navigateToPage(pageId:string, context?:object, skipHistory?:boolean) {

        // set the page in the model.  For Riot, this forces the page to change on update
        // for mobile, we need to do that through native navigation, but we still want the model to be the same
        this.model.setAtPath('navigation.pageId', pageId)

        // note that this isn't used on the mobile side, but we record it anyway.
        // this may be useful later if we have any history-related functionality in common.
        let curActivityId = this.currentActivity && this.currentActivity.activityId
        let curContext = this.currentActivity && this.currentActivity.context
        if(!skipHistory) {
            this.history.push({
                pageId: curActivityId,
                context: curContext
            })
        }

        if(check.mobile) {
            let pageref = '~/pages/' + pageId

            const navigationEntry = {
                moduleName: pageref,
                backstackVisible: !skipHistory
            };
            theFrame && theFrame.navigate(navigationEntry)

            // apparently, we can pass a function instead of a navigationEntry to construct a Page
            // which might be something to look at later if we want to work from our own common page definition
            // instead of writing out {N} syntax files.
            // Function needs to build full page including the layout stack and any event handlers.
            // not sure what effect this has on back history, since there's nothing passed for that.

        } else {
            const activity = findPageActivity(pageId)
            this.startPageLogic(pageId, activity)
        }
    }


    /**
     * Called by mobile side to start the first activity only ('main')
     *
     * @param activity
     * @param context
     */
    public startPageLogic(id:string, activity:any, context?:object) {
        activity.activityId = id;
        this.currentActivity = activity;

        if(!check.mobile) {
            this.attachPageKeyListener()
        }

        activity.appStart(this, context)

    }

    public navigateBack() {
        let popBack = this.history.pop()
        if(popBack) {
            // console.log(popBack)
            this.navigateToPage(popBack.pageId, popBack.context, true)
        }
    }

    /**
     * Dispatch an event to the current activity by name
     *
     * @param name
     * @param domEvent
     */
    public callEventHandler(name:string, tag:string, platEvent:any) {
        const act = this.currentActivity;
        const ed = new EventData()
        ed.app = this
        ed.platEvent = platEvent
        ed.sourceComponent = this.getComponent(platEvent.target as HTMLElement)
        ed.eventType = (platEvent as Event).type
        ed.tag = tag
        if(typeof act[name] === 'function') {
            act[name](ed)
        } else {
            console.error(`${name} is not a function exposed on current activity ${act.activityId}`)
        }
    }

    // same as the one in ComCommon, but duplicated here for use with eventData
    private getComponent(el:HTMLElement):any {
        try {
            let syms;
            do {
                if(el) {
                    syms = Object.getOwnPropertySymbols(el)
                    if (syms.length === 0) {
                        el = el.parentElement
                    }
                } else {
                    return null;
                }
            } while (syms && syms.length === 0)

            return el[syms[0]]
        } catch(e) {
            console.warn(e)
            return null;
        }
    }
}

// as it is from ComCommon
function getComponent(el) {
    try {
        let syms;
        do {
            if(el) {
                syms = Object.getOwnPropertySymbols(el)
                if (syms.length === 0) {
                    el = el.parentElement
                }
            } else {
                return null;
            }
        } while (syms && syms.length === 0)

        return el[syms[0]]
    } catch(e) {
        console.warn(e)
        return null;
    }
}
function findPageActivity(pageId) {
    const tag = pageId+'-page'
    const el = document.getElementById('root')
    const appComp = getComponent(el)
    const pageCompEl = appComp.$$(tag)[0]
    const pageComp = getComponent(pageCompEl)
    // console.log('found page', pageComp)
    return pageComp.activity
}
