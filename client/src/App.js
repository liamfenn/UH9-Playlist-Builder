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
  const createPlaylist = async () => {
    if (userId) { // Ensure userId is available
      try {
        const response = await spotifyApi.createPlaylist(userId, {
          name: "Indie Walk to Eiffel Tower"
        });
        console.log("Playlist created: ", response);
        return response.id; // Return the created playlist ID
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

    // Extract track URIs from the tracks array
    const trackURIs = tracks.map(track => track.track.uri);

    try {
      await spotifyApi.addTracksToPlaylist(playlistId, trackURIs);
      console.log("Tracks added to playlist successfully.");
    } catch (error) {
      console.error("Error adding tracks to playlist: ", error);
    }
  };

  const getTenMinutesOfFreshFinds = async () => {
    try {
      const searchResponse = await spotifyApi.searchPlaylists('Fresh Finds');
      const freshFindsPlaylist = searchResponse.playlists.items.find(playlist => playlist.name === 'Fresh Finds');
      if (!freshFindsPlaylist) {
        console.error("Fresh Finds playlist not found.");
        return [];
      }

      const tracksResponse = await spotifyApi.getPlaylistTracks(freshFindsPlaylist.id);
      let tracks = tracksResponse.items;

      // Shuffle the tracks array to randomize the order
      tracks = shuffleArray(tracks);

      let totalDuration = 0;
      const tenMinutesTracks = [];

      for (const track of tracks) {
        const trackDuration = track.track.duration_ms;
        if (totalDuration + trackDuration <= 600000) { // 600,000 ms = 10 minutes
          tenMinutesTracks.push(track);
          totalDuration += trackDuration;
        }
        if (totalDuration >= 600000) break; // Stop if we reach or exceed 10 minutes
      }

      return tenMinutesTracks;
    } catch (error) {
      console.error("Error fetching Fresh Finds tracks: ", error);
      return [];
    }
  };

  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  const handleCreatePlaylistWithTracks = async () => {
    const playlistId = await createPlaylist();
    if (playlistId) {
      const tracks = await getTenMinutesOfFreshFinds();
      if (tracks.length) {
        await addTracksToPlaylist(playlistId, tracks);
      } else {
        console.error("No tracks found for the playlist.");
      }
    } else {
      console.error("Failed to create playlist.");
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
        <button onClick={() => handleCreatePlaylistWithTracks()}>Create Playlist</button>
      )}
    </div>
  );
}
export default App;