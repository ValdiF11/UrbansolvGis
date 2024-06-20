from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
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
