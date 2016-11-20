var cluster = require('cluster')
var os = require('os')
var debug = require('debug')('app:bin:cluster')

const CPUS = os.cpus()
if (cluster.isMaster) {
  CPUS.forEach(function() {
    cluster.fork()
  })

  cluster.on('listening', function(worker) {
    debug('Cluster with pid: %d connected', worker.process.pid)
  })

  cluster.on('disconnect', function(worker) {
    debug('Cluster with pid: %d disconnected', worker.process.pid)
  })

  cluster.on('exit', function(worker) {
    debug('Cluster with pid: %d is dead', worker.process.pid)
    cluster.fork()
  })

} else {
  require('./start.js')
}