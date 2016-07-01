var jsdom = require('jsdom');

module.exports = function startJSDom(htmlStub) {
	return new Promise(function(resolve, reject) {
		jsdom.env({ 
			features : { 
				QuerySelector : true 
			}, 
			html : htmlStub, 
			done : function(error, window) {
				if (error) reject(error);
				else resolve(window);
			}
		})
	});
};
