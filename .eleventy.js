module.exports = function(config) {
  config.addFilter('sortByDate', values => {
    return values.slice().sort((a, b) => a.dateFormat.localeCompare(b.dateFormat))
  })
  config.addPassthroughCopy("public/images");

  return {
    dir: {
      input: "public",
      output: "dist",
    }
  }
};
