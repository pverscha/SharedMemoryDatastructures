const path = require('path');

module.exports = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        library: "SharedMemoryDatastructures",
        libraryTarget: "umd",
        globalObject: "this"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    devtool: "source-map",
    target: "web"
}
