'use strict';

const _ = require('lodash');
const cheerio = require('cheerio');
const date = require('date.js');

function getUploader ( html ) {
	const uploader = html.find('a[href^="/user/"]');
	return {
		name: uploader.text(),
		url: uploader.attr('href')
	};
}

function getPubDate ( html ) {
	return date(html.find('a[href^="/user/"]').parent().contents().last().text().trim()).toJSON();
}

function isCompleted ( html ) {
	return html.find('td.language + td').text().trim() === 'Completed';
}

function isHearingImpaired ( html ) {
	return Boolean(html.find('.newsDate[colspan="2"] img[title="Hearing Impaired"]').length);
}

function isCorrected ( html ) {
	return Boolean(html.find('.newsDate[colspan="2"] img[title="Corrected"]').length);
}

function getDescription ( html ) {
	return html.find('.newsDate[colspan="3"]').text().trim();
}

function getStats ( html, $ ) {
	return html.find('.newsDate[colspan="2"]').map(( i, item ) => {
		const re = /(\d+)/;
		const $item = $(item);
		const parts = $item.text().trim().split(' · ');
		return {
			edits: Number(re.exec(parts[0])[1]),
			downloads: Number(re.exec(parts[1])[1]),
			sequences: Number(re.exec(parts[2])[1])
		};
	}).get().pop();
}

function getDownloads ( html, $ ) {
	return _.sortBy(html.find('.buttonDownload').map(( i, item ) => {
		const $item = $(item);
		let type = $item.text().toLowerCase();
		if ( type === 'download' ) {
			type = 'original';
		}
		return {
			type: type,
			url: $item.attr('href')
		};
	}).get(), ( sub ) => {
		return /^\/original/.test(sub.url);
	});
}

function getVersion ( html ) {
	return html.find('.NewsTitle').text().trim().replace(/^Version (.+?), .+ MBs$/, '$1');
}

function getWorksWithCombination ( html ) {

	const workingCombinations = [
		['LOL', 'SYS', 'DIMENSION'],
		['XII', 'ASAP', 'IMMERSE']
	];
	const parts = getVersion(html).split(/[.-]/);

	return workingCombinations.reduce(( prev, next ) => {
		if ( _.intersection(next, parts).length !== 0 ) {
			return next;
		}
		return prev;
	}, []);

}

/**
 * @param  {String} body
 *
 * @return {Object[]}
 */
module.exports = ( body ) => {

	const $ = cheerio.load(body);
	const referer = $('a[href^="/show/"]').attr('href');
	const language = Number($('#filterlang').children('[selected]').val());
	const noResults = $('#filterlang').nextAll('font[color="yellow"]').text().trim() !== '';
	const subs = $('#container95m').get(); subs.pop();

	if ( body === '' || (body !== '' && noResults) ) {
		return [];
	}

	return subs.map(( el ) => {

		const $sub = $(el);

		return {
			language: language,
			version: getVersion($sub),
			worksWith: getWorksWithCombination($sub),
			downloads: getDownloads($sub, $),
			referer: referer,
			description: getDescription($sub),
			stats: getStats($sub, $),
			corrected: isCorrected($sub),
			hearingImpaired: isHearingImpaired($sub),
			uploader: getUploader($sub),
			pubDate: getPubDate($sub),
			completed: isCompleted($sub)
		};

	});

};

/**
 * @param  {String} body
 *
 * @return {String}
 */
module.exports.getDownloadCountExceededMessage = ( body ) => {
	const $ = cheerio.load(body);
	return $('.titulo').html().trim().replace(/(?:<br>){1,}/g, ' ');
};
