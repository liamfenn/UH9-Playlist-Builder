import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
// Imports installed spotify api tool
import SpotifyWebApi from 'spotify-web-api-js';

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

function App() {
  const [ spotifyToken, setSpotifyToken ] = useState("");
  const [ loggedIn, setLoggedIn ] = useState(false);
  const [ userId, setUserId ] = useState(null);

  // Gains to user's account through spotify's access token
  useEffect(() => {
    const fetchUserData = async () => {
      console.log("URL Derivation: ", getTokenFromURL());
      const spotifyToken = getTokenFromURL().access_token; // Extracts access token from URL
      window.location.hash = ""; // Hides access token from URL for security
      console.log("Spotify Token", spotifyToken);

      if (spotifyToken) {
        setSpotifyToken(spotifyToken);
        spotifyApi.setAccessToken(spotifyToken);
        try {
          const user = await spotifyApi.getMe(); // Fetchs user data
          console.log(user);
          setLoggedIn(true);
          setUserId(user.id); // Sets userId state dynamically
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };
    fetchUserData();
  }, []);

  // Creates empty new playlist for the logged in user
  const createPlaylist = () => {
    if (userId) { // Ensure userId is available
      spotifyApi.createPlaylist(userId, {
        name: "Indie Walk to Eiffel Tower"
      }).then((response) => {
        console.log("Playlist created: ", response);
      }).catch((error) => {
        console.error("Error creating playlist: ", error);
      });
    } else {
      console.error("User ID is not available.");
    }
  };

  return (
    <div className="App">
      {!loggedIn && <a href='http://localhost:8888'>Login to Spotify</a>}
      {loggedIn && (
        <>
        </>
      )}
      {loggedIn && (
        <button onClick={() => createPlaylist()}>Create Playlist</button>
      )}
    </div>
  );
}
export default App;