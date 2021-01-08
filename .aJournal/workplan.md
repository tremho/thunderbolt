
### Workplan and checklist

Follows up from [setup](./setup.md)

See plan ideas in [construction](./construction.md)

##### I - 1/15/21
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







###### Implement logging

##### II - 1/31/21
###### Establish separation plan

###### Convert to full SCSS support

###### Create API extension support  

##### III - 2/28/21

###### Implement documentation and doc tests

###### Devise component testing process

###### Implement resources and prep tooling

###### Implement localization and core-level support

##### IV - 3/20/21

###### Electron release per platform
###### Nativescript project export
###### Nativescript release per platform

###### Framework extension release (as .gz npm)
###### Support for using extensions

--------------

### Alcaeus parallel plan

##### First TB project start 2/1
###### Follow pre-proto design w/smart changes

###### Standalone features  3/15
- maintain track folders
- versioning and annotation
- release (to folder) and release notes

###### Commercial features
--- 4/15
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
