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
  var passes = 0, failures = 0;
  for (var i = 0; i < module.tests.length; i++) {
    try {
      module.tests[i]();
      console.log("\033[1;32mPASS\033[0m: " + module.tests[i].name);
      passes += 1;
    } catch (e) {
      console.error("\033[1;31mFAIL\033[0m: " + module.tests[i].name + ": " + e);
      console.error(e.stack);
      failures += 1;
    }
  }
  console.log(passes + " passes, " + failures + " failures.");
  if (!failures) {
    console.log("\033[30;42mOK\033[0m");
  } else {
    console.log("\033[30;41mFAIL\033[0m");
  }
}
