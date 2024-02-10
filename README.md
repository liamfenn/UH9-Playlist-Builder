# Spotify Smart Playlist Builder

Created solo by Liam Fennell

## Introduction

I always find it difficult to find new music to listen to. Even with Spotify's machine learning that recommends me music and builds playlists,
I find everytime it's all recycled music that I have already heard. This has always been frustrating for me, as someone who loves discovering new artists,
it is always enjoyable to listen to music I haven't heard and be able to add the songs I like to new playlists. I also like to support smaller artists and sometimes, finding their music on Spotify, or streaming services in general is far harder than it needs to be.

In order to solve this issue, I created a solution utilizing Spotify's Web API in combination with Google Maps' Places and Distance Matrix APIs. The idea was to create  web application where a user can authorize usage of their Spotify account, enter an origin location, destination address, method of transportation, and genre. The application takes all of this information and creates a new playlist within the user's spotify account with songs from Spotify's Fresh Finds playlist. Spotify's Fresh Finds playlists are collections of new songs by independent or smaller label artists. These playlists are a great place to find talented upcoming artists that you would never have before.

With the use of Spotify's Web API, songs are pulled from the selected genre of Fresh Finds playlist and added to the new playlist in the user's account. The total duration of the playlist will be within ~30 seconds of the travel time calculated from the entered origin address to the destination address. Google Maps' Distance Matrix API calculates this with the method of transportation chosen and ensures a playlist of that exact duration is created.

## Tools

For this project I used React for the frontend and node.js and express for the backend which handled all of the Spotify OAuth2.0 authentication & authorization. For planning, I used FigJam by Figma. I found planning to be helpful, but significantly less important when working solo.

## Problems

The biggest problem I faced was probably the first step, creating and setting up the server for Spotify's OAuth2.0 Authorization. I have never worked with OAuth2.0 before and am overall not too experienced with authentication and authorization in any form. This was a big challenge for me and was very daunting at first, but I knew it was something that I had to overcome in order to complete my program. After hours of trying to get it to work. A youtube video where someone pointed me to the github repo of examples and templates, I was finally able to make progress. Of course, the more I tweaked the frontend, the more problems I ran into with scope and access that I then had to go fix on the backend. This was a big leap for me, going from virtually no experience with authorization to an advanced setup with OAuth2.0 and it was very satisfying to complete.

## APIs & Open-Source

I used 3 API's for this project, listed below:  
Spotify Web API: https://developer.spotify.com/documentation/web-api  
Google Maps' Places API: https://developers.google.com/maps/documentation/places/web-service   
Google Maps' Distance Matrix API: https://developers.google.com/maps/documentation/distance-matrix  

I also made use of an open-source repo of Spotify OAuth2.0 Authorization examples. This was released by developers at Spotify in order to make the uathenication process easier for users using their Web API. This was a template and I was able to change css along with endpoints nessecary to get my server running and redirecting as nessecary. This repo is linked below:  
Spotify Web API Authorization Examples: https://github.com/spotify/web-api-examples/tree/master
