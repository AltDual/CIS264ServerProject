import json
import numpy as np
import math
import haversine as h
busName = "CSM"
# data[0] is the list for Eastbound coordinates, in lon, lat

def remove_neighboring_duplicates(lst):
    i = 0
    while i < len(lst) - 1:
        if lst[i] == lst[i + 1]:
            lst.pop(i + 1)  # Remove the duplicate neighbor
        else:
            i += 1
    return lst

# use clen and cdir otherwise they are existing functions
with open(f'{busName}/{busName}Coord.json', 'r') as f:
    data = json.load(f)
    clen = [len(data[0]), len(data[1]), max(len(data[0]), len(data[1]))]
    arr = np.zeros((2, clen[2], 3), dtype=np.float64)
    for cdir in range(2):
        cdata = remove_neighboring_duplicates(data[cdir])
        clen = len(cdata) # clen shadowed to the list len of no duplications
        # first coordinate
        arr[cdir][0][0], arr[cdir][0][1] = cdata[0][1],cdata[0][0]
        # second coordinate
        arr[cdir][1][0], arr[cdir][1][1] = cdata[1][1], cdata[1][0]
        arr[cdir][1][2] = h.haversine_distance(arr[cdir][0][0], arr[cdir][0][1], arr[cdir][1][0], arr[cdir][1][1])

        for i in range(2, clen):
            arr[cdir][i][0] = cdata[i][1] # lat
            arr[cdir][i][1] = cdata[i][0] # lon
            d_inbetween = h.haversine_distance(arr[cdir][i-1][0], arr[cdir][i-1][1], arr[cdir][i][0], arr[cdir][i][1]) # distance
            arr[cdir][i][2] = d_inbetween + arr[cdir][i-1][2]
    # np.savetxt(f'{busName}/{busName}East.txt', arr[0])
    # np.savetxt(f'{busName}/{busName}West.txt', arr[1])
    np.save(f'{busName}/{busName}Coord', arr)
    # arr = np.fromfile('250Coord.npy', dtype=np.float64)