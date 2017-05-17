/*
 * Simple automated testing framework.
 */

var Process = require("process");

var TEST_MODULES = [
  "./language/robolang/test/test_robolang",
  "./language/robolang/test/test_analysis",
];

var modules = 0, passes = 0, failures = 0;

function test(moduleFile) {
  console.log("Testing " + moduleFile + "...");

  var module = require(moduleFile);

  if (!module.tests) {
    console.log("No tests found in this module.");
    return;
  }

  modules += 1;
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
}

var argument = Process.argv[2];

if (argument) {
  test(argument);
} else {
  for (var i = 0; i < TEST_MODULES.length; i++) {
    test(TEST_MODULES[i]);
  }
}

console.log(modules + " test module(s), " +
            passes + " passes, " + failures + " failures.");

if (!failures) {
  console.log("\033[30;42mOK\033[0m");
} else {
  console.log("\033[30;41mFAIL\033[0m");
}
