
const fs = require('fs')
const path = require('path')

const tbRoot = path.normalize(path.join(__dirname, '..', '..')) // out of buildcycle/before-compile
const components = path.join(tbRoot, 'src', 'components')
const pages = path.join(components, 'global', 'pages')
const npages = path.join(tbRoot, 'NativeScript', 'ThunderBolt-NS', 'app', 'pages')

const nimports =
`
import {AppCore, EventData} from "~/Bridge/AppCore";
`

const nswrapper =
`
// Nativescript
import { EventData, Page, Frame } from '@nativescript/core';
import {AppCore, setTheApp} from '../Bridge/AppCore'
import * as PageLogic from './$PAGE$-logic'

let coreApp
export function onLoaded(args: EventData) { // navigatedTo
    const page = <Page>args.object;
    coreApp = new AppCore()
    setTheApp(coreApp, Frame.topmost())
}
export function onNavigatedTo() {      
    coreApp.setupUIElements().then(() => {
        coreApp.startPageLogic('$PAGE$', PageLogic)
    })
}
`

const xmlWrapper =
`
<Page xmlns="http://schemas.nativescript.org/tns.xsd" loaded="onLoaded" navigatedTo="onNavigatedTo"
      xmlns:tb="~/components/tb-components"
>
    <ActionBar title="Action Bar" icon=""></ActionBar>

    <StackLayout>
$LAYOUT$
    </StackLayout>
</Page>
`
function enumerateRiotPages() {
  const pageOut = []
  const dirents = fs.readdirSync(pages, {withFileTypes:true})
  dirents.forEach(dirent => {
    const name = dirent.name
    const did = name.lastIndexOf('.')
    if(did !== -1) {
      const ext = name.substring(did)
      if(ext === '.riot') {
        const pageName = name.substring(0, did)
        let di = pageName.indexOf('-page')
        if(di !== -1) {
          const pageId = pageName.substring(0, di)
          if(fs.existsSync(path.join(pages, pageName+'.ts'))) { // we must have a code page too
            pageOut.push(pageId)
          }
        } else {
          console.warn(`non-page .riot file "${name}" found in "pages" folder`)
        }
      }
    }
  })
  return pageOut
}

// Read from pages/page.ts
// change the import statement
// write out to npages/page-logic.ts
// start with wrapper template and change identifier and write as npages/page.ts

function createPageCode(pageList = []) {
  pageList.forEach(pageId => {
    let code = fs.readFileSync(path.join(pages, pageId+'-page.ts')).toString()
    let wrapper = nswrapper.replace('$PAGE$', pageId).replace('$PAGE$', pageId) // two occurrences
    // TODO: This assumes just the one required import only.
    // If the app code brings in other imports (which seems likely) we have to preserve those and migrate
    // those files to an accessible point in the {N} space also.
    let replacePoint = code.indexOf('import {AppCore')
    let forwardPoint
    if(replacePoint !== -1) {
      let eol = code.indexOf('\n',replacePoint)
      forwardPoint = eol+1
    }
    code = code.substring(0,replacePoint) + nimports + code.substring(forwardPoint)
    fs.writeFileSync(path.join(npages, pageId+'.ts'), wrapper)
    fs.writeFileSync(path.join(npages, pageId+'-logic.ts'), code)
    createPageXml(pageId)
  })
}

// read from pages/page.riot
function createPageXml(pageId) {
    const pageName = pageId + '-page'
    let code = fs.readFileSync(path.join(pages, pageName + '.riot')).toString()
    let lnstart = code.indexOf(`<${pageName}>`)
    code = code.substring(lnstart + pageName.length+2 )
    let cend = code.indexOf(`<script>`)
    if(cend === -1) cend = code.indexOf(`</${pageName}>`)
    cend = code.lastIndexOf('\n', cend)
    code = code.substring(0, cend)
    let xml = ''
    let si = 0
    do {
      let ti = code.indexOf('<',si)
      let pi = code.indexOf(' ', ti)
      let eti = code.indexOf('\n', ti)
      if(pi === -1 ||pi > eti ) {
        pi = code.indexOf('/>', ti)
        if(pi === -1 || pi > eti) pi = code.indexOf('>', ti)
        if(pi === -1 || pi > eti) pi = eti;
      }
      let cname = code.substring(ti+1, pi)
      if(code.charAt(pi) !== '/') pi++
      let restOfLine = code.substring(pi, eti)
      if(cname.indexOf('-') !== -1) {
        let ccname = camelCase(cname)
        xml += `        <tb:${ccname} ${restOfLine}\n`
      }
      si = eti+1
    } while(si < code.length)

    let xmlSrc = xmlWrapper.replace('$LAYOUT$', xml)
    fs.writeFileSync(path.join(npages, pageName+'.xml'), xmlSrc)
}
function camelCase(dashform) {
  let out = ''
  let parts = dashform.split('-')
  out = parts[0].charAt(0).toUpperCase()+ parts[0].substring(1)
  if(parts.length > 1) {
    out += parts[1].charAt(0).toUpperCase() + parts[1].substring(1)
  }
  return out
}



const list = enumerateRiotPages()
// console.log(list)
createPageCode(list)