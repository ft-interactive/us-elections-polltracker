/*!
  * $script.js JS loader & dependency manager
  * https://github.com/ded/script.js
  * (c) Dustin Diaz 2014 | License MIT
  */
(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return t(e),1})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v});

;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.init = init;
/* eslint-disable */

function exec(script, callback) {
  if (typeof script === 'string') {
    $script(script, (typeof callback === 'function' ? callback : undefined));
    return;
  }

  if (typeof script === 'function') {
    try {
      script();
      if (typeof callback === 'function') {
        callback();
      }
    } catch (e) {
      window.console && console.error && console.error(e);
      // TODO: proper error handling
    }
    return
  }
}

var queued_scripts = [];
var low_priority_queue = [];

function queue(src, cb, low_priority) {
  if (!queued_scripts) {
    exec(src, cb);
    return;
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
  if (q && q.length) {
    for (var i = 0; i < q.length; i++) {
      var callback = (q[i][1] &&
                          typeof q[i][1] === 'function' ? q[i][1]
                          : undefined);
      if (q[i][0]) {
        var key = '__' + eventName + bundles.length;
        bundles.push(key);
        $script(q[i][0], key, callback);
      } else if (callback) {
        exec(callback, q[i][2]);
      }
    }
    if (bundles.length) {
      $script.ready(bundles, function() {
        $script.done(eventName);
      });
    }
  }
}

$script.ready('loader.polyfills', function(){
  processQueueArray(queued_scripts, 'loader.high');
  queued_scripts = null;
});

$script.ready('loader.high', function(){
  processQueueArray(low_priority_queue, 'loader.low');
  low_priority_queue = null;
});

// Polyfill service callback
window.igPolyfillsLoaded = function() {
  setTimeout(function(){
    $script.done('loader.polyfills');
  }, 0);
}

// Load the polyfill service with custom features. Exclude big unneeded polyfills.
// and use ?callback= to clear the queue of scripts to load
var defaultPolyfillFeatures = ['default-3.6', 'matchMedia', 'fetch',
                                  'IntersectionObserver', 'HTMLPictureElement',
                                  'Map|always|gated', 'Array.from|always|gated',
                                  'Array.prototype.includes|always|gated'];

var createPolyfillURL = function createPolyfillURL(features) {
  return 'https://cdn.polyfill.io/v2/polyfill.min.js?callback=igPolyfillsLoaded&features=' + features.join(',') + '&flags=gated&unknown=polyfill&excludes=Symbol,Symbol.iterator,Symbol.species';
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
  $script(createPolyfillURL(polyfillFeatures));
}

},{}],2:[function(require,module,exports){
'use strict';

require("./../../bower_components/g-ui/asset-loader/script-loader").init();

},{"./../../bower_components/g-ui/asset-loader/script-loader":1}]},{},[2]);
