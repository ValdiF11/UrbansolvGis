from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import joblib

app = Flask(__name__)
CORS(app)
model = joblib.load('traffic_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    start = data['start']
    end = data['end']
    features = [start['lat'], start['lng'], end['lat'], end['lng']]
    prediction = model.predict([features])
    return jsonify({'traffic': int(prediction[0])})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
