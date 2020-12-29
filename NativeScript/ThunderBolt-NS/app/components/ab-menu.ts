
import ComponentBase from './ComponentBase'
import {Color, Label, StackLayout} from '@nativescript/core'
const ITEMBOXSIZE = 12; // TODO: Compute from screen height

class SubMenu extends Label {
    public subItems:string[] = []
}

export class AbMenu extends ComponentBase {
    private label:Label

    // Override to create our label
    public createControl() {
        const menu = this.get('menu')
        const mnu = new Label()
        if(menu) {
            mnu.padding = 0;
            mnu.fontSize = ITEMBOXSIZE * 0.8
            mnu.borderColor = new Color('darkkhaki')
            mnu.borderWidth = 1
            mnu.color = new Color('black')
            // mnu.lineHeight = mnu.width = mnu.height = ITEMBOXSIZE
            mnu.text = '\u2630'
            mnu.paddingLeft = mnu.paddingRight = 4;
            mnu.on('tap', (e) => {
                this.openMenu(menu.split('\n'))
            })
        }
        this.container.addChild(mnu)
        // this.addBinding(this.label, 'text', 'text')
    }

    private makeDrop(menuItems:string[]) {
        const drop = new StackLayout()
        for(let i=0; i<menuItems.length; i++) {
            let item = menuItems[i]
            let mi = item.indexOf(':')
            let modifiers:string[] = []

            if(mi !== -1) {
                modifiers = item.substring(mi+1).toLowerCase().split(',')
            } else {
                mi = item.length
            }
            let [label, action] = item.substring(0, mi).split('=>')
            label = label.trim()
            action = action && action.trim()
            if(modifiers.indexOf('submenu') !== -1) {
                const submenu = new SubMenu()
                submenu.text = label + ' \u25b8'
                submenu.subItems = []
                submenu.on('tap', (e) => {
                    for(let j=i+1; j<menuItems.length; j++) {
                        let subItem = menuItems[j].toLowerCase().trim()
                        if(subItem === 'end-submenu') {
                            i = j
                            break;
                        } else {
                            submenu.subItems.push(subItem)
                        }
                    }
                    console.log(`Submenu ${label} pressed. Drop "`)
                })
                drop.addChild(submenu)
            } else {
                const lbl = new Label()
                lbl.text = label
                lbl.on('tap', (e) => {
                    console.log(`Menu item ${label} pressed. call "${action}"`)
                })
                drop.addChild(lbl)
            }
        }
        return drop
    }
    private openMenu(menuItems:string[]) {
        console.log('open Menu')
        const drop = this.makeDrop(menuItems)
        this.addChild(drop)

    }


}

