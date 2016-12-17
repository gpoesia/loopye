/*
 * Minifies the bundle.js file produced during build.
 */

var Packer = require("node.packer");

console.log("Minifying bundle.js...");

Packer({
  log : true,
  input : ["bundle.js"],
  output : "bundle-min.js",
  minify: true,
  callback: function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Done!");
    }
  }
});

