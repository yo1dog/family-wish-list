/* eslint-disable no-process-env */
const cluster = require('cluster');
const os      = require('os');


if (cluster.isWorker) {
  startServer(); // we are a worker, start a server
}
else {
  startCluster(); // we are the master, start the cluster
}


function startServer() {
  require('./server').start({
    isPrimaryWorker: process.env.PRIMARY_WORKER === 'TRUE'
  });
}

function startCluster() {
  // get the number of workers to spawn
  let targetNumWorkers = parseInt(process.env.CLUSTER_COUNT || '0', 10) || 0;
  const maxNumWorkers  = os.cpus().length; // don't spawn more workers than the number of CPUs
  const minNumWorkers  = 1; // always spawn at least 1 worker 
  
  // if we did not specify the number of workers, use the max number
  if (targetNumWorkers === 0) {
    targetNumWorkers = maxNumWorkers;
  }
  
  const numWorkers = Math.max(minNumWorkers, Math.min(maxNumWorkers, targetNumWorkers));
  
  // spawn the workers
  console.log('Spawning workers...', {numWorkers});
  //console.log({numWorkers, targetNumWorkers, maxNumWorkers, minNumWorkers});
  
  const primaryWorker = spawnWorker(true);
  console.log(`Spawned primary worker.`, {workerID: primaryWorker.id});
  
  for (let i = 1; i < numWorkers; ++i) {
    const worker = spawnWorker(false);
    console.log(`Spawned worker ${i + 1}/${numWorkers}.`, {workerID: worker.id});
  }
  
  console.log('Spawned workers.', {primaryWorkerID: primaryWorker.id});
  
  // replace dead workers
  replaceDeadWorkers(primaryWorker);
}

/** @param {boolean} isPrimaryWorker */
function spawnWorker(isPrimaryWorker) {
  const worker = cluster.fork({
    PRIMARY_WORKER: isPrimaryWorker? 'TRUE' : '',
  });
  return worker;
}

/** @param {cluster.Worker} primaryWorker */
function replaceDeadWorkers(primaryWorker) {
  // listen for dying workers
  cluster.on('exit', (worker, code, signal) => {
    // check if the worker that died was the primary worker
    const wasPrimaryWorker = worker === primaryWorker;
    
    console.error('Worked died.', {deadWorkerID: worker.id, wasPrimaryWorker, code, signal});
    
    // replace the dead worker
    console.log('Replacing worker...', {deadWorkerID: worker.id, wasPrimaryWorker});
    
    setTimeout(() => {
      const newWorker = cluster.fork({
        // if the worker that died was the primary worker, make the new worker the primary worker
        PRIMARY_WORKER: wasPrimaryWorker? 'TRUE' : '',
      });
      
      console.log('Replaced worker.', {deadWorkerID: worker.id, newWorkerID: newWorker.id, isPrimaryWorker: wasPrimaryWorker});
      
      // record the new primary worker
      if (wasPrimaryWorker) {
        primaryWorker = newWorker;
        console.log('New primary worker.', {primaryWorkerID: primaryWorker.id});
      }
    }, 3000);
  });
  
  // listen for disconnected workers
  cluster.on('disconnect', worker => {
    // check if the worker that disconnected was the primary worker
    const wasPrimaryWorker = worker === primaryWorker;
    
    console.log('Worker disconnected.', {workerID: worker.id, wasPrimaryWorker});
  });
}