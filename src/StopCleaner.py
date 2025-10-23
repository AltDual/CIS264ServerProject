import json
import math
import numpy as np
import haversine as h

busName = "250"

arr = np.load(f'{busName}/{busName}Coord.npy')
arrlength = arr.shape[1]


# Load the stops JSON file
with open(f'{busName}/{busName}Stops.json', "r", encoding="utf-8") as f:
    stops = json.load(f)

extracted_stops = [[],[]]

stopsDic = {}
def appendDic(direction, busstopid, name):
    if not direction in stopsDic:
        stopsDic[direction] = {busstopid: name}
    else:
        stopsDic[direction][busstopid] = name

for key in stops.keys():
    stopid = int(key)
    name = stops[key]["title"][0]["value"]
    lat = stops[key]["field_location"][0]["lat"]
    lon = stops[key]["field_location"][0]["lon"]
    routeDirection = 0
    min_index = np.zeros(2, dtype=np.uint32) # for testing
    min_indexfinal = np.zeros(2, dtype=np.uint32) # for storing the answers
    min_value = np.zeros(2, dtype=np.float64)
    another_minindex = np.zeros(2, dtype=np.uint32)
    is_another_stop = False
    # search in direction 0 and 1
    for di in range(2):
        # decide how many coordinates
        dirlength = arrlength
        for i in range(arrlength - 1, -1, -1):
            if arr[di][i][0] == 0:  # the first zero in the di direction
                dirlength = i
            else:
                break

        min_value[di] = h.hav(arr[di][0][0], arr[di][0][1], lat, lon)
        i = 1
        while i < dirlength - 1: # -1 because we need at least one next point to construct a vector
            dis = h.hav(arr[di][i][0], arr[di][i][1], lat, lon)
            if dis < min_value[di]:
                min_index[di] = i
                min_value[di] = dis
            i += 1
        minindexlist = []
        for d in range(dirlength):
            if min_value[di] == h.hav(arr[di][d][0], arr[di][d][1], lat, lon):
                minindexlist.append(d)
        for index in minindexlist:
            min_index[di] = index
            # Construct vectors
            # The vector from the min to the next. LAT LON <=> YX !!!
            x1 = arr[di][min_index[di]+1][1] - arr[di][min_index[di]][1]
            y1 = arr[di][min_index[di]+1][0] - arr[di][min_index[di]][0]
            # The vector from the min route point to the bus stop
            x2 = lon - arr[di][min_index[di]][1]
            y2 = lat - arr[di][min_index[di]][0]
            cross = x1 * y2 - y1 * x2
            perdis = abs(y1 * lon - x1 * lat + arr[di][min_index[di]+1][1] * arr[di][min_index[di]][0] - arr[di][min_index[di]][1] * arr[di][min_index[di]+1][0])/math.sqrt(x1*x1+y1*y1)
            if cross < 0 and perdis < 0.015 and min_value[di] < 0.08: # min_value ensure the bus stop is not crossing a street block
                routeDirection += (di+1)
                min_indexfinal[di] = index

    if routeDirection == 1 or routeDirection == 2:
        extracted_stops[routeDirection-1].append([stopid, lat, lon, min_indexfinal[routeDirection-1].item(), name, routeDirection])
        appendDic(routeDirection-1, stopid, name)
    elif routeDirection == 3:
        extracted_stops[0].append([stopid,  lat, lon, min_indexfinal[0].item(), name, 1]) # routeDirection is either 1 or 2, 1 larger than the list index
        appendDic(0, stopid, name)
        extracted_stops[1].append([stopid,  lat, lon, min_indexfinal[1].item(), name, 2])
        appendDic(1, stopid, name)
    else:
        extracted_stops.append([stopid, name, lat, lon, routeDirection, "error"])
    # if routeDirection == 1 or routeDirection == 2:
    #     extracted_stops.append([name, lat, lon, routeDirection, min_value[routeDirection-1], min_index[routeDirection-1]])
    # elif routeDirection == 3:
    #     extracted_stops.append([name, lat, lon, routeDirection, min_value[0], min_index[0], min_value[1], min_index[1]])
    # else:
    #     extracted_stops.append([name, lat, lon, routeDirection, "error"])

extracted_stops[0].sort(key=lambda e: e[3])
extracted_stops[1].sort(key=lambda e: e[3])

listLen = max(len(extracted_stops[0]), len(extracted_stops[1]))
dtype = [('stopid', np.int32), ('lat', np.float64), ('lon', np.float64), ('nIndex', np.int32)]
stopsArr = np.zeros((2, listLen), dtype=dtype)
for x in range(2):
    for y in range(len(extracted_stops[x])):
        for z in range(4):
            stopsArr[x][y][z] = extracted_stops[x][y][z]

np.save(f'{busName}/{busName}StopsArr', stopsArr)

with open(f'{busName}/{busName}StopsDic.json', "w") as json_file:
    json.dump(stopsDic, json_file, indent=4)

with open(f'{busName}/{busName}StopsCleaned.txt', 'w') as file:
    for item in extracted_stops[0]:
        file.write(str(item) + '\n')
    for item in extracted_stops[1]:
        file.write(str(item) + '\n')
    if len(extracted_stops) >= 3:
        for item in extracted_stops[2:]:
            file.write(str(item) + '\n')



