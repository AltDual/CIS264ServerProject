import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from datetime import datetime

# Function to calculate total distance between coordinates
def calculate_distance(coords):
    total_distance = 0
    for i in range(len(coords) - 1):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i+1]
        dx = (lat2 - lat1) * 111000
        dy = (lon2 - lon1) * 111000
        total_distance += np.sqrt(dx**2 + dy**2)
    return total_distance

class BusETAPredictor:
    def __init__(self):
        self.model = LinearRegression()
        self.encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')

    def fit(self, X_raw, y):
        """
        X_raw: list of tuples [(time_of_day, day_of_week, distance_to_stop), ...]
               time_of_day in hours (0-23), day_of_week as integer (0=Monday)
        y: list of ETAs in minutes
        """
        # One-hot encode day_of_week
        days = np.array([row[1] for row in X_raw]).reshape(-1, 1)
        day_encoded = self.encoder.fit_transform(days)

        distances = np.array([row[2] for row in X_raw]).reshape(-1, 1)
        times = np.array([row[0] for row in X_raw]).reshape(-1, 1)
        X = np.hstack([times, day_encoded, distances])

        self.model.fit(X, y)

    def predict(self, time_of_day, day_of_week, distance_to_stop):
        day_encoded = self.encoder.transform(np.array([[day_of_week]]))
        X = np.hstack([[[time_of_day]], day_encoded, [[distance_to_stop]]])
        return self.model.predict(X)[0]

if __name__ == "__main__":
    coords = [(37.7749, -122.4194), (37.7750, -122.4180), (37.7755, -122.4170)]
    distance_to_next_stop = calculate_distance(coords)

    X_train = [
        (8, 0, 500),   # 8 AM Monday, 500 meters
        (9, 0, 600),
        (17, 4, 700),  # 5 PM Friday
        (12, 2, 400),
        (15, 2, 450)
    ]
    y_train = [3, 4, 6, 3, 3.5]  # ETA in minutes

    predictor = BusETAPredictor()
    predictor.fit(X_train, y_train)

    now = datetime.now()
    current_time = now.hour + now.minute/60
    current_day = now.weekday()  # Monday=0

    eta = predictor.predict(current_time, current_day, distance_to_next_stop)
    print(f"Predicted ETA to next stop: {eta:.2f} minutes")
