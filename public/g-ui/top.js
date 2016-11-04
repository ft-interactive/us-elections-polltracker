/*!
  * LoadJS JS loader & dependency manager
  * https://github.com/muicss/loadjs
  * (c) 2015 Andres Morey | License MIT
  */
loadjs=function(){function n(n,e){n=n.push?n:[n];var t,r,o,c,i=[],s=n.length,h=s;for(t=function(n,t){t.length&&i.push(n),h--,h||e(i)};s--;)r=n[s],o=u[r],o?t(r,o):(c=f[r]=f[r]||[],c.push(t))}function e(n,e){if(n){var t=f[n];if(u[n]=e,t)for(;t.length;)t[0](n,e),t.splice(0,1)}}function t(n,e,t){var r,o,c=document;/\.css$/.test(n)?(r=!0,o=c.createElement("link"),o.rel="stylesheet",o.href=n):(o=c.createElement("script"),o.src=n,o.async=void 0===t||t),o.onload=o.onerror=o.onbeforeload=function(t){var c=t.type[0];if(r&&"hideFocus"in o)try{o.sheet.cssText.length||(c="e")}catch(n){c="e"}e(n,c,t.defaultPrevented)},c.head.appendChild(o)}function r(n,e,r){n=n.push?n:[n];var o,c,i=n.length,u=i,f=[];for(o=function(n,t,r){if("e"==t&&f.push(n),"b"==t){if(!r)return;f.push(n)}i--,i||e(f)},c=0;c<u;c++)t(n[c],o,r)}function o(n,t,o){var u,f;if(t&&t.trim&&(u=t),f=(u?o:t)||{},u){if(u in i)throw new Error("LoadJS");i[u]=!0}r(n,function(n){n.length?(f.error||c)(n):(f.success||c)(),e(u,n)},f.async)}var c=function(){},i={},u={},f={};return o.ready=function(e,t){return n(e,function(n){n.length?(t.error||c)(n):(t.success||c)()}),o},o.done=function(n){e(n,[])},o}();

;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.init = init;
/* eslint-disable */

var log = function(){};
var logError = function(){};

try {
  if (window.flags && !window.flags.prod && window.console && 'bind' in Function.prototype) {
    log = window.console.log.bind(window.console);
    logError = window.console.error.bind(window.console);
  }
} catch(err) {}

var customEventSupport = (function () {
  try {
    return ('CustomEvent' in window &&
              (typeof window.CustomEvent === 'function' ||
              (window.CustomEvent.toString().indexOf('CustomEventConstructor')>-1)));
  } catch (e) {
    return false;
  }
}());

var dispatchErrorEvent = (customEventSupport ? function(){} : function(error, info) {
  var detail = { error: error };
  if (info) {
    detail.info = info;
  }

  var rootEl = document.body || document.documentElement;
	var event = (function () {
		try {
			return new CustomEvent(name, {bubbles: bubbles, cancelable: true, detail: detail});
		} catch (e) {
			return CustomEvent.initCustomEvent(name, true, true, detail);
		}
	}());

	rootEl.dispatchEvent(event);
});

function onScriptLoadError(depsNotFound) {
  depsNotFound = depsNotFound || [];
  var message = 'JS load error: ' + depsNotFound.join(', ');
  dispatchErrorEvent(new Error(message), {message: message});
  // logError('JS load error', depsNotFound);
}

function exec(script, callback) {
  if (typeof script === 'string' || Array.isArray(script)) {
    loadjs(script, {error: onScriptLoadError, success: (typeof callback === 'function' ? callback : undefined)});
    return;
  }

  if (typeof script === 'function') {
    try {
      script.call(window);
      if (typeof callback === 'function') {
        callback.call(window);
      }
    } catch (e) {
      dispatchErrorEvent(e);
      // logError(e);
    }
  }
}

var queued_scripts = [];
var low_priority_queue = [];

function queue(src, cb, low_priority) {

  if (!queued_scripts && !low_priority_queue) {
    exec(src, cb);
    return;
  } else if (!queued_scripts) {
    low_priority = true;
  }

  var args = typeof src !== 'function' ? [src, cb] : [null, src, cb];

  if (low_priority) {
    low_priority_queue.push(args);
  } else {
    queued_scripts.push(args);
  }
}

function processQueueArray(q, eventName) {
  var bundles = [];
  var readyFired = false;

  function done(errs) {
    if (readyFired) return;
    readyFired = true;
    loadjs.done(eventName);
  }

  if (q && q.length) {
    for (var i = 0; i < q.length; i++) {
      var callback = (q[i][1] &&
                          typeof q[i][1] === 'function' ? q[i][1]
                          : undefined);
      if (q[i][0]) {
        var key = '__' + eventName + bundles.length;
        bundles.push(key);
        loadjs(q[i][0], key, {error: onScriptLoadError, success: callback});
      } else if (callback) {
        exec(callback, q[i][2]);
      }
    }
  }

  if (bundles.length) {
    loadjs.ready(bundles, {success: done, error: done});
  } else {
    done()
  }
}

loadjs.ready('loader.polyfills', {success: function(){
  // log('loader.polyfills', 'done');
  processQueueArray(queued_scripts, 'loader.high');
  queued_scripts = null;
}});

loadjs.ready('loader.high', {success: function(){
  // log('loader.high', 'done');
  processQueueArray(low_priority_queue, 'loader.low');
  low_priority_queue = null;
}});

loadjs.ready('loader.low', {success: function(){
  // log('loader.low', 'done');
}});

// Polyfill service callback
window.igPolyfillsLoaded = function() {
  setTimeout(function() {
    loadjs.done('loader.polyfills');
  }, 0);
}

// Load the polyfill service with custom features. Exclude big unneeded polyfills.
// and use ?callback= to clear the queue of scripts to load
var defaultPolyfillFeatures = ['default-3.6', 'matchMedia', 'fetch',
                                  'IntersectionObserver', 'HTMLPictureElement',
                                  'Map|always|gated', 'Array.from|always|gated',
                                  'Array.prototype.includes|always|gated'];

var createPolyfillURL = function createPolyfillURL(features) {
  return 'https://cdn.polyfill.io/v2/polyfill.min.js?callback=igPolyfillsLoaded&features=' + features.join(',') + '&flags=gated&unknown=polyfill';
};

function init() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$polyfillFeatures = _ref.polyfillFeatures;
  var polyfillFeatures = _ref$polyfillFeatures === undefined ? defaultPolyfillFeatures : _ref$polyfillFeatures;


  if (!window.cutsTheMustard) {
    window.cutsTheMustard = typeof Function.prototype.bind !== 'undefined';
  }

  if (!window.cutsTheMustard) {
    // make the queue and exec a noop
    window.exec = window.queue = function(){};
    return;
  } else {
    window.queue = queue;
    window.exec = exec;
  }

  document.documentElement.className = document.documentElement.className.replace(/\bcore\b/g, 'enhanced');
  loadjs(createPolyfillURL(polyfillFeatures));
}

},{}],2:[function(require,module,exports){
'use strict';

require("./../../bower_components/g-ui/asset-loader/script-loader").init();

},{"./../../bower_components/g-ui/asset-loader/script-loader":1}]},{},[2]);
