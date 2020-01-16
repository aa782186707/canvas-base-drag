const path = require('path');
// 用于在构建前清除public目录中的内容
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const env = process.env.NODE_ENV || 'production';
const isDevelopment = env === 'development';
const webpackConfig = {
    entry: './src/index.js',
    output: {
        filename: `index.js`,
        path: path.resolve(__dirname, './dist'),
        publicPath: '/', // cdn链接
    },
    plugins: [
        // 清除dist构建目录文件
        new CleanWebpackPlugin(path.resolve(__dirname, './dist')),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env), // 解决环境变量test无法识别问题
        }),
    ],
    mode: env === 'development' ? 'development' : 'production',
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|svg)$/i,
                loaders: ['url-loader?limit=81920000000'],
            },
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [path.resolve(__dirname, 'src')], // 指定检查的目录
                options: { // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
                },
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ['@babel/preset-env'],
                    // },
                },
            },
            {
                test: /\.(mp3)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    name: 'audios/[name].[ext]',
                    limit: 1000000000000,
                },
            },
        ],
    },
    devtool: isDevelopment ? 'source-map' : false,
    devServer: {
        // 根目录下的文件
        index: 'index.html',
        // 作用根目录
        contentBase: path.join(__dirname, './src/'),
        // 端口
        port: 8081,
        // 内联模式
        inline: true,
        // 开启热加载
        hot: true,
        // 默认浏览器自动化打开
        open: true,
    },
};
// 开发环境增加热加载
if (isDevelopment) {
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.plugins.push(new HtmlWebpackPlugin({ // 配置
        filename: 'index.html', // 输出文件名
        template: './src/index.html', // 以当前目录下的index.html文件为模板生成dist/index.html文件
    }));
}
// 测试环境删除入口和出口
if (process.env.BABEL_ENV === 'test') {
    delete webpackConfig.entry;
    delete webpackConfig.output;
}
module.exports = webpackConfig;
