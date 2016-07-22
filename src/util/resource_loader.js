/*
 * Module that loads a list of resources to the browser cache and then calls
 * back.
 */

function ResourceLoader() {
  this._images = [];
}

ResourceLoader.prototype = {
  addImage: function(url) {
    this._images.push(url);
  },
  load: function(onLoad) {
    var loaded_images = new Array();
    loaded_images.length = this._images.length;
    loaded_images.fill(false);

    var done = function() {
      return loaded_images.indexOf(false) == -1;
    };

    function createCallback(loaded_images, index, done, onLoad) {
      return function() {
        loaded_images[index] = true;
        if (done()) {
          onLoad();
        }
      };
    }

    for (var i = 0; i < this._images.length; i++) {
      var image = new Image();
      var index = new Number(i);
      var url = this._images[i];

      image.onload = createCallback(loaded_images, new Number(i), done, onLoad);

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
};

module.exports = ResourceLoader;
