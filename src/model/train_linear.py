import json
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from datetime import datetime , time
#from haversine import hav

def calculate_distance(coords, current_coord, target_stop):
    total_distance, index = find_closest_coord(coords, current_coord) 
    for i in range(index, target_stop):
        lat1, lon1 = coords[i]
        lat2, lon2 = coords[i+1]
        total_distance += hav(lat, lon1, lat2, lon2)
    return total_distance
def find_closest_coord(coords, current_coord):
    if not coords:
        return None
    min_distance_hav = float('inf')
    closest_coord_index = 0
    
    for i in coords:
        lat1, lon1 = coords[i]
        lat2, lon2 = current_coord
        distance = hav(lat1, lon1, lat2, lon2)
        if distance < min_distance_hav:
            min_distance_hav = distance
            closest_coord_index = i
    return min_distance_sq, closest_coord_index
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
    CORRDINATE_FILE = "../data/temp.json"
    ROUTE_STOPS = ""
    current_coord = None
    with open(CORRDINATE_FILE, 'r') as f:
        training = json.load(f)
    #with open(ROUTE_STOPS, 'r') as f:
    #    routestop_coords = json.load(f)
    #for i in routestop_coords:
    #    _ , closest_stop_index = (coords, i)
    #    routestop_index.append(closest_stop_index)
    #distance_to_next_stop = calculate_distance(coords)
    
    #Array of n-tuples
    X_train = []
    #Array in minutes or seconds
    y_train = []  # ETA in seconds

    #predictor = BusETAPredictor()
    #predictor.fit(X_train, y_train)

    #now = datetime.now()
    #current_time = now.hour + now.minute/60
    #current_day = now.weekday()  # Monday=0

    #eta = predictor.predict(current_time, current_day, distance_to_next_stop)
    #print(f"Predicted ETA to next stop: {eta:.2f} minutes")
    for level1_key, level1_value in training.items():
        for level2_key, level2_value in level1_value.items():
            for key_string, array_list in level2_value.items():
                # Parse time from first 6 digits (HHMMSS)
                time_str = key_string[:6]
                hour = int(time_str[:2])
                minute = int(time_str[2:4])
                second = int(time_str[4:6])
                time_of_day = time(hour, minute, second)
                
                # Parse date from next 8 digits (YYYYMMDD)
                date_str = key_string[6:14]
                year = int(date_str[:4])
                month = int(date_str[4:6])
                day = int(date_str[6:8])
                
                date_obj = datetime(year, month, day)
                day_of_week = date_obj.weekday()
                
                # Process each array
                for array in array_list:
                    first_field = array[0]
                    second_field = array[1]
                    
                    data_tuple = (first_field, second_field, time_of_day, day_of_week)
                    X_train.append(data_tuple)
    print(f"Total entries: {len(X_train)}")
    print(f"First entry: {X_train[0]}")
