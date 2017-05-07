/*

- found at: https://codereview.stackexchange.com/a/105770
- enables to call resolve from outside of Promise

*/

function Deferred(cb) {
  const def = this;
  this._resolver = null;
  this._rejector = null;
  this._promise = new Promise((resolve, reject) => {
    def._resolver = resolve;
    def._rejector = reject;
  });

  if (typeof cb === 'function') {
    cb.call(this, this._resolver, this._rejector);
  }
}

Deferred.prototype.then = function then(resolve, reject) {
  return this._promise.then(resolve, reject);
};

Deferred.prototype.resolve = function resolve(reason) {
  this._resolver.call(null, reason);
  return this;
};

Deferred.prototype.reject = function reject(reason) {
  this._rejector.call(null, reason);
  return this;
};

// enable's other's to deferre
// function Deferrer(...args) {
//   Deferred.apply(this, ...args);
// }

// Deferrer.prototype = Object.create(Deferred.prototype);

// Deferrer.prototype.resolveDeferred = function resolveDeferred(val) {
//   this.resolve(val);
// };

export { Deferred };
