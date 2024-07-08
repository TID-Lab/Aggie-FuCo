process.title = 'aggie';
const processManager = require('./backend/process-manager');

require('dotenv').config();

// fork child at specific module path
function _fork(modulePath) {
  const child = processManager.fork(modulePath);

  console.debug('Aggie started')
}



// handle uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error(err.message)
  console.debug(err.stack)

});

// Begins the three main backend processes API, fetching, and analytics.
// See Readme files in backend subdirectores for more on each.
_fork('/backend/api');
_fork('/backend/fetching');
_fork('/backend/analytics');

module.exports = processManager;
