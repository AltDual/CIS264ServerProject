import os
import joblib
import numpy as np
from datetime import datetime

# ==============================================================================
# 1. Feature Engineering Logic (MUST Match Training Script Exactly)
# ==============================================================================
def create_enhanced_features(distance_to_stop, hour, minute, day_of_week, current_distance=0):
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

# ==============================================================================
# 2. Helper Functions for User Input
# ==============================================================================
def get_float_input(prompt):
    while True:
        try:
            return float(input(prompt))
        except ValueError:
            print("Invalid input. Please enter a number.")

def get_time_input():
    val = input("Enter time (HH:MM) or press Enter for 'Now': ").strip()
    if not val:
        return datetime.now()
    try:
        # Returns a datetime object for today with the specified time
        t = datetime.strptime(val, "%H:%M")
        now = datetime.now()
        return now.replace(hour=t.hour, minute=t.minute)
    except ValueError:
        print("Invalid format. Using current time.")
        return datetime.now()

# ==============================================================================
# 3. Main Execution
# ==============================================================================
def main():
    # --- Paths ---
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, 'prod_model_1.joblib')
    SCALER_PATH = os.path.join(BASE_DIR, 'prod_scaler_1.joblib')

    # --- Load Resources ---
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        print("Error: Model or Scaler file not found.")
        print(f"Looking for: {MODEL_PATH}")
        print("Please run the training script first to generate these files.")
        return

    print("Loading model and scaler...")
    try:
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Resources loaded successfully.\n")
    except Exception as e:
        print(f"Error loading files: {e}")
        return

    print("="*60)
    print(" BUS ARRIVAL TIME PREDICTOR ")
    print("="*60)

    while True:
        print("\n--- New Prediction ---")
        
        # 1. Get Inputs
        # Note: The model was trained on linear distance (e.g., Mile 10 to Mile 15)
        # not raw coordinates.
        current_pos = get_float_input("Current Cumulative Distance (e.g., 5.0): ")
        target_pos = get_float_input("Target Stop Cumulative Distance (e.g., 8.5): ")
        
        if target_pos <= current_pos:
            print("Warning: Target is behind or at current position. Distance is 0 or negative.")
            # Depending on logic, you might want to continue or continue loop
        
        distance_to_stop = target_pos - current_pos
        
        pred_time = get_time_input()
        
        # 2. Extract Temporal Features
        hour = pred_time.hour
        minute = pred_time.minute
        day_of_week = pred_time.weekday() # 0=Monday, 6=Sunday
        
        # 3. Feature Engineering
        # We wrap it in a list because create_enhanced_features returns a list (1 row)
        raw_features = create_enhanced_features(
            distance_to_stop=distance_to_stop, 
            hour=hour, 
            minute=minute, 
            day_of_week=day_of_week, 
            current_distance=current_pos
        )
        
        # 4. Scaling
        # Reshape to (1, -1) because standard scaler expects a 2D array [n_samples, n_features]
        features_array = np.array(raw_features).reshape(1, -1)
        features_scaled = scaler.transform(features_array)
        
        # 5. Prediction
        predicted_seconds = model.predict(features_scaled)[0]
        
        # 6. Output Formatting
        if predicted_seconds < 0:
            predicted_seconds = 0
            
        minutes = int(predicted_seconds // 60)
        seconds = int(predicted_seconds % 60)
        
        print("-" * 30)
        print(f"Context: {pred_time.strftime('%A %H:%M')}")
        print(f"Trip Distance: {distance_to_stop:.2f} units")
        print(f"PREDICTION: {minutes} min {seconds} sec ({predicted_seconds:.2f} total seconds)")
        print("-" * 30)
        
        # 7. Repeat?
        again = input("Run another prediction? (y/n): ").lower()
        if again != 'y':
            break

if __name__ == "__main__":
    main()
