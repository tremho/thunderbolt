
import * as riot from 'riot'
import App from './components/global/main/app.riot'
import {AppCore, setTheApp} from './app-core/AppCore'
import registerGlobalComponents from './register-global-components'

import * as MainPage from './components/global/pages/main-page'

console.log('Running under Riot', riot.version)
console.log(__dirname)

console.log('registering components...')
// register
registerGlobalComponents()

// console.log('mounting app...')

// mount all the global components found in this page
riot.mount('[data-riot-component]')
const mountApp = riot.component(App)
const coreApp = new AppCore()
// console.log('starting app...')
coreApp.setupUIElements().then(() => {

  // Add things from here to the environment. (required)
  const env = coreApp.model.getAtPath('environment')
  env.framework.riot = riot.version // add the riot version here
  coreApp.model.setAtPath('environment', env)

  // console.log('now mounting and running Riot app UI')
  mountApp( document.getElementById('root'), { app: coreApp } )
  // go to main page
  coreApp.navigateToPage('main')
})


