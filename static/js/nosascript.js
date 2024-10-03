// static/js/script.js
function sendMessage() {
    let userInput = document.getElementById('userInput').value;
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: userInput}),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('response').innerText = data.response;
        // speakMessage();
    });
}

function speakMessage() {
    let message = document.getElementById('response').innerText;
    let synth = window.speechSynthesis;
    let utterThis = new SpeechSynthesisUtterance(message);
    synth.speak(utterThis);
}