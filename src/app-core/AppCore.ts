
import {AppModel} from "./AppModel";
import {StringParser} from "../general/StringParser"

import {getInfoMessageRecorder, InfoMessageRecorder} from "./InfoMessageRecorder";

let imrSingleton:InfoMessageRecorder = getInfoMessageRecorder()

function writeMessage(subject:string, message:string) {
    imrSingleton.write(subject, message)
}

const mainApi = (window as any).api;

let done = true;


export default
/**
 *  Core object of the application.  Contains the app model and gateway functions for actions, which are
 *  mostly handled by action modules.
 */
class AppCore {
    private appModel:AppModel = new AppModel()
    private rootPath:string;
    private topLevelInfo:object;

    /**
     * get the model used for binding to the UI.
     */
    public get model() {
        return this.appModel
    }

    /**
     * Return an instance of StringParser for the given string
     * @param str
     */
    public makeStringParser(str) {
        return new StringParser(str)
    }
    
    /**
     * Set the root directory of the project we are concerned with
     * @param path
     */
    public setProjectRoot (path:string) {
        this.rootPath = path;  // TODO: Not currently used
    }

    public requestMessages() {
        mainApi.messageInit().then(() => {
            console.log('messages wired')
        })
    }

    public setupUIElements() {
        console.log('>>> setupUIElements >>>')
        // set the infomessage log handling
        this.model.addSection('infoMessage', { messages: [] })
        mainApi.addMessageListener('IM', data => {
            writeMessage(data.subject, data.message)
        })
        imrSingleton.subscribe(msgArray => {
            this.model.setAtPath('infoMessage.messages', msgArray)
        })

        // set up our app display
        this.model.addSection('testValues', {mainLabel: 'Hello, World! This is ThunderBolt!'})

        return Promise.resolve(); // this is called as a promise
    }
    flatten(obj) {
        const flatObj = {}
        Object.getOwnPropertyNames(obj).forEach(prop => {

            let value = obj[prop]
            if( typeof value === 'object') {
                if(!Array.isArray(value)) {
                    value = this.flatten(value)
                }
            }
            flatObj[prop] = value
        })
        return flatObj
    }

}

