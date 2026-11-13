(function (root) {
  // Both identifiers are from the Google Maps embed supplied by the owner.
  const place = Object.freeze({
    featureId: '0x132d8693e39ead87:0xdc460c99171bc8ef',
    cid: '15872387788371118319',
    // Verified 2026-11-12 from the !3d/!4d POI in the owner's Maps short-link redirect.
    // The coordinates after @ in the same URL are only the map's viewport centre.
    coordinates: Object.freeze({ latitude: 43.5008624, longitude: 13.4686844 }),
    coordinatesSource: 'https://maps.app.goo.gl/6PyLqpXUET7VkAeW9',
    placeUrl: 'https://www.google.com/maps?cid=15872387788371118319',
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4768.257614807089!2d13.4708169969484!3d43.49717333835238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x132d8693e39ead87%3A0xdc460c99171bc8ef!2sAgriturismo%20Giuggioloni%20-%20I%20Sapori%20dell'Acquaviva!5e0!3m2!1sit!2sit!4v1794049519253!5m2!1sit!2sit"
  });
  if (typeof module === 'object' && module.exports) module.exports = place;
  else root.GiuggioloniMap = place;
})(globalThis);
