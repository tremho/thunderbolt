
const fs = require('fs')
const path = require('path')

const tbRoot = path.normalize(path.join(__dirname, '..', '..')) // out of buildcycle/before-compile
const components = path.join(tbRoot, 'src', 'components')
const pages = path.join(components, 'global', 'pages')
const appRiotFile = path.join(components, 'global', 'main', 'app.riot')

const appRiotTemplate =
`
<app>
    <div bind="navigation.pageId">
$$$PageList$$$
    </div>
    <style>
    </style>
    <script>
      import {newCommon} from '../../../app-core/ComCommon'
      let cm;
      export default {
        state: {},
        bound: {},
        onMounted(props, state) {
          cm = newCommon(this)
          cm.bindComponent()
          console.log('App Page Context Mounted', this.bound)
        }
      }
    </script>
</app>
  
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
function createAppRiot(pageList = []) {
  let pagegen = ''
  pageList.forEach(pageId => {
    pagegen += `        <${pageId}-page if="{bound.pageId === '${pageId}'}"/>\n`
  })
  pagegen = pagegen.substring(0, pagegen.length-1) // take off the last \n
  let src = appRiotTemplate.replace('$$$PageList$$$', pagegen)
  fs.writeFileSync(appRiotFile, src)
}

const list = enumerateRiotPages()
createAppRiot(list)