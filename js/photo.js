'use strict';

(function () {
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  var addPhoto = function (input, onLoad) {
    var file = input.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        onLoad(reader.result);
      });

      reader.readAsDataURL(file);
    }
  };

  window.photo = {
    add: addPhoto
  };
})();
