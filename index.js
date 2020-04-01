const webpack = require("webpack");
const merge = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const path = require("path");

require("dotenv").config();

const baseConfig = {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    resolve: {
        extensions: ["*", ".js", ".json", ".ts"],
        symlinks: false,
    },
    plugins: [
        new FriendlyErrorsWebpackPlugin({
            clearConsole: true,
        }),
    ],
    performance: {
        hints: false,
    },
    output: {
        path: path.resolve("dist"),
        library: "[name]",
        libraryTarget: "umd",
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
};

const developmentConfig = {
    config: {
        devtool: "source-map",
        mode: "development",
        output: {
            filename: "[name].js",
        },
    },
};

const productionConfig = {
    config: {
        mode: "production",
        output: {
            filename: "[name].min.js",
        },
        performance: {
            hints: false,
        },
    },
    env: "production",
};

module.exports = (extraConfig) =>
    [productionConfig, developmentConfig].map((environmentConfig) => {
        const config = merge({}, baseConfig, environmentConfig.config, extraConfig);

        config.plugins = config.plugins.concat([
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify(environmentConfig.env || "development"),
            }),
        ]);

        return config;
    });
