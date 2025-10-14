import json
import numpy as np
import math
import haversine as h


# data[0] is the list for Eastbound coordinates, in lon, lat

with open('250Coord.json', 'r') as f:
    data = json.load(f)
    clen = [len(data[0]), len(data[1]), max(len(data[0]), len(data[1]))]
    arr = np.zeros((2, clen[2], 3), dtype=np.float64)
    for cdir in range(2):
        arr[cdir][0][0], arr[cdir][0][1] = data[cdir][0][1],data[cdir][0][0]

        arr[cdir][1][0], arr[cdir][1][1] = data[cdir][1][1], data[cdir][1][0]
        arr[cdir][1][2] = h.haversine_distance(arr[cdir][0][0], arr[cdir][0][1], arr[cdir][1][0], arr[cdir][1][1])

        for i in range(2, clen[cdir]):
            arr[cdir][i][0] = data[cdir][i][1] # lat
            arr[cdir][i][1] = data[cdir][i][0] # lon
            d_inbetween = h.haversine_distance(arr[cdir][i-1][0], arr[cdir][i-1][1], arr[cdir][i][0], arr[cdir][i][1]) # distance
            arr[cdir][i][2] = d_inbetween + arr[cdir][i-1][2]
    # np.savetxt('250East.txt', arr[0])
    # np.savetxt('250West.txt', arr[1])
    np.save('250Coord.npy', arr)
    #arr = np.fromfile('250Coord.npy', dtype=np.float64)