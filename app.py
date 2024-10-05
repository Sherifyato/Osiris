from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
import pygame
import time
import requests

# Set your ElevenLabs API key
api_key = "sk_687b96417702a78b591c810c3ef75aaf5396470c56eec2f5"

# The text response from your chatbot (stored in this variable)
# chatbot_response = "Hello! How can I assist you today?"

# Valid voice ID (You need to get this from ElevenLabs or via their API)
voice_id = "XfNU2rGpBa01ckF309OY"

# API URL for ElevenLabs text-to-speech (use a valid voice ID)
url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

# Headers for the API request
headers = {
    "accept": "audio/mpeg",  # Expected response is audio in MPEG format
    "xi-api-key": api_key,
    "Content-Type": "application/json"
}

# Initialize pygame mixer
pygame.mixer.init()

# Load the MP3 file

# Play the MP3 file


# Keep the program running while the music plays

app = Flask(__name__)

# Set your API key (replace with your actual API key)
API_KEY = 'AIzaSyC3h6H8lD-0XrGe683NA8Impy4G50eO--U'
MODEL_NAME = 'gemini-1.0-pro'

# Configure the generative AI model
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel(model_name=MODEL_NAME)


@app.route('/')
def default_page():
    default_planet = "earth"
    # You can change this to any planet
    url = f"https://eyes.nasa.gov/apps/exo/#/{default_planet}?embed=true&;featured=false&;logo=false&;menu=false"
    return render_template('nosa.html', planet_name=default_planet, url=url)

@app.route('/<planet_name>')
def planet_page(planet_name):
    # Pass the planet_name to the template
    url = f"https://eyes.nasa.gov/apps/exo/#/planet/{planet_name}?embed=true&;featured=false&;logo=false&;menu=false"
    return render_template('nosa.html', planet_name=planet_name, url=url)


@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('input').strip()

    # Server-side validation for empty input
    if not user_input:
        return jsonify({'response': 'Please enter a valid question.'})

    # Create the base prompt for the chatbot
    base = ("Your name is Nosa, you are a chatbot that exists on a website which "
            "is a solution for one of NASA Space Apps 2024 problems. Answer only questions "
            "related to the contest or NASA overall. Start your chat with a small greeting.")

    # Create the full prompt
    prompt = f"role: {base}, input user: {user_input}"



    # Generate a response using the generative AI model
    response = model.generate_content([prompt])

    data = {
        "text": response.text,  # Text to convert to speech
        "model_id": "eleven_monolingual_v1",  # Example model
        "settings": {
            "stability": 0.75,  # You can tweak stability and similarity to the cloned voice
            "similarity_boost": 0.75
        }
    }
    print(response)
    # Send POST request to ElevenLabs API

    response1 = requests.post(url, json=data, headers=headers)
    time.sleep(3)
    if response1.status_code == 200:
        with open("output_speech.mp3", "wb") as audio_file:
            audio_file.write(response1.content)
        pygame.mixer.music.load("output_speech.mp3")
        pygame.mixer.music.play()
        print("done")
    else:
        print("Error")


    return jsonify({'response': response.text})


if __name__ == '__main__':
    app.run(debug=True)
