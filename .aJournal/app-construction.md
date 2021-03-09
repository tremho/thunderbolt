#### Constructing an app with Thunderbolt

Here I want to capture an aspirational story of how to write an
app using the Thunderbolt framework.  I think I will do it by 
pre-writing a how-to primer focused on a Hello World exercise that
expands as we reveal features of the framework.  This will help serve
as a template later for an actual tutorial document.

### Setting up an app
- Launch the TB dashboard
- Select `New Project`
- Enter the folder name of the app

#### This has the following effects
- folder is created
- `.app.tb` file is created. This file contains
    - name of app
    - relative path names to each of the component folders (below)
    - _potentially more metadata as we evolve here_
    
The following folders
- `pages` where the app pages are written
- `components` where any app-supplied components go
- `core/app` and `core/back` where namespaced API business logic
for the app will go for the front and back end processes of the Electron
setup (single process for mobile)
- `resources` where assets are placed and will be processed by tools
into canonically named runtime assets.
    - will include an `images`, `icons` and an `i18n` folder

Or, we can create these manually as needed, but the best bet is to use
the tool.

##### Basic Hello World
This seeks to create the simplest possible program and thus satisfy
one of the key goals of a Hello World example. 

_At this point of the first couple examples, we need to make sure that
we have a TB CLI process (followed by TB Dashboard) that will actually
do the build from this app structure_

###### Stupid Hello World example
Some Hello World examples don't really show much of anything useful because
they don't employ any of the framework they utilize beyond the inherent
markup language.  Just to prove that we can do the same superficial thing here,
the _very first_ example is simply to create a `hello-world-page.riot`
file that simply looks like this:
```xml
<hello-world>
    <p>Hello World</p>
</hello-world>
```
and then one that is only slightly different:
```xml
<hello-world>
    <simple-label text="Hello World" />
</hello-world>
```
and then, finally to get to some dynamic structuring:
```xml
<hello-world>
    <simple-label bind="testValues.mainLabel as text"/>
    <script>
      import * as activity from './hello-world'
      export default {activity}
    </script>
</hello-world>
```
hello-world-page.ts
```typescript
export function appStart(app:any) {
    const model = app.model
    model.setAtPath('testValues.mainLabel', 'Hello, World!')
}
```
___All the above is working at this point on 2/26/21___
_Note that current Appcore is creating a model with mainLabel and it shouldn't, 
so we need to add that to app code in the example_

_Note that the above needs to change a bit so we create the model before
setting a value_

---
Then change it so that we declare the model in `core/app` code that
runs on startup so we don't have to do it awkwardly in the first page.
---

##### Bringing in the app bar
Introduce the app bar and have hello world triggered by a menu action

##### More UI events
- Introduce a different menu option that says "Hello Thunderbolt!"
- Add some buttons that emit different messages
 
##### App business code

- Create a core/app method that produces the message(s) we see
- Do the same, but this time move it to the core/back side and then
give a basic demo of the power of the back side (like get a Node version,
  or read a file directory)
  
_At this point, create the TB Dashboard app and verify it works to the
same ends_

##### More UI features
- create menu options with checkmarks, etc 
- create menu options with icons

##### How the resources structure works

##### Hello wherever!
- create a back-end function that fetches a list of locations
  - this is presented as a pseudo-service
- Present the list of locations in the UI
- clicking on one will result in a display of "Hello location" and a 
picture of that location.
- The fetch of the image is also a mock service
- Demonstrate a fallback for an image not found that comes from
the resources.

##### Localization
Localize the Hello location program with and i18n tutorial.

##### Testing
Create unit tests for the business logic fetch functions
and for the fallback features

###### Documentation
- DocJS generation for all app code APIs
- exposepi cleaning and formatting
- Markdown support and binding templates.
- UML integration


###### Rabbit hole - scenario tests
- This implies page-level hooks
- it also implies helpers that can verify a rendering.  This must
be valid for both desktop and mobile contexts.
- hooked code should compile out for release.

