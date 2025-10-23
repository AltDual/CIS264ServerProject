import json
busid = []
with open("AllCoordinates.txt", "r", encoding="utf-8") as f:
    allcoord = json.load(f)
    for bus in allcoord:
        busid.append(bus["field_route_id"][0]["value"])
        busid.sort()
with open('busList.txt', 'w') as file:
    for item in busid:
        file.write(str(item) + '\n')