from flask import Flask, render_template, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)


# Load and transform exoplanet data
def load_and_transform_data():
    # Load data from CSV file
    df = pd.read_csv('exoplanet_data.csv')

    # Ensure 'ra', 'dec', and 'sy_dist' columns are available and valid
    if not all(col in df.columns for col in ['ra', 'dec', 'sy_dist']):
        raise ValueError("The dataset must contain 'ra', 'dec', and 'sy_dist' columns.")

    # Replace any missing or invalid distances with a default value (e.g., NaN or 1)
    df['sy_dist'] = pd.to_numeric(df['sy_dist'], errors='coerce').fillna(1)

    # Convert 'ra' and 'dec' to radians
    df['ra_rad'] = np.radians(df['ra'])
    df['dec_rad'] = np.radians(df['dec'])

    # Calculate Cartesian coordinates
    df['x'] = df['sy_dist'] * np.cos(df['dec_rad']) * np.cos(df['ra_rad'])
    df['y'] = df['sy_dist'] * np.cos(df['dec_rad']) * np.sin(df['ra_rad'])
    df['z'] = df['sy_dist'] * np.sin(df['dec_rad'])

    # Select the necessary columns for visualization
    return df[['pl_name', 'x', 'y', 'z']].to_dict(orient='records')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/exoplanet_data')
def exoplanet_data():
    try:
        data = load_and_transform_data()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=True)
