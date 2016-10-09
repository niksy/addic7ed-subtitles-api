# addic7ed-subtitles-api

[![Build Status][ci-img]][ci]

API for [Addic7ed subtitles][addic7ed].

## Install

```sh
npm install addic7ed-subtitles-api --save
```

## Usage

Following API request will display list of English language subtitles for Game of Thrones, season 6, episode 4.

```js
var subs = require('addic7ed-subtitles-api');

subs(1245, 6, 4)
	.then(function ( subs ) {
		console.log(subs);
		/* [
			{
				"version": "AVS",
				"worksWith": [],
				"downloads": [
					{
						"type": "original",
						"url": "/original/112218/0"
					}
				],
				"referer": "/show/1245",
				"description": "NOT FOR TRANSLATIONS!",
				"stats": {
					"edits": 0,
					"downloads": 65238,
					"sequences": 701
				},
				"corrected": true,
				"hearingImpaired": true,
				"language": 1,
				"uploader": {
					"name": "elderman",
					"url": "/user/11400"
				},
				"pubDate": "2016-09-12T23:20:00.000Z",
				"completed": true
			},
			…
		] */
	});

subs.download('/original/112218/0')
	.then(function ( sub ) {
		console.log(sub);
		// <Buffer ef bb bf ... >
	});
```

## API

### subs(id, season, episode, [options])

Returns: `Promise`

Displays list of subtitles for show based on show ID, season and episode number.

#### id

Type: `Integer`

Addic7ed subtitles show ID.

#### season

Type: `Integer`

Season number.

#### episode

Type: `Integer`

Episode number.

#### options

Type: `Object`

##### language

Type: `Integer|String`  
Default: `1` (English)

Subtitles language based on Addic7ed languages ID or [locale string][locales]. Locales are mapped as close as possible to their Addic7ed ID equivalent.

### subs.download(url)

Returns: `Promise`

Downloads subtitle from URL or reject promise if download count is exceeded. Returns `Buffer` with custom `filename` property containing proposed output filename.

#### url

Type: `String`

Addic7ed subtitle URL.

## References

* Basic idea from [same31/addic7ed-api](https://github.com/same31/addic7ed-api) project but expanded with additional functionality, proper show handling and test coverage

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)

[ci]: https://travis-ci.org/niksy/addic7ed-subtitles-api
[ci-img]: https://img.shields.io/travis/niksy/addic7ed-subtitles-api.svg
[addic7ed]: http://www.addic7ed.com/
[locales]: https://github.com/python/cpython/blob/be2a1a76fa43bb1ea1b3577bb5bdd506a2e90e37/Lib/locale.py#L1395-L1604
