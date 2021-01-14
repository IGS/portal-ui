var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
$.ngAnnotate = require('gulp-ng-annotate');
var del = require('del');
var log = require('fancy-log');
var fs = require('graceful-fs');
var packageJSON = require('./package.json');
var mkdirp = require('mkdirp');
var randomString = require('random-string');
var eslint = require('gulp-eslint');
var format = require('string-format');

format.extend(String.prototype);

var env = {
    api: '/api',
    auth: '/api/status',
    base: '/',
    port: 8080,
    fake_auth: true
};

var production = false;
// var production = true;
if (process.env.NODE_ENV === 'production') {
    production = true;
}

log('Environment', production ? 'Production' : 'Development');

// <paths>
var paths = {
    'src': './src',
    'ddest': './dist',
    js: {},
    css: {},
    html: {}
};

paths.css.deps = './css';
paths.css.dest = paths.ddest + '/css/lib';
paths.js.src = paths.src + '/app/**/*';
paths.js.deps = './js';
paths.js.dest = paths.ddest + '/js/lib';
paths.vendor = paths.ddest + '/libs';
paths.html.src = paths.src + '/index.html';
paths.html.dest = paths.dest + '/index.html';
// </paths>

gulp.task('logs', function() {
    var cl = require('conventional-changelog');
    var myFile = fs.createWriteStream('CHANGELOG.md');
    return cl({
        repository: packageJSON.repository,
        version: packageJSON.version
    }).pipe(myFile);
});

gulp.task('clean', function() {
    return del(['.tmp/**', 'dist/**'], {force: true});
});

// This is a function that is used to format the output of the use of the
// gulp-sizediff module. Which, in this gulpfile, is invoked with $.sizediff()
// because of the use of the gulp-load-plugins module, which puts everything
// under $.
var sizeDiffFormat = function(data) {
    return ': Before: ' + data.startSize + ', After: ' + data.endSize +
        ' (' + Math.round(data.diffPercent * 100) + '% of original)' +
        '. Total bytes saved: ' + data.diff;
};

// Optimize images
function images() {
    return new Promise(function(resolve, reject) {
        gulp.src('app/images/**/*')
            .pipe($.sizediff.start())
            // Removes the viewBox from SVG regardless of parameter passed
            // Removed for NeMO (header logo)
            /*.pipe($.imagemin({
                progressive: true,
                interlaced: true
            }))*/
            .pipe($.sizediff.stop({title: 'images', formatFn: sizeDiffFormat}))
            .pipe(gulp.dest('dist/images'))
            .on('end', resolve)
            .on('error', reject);
    });
}

function fonts() {
    return new Promise(function(resolve, reject) {
        gulp.src(['app/fonts/**'])
            .pipe($.size({title: 'fonts'}))
            .pipe(gulp.dest('dist/fonts'))
            .on('end', resolve)
            .on('error', reject);
    });
}

// Copy external non-yarn managed libraries to dist
function vendor() {
    return new Promise(function(resolve, reject) {
        gulp.src(['app/vendor/**'])
            .pipe($.size({title: 'vendor'}))
            .pipe(gulp.dest('dist/libs'))
            .on('end', resolve)
            .on('error', reject);
    });
}

// Compile and Automatically Prefix Stylesheets
//gulp.task('styles', function() {
function styles() {
    return new Promise(function(resolve, reject) {
        var filename = production ? 'styles.min.css' : 'styles.css';

        gulp.src('app/styles/app.less')
            .pipe($.changed('styles', {extension: '.less'}))
            .pipe($.less().on('error', log))
            .pipe($.autoprefixer({
                cascade: false
            })
            )
            .pipe($.sizediff.start())
            // Concatenate And Minify Styles
            .pipe($.concat(filename))
            .pipe($.if(production, $.csso()))
            .pipe($.sizediff.stop({title: 'styles', formatFn: sizeDiffFormat}))
            .pipe(gulp.dest('dist/css'))
            .on('end', resolve)
            .on('error', reject);
    });
}

// NOTE: When replacing this task, the replacement will instead take assets from
// js/components, css/components and fonts/components, and do essentially the
// same thing into dist/libs
gulp.task('frontend_js', function() {
    var stream = gulp.src(paths.js.deps + '/components/**/*');

    return stream
        .pipe(gulp.dest(paths.js.dest));
});

gulp.task('frontend_css', function() {
    var stream = gulp.src(paths.css.deps + '/components/**/*');

    var f = $.filter(
        ['**', '!**/fonts', '!**/fonts/**'],
        {restore: true, passthrough: false}
    );

    stream
        // Filter the non-font files
        .pipe(f)
        .pipe(gulp.dest('./dist/css/lib'));

    // Use the filtered files (which are fonts) as a gulp file source
    f.restore
        .pipe(gulp.dest('./dist/css'));

    return stream;
});

var frontend = gulp.series('frontend_js', 'frontend_css');

gulp.task('frontend', frontend);

// <ng-templates>
gulp.task('ng_templates', function() {
    return ng_templates();
});

var ng_templates = function() {
    var f = production ? 'templates.min.js' : 'templates.js';

    return gulp.src('app/scripts/**/templates/*.html')
        .pipe($.htmlmin({
            collapseWhitespace: true,
            customAttrCollapse: /data-|d/,
            removeRedundantAttributes: true,
            removeComments: true }
        ))
        .pipe($.ngHtml2js({
            moduleName: function(file) {
                var path = file.path.split('/');
                var folder = path[path.length - 2];
                return folder.replace(/-[a-z]/g, function(match) {
                    return match.substr(1).toUpperCase() + 'templates';
                });
            }
        }))
        .pipe($.concat(f))
        .pipe($.if(production, $.uglify()))
        .pipe(gulp.dest('dist/js'))
        .pipe($.size({title: 'ng_templates'}));
};
// </ng-templates>

var html_replacement = function() {
    var minified = production ? '.min' : '';

    return gulp.src('app/index.html')
        .pipe($.replace('__BASE__', env.base))
        .pipe($.replace('__MINIFIED__', minified))
        .pipe(gulp.dest('dist'))
        .pipe($.size({title: 'html'}));
};

var html = gulp.series(html_replacement, 'frontend', 'ng_templates');

gulp.task('html', html);

// Scan Your HTML For Assets & Optimize Them
gulp.task('rev', gulp.series('html', function() {
    var stream = gulp.src('dist/index.html');

    if (production) {
        var manifest = paths.vendor + '/rev-manifest.json';
        var vendorFiles = fs.existsSync(manifest) ? require(manifest) : [];
        //var assets = $.useref.assets({searchPath: 'dist'});

        for (var file in vendorFiles) {
            if (vendorFiles.hasOwnProperty(file)) {
                stream = stream.pipe($.replace(file, vendorFiles[file]));
            }
        }

        return stream
            //.pipe($.rev())
            // .pipe($.useref())
            //.pipe($.revReplace())
            //.pipe(gulp.dest('dist'))
            .pipe($.gzip())
            .pipe(gulp.dest('dist'));
    } else {
        return stream
            .pipe(gulp.dest('dist'))
            .pipe($.size({title: 'rev'}));
    }
}));

// <typescript>
var tsProject = $.typescript.createProject('app/scripts/tsconfig.json');

var ts_compile = function () {
    var f = production ? 'app.min.js' : 'app.js';
    var api_base = production ? '/api' : 'http://localhost:5000';

    var tsResult = gulp.src('app/**/*.ts')
        .pipe(tsProject());

    tsResult.dts.pipe(gulp.dest('dist/dts'));
    tsResult.js.pipe(gulp.dest('.tmp'));

    return tsResult.js
        .pipe($.if(! production, $.sourcemaps.init()))
        .pipe($.concat(f))
        .pipe($.replace('__API_BASE__', api_base))
        .pipe($.ngAnnotate())
        .pipe($.if(production, $.uglify()))
        .pipe($.wrap({src: './iife.txt'}))
        .pipe($.if(! production, $.sourcemaps.write()))
        .pipe(gulp.dest('dist/js'))
        .pipe($.size({title: 'typescript'}));
};

gulp.task('ts_compile', function() {
    return ts_compile();
});
// </typescript>

gulp.task('test', gulp.series('clean', 'ts_compile', 'ng_templates'), function(done) {
    console.log('TO BE IMPLEMENTED');
    done();
});

gulp.task('server', function() {
    var express = require('express');
    var path = require('path');
    var app = express();
    var port = env.port;
    var localpath = 'dist';

    // Watch for changes, and relaunch gulp tasks as necesary...
    if (! production) {
        devel_watcher();
    }

    console.log('Configured Access URLs:');
    console.log('-------------------------------------');
    console.log('UI: http://localhost:{}{}'.format(port, env.base));
    console.log('-------------------------------------');
    console.log('API {}:'.format(env.api));
    console.log('-------------------------------------');
    console.log('Serving files at {} from dir: {}\n\n'.format(env.base, localpath));

    app.use('/', express.static(path.join(__dirname, localpath)));

    // Needed for browser refresh to work
    app.get('*', function(request, response, next) {
        response.sendfile(__dirname + '/dist/index.html');
    });
    app.listen(port);
});

function devel_watcher() {
    gulp.watch(['app/**/*.html'], function(event) {
        console.log('Detected an HTML change. ' +
                    'Re-running the "html" task and reloading.');
        html();
    });
    gulp.watch(['app/**/*.{less,css}'], function(event) {
        console.log('Detected a less or css change. ' +
                    'Re-running the "styles" task and reloading.');
        styles();
    });
    gulp.watch(['app/scripts/**/*.ts'], function(event) {
        console.log('Detected a typescript change. ' +
                    'Re-running the "ts_compile" task and reloading.');
        ts_compile();
    });
    gulp.watch(['app/scripts/**/*.html'], function(event) {
        console.log('Detected an angular template change. ' +
                    'Re-running the "ng_templates" task and reloading.');
        ng_templates();
    });
    gulp.watch(['app/images/**/*'], function(event) {
        console.log('Detected an images change. ' +
                    'Re-running the "images" task and reloading.');
        images();
    });
}

function pegjs() {
    var PEG = require('pegjs');
    var input = fs.readFileSync('gql.pegjs', {encoding: 'utf8'});
    var parser = PEG.generate(input, {output: 'source'});

    return new Promise(function(resolve, reject) {
        var out = production ? 'gql.min.js' : 'gql.js';
        fs.writeFileSync(out, 'window.gql = ' + parser);

        gulp.src(out)
            // Minify the gql javascript file if we're in 'production'. Also,
            // if we DO minify, then produce the stats of how much savings
            // we got. Therefore, we have 'if' conditions around the sizediff
            // invocations.
            .pipe($.if(production, $.sizediff.start()))
            .pipe($.if(production, $.uglify()))
            .pipe($.if(production, $.sizediff.stop({title: 'pegjs', formatFn: sizeDiffFormat})))
            .pipe(gulp.dest('dist/js/'))
            .on('end', resolve)
            .on('error', reject);
    });
}

// Run the eslint tool on javascript assets (that are not 3rd party or
// already minified) and report results.
gulp.task('eslint', function() {
    var stream = gulp.src([
        '**/*.js',
        '!dist/**',
        '!**/*.min.js',
        '!js/components/**',
        '!node_modules/**'
    ]);

    return stream
        .pipe(eslint())
        .pipe(eslint.result(function(result) {
            // Called for each ESLint result.
            if (result.messages.length !== 0) {
                console.log('ESLint result: ' + result.filePath);
                console.log('# Messages: ' + result.messages.length);
                console.log('# Warnings: ' + result.warningCount);
                console.log('# Errors: ' + result.errorCount);
            }
        }));
});

gulp.task('build', gulp.series('clean', styles,
    gulp.series(
        gulp.parallel(
            'rev', fonts, vendor,
            pegjs, 'ts_compile', images
        ),
        function parallelDone (done) {
            done();
        }
    ),
    function allDone (done) {
        done();
    }
));

gulp.task('default', gulp.series('build'));
