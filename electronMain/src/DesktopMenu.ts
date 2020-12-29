
import {MenuItem} from '../../src/application/MenuApi'
import {Menu} from "electron";
import {AppGateway} from "./AppGateway";

let appGa

const template = [

]


/**
 *
 * @param item
 * @param {string} target if defined, presence  of letters 'mwuai' specify targets
 *                  'mac, windows, linux, android, ios', respectively.
 *                  Note that android and ios are always excluded, since this is a desktop menu implementation.
 */
export function addMenuItem(menuArray=null, item:MenuItem) {
    const target = item.targetCode || ''
    if(!menuArray) menuArray = template;
    let included = true
    for(let n=0; n<target.length; n++) {
        let tc = target.charAt(n)
        included = false
        if(!tc.match(/[mwu]/)) {
            included = true; // if it's none of these, all are good
        }
        if(tc === 'm') {
            included = process.platform === 'darwin'
            break;
        }
        if(tc === 'w') {
            included = process.platform === 'win32'
            break;
        }
        if(tc === 'u') {
            included = process.platform === 'linux'
            break;
        }
    }
    if(included) {
        const dmi:any = {
            label: item.label,
            role: item.role,
            id: item.id,
            click: onMenuItem
        }
        if(item.label === '--') {
            dmi.type = 'separator'
            delete dmi.label
        }
        if(item.children) {
            dmi.type = 'submenu'
            let submenu:any = []
            item.children.forEach(smi => {
                addMenuItem(submenu, smi)
            })
            dmi.submenu = submenu
        }
        menuArray.push(dmi)
    }
}

function onMenuItem(item, browserWindow, event) {
    let id = item.id
    console.log('Clicked on Desktop menu item '+id)
    AppGateway.sendMessage('EV', {subject: 'menuAction', data: id})
}

/**
 * When all items have been added to menu template, this
 * actuates it into the menu bar
 */
export function realiseMenu() {
    const menu = Menu.buildFromTemplate(template)
    //console.log('Menu built from template', JSON.stringify(template, null, 2))
    Menu.setApplicationMenu(menu)
}
