import requests
import time
import numpy as np
import haversine as h
import json
import os


temp = {} # a temporary dictionary to prepare the data for ML
if os.path.exists('temp.json'):
    with open('temp.json', 'r') as f:
        temp = json.load(f)

url = f"https://www.samtrans.com/files/"
response = requests.get(url)
pre_data = response.json()
route_positions = []
try:
    while True:
        # Fetch 70 seconds after the previous data publish time
        if (int(time.time()) - int(pre_data['Header']['Timestamp'])) % 70 == 2:
            while True:
                url = f"https://www.samtrans.com/files/rt/vehiclepositions/SM.json?time={int(time.time() * 1000)}"
                response = requests.get(url)
                data = response.json()
                if data != pre_data:
                    # for testing the broadcasting interval
                    print(f"data updated {data['Header']['Timestamp']}, current time: {time.time()}")

                    for entity in data["Entities"]:
                        route_id = entity["Vehicle"]["Trip"]["RouteId"]
                        # Only deal with 250 for now
                        if route_id != "250":
                            continue;
                        direction = int(entity["Vehicle"]["Trip"]["DirectionId"])
                        start_time = entity["Vehicle"]["Trip"]["StartTime"].replace(":", "") # As bus ID
                        latit = entity["Vehicle"]["Position"]["Latitude"]
                        longi = entity["Vehicle"]["Position"]["Longitude"]
                        timestamp = entity["Vehicle"]["Timestamp"]
                        stop_id = int(entity["Vehicle"]["StopId"]) # last stop

                        routeA = np.load(f'{route_id}/{route_id}Coord.npy')
                        routeAlen = routeA.shape[1]

                        stopsA = np.load(f'{route_id}/{route_id}StopsArr.npy')
                        stopsAlen = stopsA.shape[1]

                        # Check what is stop_id
                        for i in range(len(stopsA[direction])):
                            if stopsA[direction][i][0] == stop_id:
                                reportedRouteIndex = stopsA[direction][i][3]

                        # Find the nearest route coordinate, and the distance inbetween
                        min_routecoorddis = h.hav(routeA[direction][0][0], routeA[direction][0][1], latit, longi)
                        i = 1
                        min_index = 0
                        while i < routeAlen -1  and routeA[direction][i][0] != 0:
                            dis = h.hav(routeA[direction][i][0], routeA[direction][i][1], latit, longi)
                            if dis < min_routecoorddis:
                                min_index = i
                            i += 1
                        # use dot product to determine whether the nearest point is before or after the bus
                        # (x1, y1) from bus to the nearest point
                        # (x2, y2) from the nearest point to the next point
                        x1 = routeA[direction][min_index][0] - latit
                        y1 = routeA[direction][min_index][1] - longi
                        x2 = routeA[direction][min_index+1][0] - routeA[direction][min_index][0]
                        y2 = routeA[direction][min_index+1][1] - routeA[direction][min_index][1]
                        dot = x1*y1 + x2*y2
                        if dot < 0:
                            min_index += 1
                        dis_busToPoint = h.hav(latit, longi, routeA[direction][min_index][0], routeA[direction][min_index][1])

                        # Find the next stop index
                        t = 0
                        while t < stopsAlen and stopsA[direction][t][0] != 0:
                            if stopsA[direction][t][3] <= min_index:
                                t += 1
                            else:
                                break

                        routeIndexForTheNext = stopsA[direction][t][3]
                        distanceToNext = routeA[direction][routeIndexForTheNext][2] - routeA[direction][min_index][2] + dis_busToPoint

                        # catagorize in JSON
                        if route_id not in temp:
                            temp[route_id] = {}
                        if direction not in temp[route_id]:
                            temp[route_id][direction] = {}
                        if start_time not in temp[route_id][direction]:
                            temp[route_id][direction][start_time] = {}
                        if t not in temp[route_id][direction][start_time]:
                            temp[route_id][direction][start_time][t] = []
                        temp[route_id][direction][start_time][t].append([distanceToNext, timestamp, -1])


                        route_positions.append((route_id, direction, start_time, latit, longi, timestamp, stop_id))

                        # if route_id and latitude is not None and longitude is not None:
                        #     if route_id not in route_positions:
                        #         route_positions[route_id] = []
                        #     route_positions[route_id].append((latitude, longitude))


                        time.sleep(70 + int(data['Header']['Timestamp']) - int(time.time()))
                        pre_data = data
                else:
                    print("sleep longer")
                    break
        else:
            # Sleep a short time to reduce CPU load
            time.sleep(0.2)
except KeyboardInterrupt:
    with open('DataCollected.txt', 'a') as file:
        for item in route_positions:
            file.write(str(item) + '\n')
    with open(f'temp.json', 'w') as f:
        json.dump(temp, f, indent=4)





"""
while True:
    url = f"https://www.samtrans.com/files/rt/vehiclepositions/SM.json?time={time.time() * 1000}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise error if status is not 200
        data = response.json()
        print("Fetched vehicle positions at timestamp:", data['Header']['Timestamp'])
        # Process or use the data dictionary as needed here

    except requests.RequestException as e:
        print("Error fetching data:", e)


    route_positions = []

    for entity in data["Entities"]:
        route_id = entity["Vehicle"]["Trip"]["RouteId"]
        direction = entity["Vehicle"]["Trip"]["DirectionId"]
        start_time = entity["Vehicle"]["Trip"]["StartTime"]
        latit = entity["Vehicle"]["Position"]["Latitude"]
        longi = entity["Vehicle"]["Position"]["Longitude"]
        timestamp = entity["Vehicle"]["Timestamp"]
        stop_id = entity["Vehicle"]["StopId"]

        route_positions.append((route_id, direction, latit, longi, timestamp, stop_id))

        # if route_id and latitude is not None and longitude is not None:
        #     if route_id not in route_positions:
        #         route_positions[route_id] = []
        #     route_positions[route_id].append((latitude, longitude))

    print(route_positions)

    time.sleep(interval)  # Wait before next request


"""
