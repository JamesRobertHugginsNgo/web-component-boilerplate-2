import ChildProcess from 'node:child_process';
import Fs from 'node:fs/promises';
import Path from 'node:path';
import Stream from 'node:stream';
import Vinyl from 'vinyl';

import Gulp from 'gulp';
import GulpCleanCss from 'gulp-clean-css';
import GulpHtmlmin from 'gulp-htmlmin';
import gulpRename from 'gulp-rename';
import gulpReplace from 'gulp-replace';
import gulpTerser from 'gulp-terser';

// ==
// CONSTANTS
// ==

const DEST = './dist';
const CDN_URL_PREFIX = 'https://cdn.jsdelivr.net/gh/JamesRobertHugginsNgo/web-component-boilerplate@';

// ==
// HELPER GULP PLUGIN
// ==

function stringSrc(filename, string) {
	const src = Stream.Readable({ objectMode: true });
	src._read = function () {
		this.push(new Vinyl({
			cwd: '',
			base: '.',
			path: filename,
			contents: Buffer.from(string, 'utf-8')
		}));
		this.push(null);
	};
	return src;
}

// ==
// GLOBAL VARIABLE
// ==

const minify = process.argv.indexOf('--minify') !== -1;
let destValue;

// ==
// TASKS
// ==

function setup() {
	return Promise.resolve().then(() => {
		if (process.argv.indexOf('--clean') !== -1 || process.argv.indexOf('--clear') !== -1) { // Note: Allows older flag for backward compatibility
			return Fs.rm(DEST, { recursive: true });
		}
	}).then(() => {
		const tagFlagIndex = process.argv.indexOf('--tag');
		if (tagFlagIndex !== -1) {
			const tagFlagValue = process.argv[tagFlagIndex + 1];

			if (!tagFlagValue || /^--/.test(tagFlagValue)) {
				return Fs.readFile('./package.json', { encoding: 'utf8' }).then((content) => {
					return `${CDN_URL_PREFIX}${JSON.parse(content).version}`;
				});
			}

			return `${CDN_URL_PREFIX}${tagFlagValue}`;
		}

		const branchFlagIndex = process.argv.indexOf('--branch');
		if (branchFlagIndex !== -1) {
			return new Promise((resolve, reject) => {
				ChildProcess.exec('git rev-parse --abbrev-ref HEAD', (error, stdout) => {
					if (error) {
						reject(error);
						return;
					}
					resolve(`${CDN_URL_PREFIX}${stdout.replace(/(\r\n|\n|\r)/gm, '')}`);
				});
			});
		}
	}).then((prefix = '') => {
		destValue = `${prefix}/${Path.join(DEST)}`;
	});
}

function buildSrcHtml() {
	return Gulp.src(['./src/**/*.html'])
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', ''))
		.pipe(Gulp.dest(DEST));
}

function buildSrcHtmlMin() {
	return Gulp.src(['./src/**/*.html'])
		.pipe(gulpRename((path) => {
			path.basename = path.basename + '.min';
		}))
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', '.min'))
		.pipe(GulpHtmlmin({ collapseWhitespace: true }))
		.pipe(Gulp.dest(DEST));
}

function buildSrcCss() {
	return Gulp.src(['./src/**/*.css'])
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', ''))
		.pipe(Gulp.dest(DEST));
}

function buildSrcCssMin() {
	return Gulp.src(['./src/**/*.css'], { sourcemaps: true })
		.pipe(gulpRename((path) => {
			path.basename = path.basename + '.min';
		}))
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', '.min'))
		.pipe(GulpCleanCss())
		.pipe(Gulp.dest(DEST, { sourcemaps: '.' }));
}

function buildSrcJs() {
	return Gulp.src(['./src/**/*.js'])
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', ''))
		.pipe(Gulp.dest(DEST));
}

function buildSrcJsMin() {
	return Gulp.src(['./src/**/*.js'], { sourcemaps: true })
		.pipe(gulpRename((path) => {
			path.basename = path.basename + '.min';
		}))
		.pipe(gulpReplace('{{DEST}}', destValue))
		.pipe(gulpReplace('{{INFIX}}', '.min'))
		.pipe(gulpTerser())
		.pipe(Gulp.dest(DEST, { sourcemaps: '.' }));
}

function buildOther() {
	return Gulp.src([
		'./src/**/*',
		'!./src/**/*.css',
		'!./src/**/*.html',
		'!./src/**/*.js'
	])
		.pipe(Gulp.dest('./dist'));
}

function buildCdnFilesMd() {
	function getFiles(path = '.') {
		return Fs.readdir(Path.join(DEST, path)).then((files) => {
			let promise = Promise.resolve([]);
			const length = files.length;
			for (let index = 0; index < length; index++) {
				const file = files[index];
				promise = promise.then((list) => {
					return Fs.lstat(Path.join(DEST, path, file)).then((stat) => {
						if (stat.isDirectory()) {
							return getFiles(Path.join(path, file)).then((resultList) => {
								list.push(...resultList);
								return list;
							});
						}
						list.push(`${destValue}/${Path.join(path, file)}`);
						return list;
					});
				});
			}
			return promise;
		});
	}

	return getFiles().then((list) => {
		const content = [
			'# CDN Files\n\n',
			list.map((item) => `- ${item}`).join('\n')
		].join('');
		return stringSrc('CDN-FILES.md', content).pipe(Gulp.dest(DEST));
	});
}

export default Gulp.series(
	setup,
	Gulp.parallel(
		...[
			buildSrcHtml,
			minify && buildSrcHtmlMin,
			buildSrcCss,
			minify && buildSrcCssMin,
			buildSrcJs,
			minify && buildSrcJsMin,
			buildOther
		].filter(Boolean)
	),
	buildCdnFilesMd
);
