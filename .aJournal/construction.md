
## Construction
#### Framework core and project workspace concepts

###### 1/1/21
So, on this first day of the new year, I wanted to just
free-associate my ideas of where this is going.

We are creating a framework that can be used to create
applications of many types and deploy to desktop and
mobile environments.

We want to keep the framework parts inside the framework
and ideally never needing to be manipulated by the
app developer, and keep the app parts in a separate 
location, so that a ThunderBolt project can be maintained
independently from the framework, which should stabilize
into versions with an evolution path.

We want the app code to use familiar technologies:

- Typescript
- SCSS
- xml/html style markup
- Javadoc supported documentation generation
- inchJS doc checking
- TapJS unit testing

We want the ability to define 

- pages
- components
- core code (both front and back processes)
- resources, including
    - icons
    - images
    - string tables
    - localization support

All of this is defined in the app dev's project workspace
and referenced by the framework to create a build
intermediary that brings together the framework parts
also.

From here we can produce:

- Finished release products for desktop and mobile. 
  This is an Electron standalone for desktop and a
  Nativescript Standalone for mobile.
  

- a NativeScript project that can be independently worked on
  and built using {N} workflow 

  
- A framework extension that can add new components and/or
new core library functionality as a named plugin for the framework itself
and reused in other projects as a dependency.
This extension is an NPM module and may be published as such.

##### Tricky parts
The basic construction to build apps like this
for TB Desktop seems pretty straightforward -- 
some folder linkages to make a build is all we are
really talking about here.

The harder part is the translation to the Nativescript side
of things. 

We've done some stuff already in aligning the app-core parts
of the framework, and keeping the page launch paradigm
pretty consistent.

We've been able to do that with environment checks,
but note that we get webpack bundling errors for 
libraries that aren't accessible anyway -- even though
they won't be used.  That's okay, I guess.

The components themselves may need to be developed 
separately for both Desktop and Mobile.  That's
unfortunate.  It would be cool to have a single 
source build path here, but that's a wish list item
beyond 1.0 for sure.

We do have a build process that converts the .riot files
for pages, but that's pretty boilerplate.
Doing this for a general component would be another matter,
and also needs handling code. 

So for now, the process must be to create a component 
with both source parts.  If you create only one side, 
it can't become an extension.

Need to figure out a way to certify a component 
for both sides via testing.

##### Parts we have now

###### app parts:
- Pages are in components/pages
- Menudef is in menudef.txt
- scss in scss/app.scss
  
###### framework:
- app-core 
- application (needs to move to app-core)
- components
- general
- scss in scss/fa-scss
- scss in scss/datepicker.scss (not used, but exemplar of possible future use)

###### Need to supply to app

- pages folder -- where pages
- app.scss (combines with framework-profile.scss to make
  globals)
    - any scss tree that is imported into app.scss
- components -- app specific component definitions
    - must contain both .riot and .ns versions (separate subfolders)
- api code -- specify if this is to become a namespace in app-core, or in back-core
    - application
        - core (will be mapped to app.api.name)
        - back (will be mapped to app.back.name for mobile)
    
    Enumerate files in these locations and apply their exports as apis as shown.

##### Resources
Resources are provided by the app, although there may be some framework resources too

They are organized in a folder structure:
- resources
    - icons
        foobar.png
        indicator.png
    - images
        background1.png
        logo.png
    - locale-strings
        - common
            section1.str
            section2.str
        - en
          section1.str
          section2.str
            - GB
              section1.str
            - US
              section1.str
              section2.str
        - es
            - ES
        - fr
           - FR
           - CA
        - de
            
Icons are converted by a tool to dest size

sizes must be determined 
should relate to rem size
mobile platforms with different targets may be an issue. 
may want/need a config to specify ranges platform can pick from (sm/md/lg)

-icons
    - foobar-s16.png
    - foobar-s24.png
    - s32
    - s48
    - s64
    - s128


    
