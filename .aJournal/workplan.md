
### Workplan and checklist

Follows up from [setup](./setup.md)

See plan ideas in [construction](./construction.md)

##### I - 1/20/21
###### Finish out action bar work
- Indicators and tools
    - [X] apply class
    - [X] support tooltip
    - [X] support type API extension
    - [X] independent model binding
    - [X] both tools and indicators

----
1/4: First task block looking good.
Appbar is ready except could use better styling
and that probably also means resource handling
for icons, etc.
-----

###### Import layouts and other items from before
Moving over from projectus
- [ ] Create test / example pages
  - [4 stack examples from NativeScript](https://docs.nativescript.org/ui/layouts/layout-containers#stacklayout)
  - [10 flex examples](https://tobiasahlin.com/blog/common-flexbox-patterns/)
  - [4 to 6 of the 46 grid examples found here](https://gridbyexample.com/examples/)
---
###### Observations 1/5
- Making a new page has copy/paste perils
    - consider a tool like compgen 
- Sticky wicket if we don't name the correct root element
in a `el = this.$('el')` call
  
- Sidebar to test is to explore context passing
  - [x] pass to app
  - [ ] pass and act upon in layout

```
side sidebar
============
How to pass context to layout?
We pass it via function to activity code
We can also put it into model.activity.context
We should also record the current acvitity Id
Pages can then bind to these values.
This means we need to inject intercepts into the
page 'component' code to handle the binding.
This might also be a vehicle for more lifecycle events
to the app page (but try to keep synchronicity with
Nativescript here, too).
```  
---
Hmm. proving harder than I thought.
I'm not going to be able to successfully inject
the props, so I need to do it by treating a
page like other components so I can get to the 
lifecycle events and perform the binding.

But we can do that in a base class.  Change
the boilerplate to be like this:
```
<script>
      import pageComp from '../../../app-core/PageComp'
      import * as activity from './stack-test-page'
      pageComp.activity = activity
      export default pageComp
</script>      
``` 
and put our onMounted(...) etc stuff in PageComp.  

Hurray. This is all working now as intended.
 - [X] Frame up the 4 stack types as proof.

---
Now we have a problem (probably had before)
Menu doesn't work anywhere but main page.
 - probably because we need handlers per page
 - can we create global handlers? How?

- [X] registerMenuHandler seems to work for this.
  
---

Now we have some "strange" things but its otherwise
on the right track.

- if we go to Vertical and then Horizontal (say),
then the `if` switch works to reflect the change
in the binding, but the display still shows the former
type.

---
Update @ close of 1/7:
- looks like everything works, but may be buggy still
- back action 'works', but context is not getting
updated the way it should
- the __main thing__, _not the sidebar_, doesn't work,
though. Only vertical stack is correct, so 1 of 4.
  
---
Mid-day 1/8:
- All looks good.  back action and context behaving well.
- Found bug in simple-label can't figure.
made simple-slot as an alternative label type.

- New objectives to put on list somewhere:
  - __BaseComp__ common handling for components
  - Bind to `state` instead of `bound`

-----  

###### Implement logging

- [ ] outline plan at [Logging Overview](./logoverview.md)

----
I'm at this point now, on 2/10/21.

Review and wrap up fine points before travel to Pueblo on 2/13

###### Wrap up before travel plan
- Make an aspirational plan (design) for how an app should be constructed
using this framework [App Construction Plan](./app-construction.md)

- Make a TB Dashboard design plan that helps bind together the
_Projectus_ inspired features, checkpoints, and tools.
  
- Make a SWAG approach schedule for those parts to incorporate
and superceed the following Part II and Part III schedule notes.
  
- Don't get too far ahead of yourself without doing a sanity chack
on mobile execution.  This is likely to have many shortcomings because
it hasn't been addressed in a while, but let's take some time to at
least enumerate these issues before the gap gets too wide.

  
-----

Some other things to note in this section:
- Unit Measure and format
- gen-i18n

##### II - <s>1/31/21</s> 2/28/21
Making app space
###### Establish separation plan
This means making the framework external to the projects that use it.

###### Convert to full SCSS support
App project supplies its own CSS
We also need framework CSS baselines and a profile theme structure.

Somewhere in here contact Jessica for some style work.

###### Create API extension support
App project supplies API namespace code for app-core or back-core
contexts.  Each is accessible via framework API re namespace.


##### III - 2/28/21
App lifecycle tool support

###### Implement documentation and doc tests
Api generation paths
Article doc space
Doc Assets folder
UML use cases and sequences
InchJS and DocumentationJS, etc via framework
ts-clear-classdoc via framework

###### Devise component testing process
Patterns for generic app-side unit test
Patterns for component unit test
Pattern for component integration test / HumanTest integration

###### Implement resources and prep tooling
Establish process by which resources can be processed and integrated.
Examples include menu images, for instance.

###### Implement localization and core-level support
App project support for local i18n tables.  Generally integrated
@tag:default syntax in formatted strings, menus, etc.

##### IV - 3/20/21

###### Electron release per platform
###### Nativescript project export
###### Nativescript release per platform

###### Framework extension release (as .gz npm)
###### Support for using extensions


##### Consider TB framework release 4/1

--------------
--------------

### Alcaeus parallel plan
Prove the framework is ready by creating an app with it, and also
to make something that can be released and evolved.

##### First TB project start <s>2/1</s> 3/1
###### Follow pre-proto design w/smart changes

###### Standalone features  3/15
- maintain track folders
- versioning and annotation
- release (to folder) and release notes

###### Commercial features  4/15
- login
- cloud sync
  
---- 4/30
- call for contribution
- guest access and contribution
- notifications

---- 5/31
- messages and forums  
- release to cloud
- Radio Alcaeus

