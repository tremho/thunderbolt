
### Action Bar

A page should have an action bar.
On mobile, this may be the only consistent support for a back button.


###### Action bar features

- __Title__ - title or breadcrumb of page activity. Centered.
- __Menu__ - dropdown hierarchy from either:
    - conventional style menu strip
    - hamburger icon.  Left of title.
    - Note that this is _not_ the same as the desktop app menu       
        
- __Indicators__ - a string of icons that indicate status
of various things.  Typically appears on right side
    
- __Toolstrip__ - a string of icon buttons that do things
when pressed.  Typically to the left of indicators.

- __Back__ - back arrow icon/indicator.  Typically on far
left
    

###### Display variants

- no action bar
    - may allow swipe / key back
    
- single line
- multi line
- overlay w/transition
    - fade
    - drop
    
###### Back options
    - on action bar
    - swipe back / key back
    - no back (must navigate otherwise)    


###### Action Bar construction    
![Action Bar](action%20bar.png)

- Title is centered.  It has padding that sets its bounds.
- Hamburger menu (if used) is to the left of the title.
- back button (if used) is on far left.
- area between back button and hamburger is for the 
toolstrip icons, which are centered as a group in this
space.
- indicators start at the right and populate leftward.
They will clip when they reach the boundary (right of title)

###### Current state  12/10

- Basic layout set out
- [X] Need to capture bounds of full bar and have a rational
static API to call so its components can use it.  This is needed
now to finish indicators, but should also be used for
toolbar.

    - Did this, but no luck with the strategy.
    - √ I think I can do what I need with a Grid Layout
    - √ experiment with a scratch and then implement.

- [ ] Need to build the hamburger menu control.

