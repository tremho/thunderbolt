
import ComponentBase from './ComponentBase'
import {ActionBar, NavigationButton, View, Label, Color, FlexboxLayout, GridLayout} from '@nativescript/core'
import {GridUnitType, ItemSpec} from "@nativescript/core/ui/layouts/grid-layout"

const ITEMBOXSIZE = 12; // TODO: Compute from screen height
const TITLESIZE = 16; // TODO: Compute from screen height

export class TitleBar extends ActionBar {
    private _isInit:boolean

    constructor() {
        super();
        this.on('layoutChanged', () => {
            // console.log('in layoutChanged')
            if (!this._isInit) {
                this._isInit = true

                const toolbars = this.get('toolbars')
                const menu = this.get('menu')
                const indicators = this.get('indicators')

                if (!this.get('noBack')) {
                    const nb = new NavigationButton()
                    //text="Go Back" android.systemIcon="ic_menu_back" tap="onNavBtnTap"
                    nb.text = "Back"
                    if (nb.android) {
                        nb.android.systemIcon = 'ic_menu_back'
                    }
                    nb.on('tap', (e) => {
                        console.log('Back button pressed -- go back')
                    })
                    this.navigationButton = nb
                }
                const rowLayout = new GridLayout()
                // *,50,auto,2*  (toolbar, menu, title, indicators)
                rowLayout.addColumn(new ItemSpec(1, GridUnitType.STAR))
                rowLayout.addColumn(new ItemSpec(1, GridUnitType.AUTO))
                rowLayout.addColumn(new ItemSpec(2, GridUnitType.STAR))

                // add any toolbar items
                class TBEntry {
                    public label:string
                    public action:string

                    constructor(line:string) {
                        let parts = line.split('=>')
                        this.label = parts[0].trim()
                        if(parts[1]) this.action = parts[1].trim()
                    }
                }
                const tooldefs:TBEntry[] = []
                const tbList = toolbars.split('\n')
                for(let i=0; i < tbList.length; i++) {
                    if(tbList[i]) tooldefs.push(new TBEntry(tbList[i]))
                }
                const tbfb = new FlexboxLayout()
                tbfb.flexDirection = "row"
                tbfb.justifyContent = "space-around"
                tbfb.backgroundColor = new Color("aliceblue")
                tbfb.alignItems = "center"
                tbfb.paddingLeft = 0
                tbfb.paddingRight = 4;
                for(let i=0; i < tooldefs.length; i++) {
                    const td = tooldefs[i]
                    if(td.label) {
                        const tb = new Label()
                        tb.text = td.label
                        tb.on('tap', (e) => {
                            console.log(`toolbutton ${td.label} pressed. call "${td.action}"`)
                        })
                        tb.fontSize = ITEMBOXSIZE * 0.8
                        tb.padding = 0
                        tb.color = new Color('black')
                        tb.borderColor = new Color('darkblue')
                        tb.borderWidth = 2
                        tbfb.addChild(tb)
                    }
                }
                rowLayout.addChildAtCell(tbfb, 0, 0)

                // add menu
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
                        console.log('open Menu')
                    })
                }
                rowLayout.addChildAtCell(mnu, 0, 1)

                // title
                const title = new Label()
                title.padding = 0
                title.text = this.get('title') || 'ThunderBolt'
                title.fontSize = TITLESIZE
                title.marginTop = -TITLESIZE / 5
                title.color = new Color('black')
                title.horizontalAlignment = 'left'
                title.paddingLeft = title.paddingRight = 8;
                rowLayout.addChildAtCell(title, 0, 2)

                // indicators
                const inddefs:string[] = []
                const indList = indicators.split('\n')
                for(let i=0; i < indList.length; i++) {
                    inddefs.push(indList[i].trim())
                }
                const infb = new FlexboxLayout()
                infb.flexDirection = "row-reverse"
                infb.backgroundColor = new Color('papayawhip')
                infb.alignItems = 'center'
                infb.horizontalAlignment = 'right'

                for(let i=0; i < inddefs.length; i++) {
                    const nd = inddefs[i]
                    if(nd) {
                        const nc = new Label()
                        nc.text = nd
                        nc.padding = 0
                        nc.fontSize = ITEMBOXSIZE * 0.8
                        nc.borderColor = 'black'
                        nc.borderWidth = 1
                        infb.addChild(nc)
                    }
                }
                rowLayout.addChildAtCell(infb, 0, 3)

                rowLayout.height = TITLESIZE
                rowLayout.paddingRight = TITLESIZE / 2.5
                rowLayout.paddingLeft = 0
                this.titleView = rowLayout

            }
        })
    }

}

