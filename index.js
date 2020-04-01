const webpack = require("webpack");
const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const path = require("path");

require("dotenv").config();
const resolve = (file) => path.resolve(__dirname, file);

const base = (libraryName) => ({
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    resolve: {
        extensions: ["*", ".js", ".json", ".ts"],
    },
    plugins: [
        new FriendlyErrorsWebpackPlugin({
            clearConsole: true,
        }),
    ],
    performance: {
        hints: false,
    },
    stats: { children: false },
    entry: {
        app: "./src/index.ts",
    },
    output: {
        path: resolve("../dist"),
        publicPath: "/dist/",
        library: libraryName,
        libraryTarget: "umd",
        libraryExport: "default",
    },
    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true,
            }),
        ],
    },
});

const builds = (libraryName) => ({
    development: {
        config: {
            devtool: "source-map",
            mode: "development",
            output: {
                filename: `${libraryName}.js`,
                libraryTarget: "umd",
            },
        },
    },
    production: {
        config: {
            mode: "production",
            output: {
                filename: `${libraryName}.min.js`,
                libraryTarget: "umd",
            },
            performance: {
                hints: false,
            },
        },
        env: "production",
    },
});

function genConfig(opts, libraryName) {
    const config = merge({}, base(libraryName), opts.config);

    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(opts.env || "development"),
        }),
    ]);

    return config;
}

module.exports = (libraryName) => Object.values(builds(libraryName)).map((build) => genConfig(build, libraryName));
