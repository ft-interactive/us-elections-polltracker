var jsdom = require('jsdom');

// creates a jsdom with an HTML stub and returns a window
module.exports = function getJSDomWindow(htmlStub) {
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
