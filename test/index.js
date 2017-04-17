'use strict';

const assert = require('assert');
const timekeeper = require('timekeeper');
const networkMock = require('./helpers/network-mock');
const fn = require('../');

before(function () {
	timekeeper.freeze(new Date('2016-09-12T23:20:00.000Z'));
	networkMock.setup();
});

after(function () {
	timekeeper.reset();
	networkMock.destroy();
});

it('should reject if show information is not provided', function () {
	return fn()
		.catch(function ( err ) {
			assert.equal(err, 'Expected show and episode information.');
		});
});

it('should reject if season information is not provided', function () {
	return fn(1)
		.catch(function ( err ) {
			assert.equal(err, 'Expected show and episode information.');
		});
});

it('should reject if episode information is not provided', function () {
	return fn(1, 2)
		.catch(function ( err ) {
			assert.equal(err, 'Expected show and episode information.');
		});
});

it('should return empty array of subtitles if show information is incorrect', function () {
	return fn(1245, 99, 4)
		.then(function ( subs ) {
			assert.equal(subs.length, 0);
		});
});

it('should return array of subtitles if show information is correct', function () {
	return fn(1245, 6, 4)
		.then(( subs ) => {
			assert.deepEqual(subs, require('./fixtures/subtitles.json'));
		});
});

it('should return array of subtitles if there are any subtitles for specific language defined as locale string', function () {
	return fn(1245, 6, 4, { language: 'en_US' })
		.then(( subs ) => {
			assert.deepEqual(subs, require('./fixtures/subtitles.json'));
		});
});

it('should return empty array of subtitles if there aren’t any subtitles for specific language', function () {
	return fn(1245, 6, 4, { language: 9999 })
		.then(( subs ) => {
			assert.equal(subs.length, 0);
		});
});

it('should download subtitle when provided with subtitle URL', function () {
	return fn.download('/original/112218/3')
		.then(( sub ) => {
			assert.equal(sub instanceof Buffer, true);
		});
});

it('should get subtitle filename from headers', function () {
	return fn.download('/original/112218/3')
		.then(( sub ) => {
			assert.equal(sub.filename, 'Game of Thrones - 06x04 - Book of the Stranger.AVS.English.HI.C.orig.Addic7ed.com.srt');
		});
});

it('should reject if subtitle download count is excedeed', function () {
	return fn.download('/original/112218/3')
		.catch(( err ) => {
			assert.equal(err, 'Daily Download count exceeded. Login to continue. Error: 2: Anonymous users are limited to 15 downloads per 24 hours on their IP address. Fix: Login to get more 127.0.0.1 Registered users are limited to 40 but VIPs get 80 downloads every 24 hours. Please consider donating to become VIP and show your support.');
		});
});
