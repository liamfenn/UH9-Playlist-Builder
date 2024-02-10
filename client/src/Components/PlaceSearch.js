import React, { useRef } from 'react';
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

const PlaceSearch = ({ placeholder, onPlaceSelected }) => {
    const inputRef = useRef();

    const handlePlaceChanged = () => {
        const places = inputRef.current.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            console.log(place.formatted_address);
            if (place.geometry && place.geometry.location) {
                console.log(place.geometry.location.lat());
                console.log(place.geometry.location.lng());
                if (onPlaceSelected) {
                    // Constructing a simplified place object with lat and lng
                    const simplifiedPlace = {
                        formatted_address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    onPlaceSelected(simplifiedPlace);
                }
            } else {
                console.error('Place has no geometry');
            }
        }
    };

    return (
        <LoadScript
            googleMapsApiKey="AIzaSyDjjvLOrFCOwfgKrgjez94C-Xr9PGl5P4A"
            libraries={["places"]}
        >
            <StandaloneSearchBox
                onLoad={ref => (inputRef.current = ref)}
                onPlacesChanged={handlePlaceChanged}
            >
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                />
            </StandaloneSearchBox>
        </LoadScript>
    );
};

export default PlaceSearch;