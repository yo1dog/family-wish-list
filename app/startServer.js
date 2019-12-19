// use this file for starting a single worker server 
// use startCluster.js to start a clustered worker server
require('./server').start({isPrimaryWorker: true});