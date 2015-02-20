/**
 * Pipe is a library which handles page to worker to worker communication.
 * It is intended to facilitate communication between documents as a continuous
 * experience.
 *
 * The contract is the routing.
 */

/**
 * Pipe constructor.
 * @param {Object} config A configuration object with the following keys:
 *  - {String} src The src to the logic script which may be loaded in either a worker or a shared worker.
 */
function Pipe(config) {
  config = config || {};
  if (config.src) {
    if (!Array.isArray(config.src)) {
      config.src = [config.src];
    }
    this.src = config.src;
  }
  this.config = config;

  this.isWindow = (typeof window === 'object');
  this.isSharedWorker = (typeof SharedWorkerGlobalScope !== 'undefined' && self instanceof SharedWorkerGlobalScope);
  // A shared worker will have a WorkerGlobalScope and a SharedWorkerGlobalScope
  this.isWorker = !this.isSharedWorker && (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);
  this.isServiceWorker = (typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope);

  if(this.isSharedWorker) {
    var postToAll = (message) => {
      this._ports.forEach(port => {
        port.postMessage(message);
      });
    };

    self.addEventListener('connect', e => {
      var port = e.ports[0];
      this._ports.push(port);

      port.addEventListener('message', e => {
        this.debug('got shared worker message' + e.data.resource);
        if (!this._handlers[e.data.resource]) {
          this.debug('no handler for ' + e.data.resource);
          return;
        }
        this._handlers[e.data.resource](e.data.params).then((results) => {
          postToAll({
            resource: e.data.resource,
            results: results
          });
        });
      });

      port.start();
    });
  } else if (this.isWorker) {
    self.addEventListener('message', e => {
      this.debug(e.data);
      if (!this._handlers[e.data.resource]) {
        this.debug('no handler for ' + e.data.resource);
        return;
      }
      this._handlers[e.data.resource](e.data.params).then((results) => {
        self.postMessage({
          resource: e.data.resource,
          results: results
        });
      });
    }, false);
  } else {
    // Instantiate all requested workers.
    this.src.forEach(src => {
      var endpoint = this._workerRefs[src] = this.getWorkerTypeForSrc(src);

      // Start the port for shared workers
      if (endpoint instanceof SharedWorker) {
        endpoint.port.addEventListener('message', this.onEndpointMessage.bind(this), false);
        endpoint.port.start();
      } else if (endpoint instanceof Worker) {
        endpoint.addEventListener('message', this.onEndpointMessage.bind(this), false);
      }
    });
  }
}

Pipe.prototype = {

  /**
   * A list of all active ports.
   * @type {Array}
   */
  _ports: [],

  /**
   * The src of all connected scripts.
   * @type {Array}
   */
  src: [],

  /**
   * A list of workers per script src.
   */
  _workerRefs: {},

  /**
   * A list of request handlers.
   * These handlers can be used in different contexts.
   * worker - Used to define worker callbacks for a resource.
   * window - Used to hold promise resolution for pipe.request() calls.
   */
  _handlers: {},

  /**
   * Debugs a message from a worker by outputting it to the console.
   */
  debug: function(message) {

    if (this.isWindow) {
      console.log(message);
      return;
    }

    if (this._ports) {
      this._ports.forEach(port => {
        port.postMessage({
          debug: message
        });
      });
      return;
    }

    self.postMessage({
      debug: message
    });
  },

  /**
   * Returns a worker object for the current SRC.
   * @param {String} src The script of the endpoint.
   */
  getWorkerTypeForSrc: function(src) {
    var endpoint;

    // Check if we have a configured override for this src.
    if (this.config.overrides && this.config.overrides[src]) {
      console.log('making shared worker.');
      endpoint = new this.config.overrides[src].WorkerClass(src);
    } else {
      // Use a worker by default.
      console.log('making worker.');
      endpoint = new Worker(src);
    }

    endpoint.onerror = (e) => {
      this.debug('endpoint error ' + src + ' - ' + e.message);
    };

    return endpoint;
  },

  /**
   * Requests *something*, generally data from a worker.
   * @param {String} resource Method of the worker.
   * @param {Object} params Deliver to the worker.
   */
  request: function(resource, params) {
    return new Promise(resolve => {
      this._handlers[resource] = resolve;

      // Broadcast the message to all workers for now.
      for (var i in this._workerRefs) {
        var eachEndpoint = this._workerRefs[i];
        if (eachEndpoint instanceof Worker) {
          console.log('posting to worker', i, resource, params);
          eachEndpoint.postMessage({resource: resource, params: params});
        } else if (eachEndpoint instanceof SharedWorker) {
          console.log('posting to shared worker', i, resource, params);
          eachEndpoint.port.postMessage({resource: resource, params: params});
        }
      }
    });
  },

  /**
   * Called whenever we receive a message from an endpoint.
   */
  onEndpointMessage: function(e) {
    console.log('Worker said: ', e, e.data);

    if (e.data.resource) {
      console.log('Worker said: ', e.data.resource, this._handlers);
      if (!this._handlers || !this._handlers[e.data.resource]) { return; }
      this._handlers[e.data.resource](e.data.results);
    }
  },

  /**
   * Handles a request.
   * This is generally used in Workers to handle pipe.request() calls.
   */
  handle: function(method, handler) {
    this._handlers[method] = handler;
  },

  /**
   * Requests that a new page is loaded.
   */
  requestPage: function(url) {
    window.open(url, '_blank');
  },

  /**
   * Terminates all connected workers.
   */
  terminate: function() {
    for (var i in this._workerRefs) {
      var ref = this._workerRefs[i];
      if (ref instanceof Worker) {
        ref.terminate();
      } else if (ref instanceof SharedWorker) {
        ref.port.close();
      }
    }
    this._workerRefs = {};
  }

};
