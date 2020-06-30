'use strict';

(function () {
  var MAX_OFFERS = 5;

  var offersList = [];
  var pinsContainer;

  var filterContainer = document.querySelector('.map__filters');
  var filterSelects = document.querySelectorAll('.map__filters select');
  var filterInputs = document.querySelectorAll('.map__filters input');

  var filterType = document.querySelector('#housing-type');
  var filterPrice = document.querySelector('#housing-price');
  var filterRooms = document.querySelector('#housing-rooms');
  var filterGuests = document.querySelector('#housing-guests');
  var filterFeatures = document.querySelector('#housing-features');

  var getPriceNameRange = function (price) {
    switch (true) {
      case (price < 10000):
        return 'low';
      case (price >= 10000 && price < 50000):
        return 'middle';
      case (price >= 50000):
        return 'high';
      default:
        return 'any';
    }
  };

  var isOfferStringCorrect = function (offerProperty, filterOption) {
    return (filterOption === 'any' || offerProperty === filterOption);
  };

  var isOfferIntCorrect = function (offerProperty, filterOption) {
    return (filterOption === 'any' || offerProperty === parseInt(filterOption, 10));
  };

  var areOfferFeaturesCorrect = function (offerFeatures, checkedFeatures) {
    if (checkedFeatures.length > 0) {
      for (var i = 0; i < checkedFeatures.length; i++) {
        if (offerFeatures.indexOf(checkedFeatures[i].value) === -1) {
          return false;
        }
      }
    }
    return true;
  };

  var filterOffers = function (offers, options) {
    var filteredOffers = [];
    for (var i = 0; i < offers.length; i++) {
      if (isOfferStringCorrect(offers[i].offer.type, options.type) &&
          isOfferStringCorrect(getPriceNameRange(offers[i].offer.price), options.price) &&
          isOfferIntCorrect(offers[i].offer.rooms, options.rooms) &&
          isOfferIntCorrect(offers[i].offer.guests, options.guests) &&
          areOfferFeaturesCorrect(offers[i].offer.features, options.features)) {
        filteredOffers.push(offers[i]);
      }
      if (filteredOffers.length >= MAX_OFFERS) {
        break;
      }
    }
    return filteredOffers;
  };

  var updateFilter = window.debounce(function () {
    var filterOptions = {
      type: filterType.value,
      price: filterPrice.value,
      rooms: filterRooms.value,
      guests: filterGuests.value,
      features: filterFeatures.querySelectorAll('input:checked')
    };

    var filteredOffers = filterOffers(offersList, filterOptions);

    window.map.removeCard();
    window.map.removePins();
    window.pins.create(filteredOffers, pinsContainer);
  });

  var resetFilter = function () {
    filterType.selectedIndex = 0;
    filterPrice.selectedIndex = 0;
    filterRooms.selectedIndex = 0;
    filterGuests.selectedIndex = 0;
    filterFeatures.querySelectorAll('input:checked').forEach(function (elem) {
      elem.checked = false;
    });
  };

  var lockFilter = function () {
    filterContainer.classList.add('map__filters--disabled');
    window.util.disableElements(filterSelects);
    window.util.disableElements(filterInputs);
    filterType.removeEventListener('change', updateFilter);
    filterPrice.removeEventListener('change', updateFilter);
    filterRooms.removeEventListener('change', updateFilter);
    filterGuests.removeEventListener('change', updateFilter);
    filterFeatures.removeEventListener('change', updateFilter);
  };

  var unlockFilter = function () {
    filterContainer.classList.remove('map__filters--disabled');
    window.util.enableElements(filterSelects);
    window.util.enableElements(filterInputs);
    filterType.addEventListener('change', updateFilter);
    filterPrice.addEventListener('change', updateFilter);
    filterRooms.addEventListener('change', updateFilter);
    filterGuests.addEventListener('change', updateFilter);
    filterFeatures.addEventListener('change', updateFilter);
  };

  var initializeFilter = function (offers, container) {
    offersList = offers;
    pinsContainer = container;
    updateFilter();
  };

  window.filter = {
    init: initializeFilter,
    lock: lockFilter,
    unlock: unlockFilter,
    update: updateFilter,
    reset: resetFilter
  };
})();
