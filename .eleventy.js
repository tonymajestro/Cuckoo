module.exports = function(config) {
  config.addPassthroughCopy("public/images");

  return {
    dir: {
      input: "public",
      output: "dist",
    }
  }
};
