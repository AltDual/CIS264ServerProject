import os
import json
import numpy as np
from joblib import load
from datetime import datetime
from sklearn.preprocessing import StandardScaler


def create_enhanced_features(distance_to_stop, hour, minute, day_of_week, current_distance=0):
    """
    Create the same feature set used during training
    """
    is_weekend = 1 if day_of_week >= 5 else 0
    is_rush_hour = 1 if (7 <= hour <= 9) or (16 <= hour <= 18) else 0
    hour_continuous = hour + minute/60.0
    
    # Additional features for better accuracy
    is_morning = 1 if 6 <= hour < 12 else 0
    is_afternoon = 1 if 12 <= hour < 18 else 0
    is_evening = 1 if 18 <= hour < 22 else 0
    is_night = 1 if hour >= 22 or hour < 6 else 0
    
    # Sinusoidal encoding for cyclical time features
    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    dow_sin = np.sin(2 * np.pi * day_of_week / 7)
    dow_cos = np.cos(2 * np.pi * day_of_week / 7)
    
    # Distance-based features
    distance_squared = distance_to_stop ** 2
    distance_log = np.log1p(distance_to_stop)
    
    features = [
        distance_to_stop,
        hour,
        minute,
        day_of_week,
        is_weekend,
        is_rush_hour,
        hour_continuous,
        is_morning,
        is_afternoon,
        is_evening,
        is_night,
        hour_sin,
        hour_cos,
        dow_sin,
        dow_cos,
        distance_squared,
        distance_log,
        current_distance,
    ]
    
    return features


def load_model_and_create_scaler(model_path='prod_model.joblib', scaler_path='prod_scaler.joblib'):
    """
    Load the trained model and create a new scaler
    """
    try:
        model = load(model_path)
        scaler = load(scaler_path)
        return model, scaler
    except FileNotFoundError as e:
        print(f"Error: Could not find model file '{model_path}'")
        raise e


def get_unarrived_timeslots(log_file_path):
    with open(log_file_path, 'r') as f:
        log_data = json.load(f)

    unarrived = {}

    for route_id, dates in log_data.items():
        for date, directions in dates.items():
            for direction, bus_list in directions.items():

                # Track arrival status per (date, direction, time)
                time_status = {}

                for entry in bus_list:
                    time_str = entry[0]
                    status = entry[1]

                    key = (route_id, date, direction, time_str)

                    # Initialize timeslot as "not arrived yet"
                    if key not in time_status:
                        time_status[key] = False

                    # If this timeslot ever has "arrived", mark it
                    if status == "arrived":
                        time_status[key] = True

                # Collect timeslots where arrival never happened
                for key, arrived in time_status.items():
                    if not arrived:
                        unarrived[key] = True
    print(f"[DEBUG] Total unarrived timeslots: {len(unarrived)}")
    print(unarrived)
    print("[DEBUG] Completed processing.")
    return unarrived
def get_latest_distances(log_data2, unarrived):
    results = {}
    with open(log_data2, 'r') as f:
        log_data = json.load(f)
    for route_id, date, direction, time in unarrived:
        if route_id in log_data and direction in log_data[route_id]:
            for trip_id, trip_data in log_data[route_id][direction].items():
                if trip_id.startswith(time):
                    if trip_data:  # make sure trip_data list is not empty
                        last_element = trip_data[-1]  # last element of the trip's array
                        # assuming last_element itself is a list and you want the whole thing
                        distance = last_element[0]
                        timestamp = datetime.fromtimestamp(last_element[1])
                        hour = timestamp.hour
                        minute = timestamp.minute
                        day_of_week = timestamp.weekday()

                        results[(route_id, date, direction, time)] = {
                                "distance": distance,
                                "hour": hour,
                                "minute": minute,
                                "day_of_week": day_of_week
                        }
                    break  # stop searching trip_ids if found   
    print(results)
    return results 

def predict_for_active_buses(active_buses, model, scaler, stop_distances):
    predictions = {}
    
    for key, info in active_buses.items():
        route, date, direction, time = key
        bus_distance = info["distance"]
        hour = info["hour"]
        minute = info["minute"]
        day_of_week = info["day_of_week"]

        # Stops ahead of the bus
        upcoming_stops = [d for d in stop_distances if d > bus_distance]

        bus_predictions = []

        for stop_distance in upcoming_stops:
            distance_to_stop = stop_distance - bus_distance

            features = create_enhanced_features(
                distance_to_stop=distance_to_stop,
                hour=hour,
                minute=minute,
                day_of_week=day_of_week,
                current_distance=bus_distance,
            )
            features = np.array(features).reshape(1, -1)

            # Scale
            scaled = scaler.transform(features)

            # Predict minutes
            predicted_minutes = model.predict(scaled)[0]

            # Store prediction
            bus_predictions.append({
                "stop_distance": stop_distance,
                "distance_to_stop": distance_to_stop,
                "predicted_minutes": float(predicted_minutes)
            })

        # Store inside route → direction → bus
        predictions.setdefault(route, {}) \
                    .setdefault(direction, {})[time] = bus_predictions

    return predictions


if __name__ == "__main__":
    # File paths
    BASE = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE, 'prod_model_1.joblib')
    SCALER_PATH = os.path.join(BASE, 'prod_scaler_1.joblib')
    LOG_FILE = os.path.join(BASE, "..", "data", "log.json")
    TEMP_FILE = os.path.join(BASE, "..", "data", "temp.json")
    
    model, scaler = load_model_and_create_scaler(MODEL_PATH, SCALER_PATH)

    unarrived = get_unarrived_timeslots(LOG_FILE)

    data_to_feed = get_latest_distances(TEMP_FILE, unarrived)


    predictions = predict_for_active_buses(
        active_buses=data_to_feed,
        model=model,
        scaler=scaler,
        stop_distances_east=[0.2, 1.4, 3.0, 5.2, 8.1, 11.5, 14.0],
        stop_distances_west=[],
    )
    
    # Save to file
    output_file = os.path.join(BASE, 'bus_predictions.json')
    with open(output_file, 'w') as f:
        json.dump(predictions, f, indent=2)
    print(f"✓ Predictions saved to '{output_file}'") 
