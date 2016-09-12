var path = require('path');
var _ = require('lodash');
var got = require('got');
var normalizeUrl = require('normalize-url');
var parse = require('./lib/parse');
var API_URL = 'http://www.addic7ed.com';

/**
 * @param  {String} url
 * @param  {Integer} language
 *
 * @return {Promise}
 */
function fetchLanguage ( url, language ) {
	var part = url.split('/'); part.pop();
	return got(normalizeUrl(`${API_URL}/${path.join(part.join('/'))}/${language}`));
}

module.exports = function ( id, season, episode, options ) {

	if ( typeof id !== 'number' || typeof season !== 'number' || typeof episode !== 'number' ) {
		return Promise.reject('Expected show and episode information.');
	}

	options = _.assign({
		language: 1
	}, options);

	return got.head(normalizeUrl(`${API_URL}/re_episode.php?ep=${id}-${season}x${episode}`))
		.then(( res ) => {
			var part = res.req.path;
			if ( part === '/index.php' ) {
				return {
					body: ''
				};
			}
			return fetchLanguage(part, options.language);
		})
		.then(( res ) => {
			return parse(res.body);
		});

};

/**
 * @param  {String} url
 *
 * @return {Promise}
 */
module.exports.download = function ( url ) {

	url = normalizeUrl(`${API_URL}/${url}`);

	return got(url, {
		headers: {
			Referer: url
		}
	})
		.then(( res ) => {
			return new Buffer(res.body);
		});

};
