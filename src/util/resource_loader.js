/*
 * Module that loads a list of resources (e.g. images) to a local store and
 * then calls back after all of them have finished loading.
 */

function ResourceLoader() {
  this._images = [];
  this._loaded_resources = {};
}

ResourceLoader.prototype = {
  /// Adds a resource to be loaded.
  addImage: function(url) {
    if (!this._loaded_resources.hasOwnProperty(url)) {
      this._images.push(url);
    }
  },
  /// Loads the registered resources that have not been loaded yet
  /// and calls onLoad when all of them have finished loading.
  load: function(onLoad) {
    var loaded_images = new Array();
    loaded_images.length = this._images.length;
    loaded_images.fill(false);

    var done = function() {
      return loaded_images.indexOf(false) == -1;
    };

    var loaded_resources = this._loaded_resources;
    function createCallback(loaded_images, index, done, url, image, onLoad) {
      return function() {
        loaded_resources[url] = image;
        loaded_images[index] = true;
        if (done()) {
          onLoad();
        }
      };
    }

    for (var i = 0; i < this._images.length; i++) {
      var index = new Number(i);
      var url = this._images[i];

      // Avoids loading resources which have been previously loaded.
      // This allows incremental uses of the ResourceLoaded.
      if (this._loaded_resources.hasOwnProperty(url)) {
        loaded_images[index] = true;
        continue;
      }

      var image = new Image();
      image.onload = createCallback(loaded_images, new Number(i), done,
                                    url, image, onLoad);

      image.onerror = function(error) {
        console.error("Error when loading " + url + ": " + error);
      }

      image.src = url;
    }

    // If all images were already in the browser's cache, img.onload may never
    // be called. Otherwise, it (or onerror) will be called at least once.
    if (done()) {
      onLoad();
    }
  },

  /// Returns the resource loaded from the given URL.
  /// If the url was not loaded, either returns null (if ignore_error is true)
  /// or throws an exception.
  get: function(url, ignore_error) {
    if (!this._loaded_resources.hasOwnProperty(url)) {
      if (ignore_error) {
        return null;
      } else {
        throw "Resource not loaded: " + url;
      }
    }
    return this._loaded_resources[url];
  },
};

module.exports = new ResourceLoader();
