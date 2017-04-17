'use strict';

const path = require('path');
const _ = require('lodash');
const got = require('got');
const normalizeUrl = require('normalize-url');
const contentDisposition = require('content-disposition');
const contentType = require('content-type');
const safeBuffer = require('safe-buffer').Buffer;
const parse = require('./lib/parse');
const langs = require('./lib/langs');
const API_URL = 'http://www.addic7ed.com';

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
	if ( typeof value === 'string' ) {
		const lang = _.find(langs, ( o ) => { return o.locale.indexOf(value) !== -1; });
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
	const part = url.split('/'); part.pop();
	return got(normalizeUrl(`${API_URL}/${path.join(part.join('/'))}/${language}`));
}

/**
 * @param  {Integer} id
 * @param  {Integer} season
 * @param  {Integer} episode
 * @param  {Object} options
 *
 * @return {Promise}
 */
module.exports = ( id, season, episode, options ) => {

	if ( typeof id !== 'number' || typeof season !== 'number' || typeof episode !== 'number' ) {
		return Promise.reject('Expected show and episode information.');
	}

	options = _.assign({
		language: 1
	}, options);

	return got.head(normalizeUrl(`${API_URL}/re_episode.php?ep=${id}-${season}x${episode}`))
		.then(( res ) => {
			const part = res.req.path;
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
module.exports.download = ( url ) => {

	url = normalizeUrl(`${API_URL}/${url}`);

	return got(url, {
		headers: {
			Referer: url
		}
	})
		.then(( res ) => {
			const headerContentType = parseContentTypeHeader(res.headers['content-type']);
			if ( headerContentType.type !== 'text/html' ) {
				const buff = safeBuffer.from(res.body);
				buff.filename = contentDisposition.parse(res.headers['content-disposition']).parameters.filename;
				return buff;
			}
			return Promise.reject(parse.getDownloadCountExceededMessage(res.body));
		});

};
