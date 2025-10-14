import json
import numpy as np
from haversine import haversine_distance as hav

arr = np.load('250Coord.npy')
arrlength = arr.shape[1]


# Load the stops JSON file
with open("250Stops.json", "r", encoding="utf-8") as f:
    stops = json.load(f)
extracted_stops = []
for key in stops.keys():
    name = stops[key]["title"][0]["value"]
    lat = stops[key]["field_location"][0]["lat"]
    lon = stops[key]["field_location"][0]["lon"]
    routeDirection = 0
    min_index = np.zeros(2, dtype=np.uint32)
    min_value = np.zeros(2, dtype=np.float64)
    # search in direction 0 and 1
    for di in range(2):
        # decide how many coordinates
        dirlength = arrlength
        for i in range(arrlength - 1, -1, -1):
            if arr[di][i][0] == 0:  # the first zero in the di direction
                dirlength = i
            else:
                break

        min_value[di] = hav(arr[di][0][0], arr[di][0][1], lat, lon)
        i = 1
        while i < dirlength - 1: # -1 because we need at least one next point to construct a vector
            dis = hav(arr[di][i][0], arr[di][i][1], lat, lon)
            if dis < min_value[di]:
                min_index[di] = i
                min_value[di] = dis
            i += 1
        # Construct vectors
        # The vector from the min to the next
        x1 = arr[di][min_index[di]+1][0] - arr[di][min_index[di]][0]
        y1 = arr[di][min_index[di]+1][1] - arr[di][min_index[di]][1]
        # The vector from the bus stop to the min route point
        x2 = lat - arr[di][min_index[di]][0]
        y2 = lon - arr[di][min_index[di]][1]
        cross = x1 * y2 - y1 * x2
        if cross < 0:
            routeDirection += (di+1)
    if routeDirection == 1 or routeDirection == 2:
        extracted_stops.append([name, lat, lon, routeDirection, min_value[routeDirection-1], min_index[routeDirection-1]])
    elif routeDirection == 3:
        extracted_stops.append([name, lat, lon, routeDirection, min_value[0], min_index[0], min_value[1], min_index[1]])
    else:
        extracted_stops.append([name, lat, lon, routeDirection, "error"])


with open('250StopsCleaned.txt', 'w') as file:
    for item in extracted_stops:
        file.write(str(item) + '\n')
