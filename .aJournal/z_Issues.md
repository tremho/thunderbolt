

## Current Issues

#### sourcemaps for web console

The stack info we get from JS is already 
sourcemapped off of bundle.js to the source (js)
because Chromium does that for us.

We must use the .map file info for Node because
it only has raw JS to work with.

So we can use our existing mapping code in a Node environment,
but don't map (again) in Chromium world.

For this to work the ts files need to be fully
compiled and packed by webpack.  This should
be able to be configured as we need it.

While we're at it, can we typescriptify the .riot files?

I had thought of getting away from loaders, but
I'm not seeing a clear path to that.
We'd need to do a double map solutions somehow.

#### On Review

Build with webpack does not give me the 
sourcemap I want. All it does is make the .ts file 
into compiled js, so it's the same thing, but we
even lose the file naming with this route.

I still need to build my own map.

I think we can do this from bundle.js.
find files with "!*** "
and then sourceMapURL= following.

The hope is that webpack will map this to
the original ts source here.

I don't know for sure that the sourcemap info
there goes down to the ts layer or not, but
it seems like it would have to, or else what
is it for?

#### YES! It's working!

I now have proper source mapping for the
webpacked TB/riot/electron code, as well as for
tsc compiled node code for TB/electron back end.

Of course, I still have to set up the back end logging

and in fact
##### That's the next step

###### But maybe first:
- [ ] Migrate `make-sourcemap.js` to `gen-logger/smx`
and do it that way to be copasetic.

###### Then

- [ ] Make TB Back-end loggers
    - [ ] console
    - [ ] file
- [ ] Make bidi messaging
- [ ] proxy front to back and
- [ ] attach similar names to relevant proxies

End result here should be that we can log to
any consistently named logger on either side
and get log output in the same place.
- web console
- terminal console
- log file


