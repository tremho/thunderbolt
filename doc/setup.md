
started with a copied shell of earlier ThunderBolt setup,
so we have Electron and Riot parts in place, and the app runs
an empty "Hello World" screen.

Now I want to get the NS parts in place:

Doing this:
```
tns create ThunderBolt-NS --ts --path ./NativeScript --appid tbd.tbns.app1
```
and it creates NativeScript / ThunderBolt-NS tree

doing 
```
tns run android [--device medium]
```

will build and run the default NS tap counter demo app.

so, now to connect to our own app...

![Thunderbolt structure](Thunderbolt%20structure.png)

I think what we want to do is:

- commonize `app.riot` and `main-page.xml` as the main layout page
- Each of these is backed by component observables that respond to app and
update the properties of the layout
- Each of those components has a common API interface 
- this interface is implemented accordingly in each environment
- app code calls one or the other depending upon environment

### First cobbling: A Simple label

Let's do "Hello World" using a simple label control.

Let's do this in the Electron/Riot (Desktop) world first.
 - √ Okay.
 
  

 