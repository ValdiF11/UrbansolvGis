import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Muat dataset
data = pd.read_csv('traffic_data.csv')

# Pisahkan fitur dan label
X = data[['start_lat', 'start_lng', 'end_lat', 'end_lng']]
y = data['traffic']

# Bagi dataset menjadi data latih dan data uji
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Buat dan latih model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Simpan model
joblib.dump(model, 'traffic_model.pkl')

print("Model telah dilatih dan disimpan sebagai traffic_model.pkl")
