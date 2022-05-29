function getLatLngByZipcode(zipcode){
    const coordinates = {Latitude: 22.973423, Longitude: 78.656894};	// Fallback coordinates in case of failure
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': 'zipcode ' + zipcode }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            coordinates.Latitude = results[0].geometry.location.lat();
            coordinates.Longitude = results[0].geometry.location.lng();
        } else {
            console.log("google.maps.Geocoder request failure.")
        }
    });
    return coordinates;
}
