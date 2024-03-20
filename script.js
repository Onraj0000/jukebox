// Code voor de play/pause knoppen

var playing = false;
var spotiData;
// var getUrlParam;
var player;

function playPauseSong() {
  const playPauseIcon = document.getElementById('play-pause-icon');
  if(!playing){
    //currentSong.play();
    playPauseIcon.className = "ph-bold ph-pause";
    playing = true;
  }
  else {
    //currentSong.pause();
    playPauseIcon.className = "ph-bold ph-play";
    playing = false;
  }
}

function getUrlParam(name) {
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
  return (results && results[1]) || undefined;
}

const playlistId = '46E77mCrgApL4aHy9KInz6';


// Informatie voor het inloggen 1ste x;

//Deze functie haalt de authCode op van Spotify. De clientId is nu hardcoded, maar deze zou je als functieparam mee kunnen geven
function getCode(){
  //De client_id (Komt van jullie spotify app)
  var client_id = '2478dab086c8462db99324a4a78332f4';
  var client_secret = '8698451b2c514193b62180cde63b57e3';
  // link waar je naar teruggestuurt wordt
  var redirect_uri = 'https://server.hondsrugcollege.com/spotify'; 

  //Een state is niet belangrijk, maar kan je gebruiken tegen spoofen. Mag van alles zijn
  var state = "qhtnfksjeutnslot";
  //De rechten die jij van de gebruiker wilt hebben
  var scope = 'streaming user-read-email user-read-private user-modify-playback-state';
  //De string met de url waar we naartoe gaan. We plakken de variabelen in de string
  var redirString = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${state}`
  //Het daadwerkelijk gaan naar spotify met de url
  window.location.replace(redirString);

}

 var authCode = getUrlParam('code'); // oude code weer terugzetten, dit was de werkende code
// var authCode = new URLSearchParams(window.location.search).get('code');
if (authCode > "") {
    // do something with the id
    getToken();
    // deze functie haalt token uit de url en vraagt acces token aan
    
} else {
    // there is no id value
    console.log("no code");
}



function getToken() {
  //AuthCode ophalen uit de url in de browser (Alternatief is om de authCode mee te geven als functieparam)
// var authCode = new URLSearchParams(window.location.search).get('code');

  //Hier bouwen we de formbody op voor het verzoek. Eerst in JSON, later converten we het naar het juiste formaat
  var details = {
      'grant_type': 'authorization_code',
      'code': authCode,
      'redirect_uri': 'https://server.hondsrugcollege.com/spotify'
  };

  //Hier wordt de echte formbody gemaakt. We gaan alle 3 de details bij langs en converteren deze naar x-www-form-urlencoded
  var formBody = [];
  for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
  }
  formBody = formBody.join("&");


  //Hier bouwen wee een POST request op naar de spotify API met als body de variabele "formbody" en de juiste headers
  //In de header staat een functie btoa, welke een string omzet naar BASE64. De string hierin is de client_id:client_secret
  fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: formBody,
      headers: {
          'Authorization': 'Basic ' + btoa("2478dab086c8462db99324a4a78332f4:8698451b2c514193b62180cde63b57e3"),
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true
  })
      .then(response => response.json())
      .then(data => {
          //Als de data terug is, show het in de console
          console.log(data);
          spotiData = data;
          runSpotify();
      });
}

// access token gebruiken om de spotify functie te gebruiken
function runSpotify(){
   
   
    player = new Spotify.Player({
        name: 'Jukebox',
        getOAuthToken: cb => { cb(spotiData.access_token); },
        volume: 0.5
    });

    
    player.getCurrentState().then(state => {
      if (!state) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
      }
   
      var current_track = state.track_window.current_track.name;
      var next_track = state.track_window.next_tracks[0];
      
   
      console.log('Currently Playing', current_track);
      console.log('Playing Next', next_track);
    });
    
  

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error('initialization_error: ' + message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error('authentication_error: ' + message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error('account_error: ' + message);
    });

    document.getElementById('playPause').onclick = function() {
      player.togglePlay();
      playPauseSong();
    };

    document.getElementById('playPrevious').onclick = function() {
      player.previousTrack().then(() => {
        console.log('Skipped to previous track!');
      });
    };

    document.getElementById('playNext').onclick = function() {
      player.nextTrack().then(() => {
        console.log('Skipped to next track!');
      });
    };

    player.addListener('player_state_changed', ({
      duration,
      paused,
      track_window: { current_track }
    }) => {
      console.log('Paused', paused);
      console.log('Currently Playing', current_track);
      console.log('Duration of Song', duration);
      document.getElementById('song-name').innerHTML = current_track.name;

      playing = paused;
      playPauseSong();
    });
    
    // player.addListener('player_state_change', ({
    //   track_window: {current_track}

    // }) =>  {
    //   console.log('Currently PLaying' , current_track);
    //
    // });

    player.connect();

    

    
}






// Token ontvangen



// async function getProfile(accessToken) {

//   const response = await fetch('https://api.spotify.com/v1/me', {
//     headers: {
//       Authorization: 'Bearer ' + accessToken
//     }
//   });

//   const data = await response.json();
// }

// Het halen van de code uit de url;

// var urlParams = new URLSearchParams(window.location.search);
// var code = urlParams.get('code');
//  if(code){
//    console.log(code);

//    document.getElementById("code").innerHTML = code;
//  }