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


def load_model_and_create_scaler(model_path='prod_model.joblib'):
    """
    Load the trained model and create a new scaler
    """
    try:
        model = load(model_path)
        scaler = StandardScaler()
        return model, scaler
    except FileNotFoundError as e:
        print(f"Error: Could not find model file '{model_path}'")
        raise e


def get_arrived_buses(log_file_path):
    with open(log_file_path, 'r') as f:
        log_data = json.load(f)
    
    arrived_buses = {}
    
    for route_id, dates in log_data.items():
        for date, directions in dates.items():
            for direction, bus_list in directions.items():
                # Track which buses have arrived
                for entry in bus_list:
                    time_str = entry[0]
                    status = entry[1]
                    bus_key = (date, direction, time_str)
                        
                    if status == "arrived":
                        arrived_buses[bus_key] = True
    
    return arrived_buses


def parse_active_buses(temp_file_path, log_file_path):
    # Get list of arrived buses from log.json
    arrived_buses = get_arrived_buses(log_file_path)
    
    # Load temp.json (training variable name)
    with open(temp_file_path, 'r') as f:
        training = json.load(f)
    
    active_buses = {}
    


def predict_for_active_buses(active_buses, model, scaler, target_stop_distance=None):
    """
    Make predictions for all active buses
    
    Parameters:
    -----------
    active_buses : dict
        Dictionary of active buses from parse_active_buses
    model : trained model
        Loaded model
    scaler : StandardScaler
        Scaler instance
    target_stop_distance : float, optional
        Specific target stop distance. If None, predicts to all upcoming stops
    
    Returns:
    --------
    dict : Predictions for each bus
    """
    predictions = {}
    
    for route_id, directions in active_buses.items():
        predictions[route_id] = {}
        
        for direction, buses in directions.items():
            predictions[route_id][direction] = {}
            
            for bus_id, bus_data in buses.items():
                current_distance = bus_data['current_distance']
                
                if current_distance is None:
                    predictions[route_id][direction][bus_id] = {
                        'error': 'Could not determine current distance'
                    }
                    continue
                
                # Get current time from timestamp
                current_time = datetime.fromtimestamp(bus_data['timestamp'])
                hour = current_time.hour
                minute = current_time.minute
                day_of_week = current_time.weekday()
                
                # Get all upcoming stops
                all_stops = bus_data['all_stop_distances']
                upcoming_stops = [d for d in all_stops if d > current_distance]
                
                bus_predictions = {
                    'schedule_id': bus_data['schedule_id'],
                    'current_distance': current_distance,
                    'current_stop_index': bus_data['current_stop_index'],
                    'schedule_time': bus_data['schedule_time'],
                    'timestamp': bus_data['timestamp'],
                    'current_time': current_time.strftime('%H:%M:%S'),
                    'predictions': []
                }
                
                # If target stop specified, predict only to that stop
                if target_stop_distance is not None:
                    if target_stop_distance > current_distance:
                        upcoming_stops = [target_stop_distance]
                    else:
                        bus_predictions['error'] = 'Target stop is behind current position'
                        predictions[route_id][direction][bus_id] = bus_predictions
                        continue
                
                # Make predictions for each upcoming stop
                for stop_distance in upcoming_stops:
                    distance_to_stop = stop_distance - current_distance
                    
                    features = create_enhanced_features(
                        distance_to_stop, hour, minute, day_of_week, current_distance
                    )
                    
                    features_array = np.array([features])
                    features_scaled = scaler.fit_transform(features_array)
                    
                    predicted_seconds = model.predict(features_scaled)[0]
                    predicted_minutes = predicted_seconds / 60.0
                    
                    # Calculate ETA
                    eta_timestamp = bus_data['timestamp'] + predicted_seconds
                    eta_datetime = datetime.fromtimestamp(eta_timestamp)
                    
                    bus_predictions['predictions'].append({
                        'stop_distance': float(stop_distance),
                        'distance_to_stop': float(distance_to_stop),
                        'predicted_seconds': float(predicted_seconds),
                        'predicted_minutes': float(predicted_minutes),
                        'eta_time': eta_datetime.strftime('%H:%M:%S'),
                        'eta_timestamp': float(eta_timestamp)
                    })
                
                predictions[route_id][direction][bus_id] = bus_predictions
    
    return predictions


def display_predictions(predictions, max_stops_display=5):
    """
    Display predictions in a readable format
    """
    print("\n" + "="*80)
    print("BUS ARRIVAL PREDICTIONS FOR ACTIVE BUSES (NOT YET ARRIVED)")
    print("="*80 + "\n")
    
    total_buses = 0
    for route_id, directions in predictions.items():
        print(f"\nRoute {route_id}:")
        print("-" * 80)
        
        for direction, buses in directions.items():
            print(f"\n  Direction {direction}:")
            
            for bus_id, bus_data in buses.items():
                total_buses += 1
                
                if 'error' in bus_data:
                    print(f"    Bus {bus_id}: {bus_data['error']}")
                    continue
                
                print(f"\n    Bus {bus_id}")
                print(f"      Schedule Time: {bus_data['schedule_time']}")
                print(f"      Current Time: {bus_data['current_time']}")
                print(f"      Current Distance: {bus_data['current_distance']:.2f} km")
                print(f"      Current Stop Index: {bus_data['current_stop_index']}")
                
                if bus_data['predictions']:
                    print(f"\n      {'Stop Dist':<12} {'Dist to Stop':<14} {'ETA Time':<12} {'Minutes':<10}")
                    print(f"      {'-'*60}")
                    
                    for pred in bus_data['predictions'][:max_stops_display]:
                        print(f"      {pred['stop_distance']:<12.2f} "
                              f"{pred['distance_to_stop']:<14.2f} "
                              f"{pred['eta_time']:<12} "
                              f"{pred['predicted_minutes']:<10.2f}")
                    
                    if len(bus_data['predictions']) > max_stops_display:
                        print(f"      ... and {len(bus_data['predictions']) - max_stops_display} more stops")
    
    print(f"\n{'='*80}")
    print(f"Total active buses: {total_buses}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    # File paths
    BASE = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE, 'prod_model.joblib')
    LOG_FILE = os.path.join(BASE, "..", "data", "log.json")
    TEMP_FILE = os.path.join(BASE, "..", "data", "temp.json")
    
    # Debug mode - set to True to see detailed matching info
    DEBUG = True
    
    try:
        print("Loading model...")
        model, scaler = load_model_and_create_scaler(MODEL_PATH)
        print("✓ Model loaded successfully\n")
        
        if DEBUG:
            print("="*80)
            print("DEBUG: Checking arrived buses from log.json")
            print("="*80)
            arrived = get_arrived_buses(LOG_FILE)
            print(f"Found {len(arrived)} arrived buses:")
            for key in list(arrived.keys())[:5]:  # Show first 5
                print(f"  {key}")
            if len(arrived) > 5:
                print(f"  ... and {len(arrived) - 5} more")
            print()
            
            print("="*80)
            print("DEBUG: Checking buses in temp.json")
            print("="*80)
            with open(TEMP_FILE, 'r') as f:
                temp_data = json.load(f)
            
            temp_bus_count = 0
            for route_id, directions in temp_data.items():
                for direction, schedules in directions.items():
                    temp_bus_count += len(schedules)
                    if temp_bus_count <= 5:  # Show first few
                        for key_string in list(schedules.keys())[:2]:
                            time_str = key_string[:6]
                            parts = key_string.split('-')
                            schedule_id = parts[1] if len(parts) >= 2 else key_string
                            bus_key = (route_id, direction, time_str, schedule_id)
                            is_arrived = bus_key in arrived
                            print(f"  Route {route_id}, Dir {direction}, Time {time_str}, ID {schedule_id}")
                            print(f"    Key: {key_string[:50]}...")
                            print(f"    Arrived: {is_arrived}")
            
            print(f"Total buses in temp.json: {temp_bus_count}\n")
        
        print("Parsing active buses (not yet arrived)...")
        active_buses = parse_active_buses(TEMP_FILE, LOG_FILE)
        
        # Count total buses
        total_buses = sum(len(buses) for directions in active_buses.values() 
                         for buses in directions.values())
        print(f"✓ Found {total_buses} active buses (filtered out arrived buses)\n")
        
        if total_buses == 0:
            print("⚠ No active buses found. All buses may have arrived.")
            print("\nPossible reasons:")
            print("  1. All buses in temp.json have 'arrived' status in log.json")
            print("  2. The schedule_id matching between files doesn't align")
            print("  3. temp.json contains only historical data")
            print("\nTip: Set DEBUG = True in the script to see matching details")
        else:
            print("Making predictions...")
            predictions = predict_for_active_buses(active_buses, model, scaler)
            
            # Display results
            display_predictions(predictions)
            
            # Save to file
            output_file = os.path.join(BASE, 'bus_predictions.json')
            with open(output_file, 'w') as f:
                json.dump(predictions, f, indent=2)
            print(f"✓ Predictions saved to '{output_file}'")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        print("\nMake sure you have:")
        print("  1. Trained model saved as 'prod_model.joblib'")
        print("  2. Log file at '../data/log.json'")
        print("  3. Route data at '../data/temp.json'")
