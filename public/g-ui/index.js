(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
function init() {
  return new Promise(function (resolve, reject) {
    queue('https://ig.ft.com/static/g-ui/o-ads.20161111.js', function () {

      if (!window.oAds) {
        reject(new Error('Could not load oAds'));
        return;
      }

      resolve();
    }, true);
  });
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = analytics;
function analytics() {
  queue('https://ig.ft.com/static/g-ui/o-tracking.20161025.js', function () {

    if (!window.oTracking) {
      throw new Error('Could not load oTracking');
    }

    var oTracking = window.oTracking['o-tracking'];
    var page_data = {
      content: { asset_type: 'interactive' }
    };

    var properties = [].reduce.call(document.querySelectorAll('head meta[property^="ft.track:"]') || [], function (o, el) {
      o[el.getAttribute('property').replace('ft.track:', '')] = el.getAttribute('content');
      return o;
    }, {});

    var id = document.documentElement.getAttribute('data-content-id');

    if (id) {
      page_data.content.uuid = id;
    }

    if (properties.microsite_name) {
      page_data.microsite_name = properties.microsite_name;
    }

    oTracking.init({
      server: 'https://spoor-api.ft.com/px.gif',
      system: {
        is_live: typeof properties.is_live === 'string' ? properties.is_live.toLowerCase() : false
      },
      context: { product: properties.product || 'IG' }
    });

    // Automatic link tracking
    oTracking.link.init();
    // Register page view
    oTracking.page(page_data);
  }, true);
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
/* eslint-disable */

var oCommentsUrl = 'https://origami-build.ft.com/v2/bundles/js?export=oComments&modules=o-comments@^3.3.0&autoinit=0';

function init() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$elementId = _ref.elementId;
  var elementId = _ref$elementId === undefined ? 'comments' : _ref$elementId;
  var _ref$delay = _ref.delay;
  var delay = _ref$delay === undefined ? 1000 : _ref$delay;
  var _ref$initialNumVisibl = _ref.initialNumVisible;
  var initialNumVisible = _ref$initialNumVisibl === undefined ? 10 : _ref$initialNumVisibl;


  var container = document.getElementById(elementId);
  var articleId = document.documentElement.getAttribute('data-content-id');

  if (!container) {
    return Promise.reject('No comments container element present');
  };

  if (!articleId) {
    return Promise.reject('Cannot get comments, article ID not found.');
  }

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      queue(oCommentsUrl, function () {
        if (!oComments) {
          Promise.reject('Couldn\'t get oComments');
          return;
        }

        try {
          resolve(new oComments['o-comments'](container, {
            title: document.title,
            url: document.location.href,
            articleId: articleId,
            livefyre: {
              initialNumVisible: initialNumVisible,
              disableIE8Shim: true,
              disableThirdPartyAnalytics: true
            }
          }));
        } catch (err) {
          reject(err);
        }
      }, true);
    }, delay);
  });
}

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _onwardJourney = require('./onward-journey');

var _onwardJourney2 = _interopRequireDefault(_onwardJourney);

var _comments = require('./comments');

var _comments2 = _interopRequireDefault(_comments);

var _analytics = require('./analytics');

var _analytics2 = _interopRequireDefault(_analytics);

var _ads = require('./ads');

var _ads2 = _interopRequireDefault(_ads);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialized = false;

function init() {
  if (initialized) return;
  initialized = true;

  if (flags.analytics) (0, _analytics2.default)();
  if (flags.ads) (0, _ads2.default)().catch(console.log);
  if (flags.onwardJourney) (0, _onwardJourney2.default)();
  if (flags.comments) (0, _comments2.default)().catch(console.log);
}

},{"./ads":1,"./analytics":2,"./comments":3,"./onward-journey":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderIntoElement = renderIntoElement;
exports.default = init;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var elementSelector = exports.elementSelector = '[data-g-component="onward-journey"]';

var serviceBaseUrl = exports.serviceBaseUrl = 'https://ig.ft.com/onwardjourney/v1/';

var fetchList = exports.fetchList = function fetchList(list, layout, limit) {
  return fetch('' + serviceBaseUrl + list + '/html/' + layout + '?limit=' + limit).then(function (res) {
    if (res.status >= 200 && res.status < 300) {
      return res;
    } else {
      var error = new Error(res.statusText);
      error.res = response;
      throw error;
    }
  }).then(function (res) {
    return res.text();
  });
};

function renderIntoElement(element) {
  if (element.classList.contains('is-rendered')) return;
  var list = element.getAttribute('data-list') || 'list/graphics';
  var layout = element.getAttribute('data-layout') || '';
  var limit = parseInt(element.getAttribute('data-rows') || '1') * 4;
  fetchList(list, layout, limit).then(function (html) {
    element.innerHTML = html;
    element.classList.add('is-rendered');
  }).catch(function () {
    element.remove();
  });
}

function init() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$delay = _ref.delay;
  var delay = _ref$delay === undefined ? 800 : _ref$delay;

  setTimeout(function () {
    [].concat(_toConsumableArray(document.querySelectorAll(elementSelector))).forEach(renderIntoElement);
  }, delay);
}

},{}],6:[function(require,module,exports){
'use strict';

require("./../../bower_components/g-ui/index").init();

},{"./../../bower_components/g-ui/index":4}]},{},[6]);
