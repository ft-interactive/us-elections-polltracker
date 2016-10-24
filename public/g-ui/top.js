(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.init = init;
/* eslint-disable */

function add_script(src, async, defer, cb) {
  var script = document.createElement('script');
  script.src = src;
  script.async = !!async;
  if (defer) script.defer = !!defer;
  var head = document.head || document.getElementsByTagName('head')[0];
  if (!cb && typeof defer === 'function') {
    cb = defer;
  }

  if (typeof cb === 'function') {
    var onScriptLoaded = function onScriptLoaded() {
      var readyState = this.readyState; // we test for "complete" or "loaded" if on IE
      if (!readyState || /ded|te/.test(readyState)) {
        try {
          cb();
        } catch (error) {
          if (window.console && console.error) {
            console.error(error);
          }
        }
      }
    };

    script.onload = script.onerror = script.onreadystatechange = onScriptLoaded;
  }
  head.appendChild(script);
  return script;
}

function exec(script) {
  if (!window.cutsTheMustard) return;
  var s = typeof script === 'undefined' ? 'undefined' : _typeof(script);
  if (s === 'string') {
    try {
      add_script.apply(window, arguments);
    } catch (e) {}
  } else if (s === 'function') {
    try {
      script();
    } catch (e) {}
  } else if (script) {
    try {
      var args = Array.prototype.slice.call(arguments, 1);
      for (var i = 0; i < script.length; i++) {
        exec.apply(window, [script[i]].concat(args));
      }
    } catch (e) {}
  }
}

var queued_scripts = [];
var low_priority_queue = [];

function queue(src, cb, low_priority) {
  var args = [src, true, !!low_priority, cb];

  if (!queued_scripts) {
    exec.apply(window, args);
    return;
  }

  if (low_priority) {
    low_priority_queue.push(args);
  } else {
    queued_scripts.push(args);
  }
}

function empty_queue(q) {
  var arr = q.slice(0);
  for (var i = 0; i < arr.length; i++) {
    exec.apply(window, arr[i]);
  }
}

function clear_queue() {
  empty_queue(queued_scripts);
  queued_scripts = null;
  var callback = low_priority_queue.length ? low_priority_queue[low_priority_queue.length - 1][3] : null;

  var done = function done() {
    document.documentElement.className = document.documentElement.className + ' js-success';
  };

  var onLoaded = typeof callback !== 'function' ? done : function () {
    callback();
    done();
  };

  if (low_priority_queue.length) {
    low_priority_queue[low_priority_queue.length - 1][3] = onLoaded;
  } else {
    setTimeout(function () {
      onLoaded();
    }, 1);
  }

  empty_queue(low_priority_queue);
  low_priority_queue = null;
}

// Load the polyfill service with custom features. Exclude big unneeded polyfills.
// and use ?callback= to clear the queue of scripts to load
var defaultPolyfillFeatures = ['default-3.6', 'matchMedia', 'fetch',
                                  'IntersectionObserver', 'HTMLPictureElement',
                                  'Map|always|gated', 'Array.from|always|gated'];

var createPolyfillURL = function createPolyfillURL(features) {
  return 'https://cdn.polyfill.io/v2/polyfill.min.js?callback=clear_queue&features=' + features.join(',') + '&flags=gated&unknown=polyfill&excludes=Symbol,Symbol.iterator,Symbol.species';
};

function init() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$polyfillFeatures = _ref.polyfillFeatures;
  var polyfillFeatures = _ref$polyfillFeatures === undefined ? defaultPolyfillFeatures : _ref$polyfillFeatures;


  if (!window.cutsTheMustard) {
    window.cutsTheMustard = typeof Function.prototype.bind !== 'undefined';
  }

  window.queue = queue;
  window.clear_queue = clear_queue;
  window.exec = exec;

  exec(function () {
    window.isNext = document.cookie.indexOf('FT_SITE=NEXT') !== -1;
    window.isLoggedIn = document.cookie.indexOf('FTSession=') !== -1;
    document.documentElement.className = document.documentElement.className.replace(/\bcore\b/g, ['enhanced', window.isNext ? 'is-next' : 'is-falcon', window.isLoggedIn ? 'is-loggedin' : 'is-anonymous'].join(' '));
  });

  exec(createPolyfillURL(polyfillFeatures), true, false);
}

},{}],2:[function(require,module,exports){
'use strict';

require("./../../bower_components/g-ui/asset-loader/script-loader").init();

},{"./../../bower_components/g-ui/asset-loader/script-loader":1}]},{},[2]);
