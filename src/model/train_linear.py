import json
import os
import numpy as np
from xgboost import XGBRegressor
from datetime import datetime , time
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

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
def predict_times_to_all_stops(current_distance, time_of_day, day_of_week, all_stops_distances, model, scaler):
    hour = time_of_day.hour
    minute = time_of_day.minute
    
    # Filter to only upcoming stops (stops beyond current position)
    upcoming_stops = [d for d in all_stops_distances if d > current_distance]
    
    predictions = []
    
    for stop_distance in upcoming_stops:
        distance_to_stop = stop_distance - current_distance
        
        features = [[
            distance_to_stop,          
            hour,
            minute,
            day_of_week,
            1 if day_of_week >= 5 else 0,
            1 if 7 <= hour <= 9 or 16 <= hour <= 18 else 0,
            hour + minute/60.0,
        ]]
        
        features_scaled = scaler.transform(features)
        predicted_seconds = model.predict(features_scaled)[0]
        predicted_minutes = predicted_seconds / 60.0
        
        predictions.append((stop_distance, predicted_seconds, predicted_minutes))
    
    return predictions

if __name__ == "__main__":
    BASE = os.path.dirname(os.path.abspath(__file__))
    CORRDINATE_FILE = os.path.join(BASE, "..", "data", "temp.json")
    ROUTE_STOPS = ""
    current_coord = None
    with open(CORRDINATE_FILE, 'r') as f:
        training = json.load(f)
    
    X_data = []
    y_data = []

    for level1_key, level1_value in training.items():
        for level2_key, level2_value in level1_value.items():
            for key_string, array_list in level2_value.items():
            # Parse time and day from key
                time_str = key_string[:6]
                hour = int(time_str[:2])
                minute = int(time_str[2:4])
                second = int(time_str[4:6])
            
                date_str = key_string[6:14]
                year = int(date_str[:4])
                month = int(date_str[4:6])
                day = int(date_str[6:8])
                date_obj = datetime(year, month, day)
                day_of_week = date_obj.weekday()
            
                # For each point in the route (current position)
                for i in range(len(array_list) - 1):
                    current_point = array_list[i]
                    current_distance = current_point[0]
                    current_timestamp = current_point[1]
                
                    # For each upcoming stop after current position
                    for j in range(i + 1, len(array_list)):
                        future_point = array_list[j]
                        future_distance = future_point[0]
                        future_timestamp = future_point[1]
                    
                        # Distance remaining to this future stop
                        distance_to_stop = future_distance - current_distance
                    
                        # Time it will take to reach this stop (target)
                        time_to_stop = future_timestamp - current_timestamp
                    
                        # Features for prediction (NO "stops ahead" feature!)
                        features = [
                            distance_to_stop,          
                            hour,                      
                            minute,                    
                            day_of_week,               
                            1 if day_of_week >= 5 else 0,  # is_weekend
                            1 if 7 <= hour <= 9 or 16 <= hour <= 18 else 0,  # is_rush_hour
                            hour + minute/60.0,     
                        ]

                        X_data.append(features)
                        y_data.append(time_to_stop)
X_data = np.array(X_data)
y_data = np.array(y_data)

X_train, X_test, y_train, y_test = train_test_split(X_data, y_data, test_size=0.2, random_state=42)
# Train the model
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


model = GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5)
model.fit(X_train_scaled, y_train)

print("Model trained successfully!")

y_pred = model.predict(X_test_scaled)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
relative_error = (mae / np.mean(y_test)) * 100

print("\n================ MODEL ACCURACY ================\n")
print(f"MAE  (mean absolute error):     {mae:.2f} sec")
print(f"RMSE (root mean squared error): {rmse:.2f} sec")
print(f"Avg actual travel time:         {np.mean(y_test):.2f} sec")
print(f"Relative error:                {relative_error:.2f}%")
print("\n================================================\n")

current_distance = 3.847  
current_time = time(9, 30, 0)
current_day = 2  # Wednesday

# Actual stop locations on route
route_stops = [1.0, 2.5, 4.2, 5.8, 7.3, 9.1, 10.5, 12.0, 13.6]

predictions = predict_times_to_all_stops(
    current_distance=current_distance,
    time_of_day=current_time,
    day_of_week=current_day,
    all_stops_distances=route_stops,
    model=model,
    scaler=scaler
)

print(f"\nBus currently at: {current_distance} km (arbitrary position)")
print(f"Time: {current_time}, Day: Wednesday\n")
print("Predictions for upcoming stops:")
print("-" * 60)

for stop_dist, seconds, minutes in predictions:
    distance_remaining = stop_dist - current_distance
    print(f"Stop at {stop_dist:.1f} km ({distance_remaining:.2f} km away): "
          f"{int(seconds)} sec ({minutes:.1f} min)")