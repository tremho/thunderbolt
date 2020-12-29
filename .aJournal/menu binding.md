### Menu Binding

A menu will look like

- label (action)
- label (action)

etc.
but it could be
- (id) label
- (id) label

with a common action handler that switches on ID
(e.g. `onMenuAction`)

So we could have a data entry like `#SAVEAS:Save As...`
which would specify `#SAVEAS` as the idea for the label 'Save As...'
and it would be recorded in the model as

    menu {
        SAVEAS: "Save As..."
    }
        
so a binding to menu.SAVEAS would trigger this element.

The menu section is actually one of potentially several
menus, one per page.
They are in the model as `menu-<pageId>` and
`menu-default`.  So a menu tries to bind to its named
version, and failing that the common default.

We should be able to declare the Desktop Electron menu
in the same way, so menu notation must include
"Desktop / ActionBar or Both".  We can use this notation:
`@D`, `@A` or neither for these, respectively.
So, entries may be declared like

    @D#FULLSCREEN,Toggle Full Screen
    @A#SETTINGS,Settings
    #Help, Help

 Desktop menu must name the section,though.
 So maybe `@D#FILE_SAVEAS:Save As...` is used,
 and the `FILE` part is ignored in the action bar.
 Actually, no, the menu bar title becomes a first-level
 submenu in the action bar. I like that better.
 
 Define these menu titles with `#TITLE!Title Text`
 
 ---
 
 A submenu is just a different menu section with an id
 
    submenu-<id> {
        A: "a",
        B: "b",
        C: "c"
    }
 
 and appears in a menu by id
   
    menu {
        FOO: "foo",
        BAR: "bar,
        ID: "$$submenu$$"
    }       
    
so when that signature is seen, the submenu-<id> section
referenced for the content of that drop down.

Submenus can be declared as so:

    @D#FULLSCREEN,Toggle Full Screen
    @A#SETTINGS,Settings
    #Help, Help
    #SUBMENU
        #FOO:Foo
        #BAR:Bar
    #ENDSUBMENU
    #BLAH:Blah
    #BLAH2: Blah Blah
    
Submenus may target just desktop or actionbar by using the same
notation in the submenu, like `@D#SUBMENU` and `@D#ENDSUBMENU`
(or `@A`, of course).
Note that for a separated submenu, all the items must be prefixed
to that target as well, otherwise they will be treated as not
belonging to the submenu and will appear in the current menu instead.

###### Platform specifiers
following the `@`, `m,w,u, i,a` shall mean Mac, Windows, Unix, ios, and android, respectively.
so, `@Dm#FOO:Bar` will only apply to Mac
`@Dm` is same as `@m` since the D is implied.
`@a` will only apply to android (same as `@Aa`)
`@ai` will apply to both android and ios, but not Mac, Windows or Unix (Linux)

##### Toolbars

similar to the menu, but with an injection option:

it uses similar notation:

    @<target>#<id>:<injection>(<params>)

but rather than naming a label, it names an injected
handler and optional parameters.

The injection is an instance of a ToolbarHandler class that
defines the appearance and action handling of the tool.
Parameters include options for setup.
Common action handler (`onToolbarAction`) is called on press, and
works similar to menu action. 

##### Indicators

Indicators work the same way as toolbars, but their 
injections come from the Indicator class that defines
their appearance in various states. Parameters
convey options for setup, and the binding
for state changes.
                    
----
need to refactor to this.
 
    menu .parent=null, children
        submenu .parent, children
            item .parent, .details  

---