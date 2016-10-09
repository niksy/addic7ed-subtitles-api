var path = require('path');
var _ = require('lodash');
var got = require('got');
var normalizeUrl = require('normalize-url');
var contentDisposition = require('content-disposition');
var contentType = require('content-type');
var parse = require('./lib/parse');
var langs = require('./lib/langs');
var API_URL = 'http://www.addic7ed.com';

/**
 * @param  {String} str
 *
 * @return {Object}
 */
function parseContentTypeHeader ( str ) {
	if ( /charset=$/.test(str) ) {
		str = `${str}utf8`;
	}
	return contentType.parse(str);
}

/**
 * @param  {String|Number} value
 *
 * @return {Number}
 */
function resolveLanguage ( value ) {
	var lang;
	if ( typeof value === 'string' ) {
		lang = _.find(langs, ( o ) => { return o.locale.indexOf(value) !== -1; });
		if ( typeof lang !== 'undefined' ) {
			return lang.id;
		}
	}
	return value;
}

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
			return fetchLanguage(part, resolveLanguage(options.language));
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
			var headerContentType = parseContentTypeHeader(res.headers['content-type']);
			var buff;
			if ( headerContentType.type !== 'text/html' ) {
				buff = new Buffer(res.body);
				buff.filename = contentDisposition.parse(res.headers['content-disposition']).parameters.filename;
				return buff;
			}
			return Promise.reject(parse.getDownloadCountExceededMessage(res.body));
		});

};
