/*
 * Wrapper module for the i18n backend we use.
 * Currently, this wrapper does nothing. However, it will be useful in the future
 * in order to locate strings that need translation.
 */

// Translation function. For now, just returns the original string.
function T(string) {
  return string;
}

module.exports = {
  T: T,
};
