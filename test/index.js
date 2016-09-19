var assert = require('assert');
var rewire = require('rewire');
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

it('should return array of subtitles if show information is correct', function () {

	var parse = rewire('../lib/parse');
	var fn = rewire('../');

	parse.__set__('date', function ( str ) {
		return require('date.js')(str, new Date('2016-09-12T23:20:00.000Z'));
	});
	fn.__set__('parse', parse);

	return fn(1245, 6, 4)
		.then(function ( subs ) {
			assert.deepEqual(subs, require('./fixtures/subtitles.json'));
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
