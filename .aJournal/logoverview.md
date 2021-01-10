### Logging implementation

We want a flexible, central logging system
that is comprehensive, configurable, and expandable

##### Telemetry
We also want to support telemetry diagnostics, so
let's build in the shell for that at the start.

##### Features and dependencies
Modeling after the Log module of Sniff, we know
we want a formatted line that displays
- timestamp
- module
- function and line
- message
- detail, incl. object dumps
- deferred logs
- stack traces 

The formatted output uses our Formatter class,
so we might want to tackle that one first.

A Stack Parser is required for determining 
the line of interest as well as other
stack parsing needs. (the 'ffl' implementation)

Source Code Map translation might be necessary to
accurately reflect source lines, and is probably
a necessity for telemetry at least. (SauceCode)

Different output targets will have different layout
options, such as groups, etc that may not be universal.
Make sure we have "plain" as well as "dropdown" modes
accounted for.

##### Routing

We'll need to capture logs from several areas, including
- app page code
- framework app core
- components
- back-end (Node) processes

We'll want to output to
- Electron console
- Node console
- Nativescript runtime console
- External (https / websocket) clients
- Local file

Some of these must be served through the back-end,
so one of the first tasks will be to provide this
message gateway from renderer process to back process.

Vice-versa if we want to display back-end issues in the 
Electron display.

This message passing should be independent, because it
is generally useful for other things.

##### Include trapping
Several times things fail silently, so
what can we do about that?
We can wrap most things in try/catch blocks, but
I'm concerned about silent death within a riot operation
or other event-initiated entry point that is not
under our control.

Maybe implement a punt/receive/timeout paradigm:
Set up a 'punt': a named timer. When the  

---------

I think we can pretty much start by just moving over
Log.js from WanWan...

but...

- Convert to Typescript
- Extend Writer to include a target by name
- Define default target to names and the ability
to add new ones (name file, name service)
  

- `src/app-core/Log.ts`
- `src/general/Formatter.ts`
- `src/general/Telemetry.ts`
- `src/general/ProcMessaging.ts`

- `ElectronMain/src/LogRouting.ts`
- `ElectronMain/src/Logging.ts`
- `ElectronMain/src/TelemetryUplink.ts`
- `ElectronMain/src/LogFile.ts`

-----------------------

Yeah, need to do formatter first.<br/>
Then StackTraceParser<br/>
Then SauceCode?<br/>
and move ANSIColor support to different module<br/>
<br/>
Move over the tests<br/>
Go through all that again.<br/>

<br/>

##### TODO: 
Consider making an alternative Formatter
that can be used in backtick strings
like `limited size string = "${F('10,20', str)`
or `this price is $${F('02,2, value) dollars`
and then implement our existing format mode in
terms of these string/number bases.

Maybe also date or other extensions ${F('date|hint', value)

<br/>

Log and Format should become separate NPM modules



