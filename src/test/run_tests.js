/*
 * Simple automated testing framework.
 */

var Process = require("process");

var argument = Process.argv[2];

console.log("Testing " + argument + "...");

var module = require(argument);

if (!module.tests) {
  console.log("Error: no tests found in module.");
} else {
  try {
    for (var i = 0; i < module.tests.length; i++) {
      module.tests[i]();
    }
    console.log("    PASSED");
  } catch (e) {
    console.error("    FAILED: " + e);
    console.error(e.stack);
  }
}
