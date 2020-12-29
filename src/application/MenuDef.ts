
// now to parse the madness

// we need to use the file functions common to the API
// (these come from Electron back end for desktop, and directly implemented in {N}, accessible from App-Core Wrapper)
import {AppCore} from '../app-core/AppCore'
import {MenuItem, addMenuItem} from "./MenuApi";
import {environment, check} from '../app-core/EnvCheck'

// app menu is available to all, deskmenu only for desktop platforms
// let deskmenu:MenuItem[] = [];
let appmenu:MenuItem[] = []
let curMenu

let submenus:any = {}
let mbid
let smstack:any[] = []
let nextSMID = 1

// async
function readMenuDef(app:AppCore) {
    return app.readFileText('src/application/menudef.txt').then(defText => {
        return processMenuDef(app, defText)
    })

}

function processMenuDef(app, defText) {
    const lines = defText.split('\n')
    lines.forEach(ln =>  {
        processMenuLine(ln)
    })
    // at this point we have parsed into a computable set of object maps we can translate into our model
    commuteToModel(app)
}

function processMenuLine(line) {
    line = line.trim()
    let target = ''
    let id = ''
    let label = ''
    let role = ''
    // check for comment
    let mi = line.indexOf('//')
    if(mi !== -1) {
        line = line.substring(0, mi).trim()
    }
    // check for @
    let ti = line.indexOf('@')
    // check for #
    let hi = line.indexOf('#')
    // check for :
    let ci = line.indexOf(':')
    // check for ,
    let li = line.indexOf(',')
    // check for !
    let bi = line.indexOf('!')

    if(ti !== -1) {
        let ni
        if(!ni && hi !== -1) ni = hi
        if(!ni && ci !== -1) ni = ci
        if(!ni && li !== -1) ni = li
        if(!ni && bi !== -1) ni = bi
        target = line.substring(ti+1,ni)
    }
    if(hi !== -1) {
        let xi = ci
        if(xi == -1) xi = li
        if(xi == -1) xi = bi
        if(xi === -1) xi = line.length;
        id = line.substring(hi+1,xi)
    }

    if( li === -1) li = bi
    if( li === -1) li = line.length;
    if(ci !==-1) role = line.substring(ci+1,li)
    label = line.substring(li+1).trim()


    if(bi !== -1 && id !== 'SUBMENU') {
        // this is a menubar label definition
        let mi = new MenuItem()
        mi.label = label
        mi.id = id
        mi.role = role
        mi.targetCode = target
        curMenu = mi.children = [] // start a new menu
        appmenu.push(mi)
        return;  // we're done for now
    }

    // id, target, label, role


    if(id) {
        if(id == '--') {
            // separator
            // (unique key and type identifier in either key or value)
            // label = id; // --
            // id = '$SEP-'+nextSMID++ // shared with submenu id counts
            role = 'separator'
        }
        // process normal line
        let mi = new MenuItem()
        mi.label = label;
        mi.role = role;
        mi.id = id;
        mi.targetCode = target

        if (id === 'ENDSUBMENU') {
            // pop to previous submenu level
            curMenu = smstack.pop()
        } else {
            curMenu.push(mi)
        }
        if (id === 'SUBMENU') {
            //create a new submenu
            smstack.push(curMenu)
            curMenu = mi.children = []
        }
    }

}

/* Take the parsed intermediate objects and translate them into our model format

We could make the entire menu (for a page) a single object (i.e. take deskmenu/appmenu as they are)
But I like the idea of having each menu list a section.
This means submenus need to get assigned an id (parent id+[label, ordinal]?) and given their own sections.
each menu list then needs an array plus a section id, or otherwise be enumerable in proper order.
binding is then done to these section values.

we also need a menu api so we can programmatically make the menu models.
- addMenu       // to page; add means append or insert
- addSubmenu    // to menu by id, returns submenu id
- removeMenu    // by id
- removeSubmenu // by id
- addMenuItem  // add means append or insert
- deleteMenuItem // by id
- clearMenu
- changeMenuItem // by id


All of this pertains to the model.

menu-pageId-list [APP, FILE, EDIT]
menu-pageId-APP
menu-pageId-FILE
menu-pageId-EDIT
menu-pageId-submenu-1
menu-pageId-submenu-2

 */

function commuteToModel(app:AppCore) {

    const model = app.model;
    console.log('Make model out of this', appmenu);
    const topItem = new MenuItem()
    topItem.id = topItem.label = 'appmenu'
    addMenuItem(model, 'appmenu', topItem)
    for(let i=0; i<appmenu.length; i++) {
        addMenuItem(model, 'appmenu', appmenu[i])
    }

    // now the desktop items
    app.setupDesktopMenu(appmenu)

}


// Entry point called from AppCore::setupUIElements
export function setupMenu(app:AppCore) {
    return readMenuDef(app)
}