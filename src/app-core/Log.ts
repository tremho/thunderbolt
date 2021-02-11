
import {loadLoggerConfig, setLoggerConfig, getLogger} from 'gen-logger'
const logConfig = require('./logConfig.json')

// Can't do this
// loadLoggerConfig('/Users/sohmert/tbd/gen-logger/testConfig.json')
// but can do this
// logConfig is parsed JSON from import.
setLoggerConfig(logConfig)

const Log = getLogger('Main')

export default Log