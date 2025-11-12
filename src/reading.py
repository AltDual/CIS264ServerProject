import json
import numpy as np

with open('temp.json', 'r') as f:
    temp = json.load(f)

# The inputs
busName = '250'
direction_str = '1'
begin_time = '093000'
target_stop = 341190


# The intermediates
stop_coord_index = None
live_bus_position_index = 5

matching_keys = [k for k in temp[busName][direction_str] if str(k).startswith(begin_time)]
print(matching_keys)

with open(f'{busName}/{busName}Stops.json', "r", encoding="utf-8") as f:
    stops = json.load(f)

routeA = np.load(f'{busName}/{busName}Coord.npy')
stopsArr = np.load(f'{busName}/{busName}StopsArr.npy')
stopsArrLen = stopsArr[direction_str][stopsArr.shape[1]-1][0]



for i in range(stopsArrLen):
    if stopsArr[direction_str][i][0] == target_stop:
        stop_coord_index = stopsArr[direction_str][i][3]

distance_endpoint = routeA[direction_str][stop_coord_index][2]
distance_startpoint = routeA[direction_str][live_bus_position_index][2]

# bus_distance = routeA[direction_str][min_index][2]
# for things in matching_keys:
#     temp_min_index = 0
#     dis_apart = abs(temp[busName][direction_str][things][0][0] - )
#     for i in range(1, len(temp[busName][direction_str][things])):
#         if temp[busName][direction_str][things][i][0]


