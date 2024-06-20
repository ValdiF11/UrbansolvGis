import numpy as np
import pandas as pd

# Tentukan bounding box untuk kota Bandung atau Subang (koordinat acak dalam batas wilayah ini)
min_lat, max_lat = -6.9707, -6.8505
min_lng, max_lng = 107.5400, 107.7000

data_size = 1000
np.random.seed(42)

# Fitur: [start_lat, start_lng, end_lat, end_lng]
start_lat = np.random.uniform(min_lat, max_lat, data_size)
start_lng = np.random.uniform(min_lng, max_lng, data_size)
end_lat = np.random.uniform(min_lat, max_lat, data_size)
end_lng = np.random.uniform(min_lng, max_lng, data_size)

X = np.column_stack([start_lat, start_lng, end_lat, end_lng])

# Label: 0 untuk lancar, 1 untuk macet (acak untuk contoh ini)
y = np.random.choice([0, 1], size=data_size)

# Gabungkan fitur dan label menjadi satu dataframe
data = pd.DataFrame(X, columns=['start_lat', 'start_lng', 'end_lat', 'end_lng'])
data['traffic'] = y

# Simpan dataset ke file CSV
data.to_csv('traffic_data.csv', index=False)

print("Dataset tiruan telah dibuat dan disimpan sebagai traffic_data.csv")
