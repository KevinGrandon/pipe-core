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
  this.isWorker = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);

  if (this.isWorker) {
    self.addEventListener('message', e => {
      this.debug(e.data);

      this._handlers[e.data.resource](e.data.params).then((results) => {
        self.postMessage({
          resource: e.data.resource,
          results: results
        });
      });
    }, false);
  }
}

Pipe.prototype = {

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
    self.postMessage({
      debug: message
    });
  },

  /**
   * Returns a worker object for the current SRC.
   * @param {String} src The script of the endpoint.
   */
  getWorkerTypeForSrc: function(src) {
    // Check if we have a configured override for this src.
    if (this.config.overrides && this.config.overrides[src]) {
      return new this.config.overrides[src].WorkerClass(src);
    }

    // Use a worker by default.
    return new Worker(src);
  },

  /**
   * Requests *something*, generally data from a worker.
   * @param {String} resource Method of the worker.
   * @param {Object} params Deliver to the worker.
   */
  request: function(resource, params) {
    return new Promise(resolve => {
      // Instantiate all requested workers.
      if (!this._workerRefs.length) {
        this.src.forEach(src => {
          var endpoint = this._workerRefs[src] = this.getWorkerTypeForSrc(src);
          endpoint.addEventListener('message', this.onEndpointMessage.bind(this), false);
        });
      }

      this._handlers[resource] = resolve;

      // Broadcast the message to all workers for now.
      for (var i in this._workerRefs) {
        this._workerRefs[i].postMessage({resource: resource, params: params});
      }
    });
  },

  /**
   * Called whenever we receive a message from an endpoint.
   */
  onEndpointMessage: function(e) {
    console.log('Worker said: ', e.data);

    if (e.data.resource) {
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
  }

};
