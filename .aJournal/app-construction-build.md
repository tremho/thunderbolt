
### WTF?
So what is the framework app in a separated world?

- Node project that handles the CLI args and its own prompts
- GUI mode : so we're really an electron app.

#### Invocation app
The app must be in the execution path so we can use the current directory.
Basically, this is:

    p=`pwd`; cd ~/tbd/thunderbolt/electronMain; npm run start $p`

#### Command line in
The app dir is passed as an arg or else it is the pwd at the 
time of invocation

#### What it does
read .app.tb from the app directory. From here we get
###### app name
We'll use this in places like the menu, package.json, etc.
  
###### all the paths
we build a webpack.config based on the remote locations
and include any of the framework bits too.
This will build our end result electron app.

__Do this one of two ways__<br/>
- Configure webpack bundle from disparate locations to include framework
and app elements together
  - _how do we do that?_
- √ Copy into a staging area and build from there.    

We will need to do a file copy-into-place for the mobile build, methinks.
We might consider doing a 2-stage webpack so we migrate a .js file into
the mobile space and use that as a single file to be bundled.

###### Da build
To do the actual build, we need to execute a command.  This will
run the scripts/build processes we need.

----
_Lifecycle_<br/>
- name starting page in .app.tb (default 'main-page')
- name app mains in .app.tb (default 'main')
- call pre-named methods
    - appStart ?? setupModel is first call
    - setupModel - call in setupUI
    - setupMenu
    - appExit
- rename page appStart to pageStart
- what other page lifecycles?
  - onMenuAction
  - onToolAction
  - (activityId, context)
  - onBeforeUpdate
  - {event handlers by name}

_Imports_<br/>
- PoC: make an import/export file with available APIs
- put this file into node_modules
- This brings up the concept of an `init` command
  - prompt for and create .app.tb
  - create the folders
  - create a how-to
  - create a readme and 

----
###### To-dos for this
- in TBCommand, enumerate and identify all folder chains
from root that have .ts files and add these to docopy.
- √ Alternately (maybe better) require all paths to be named 
in .app.tb

- move framework to node_modules as planned.
- ◊ need to do this for paths to work

---
Oh shit

messed up on the node_modules because we need it
in two places.  Can we somehow work without
import? Or else, create the link as part of an init
process.

√ app/core needs to hook into app-core setupUI
which means it needs to be try/required there
then we can call he exported lifecycle functions.

---
Looks like the next step is to bring in the app bar
and menu

That should be an adventure.

----
Create a config section.
Put logConfig.json and menudef.txt there.

Instantiate a default log where we do now, for framework use.
Let core/app/main set up logging with gen-logger, and
pull from logConfig.json explicitly (meaning it doesn't
really have to be in config, but this is a good convention).

Similar for menu.  In core/app/main:setupMenu point to the
menudef to instantiate.  Then call app.registerMenuHandler
for items to connect.


  
  