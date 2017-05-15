

module.exports = {

  version: {
    major: 2,
    minor: 1,
    patch: 0
  },

  exit: function(code) {
    // console.log('phantom exit', code);
    process.exit(code);
  }
};
