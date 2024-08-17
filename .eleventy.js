module.exports = function(config) {
  config.addPassthroughCopy("public/images");
  config.addPassthroughCopy("public/scripts");

  return {
    dir: {
      input: "public",
      output: "dist",
    }
  }
};
