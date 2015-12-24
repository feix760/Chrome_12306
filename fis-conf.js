fis.project.setProjectRoot('src');
fis.processCWD = fis.project.getProjectPath();

fis.hook('commonjs', {
        packages: [
            {
                name: 'lib',
                location: '/modules/lib'
            },
            {
                name: 'common',
                location: '/modules/common'
            }
        ]
    })
    .match('/modules/(**).js', {
        isMod: true
    })
    .match('jquery.*', {
        isMod: false
    })
    .match('{mod,station_name}.js', {
        isMod: false
    })
    .match('**.min.js', {
        isMod: false
    })
    .match('/modules/common/lib.js', {
        isMod: false
    })
    .match(/\/(.+)\.tpl$/, {
        isMod: true,
        rExt: 'js',
        id: '$1_tpl',
        release: '$0.tpl',
        parser: fis.plugin('imweb-tpl')
    })
    .match('*.scss', {
        rExt: '.css',
        parser: fis.plugin('sass')
    })
    .match('_*.scss', {
        release: false
    });

fis.media('dev')
    .match('::package', {
        postpackager: [
            fis.plugin('loader', {
                resourceType: 'commonJs'
            })
        ]
    })
    .match('**', {
        deploy: fis.plugin('local-deliver', {
            to: '../dev'
        })
    });

fis.media('dist')
    .match('*.{js,css,png}', {
        useHash: true
    })
    .match('*.{css,scss}', {
        useSprite: true,
        optimizer: fis.plugin('clean-css')
    })
    .match('*.{js,tpl}', {
        optimizer: fis.plugin('uglify-js')
    })
    .match('/*', {
        useHash: false
    })
    .match('*.min.js', {
        optimizer: null
    })
    .match('::package', {
        postpackager: [
            fis.plugin('loader', {
                resourceType: 'commonJs',
                allInOne: {
                    css: '${filepath}_aio.css',
                    js: '${filepath}_aio.js',
                }
            })
        ]
    });

function release(rel) {
    var rt = {
        deploy: [
            fis.plugin('local-deliver', {
                to: '../dist-tmp'
            })
        ]
    };
    rel && (rt.release = rel);
    return rt;
}

// 生成public文件
fis.media('dist')
    .match('/*.*', release())
    // 资源文件
    .match(/\/modules\/.*\/([^\/\\]*)\.(wav|png|jpeg|jpg)/, release('/static/res/$1'))
    // 合并的js,css
    .match('/pages/(*)/*_aio.*', release('/static/$1'))
    // html
    .match('/pages/(*)/*.html', release('/pages/$1'));


