const webpackConfig = require('../../webpack.config.js');

module.exports = function (config) {
    const configuration = {
        // 需要使用的浏览器
        browsers: ['ChromeHeadless'],
        // 测试框架
        frameworks: ['mocha'],
        // 使用测试报告者
        reporters: ['spec', 'coverage'],
        // 需要加载到浏览器的文件列表
        files: ['**/*.spec.js'],
        // 在浏览器使用之前处理匹配的文件
        preprocessors: {
            '**/*.spec.js': ['webpack', 'sourcemap'],
        },
        webpack: webpackConfig,
        webpackMiddleware: {
            noInfo: true,
        },
        // 使用reporters为"coverage"时报告输出的类型和那目录
        coverageReporter: {
            dir: './coverage',
            reporters: [{
                    type: 'lcov',
                    subdir: '.',
                },
                {
                    type: 'text-summary',
                },
            ],
        },
        client: {
            mocha: {
                timeout: 4000,
            },
        },
    };

    config.set(configuration);
};