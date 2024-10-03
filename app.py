from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

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

    return jsonify({'response': response.text})


if __name__ == '__main__':
    app.run(debug=True)
