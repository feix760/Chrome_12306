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
    .match('{mod,moment,station_name}.js', {
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

