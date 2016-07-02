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

    var done = function() { return loaded_images.indexOf(false) == -1; };

    for (var i = 0; i < this._images.length; i++) {
      loaded_images[i] = false;

      var image = new Image();
      var index = i;
      var url = this._images[i];

      image.onload = function() {
        loaded_images[index] = true;
        if (done()) {
          onLoad();
        }
      };

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
