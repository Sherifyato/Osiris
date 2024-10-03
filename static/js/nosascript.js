function sendMessage() {
    let userInput = document.getElementById('userInput').value.trim();  // Trim spaces
    if (userInput === "") {
        alert("Please enter a question before sending!");  // Alert user for empty input
        return;
    }

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
    })
    .catch(error => {
        document.getElementById('response').innerText = "Something went wrong, please try again!";
    });
}
