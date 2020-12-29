
import {AppModel} from "../app-core/AppModel";
import {environment} from "../app-core/EnvCheck";

/*
- addMenu       // to page; add means append or insert
- addSubmenu    // to menu by id, returns submenu id
- removeMenu    // by id
- removeSubmenu // by id
- addMenuItem  // add means append or insert
- deleteMenuItem // by id
- clearMenu
- changeMenuItem // by id

binding example

<bind="menu-pageid-FILE">
    <item label={bound.FILE_SAVE.label}/>

*/
export class MenuItem {
    public label:string
    public id:string
    public role?:string // parsed and used for desktop (per Electron)
    public type?:string // submenu, separator; set to model
    public targetCode?:string // used to apply to different platforms
    public disabled?:boolean // true if menu listing should be shown as disabled; no action
    public children?: MenuItem[] // found only in incoming submenus in parsing and setup
}


// -------------
/**
 * Get the list of items belonging to a menu
 * @param menuId
 */
export function listMenuItems(model:AppModel, menuId:string):MenuItem[] {
    const items = model.getAtPath(menuId+'.$items')
    return items
}

/**
 * Add or insert an item to a menu list
 * item may be a submenu with children
 * Will create the menu if it does not already exist
 *
 * @param {string} menuId Identifier of menu
 * @param {MenuItem }item entry
 * @param {number} [position] insert position, appends if undefined.
 * @param {number} [recurseChild] leave undefined; used in recursion
 */
export function addMenuItem(model:AppModel, menuId:string, item:MenuItem, position?:number, recurseChild?:number ) {
    let items:MenuItem[] = []
    try {
        items = model.getAtPath('menu-'+menuId+'.$items')
    } catch(e) {
        items = []
        model.addSection('menu-'+menuId, {})
    }

    if(limitTarget(item)) {
        if (position === undefined) position = items.length;
        items.splice(position, 0, item)
        model.setAtPath('menu-' + menuId + '.$items', items, true)
        model.setAtPath('menu-' + menuId + '.' + item.id, item, true)
        if (item.children) {
            let dirty = false
            do {
                for(let i=0; i<item.children.length; i++) {
                    dirty = false;
                    if(!limitTarget(item.children[i])) {
                        item.children.splice(i,1)
                        dirty = true
                        break;
                    }
                }
            } while(dirty)
            const submenuId = menuId + '-' + item.id
            for (let i = (recurseChild || 0); i < item.children.length; i++) {
                if (item.children[i]) {
                    addMenuItem(model, submenuId, item.children[i], undefined, i)
                }
            }
        }
    }
}
function limitTarget(item) {
    const target = item.targetCode || ''
    // limit to the target
    let isAppBar = (target.indexOf('A') !== -1) // specifically app bar only
    let isMenuBar = !isAppBar && (target.indexOf('D') !== -1) // goes to the menu bar, not the app menu
    if(!isAppBar && !isMenuBar) {
        isAppBar = true; // mutually exclusive.  Neither targeted means put to both.
    }
    let included = true
    for(let n=0; n<target.length; n++) {
        let tc = target.charAt(n)
        included = false
        if(!tc.match(/[mwuai]/)) {
            included = true; // if it's none of these, all are good
        }
        if(tc === 'm') {
            included = environment.platform.name === 'darwin'
            break;
        }
        if(tc === 'w') {
            included = environment.platform.name === 'win32'
            break;
        }
        if(tc === 'u') {
            included = environment.platform.name === 'linux'
            break;
        }
        if(tc === 'a') {
            included = environment.platform.name === 'android'
            break;
        }
        if(tc === 'i') {
            included =  environment.platform.name === 'ios'
            break;
        }
    }
    return isAppBar && included

}

/**
 * Remove an item from a menu list
 *
 * @param menuId
 * @param itemId
 */
export function deleteMenuItem(model:AppModel, menuId:string, itemId:string) {
    const items = model.getAtPath('menu-'+menuId+'.$items')
    let rid = -1
    for(let i=0; i<items.length; i++) {
        if(items.id === itemId) {
            rid = i;
            break;
        }
    }
    if(rid !== -1) {
        items.splice(rid, 1)
    }
    model.setAtPath('menu-'+menuId+'.$items', items)
    model.setAtPath('menu-'+menuId+'.'+itemId, undefined)
}

/**
 * Replace an item in the menu list
 *
 * @param menuId
 * @param itemId
 * @param updatedItem
 */
export function changeMenuItem(model:AppModel, menuId:string, itemId:string, updatedItem:MenuItem) {
    const items = model.getAtPath(menuId+'.$items')
    let rid = -1
    for(let i=0; i<items.length; i++) {
        if(items.id === itemId) {
            rid = i;
            break;
        }
    }
    if(rid !== -1) {
        items.splice(rid, 1, updatedItem)
    }
    model.setAtPath('menu-'+menuId+'.$items', items)
    model.setAtPath('menu-'+menuId+'.'+itemId, undefined) // remove old first, in case id has changed.
    model.setAtPath('menu-'+menuId+'.'+updatedItem.id, updatedItem)
}

/**
 * Clear the menu of all its items
 *
 * @param menuId
 */
export function clearMenu(model:AppModel, menuId:string) {
    const items = model.getAtPath(menuId+'.$items')
    for(let i=0; i<items.length; i++) {
        deleteMenuItem(model, menuId, items[i].id)
    }
}



