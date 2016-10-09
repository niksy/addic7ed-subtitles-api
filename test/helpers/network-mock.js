var path = require('path');
var nock = require('nock');
var url;

module.exports = {
	setup: function () {

		url = nock('http://www.addic7ed.com');

		url
			.head('/re_episode.php')
			.query({
				ep: '1245-99x4'
			})
			.reply(302, '', {
				Location: '/index.php'
			})
			.head('/index.php')
			.reply(200);

		url
			.head('/re_episode.php')
			.query({
				ep: '1245-6x4'
			})
			.times(3)
			.reply(302, '', {
				Location: '/serie/Game_of_Thrones/6/4/Book_of_the_Stranger'
			})
			.head('/serie/Game_of_Thrones/6/4/Book_of_the_Stranger')
			.times(3)
			.reply(200);

		url
			.get('/serie/Game_of_Thrones/6/4/1')
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/subtitles.html'));

		url
			.get('/serie/Game_of_Thrones/6/4/9999')
			.replyWithFile(200, path.join(__dirname, 'fixtures/subtitles-no-language-results.html'));

		url
			.get('/original/112218/3')
			.times(2)
			.replyWithFile(200, path.join(__dirname, 'fixtures/subtitle.srt'), {
				'Content-Type': 'text/srt; charset=',
				'Content-Disposition': 'attachment; filename="Game of Thrones - 06x04 - Book of the Stranger.AVS.English.HI.C.orig.Addic7ed.com.srt"'
			})
			.get('/original/112218/3')
			.replyWithFile(200, path.join(__dirname, 'fixtures/download-count-exceeded.html'), {
				'Content-Type': 'text/html'
			});

	},
	destroy: function () {
		url.done();
		nock.cleanAll();
	}
};
