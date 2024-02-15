var audioFiles = [
  "Denon-PMA2500NE.mp3",
  "NAD-C388.mp3",
  "NAIM-NAIT-XS3.mp3",
  "Yamaha-A-S1200.mp3",
  "Primare-i25.mp3",
];
var sources = [];
var gainNodes = [];
var currentTrackIndex = -1;
var intervalId; // Variable to store the interval ID
var loadingInProgress = false; // Flag to track loading state
var loadedCount = 0; // Variable to track the number of loaded audio files

function loadTracks() {
  if (loadingInProgress) {
    return; // Return if loading is already in progress
  }

  stopAudio(); // Stop the audio if it is already playing

  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var buffers = [];

  function loadAudio(url, index) {
    loadingInProgress = true; // Set loading state to true

    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function () {
      audioContext.decodeAudioData(request.response, function (buffer) {
        buffers[index] = buffer;
        loadedCount++;

        // Calculate the progress percentage
        var progress = Math.floor((loadedCount / audioFiles.length) * 100);
        updateLoadingProgress(progress);

        if (loadedCount === audioFiles.length) {
          loadingInProgress = false; // Reset loading state
          playTracks();
        }
      });
    };

    request.send();
  }

  function playTracks() {
    for (var i = 0; i < buffers.length; i++) {
      var source = audioContext.createBufferSource();
      source.buffer = buffers[i];
      var gainNode = audioContext.createGain();
      gainNode.gain.value = 0; // Set the initial gain value to 0 (muted)
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      sources.push(source);
      gainNodes.push(gainNode);
      source.onended = function () {
        stopAudio();
      };
    }

    sources.forEach(function (source) {
      source.start();
    });

    // start playing immediately
    currentTrackIndex = getRandomTrackIndex(
      Math.floor(Math.random() * audioFiles.length)
    );
    updateTrackMuteState(-1, currentTrackIndex);
    updateTrackName(currentTrackIndex); // Update the track name

    intervalId = setInterval(function () {
      var previousTrackIndex = currentTrackIndex;
      currentTrackIndex = getRandomTrackIndex(previousTrackIndex);
      updateTrackMuteState(previousTrackIndex, currentTrackIndex);
      updateTrackName(currentTrackIndex); // Update the track name
    }, 3000);
  }

  function getRandomTrackIndex(previousIndex) {
    var index;
    do {
      index = Math.floor(Math.random() * audioFiles.length);
    } while (index === previousIndex);
    return index;
  }

  function updateTrackMuteState(previousIndex, currentIndex) {
    if (previousIndex !== -1) {
      gainNodes[previousIndex].gain.value = 0; // Mute previous track
    }
    gainNodes[currentIndex].gain.value = 1; // Unmute current track
  }

  function updateTrackName(currentIndex) {
    var trackNameElement = document.getElementById("trackName");
    trackNameElement.textContent = audioFiles[currentIndex].replace(".mp3", ""); // Set the track name
  }

  audioFiles.forEach(function (file, index) {
    loadAudio(
      "mp3/" + document.getElementById("track").value + "/" + file,
      index
    );
  });
}

function updateLoadingProgress(progress) {
  let progressBar = document.getElementById("progressBar");
  progressBar.style.opacity = 1; // Show the progress bar
  progressBar.style.width = progress + "%"; // Update the progress bar width
  progressBar.textContent = progress + "%"; // Update the progress bar text

  if (progress === 100) {
    setTimeout(function () {
      progressBar.style.opacity = 0; // Fade out the progress bar
      progressBar.style.transition = "opacity 1s"; // Apply CSS transition
    }, 500);
  }
}

function stopAudio() {
  sources.forEach(function (source) {
    source.stop();
  });
  sources = [];
  gainNodes = [];
  currentTrackIndex = -1;
  document.getElementById("trackName").textContent = ""; // Clear the track name
  clearInterval(intervalId); // Clear the interval
  loadingInProgress = false; // Reset loading state
  loadedCount = 0; // Reset loaded count
  updateLoadingProgress(0); // Reset the progress bar
}

function resetAudio() {
  stopAudio();
  loadTracks();
}

function toggleTrackName() {
  var title = document.getElementById("trackName");
  if (title.style.display === "none") {
    title.style.display = "block";
  } else {
    title.style.display = "none";
  }
}
