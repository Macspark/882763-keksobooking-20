'use strict';

(function () {
  var UPLOAD_PATH = 'keksobooking';
  var PriceList = {
    BUNGALO: 0,
    FLAT: 1000,
    HOUSE: 5000,
    PALACE: 25000
  };
  var PRICE_PLACEHOLDER_MULTIPLIER = 5;

  var MAX_ROOMS = '100';

  var adForm = document.querySelector('.ad-form');
  var adFormFieldsets = adForm.querySelectorAll('fieldset');

  var adTitle = adForm.querySelector('#title');
  var adPrice = adForm.querySelector('#price');
  var adType = adForm.querySelector('#type');
  var adTimein = adForm.querySelector('#timein');
  var adTimeout = adForm.querySelector('#timeout');
  var adRooms = adForm.querySelector('#room_number');
  var adGuests = adForm.querySelector('#capacity');
  var adAddress = adForm.querySelector('#address');
  var adDescription = adForm.querySelector('#description');
  var adFeatures = adForm.querySelectorAll('.feature__checkbox');
  var adReset = adForm.querySelector('.ad-form__reset');

  var adAvatarInput = adForm.querySelector('#avatar');
  var adAvatarImg = adForm.querySelector('.ad-form-header__preview img');
  var adDefaultAvatar = adAvatarImg.src;

  var adPhotosInput = adForm.querySelector('#images');
  var adPhotosContainer = adForm.querySelector('.ad-form__photo-container');
  var isFirstPhotoUploaded = false;

  var adTypeDefault = adType.value;
  var adTimeinDefault = adTimein.value;
  var adTimeoutDefault = adTimeout.value;
  var adRoomsDefault = adRooms.value;
  var adGuestsDefault = adGuests.value;

  var setAddress = function () {
    var coordinates = window.map.getMainPinCoordinates();
    adAddress.value = coordinates.x + ', ' + coordinates.y;
  };

  var compareRoomsAndGuests = function () {
    switch (true) {
      case (adRooms.value === MAX_ROOMS && adGuests.value !== '0'):
        adGuests.setCustomValidity('Указанное количество комнат не для гостей');
        break;
      case (adRooms.value < adGuests.value):
        adGuests.setCustomValidity('Для текущего количества комнат гостей может быть не больше ' + adRooms.value);
        break;
      case (adRooms.value !== MAX_ROOMS && adGuests.value === '0'):
        adGuests.setCustomValidity('Текущее количество комнат подразумевает минимум 1 гостя');
        break;
      default:
        adGuests.setCustomValidity('');
        break;
    }
  };

  var lockForm = function () {
    adForm.classList.add('ad-form--disabled');
    window.util.disableElements(adFormFieldsets);
    setAddress();
    compareTypeAndPrice();
    compareRoomsAndGuests();
  };

  var unlockForm = function () {
    adForm.classList.remove('ad-form--disabled');
    window.util.enableElements(adFormFieldsets);
    setAddress();
  };

  var compareTypeAndPrice = function () {
    var price;
    switch (adType.value) {
      case 'bungalo':
        price = PriceList.BUNGALO;
        break;
      case 'flat':
        price = PriceList.FLAT;
        break;
      case 'house':
        price = PriceList.HOUSE;
        break;
      case 'palace':
        price = PriceList.PALACE;
        break;
      default:
        price = PriceList.FLAT;
        break;
    }
    adPrice.min = price;
    adPrice.placeholder = price * PRICE_PLACEHOLDER_MULTIPLIER;
  };

  var resetPhotos = function () {
    if (isFirstPhotoUploaded) {
      var photos = document.querySelectorAll('.ad-form__photo');
      photos.forEach(function (elem) {
        adPhotosContainer.removeChild(elem);
      });
      var emptyFrame = document.createElement('div');
      emptyFrame.classList.add('ad-form__photo');
      adPhotosContainer.appendChild(emptyFrame);
      isFirstPhotoUploaded = false;
    }
  };

  var resetForm = function () {
    adTitle.value = adTitle.defaultValue;
    adPrice.value = adPrice.defaultValue;
    adType.value = adTypeDefault;
    adTimein.value = adTimeinDefault;
    adTimeout.value = adTimeoutDefault;
    adRooms.value = adRoomsDefault;
    adGuests.value = adGuestsDefault;
    adDescription.value = adDescription.defaultValue;
    adFeatures.forEach(function (elem) {
      elem.checked = false;
    });
    adAvatarImg.src = adDefaultAvatar;
    resetPhotos();
    lockForm();
  };

  adType.addEventListener('change', function () {
    compareTypeAndPrice();
  });

  adTimein.addEventListener('change', function () {
    adTimeout.value = adTimein.value;
  });

  adTimeout.addEventListener('change', function () {
    adTimein.value = adTimeout.value;
  });

  adRooms.addEventListener('change', function () {
    compareRoomsAndGuests();
  });

  adGuests.addEventListener('change', function () {
    compareRoomsAndGuests();
  });

  adAvatarInput.addEventListener('change', function () {
    var onLoad = function (result) {
      adAvatarImg.src = result;
    };
    window.photo.add(adAvatarInput, onLoad);
  });

  adPhotosInput.addEventListener('change', function () {
    var onLoad = function (result) {

      if (!isFirstPhotoUploaded) {
        var emptyFrame = document.querySelector('.ad-form__photo');
        adPhotosContainer.removeChild(emptyFrame);
        isFirstPhotoUploaded = true;
      }

      var wrapper = document.createElement('div');
      var img = document.createElement('img');

      wrapper.classList.add('ad-form__photo');
      adPhotosContainer.appendChild(wrapper);

      img.style.width = wrapper.offsetWidth + 'px';
      img.style.height = wrapper.offsetHeight + 'px';
      img.style.borderRadius = 'inherit';
      img.src = result;

      wrapper.appendChild(img);
    };
    window.photo.add(adPhotosInput, onLoad);
  });

  adReset.addEventListener('click', function (evt) {
    evt.preventDefault();
    window.page.reset();
  });

  adForm.addEventListener('submit', function (evt) {
    evt.preventDefault();

    var onSuccess = function () {
      window.page.reset();
      window.popup.success();
    };

    var onError = function (errorMsg) {
      window.popup.error(errorMsg);
    };

    window.xhr({
      method: 'POST',
      path: UPLOAD_PATH,
      data: new FormData(adForm)
    }, onSuccess, onError);

  });

  adAddress.setAttribute('readonly', true);
  lockForm();

  window.form = {
    unlock: unlockForm,
    reset: resetForm,
    setAddress: setAddress,
    compareRooms: compareRoomsAndGuests,
  };
})();
