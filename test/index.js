var assert = require('assert');
var timekeeper = require('timekeeper');
var networkMock = require('./helpers/network-mock');
var fn = require('../');

before(function () {
	networkMock.setup();
});

after(function () {
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

describe('', function () {

	before(function () {
		timekeeper.freeze(new Date('2016-09-12T23:20:00.000Z'));
	});

	after(function () {
		timekeeper.reset();
	});

	it('should return array of subtitles if show information is correct', function () {
		return fn(1245, 6, 4)
			.then(function ( subs ) {
				assert.deepEqual(subs, require('./fixtures/subtitles.json'));
			});
	});

	it('should return array of subtitles if there are any subtitles for specific language defined as locale string', function () {
		return fn(1245, 6, 4, { language: 'en_US' })
			.then(function ( subs ) {
				assert.deepEqual(subs, require('./fixtures/subtitles.json'));
			});
	});

});

it('should return empty array of subtitles if there aren’t any subtitles for specific language', function () {
	return fn(1245, 6, 4, { language: 9999 })
		.then(function ( subs ) {
			assert.equal(subs.length, 0);
		});
});

it('should download subtitle when provided with subtitle URL', function () {
	return fn.download('/original/112218/3')
		.then(function ( sub ) {
			assert.equal(sub instanceof Buffer, true);
		});
});

it('should get subtitle filename from headers', function () {
	return fn.download('/original/112218/3')
		.then(function ( sub ) {
			assert.equal(sub.filename, 'Game of Thrones - 06x04 - Book of the Stranger.AVS.English.HI.C.orig.Addic7ed.com.srt');
		});
});
