import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
// Imports installed spotify api tool
import SpotifyWebApi from 'spotify-web-api-js';
import PlaceSearch from './Components/PlaceSearch';

// Initializes spotify's API tool without having to use endpoints
const spotifyApi = new SpotifyWebApi();

// String parsing to allow extracting of token from URL
const getTokenFromURL = () => {
  return window.location.hash.substring(1).split('&').reduce((initial, item) => {
    let parts = item.split("=")
    initial[parts[0]] = decodeURIComponent(parts[1])
    return initial
  }, {});
};

function calculateTravelTime(origin, destination, travelMode) {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Maps JavaScript API not loaded'));
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
      origins: [{ lat: origin.lat, lng: origin.lng }],
      destinations: [{ lat: destination.lat, lng: destination.lng }],
      travelMode: travelMode,
    }, (response, status) => {
      if (status !== 'OK') {
        reject(new Error('Error with Distance Matrix service: ' + status));
      } else {
        const element = response.rows[0].elements[0];
        if (element.status === 'OK') {
          resolve((element.duration.value) * 1000); // Duration in milliseconds
        } else {
          reject(new Error('Error with Distance Matrix service: ' + element.status));
        }
      }
    });
  });
}

function App() {
  const [ spotifyToken, setSpotifyToken ] = useState("");
  const [ loggedIn, setLoggedIn ] = useState(false);
  const [ userId, setUserId ] = useState(null);
  const [ origin, setOrigin ] = useState(null);
  const [ destination, setDestination ] = useState(null);
  const [ travelMode, setTravelMode ] = useState('DRIVING');
  const [ travelTimeMs, setTravelTimeMs ] = useState(null);

  useEffect(() => {

    const fetchUserData = async () => {
      console.log("URL Derivation: ", getTokenFromURL());
      const spotifyToken = getTokenFromURL().access_token;
      window.location.hash = "";
      console.log("Spotify Token", spotifyToken);

      if (spotifyToken) {
        setSpotifyToken(spotifyToken);
        spotifyApi.setAccessToken(spotifyToken);
        try {
          const user = await spotifyApi.getMe();
          console.log(user);
          setLoggedIn(true);
          setUserId(user.id);
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (origin && destination) {
      calculateTravelTime(origin, destination, travelMode)
        .then(travelTimeMs => {
          console.log(`Travel time is ${travelTimeMs} milliseconds`);
          setTravelTimeMs(travelTimeMs); // Store the calculated travel time in state
        })
        .catch(error => console.error(error));
    }
  }, [origin, destination, travelMode]);

  const createPlaylist = async () => {
    if (userId) {
      try {
        // Ensure destination.name is used
        const playlistName = `${travelMode.charAt(0).toUpperCase() + travelMode.slice(1).toLowerCase()} to ${destination.name}`;

        const response = await spotifyApi.createPlaylist(userId, {
          name: playlistName
        });
        console.log("Playlist created: ", response);
        return response.id;
      } catch (error) {
        console.error("Error creating playlist: ", error);
        return null;
      }
    } else {
      console.error("User ID is not available.");
      return null;
    }
  };

  const addTracksToPlaylist = async (playlistId, tracks) => {
    if (!playlistId || !tracks.length) {
      console.error("Playlist ID or tracks array is missing.");
      return;
    }

    const trackURIs = tracks.map(track => track.track.uri);

    try {
      await spotifyApi.addTracksToPlaylist(playlistId, trackURIs);
      console.log("Tracks added to playlist successfully.");
    } catch (error) {
      console.error("Error adding tracks to playlist: ", error);
    }
  };

  const getFreshTracks = async (travelTimeMs) => {
    try {
      const searchResponse = await spotifyApi.searchPlaylists('Fresh Finds');
      console.log('Search Response:', searchResponse); // Log to debug
      const freshFindsPlaylist = searchResponse.playlists.items[0]; // Use the first playlist
      if (!freshFindsPlaylist) {
        console.error("Fresh Finds playlist not found.");
        return [];
      }

      const tracksResponse = await spotifyApi.getPlaylistTracks(freshFindsPlaylist.id);
      let tracks = tracksResponse.items;

      tracks = shuffleArray(tracks);

      let totalDuration = 0;
      const freshTracks = [];

      for (const track of tracks) {
        const trackDuration = track.track.duration_ms;
        if (totalDuration + trackDuration <= travelTimeMs) {
          freshTracks.push(track);
          totalDuration += trackDuration;
        }
        if (totalDuration >= travelTimeMs) break;
      }

      return freshTracks;
    } catch (error) {
      console.error("Error fetching Fresh Finds tracks: ", error);
      return [];
    }
  };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleCreatePlaylistWithTracks = async () => {
    const playlistId = await createPlaylist();
    if (playlistId && travelTimeMs) { // Ensure travelTimeMs is available
      const tracks = await getFreshTracks(travelTimeMs);
      if (tracks.length) {
        await addTracksToPlaylist(playlistId, tracks);
      } else {
        console.error("No tracks found for the playlist.");
      }
    } else {
      console.error("Failed to create playlist or travel time is not calculated.");
    }
  };

  return (
    <div className="App">
      {!loggedIn && <a href='http://localhost:8888'>Login to Spotify</a>}
      {loggedIn && (
        <>
          <PlaceSearch placeholder="Enter Origin" onPlaceSelected={(place) => setOrigin(place)} />
          <PlaceSearch placeholder="Enter Destination" onPlaceSelected={(place) => {
            // Assuming place has a name property and geometry for lat/lng
            console.log(place);
            setDestination({ name: place.formatted_address.split(',')[0], lat: place.lat, lng: place.lng });
          }} />
          <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Cycling</option>
          </select>
          <button onClick={() => handleCreatePlaylistWithTracks()}>Create Playlist</button>
        </>
      )}
    </div>
  );
}
export default App;