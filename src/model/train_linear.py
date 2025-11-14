import json
import os
import numpy as np
import pandas as pd
from joblib import dump
from xgboost import XGBRegressor
from datetime import datetime , time
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, ExtraTreesRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

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
        current_distance,  # Absolute position can matter
    ]
    
    return features
def get_models():
    """Return dictionary of models to test"""
    models = {
        'GradientBoosting': GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=6,
            min_samples_split=10,
            min_samples_leaf=4,
            subsample=0.8,
            random_state=42
        ),
        'XGBoost': XGBRegressor(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=6,
            min_child_weight=3,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            n_jobs=-1
        ),
        'RandomForest': RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=42,
            n_jobs=1
        ),
        'ExtraTrees': ExtraTreesRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_split=10,
            min_samples_leaf=4,
            random_state=42,
            n_jobs=1
        ),
        'KNN': KNeighborsRegressor(
            n_neighbors=15,
            weights='distance',
            algorithm='auto',
            leaf_size=30,            
            p=2,                     
            metric='minkowski',      
            n_jobs=1
        ),

        'Ridge': Ridge(alpha=1.0, random_state=42)
    }
    return models
def evaluate_model(model, X_train, X_test, y_train, y_test, model_name):
    """Train and evaluate a single model"""
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    relative_error = (mae / np.mean(y_test)) * 100
    
    # Cross-validation score
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, 
                                 scoring='neg_mean_absolute_error', n_jobs=-1)
    cv_mae = -cv_scores.mean()
    
    return {
        'model': model,
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'relative_error': relative_error,
        'cv_mae': cv_mae,
        'y_pred': y_pred
    }
def predict_times_to_all_stops(current_distance, time_of_day, day_of_week, all_stops_distances, model, scaler):
    hour = time_of_day.hour
    minute = time_of_day.minute
    
    # Filter to only upcoming stops (stops beyond current position)
    upcoming_stops = [d for d in all_stops_distances if d > current_distance]
    
    predictions = []
    
    for stop_distance in upcoming_stops:
        distance_to_stop = stop_distance - current_distance
        
        features = [create_enhanced_features(distance_to_stop, hour, minute, day_of_week, current_distance)]
        
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
            
                for i in range(len(array_list) - 1):
                    current_point = array_list[i]
                    current_distance = current_point[0]
                    current_timestamp = current_point[1]

                    current_datetime = datetime.fromtimestamp(current_timestamp)
                    current_hour = current_datetime.hour
                    current_minute = current_datetime.minute
                
                
                    for j in range(i + 1, len(array_list)):
                        future_point = array_list[j]
                        future_distance = future_point[0]
                        future_timestamp = future_point[1]
                    
                        distance_to_stop = future_distance - current_distance
                    
                        time_to_stop = future_timestamp - current_timestamp
                    
                        features = create_enhanced_features(distance_to_stop, current_hour, current_minute, day_of_week, current_distance)

                        X_data.append(features)
                        y_data.append(time_to_stop)
X_data = np.array(X_data)
y_data = np.array(y_data)

X_train, X_test, y_train, y_test = train_test_split(X_data, y_data, test_size=0.2, random_state=42)
# Train the model
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# Test all models
print("\n" + "="*80)
print("TRAINING AND EVALUATING MULTIPLE MODELS")
print("="*80 + "\n")

models = get_models()
results = {}

for model_name, model in models.items():
    print(f"Training {model_name}...")
    results[model_name] = evaluate_model(
        model, X_train_scaled, X_test_scaled, y_train, y_test, model_name
    )

# Display results
print("\n" + "="*80)
print("MODEL COMPARISON RESULTS")
print("="*80 + "\n")

results_df = pd.DataFrame({
    name: {
        'MAE (sec)': f"{res['mae']:.2f}",
        'RMSE (sec)': f"{res['rmse']:.2f}",
        'R² Score': f"{res['r2']:.4f}",
        'Relative Error (%)': f"{res['relative_error']:.2f}",
        'CV MAE (sec)': f"{res['cv_mae']:.2f}"
    }
    for name, res in results.items()
}).T

print(results_df)
print("\n" + "="*80)

# Find best model
best_model_name = min(results.keys(), key=lambda k: results[k]['mae'])
best_model = results[best_model_name]['model']

print(f"\nBest Model: {best_model_name}")
print(f"MAE: {results[best_model_name]['mae']:.2f} seconds")
print(f"Relative Error: {results[best_model_name]['relative_error']:.2f}%")

save_filename = 'prod_model.joblib'

dump(best_model, save_filename)
