// By Guilherme Ferreira de Souza
var audioContext, audioBuffer, audioSource, analyser;
const bufferSize = 1024;

const fileInput = document.getElementById('fileInput');
const loadButton = document.getElementById('loadButton');
const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const frequencyBar = document.getElementById('frequencyBar');
const frequencyDisplay = document.getElementById('frequencyDisplay');

// Function to decode audio from file
fileInput.addEventListener('change', handleFileSelect);
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const fileReader = new FileReader();
    document.getElementById('fileName').textContent = file.name;

    // Get file content
    fileReader.onload = function () {
        const arrayBuffer = fileReader.result;
        audioContext.decodeAudioData(arrayBuffer, function (buffer) {
            audioBuffer = buffer;
            playButton.disabled = false;
        });
    };

    fileReader.readAsArrayBuffer(file);
}

// Load button click event
loadButton.addEventListener('click', () => { fileInput.click() });

// Play button click event
playButton.addEventListener('click', () => {
    playButton.disabled = true;
    stopButton.disabled = false;

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    // Analyze the audio data with AnalyserNode
    analyser = audioContext.createAnalyser();
    analyser.fftSize = bufferSize * 2;
    analyser.smoothingTimeConstant = 0.3;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);

    // Update the frequency display
    function updateFrequency() {
        const timeDomainData = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(timeDomainData);

        const peak = getPeak(timeDomainData);
        const maxFrequency = peak * audioBuffer.sampleRate / analyser.fftSize;
        frequencyDisplay.textContent = maxFrequency.toFixed(2) + ' Hz';
        frequencyBar.style.width = (maxFrequency.toFixed(2) * 10) + 'px';

        const maxDegree = 20;
        const degree = (maxFrequency > maxDegree) ? maxDegree : maxFrequency;
        document.body.style.setProperty('--deg', `${degree * 0.1}deg`);
        document.body.style.setProperty('--negative-deg', `${degree * -0.1}deg`);
        requestAnimationFrame(updateFrequency);
    }

    function getPeak(data) {
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i] > peak) {
                peak = data[i];
            }
        }
        return peak;
    }

    updateFrequency();
    audioSource.start();
});

// Stop button click event
stopButton.addEventListener('click', () => {
    audioSource.stop();
    audioSource.disconnect();
    audioSource = null;
    analyser.disconnect();

    playButton.disabled = false;
    stopButton.disabled = true;
});

// Effect button click event
document.getElementById('effectBtn').addEventListener('click', e => {
    document.body.querySelector('main').classList.toggle('shake');
    e.target.classList.toggle('active');
});

// Download file from google drive
document.getElementById('downloadBtn').addEventListener('click', e => {
    const fileId = "1HemtRzLqqHcaALgPIVKktwvKY4PhmIsx";
    const link = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.location.href = link;
});