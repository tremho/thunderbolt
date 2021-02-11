"use strict";
// now to parse the madness
exports.__esModule = true;
exports.setupMenu = void 0;
var MenuApi_1 = require("./MenuApi");
var appmenu = [];
var appTools = [];
var appIndicators = [];
var curMenu;
var smstack = [];
// async
function readMenuDef(app) {
    return app.readFileText('src/application/menudef.txt').then(function (defText) {
        return processMenuDef(app, defText);
    });
}
var processing = '';
var resourcePath = '';
var menuName = '';
var toolbarName = '';
var indicatorName = '';
function processMenuDef(app, defText) {
    var lines = defText.split('\n');
    lines.forEach(function (ln) {
        processDefinition(app, ln);
        if (menuName) {
            processMenuLine(ln);
        }
        else if (toolbarName) {
            processToolLine(ln);
        }
        else if (indicatorName) {
            processIndicatorLine(ln);
        }
    });
    commuteToModel(app); // pick up last one
}
function processDefinition(app, line) {
    var tag = "DEFINE";
    var rptag = "RESOURCE PATH";
    var mntag = "MENU";
    var tbtag = "TOOLBAR";
    var intag = "INDICATORS";
    if (line.indexOf(tag) === 0) {
        // at this point we have parsed into a computable set of object maps we can translate into our model
        commuteToModel(app);
        menuName = toolbarName = indicatorName = resourcePath = '';
        var proc = line.substring(tag.length + 1);
        if (proc.indexOf(rptag) !== -1) {
            var qi = proc.indexOf('"') + 1;
            if (qi) {
                var qe = proc.indexOf('"', qi);
                resourcePath = proc.substring(qi, qe);
            }
        }
        else if (proc.indexOf(mntag) !== -1) {
            var qi = proc.indexOf('"') + 1;
            if (qi) {
                var qe = proc.indexOf('"', qi);
                menuName = proc.substring(qi, qe);
            }
        }
        else if (proc.indexOf(tbtag) !== -1) {
            var qi = proc.indexOf('"') + 1;
            if (qi) {
                var qe = proc.indexOf('"', qi);
                toolbarName = proc.substring(qi, qe);
            }
        }
        else if (proc.indexOf(intag) !== -1) {
            var qi = proc.indexOf('"') + 1;
            if (qi) {
                var qe = proc.indexOf('"', qi);
                indicatorName = proc.substring(qi, qe);
            }
        }
    }
}
function processMenuLine(line) {
    line = line.trim();
    var target = '';
    var id = '';
    var label = '';
    var role = '';
    // check for comment
    var mi = line.indexOf('//');
    if (mi !== -1) {
        line = line.substring(0, mi).trim();
    }
    // check for @
    var ti = line.indexOf('@');
    // check for #
    var hi = line.indexOf('#');
    // check for >>
    var sm = line.indexOf('>>');
    var es = line.indexOf('<<');
    // check for :
    var ci = line.indexOf(':');
    // check for ,
    var li = line.indexOf(',');
    // check for !
    var bi = line.indexOf('!');
    var di = line.indexOf('<');
    var ai = line.indexOf('[');
    if (ti !== -1) {
        var ni = void 0;
        if (!ni && hi !== -1)
            ni = hi;
        if (!ni && ci !== -1)
            ni = ci;
        if (!ni && li !== -1)
            ni = li;
        if (!ni && bi !== -1)
            ni = bi;
        target = line.substring(ti + 1, ni);
    }
    if (hi !== -1) {
        var xi = ci;
        if (xi == -1)
            xi = li;
        if (xi == -1)
            xi = bi;
        if (xi === -1)
            xi = line.length;
        id = line.substring(hi + 1, xi);
    }
    if (sm !== -1) {
        var xi = bi;
        if (xi === -1)
            xi = line.length;
        id = line.substring(sm + 2, xi);
    }
    if (li === -1)
        li = bi;
    if (li === -1)
        li = line.length;
    if (ci !== -1)
        role = line.substring(ci + 1, li);
    var le = 0;
    if (di !== -1)
        le = di;
    if (!le && ai !== -1)
        le = ai;
    if (!le)
        le = line.length;
    label = line.substring(li + 1, le).trim();
    var mods = [];
    if (di !== -1) {
        var edi = line.indexOf('>', di);
        if (edi !== -1) {
            mods = line.substring(di + 1, edi).split(',');
        }
    }
    var accs = [];
    if (ai !== -1) {
        var eai = line.indexOf(']', ai);
        if (eai !== -1) {
            accs = line.substring(ai + 1, eai).split(',');
        }
    }
    if (bi !== -1 && sm === -1) {
        // this is a menubar label definition
        var mi_1 = new MenuApi_1.MenuItem();
        mi_1.label = label;
        mi_1.id = id;
        mi_1.role = role;
        mi_1.accelerator = accs[0];
        mi_1.targetCode = target;
        applyMods(mi_1, mods);
        curMenu = mi_1.children = []; // start a new menu
        appmenu.push(mi_1);
        return; // we're done for now
    }
    // id, target, label, role
    if (id || es !== -1) {
        if (id == '--') {
            // separator
            // (unique key and type identifier in either key or value)
            // label = id; // --
            // id = '$SEP-'+nextSMID++ // shared with submenu id counts
            role = 'separator';
        }
        // process normal line
        var mi_2 = new MenuApi_1.MenuItem();
        mi_2.label = label;
        mi_2.role = role;
        mi_2.accelerator = accs[0];
        mi_2.id = id;
        mi_2.targetCode = target;
        applyMods(mi_2, mods);
        if (es !== -1) {
            // pop to previous submenu level
            curMenu = smstack.pop();
        }
        else {
            curMenu.push(mi_2);
        }
        if (sm !== -1) {
            //create a new submenu
            smstack.push(curMenu);
            curMenu = mi_2.children = [];
        }
    }
}
function applyMods(item, mods) {
    mods.forEach(function (m) {
        m = m.toLowerCase();
        if (m === 'disabled') {
            item.disabled = true;
        }
        if (m === 'checked') {
            item.type = 'checkbox';
            item.checked = true;
        }
        if (m === 'enabled') {
            item.disabled = false;
        }
        if (m === 'unchecked') {
            item.type = 'checkbox';
            item.checked = false;
        }
        if (m.indexOf('icon') === 0) {
            var e = m.indexOf('=');
            item.icon = m.substring(e + 1).trim();
        }
        // sublabel has no effect on mac
        if (m.indexOf('sublabel') === 0) {
            var e = m.indexOf('=');
            item.sublabel = m.substring(e + 1).trim();
        }
        if (m.indexOf('tooltip') === 0) {
            var e = m.indexOf('=');
            item.tooltip = m.substring(e + 1).trim();
        }
    });
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
function commuteToModel(app) {
    var model = app.model;
    if (menuName) {
        for (var i = 0; i < appmenu.length; i++) {
            app.MenuApi.addMenuItem(menuName, appmenu[i]);
        }
    }
    if (toolbarName) {
        app.MenuApi.addToolbarItems(toolbarName, appTools);
    }
    if (indicatorName) {
        app.MenuApi.addIndicatorItems(indicatorName, appIndicators);
    }
}
function processToolLine(line) {
    line = line.trim();
    console.log('tool line', line);
    var target = '';
    var id = '';
    var label = '';
    // check for comment
    var mi = line.indexOf('//');
    if (mi !== -1) {
        line = line.substring(0, mi).trim();
    }
    // check for @
    var ti = line.indexOf('@');
    // check for #
    var hi = line.indexOf('#');
    // check for ,
    var li = line.indexOf(',');
    // check for !
    var bi = line.indexOf('!');
    // check for mods
    var di = line.indexOf('<');
    // check for accelerators
    var ai = line.indexOf('[');
    if (ti !== -1) {
        var ni = void 0;
        if (!ni && hi !== -1)
            ni = hi;
        if (!ni && li !== -1)
            ni = li;
        if (!ni && bi !== -1)
            ni = bi;
        target = line.substring(ti + 1, ni);
    }
    if (hi !== -1) {
        var xi = li;
        if (xi == -1)
            xi = bi;
        if (xi === -1)
            xi = line.length;
        id = line.substring(hi + 1, xi);
    }
    if (li === -1)
        li = bi;
    if (li === -1)
        li = line.length;
    var le = 0;
    if (di !== -1)
        le = di;
    if (!le && ai !== -1)
        le = ai;
    if (!le)
        le = line.length;
    label = line.substring(li + 1, le).trim();
    var mods = [];
    if (di !== -1) {
        var edi = line.indexOf('>', di);
        if (edi !== -1) {
            mods = line.substring(di + 1, edi).split(',');
        }
        else {
            console.error('Missing closing > in tool declaration ' + id);
        }
    }
    var accs = [];
    if (ai !== -1) {
        var eai = line.indexOf(']', ai);
        if (eai !== -1) {
            accs = line.substring(ai + 1, eai).split(',');
        }
    }
    // target filter
    if (id) {
        var item_1 = new MenuApi_1.ToolItem();
        item_1.label = label;
        item_1.id = id;
        mods.forEach(function (m) {
            m = m.trim();
            if (m === 'disabled') {
                item_1.state = 'disabled';
            }
            if (m === 'enabled') {
                item_1.state = '';
            }
            if (m.indexOf('state') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_1.state = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('icon') === 0) {
                var c = m.indexOf(':');
                var e = m.indexOf('=');
                if (e === -1)
                    e = m.length;
                var state = 'default';
                if (c !== -1) {
                    state = m.substring(c + 1, e);
                }
                if (!item_1.icons)
                    item_1.icons = {};
                item_1.icons[state] = m.substring(e + 1).trim();
            }
            if (m.indexOf('tooltip') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_1.tooltip = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('class') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_1.className = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('type') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_1.type = m.substring(b + 1).trim();
                }
            }
        });
        item_1.accelerator = accs[0];
        appTools.push(item_1);
    }
}
function processIndicatorLine(line) {
    console.log('indicator line', line);
    line = line.trim();
    console.log('tool line', line);
    var target = '';
    var id = '';
    var label = '';
    // check for comment
    var mi = line.indexOf('//');
    if (mi !== -1) {
        line = line.substring(0, mi).trim();
    }
    // check for @
    var ti = line.indexOf('@');
    // check for #
    var hi = line.indexOf('#');
    // check for ,
    var li = line.indexOf(',');
    // check for !
    var bi = line.indexOf('!');
    // check for mods
    var di = line.indexOf('<');
    if (ti !== -1) {
        var ni = void 0;
        if (!ni && hi !== -1)
            ni = hi;
        if (!ni && li !== -1)
            ni = li;
        if (!ni && bi !== -1)
            ni = bi;
        target = line.substring(ti + 1, ni);
    }
    if (hi !== -1) {
        var xi = li;
        if (xi == -1)
            xi = bi;
        if (xi === -1)
            xi = line.length;
        id = line.substring(hi + 1, xi);
    }
    if (li === -1)
        li = bi;
    if (li === -1)
        li = line.length;
    var le = 0;
    if (di !== -1)
        le = di;
    if (!le)
        le = line.length;
    label = line.substring(li + 1, le).trim();
    var mods = [];
    if (di !== -1) {
        var edi = line.indexOf('>', di);
        if (edi !== -1) {
            mods = line.substring(di + 1, edi).split(',');
        }
        else {
            console.error('missing closing > in indicator declaration' + id);
        }
    }
    // target filter
    if (id) {
        var item_2 = new MenuApi_1.IndicatorItem();
        item_2.label = label;
        item_2.id = id;
        mods.forEach(function (m) {
            m = m.trim();
            if (m === 'disabled') {
                item_2.state = 'disabled';
            }
            if (m === 'enabled') {
                item_2.state = '';
            }
            if (m.indexOf('state') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_2.state = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('icon') === 0) {
                var c = m.indexOf(':');
                var e = m.indexOf('=');
                if (e === -1)
                    e = m.length;
                var state = 'default';
                if (c !== -1) {
                    state = m.substring(c + 1, e);
                }
                if (!item_2.icons)
                    item_2.icons = {};
                item_2.icons[state] = m.substring(e + 1).trim();
            }
            if (m.indexOf('tooltip') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_2.tooltip = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('class') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_2.className = m.substring(b + 1).trim();
                }
            }
            if (m.indexOf('type') === 0) {
                var b = m.indexOf('=');
                if (b !== -1) {
                    item_2.type = m.substring(b + 1).trim();
                }
            }
        });
        appIndicators.push(item_2);
    }
}
// Entry point called from AppCore::setupUIElements
function setupMenu(app) {
    appmenu = [];
    appTools = [];
    appIndicators = [];
    smstack = [];
    app.MainApi.resetMenu();
    return readMenuDef(app);
}
exports.setupMenu = setupMenu;
