const { defineConfig } = require("@vue/cli-service");
const Path = require("path");
module.exports = defineConfig({
  transpileDependencies: true,
  outputDir: Path.resolve(__dirname, "../server/public"),
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
      },
    },
  },
});
