import socket, pathlib
import requests
import json

HOST, PORT = "0.0.0.0", 8080
doc_root = pathlib.Path("./public")

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(10)
    print(f"Serving HTTP on {HOST}:{PORT} ...")

    while True:
        conn, addr = s.accept()
        with conn:
            request = conn.recv(1024).decode("utf-8", "ignore")
            path = request.split(" ")[1] if request else "/"

            # Handle API endpoint
            if path == "/get-vehicle-positions":
                try:
                    url = "https://www.samtrans.com/files/rt/vehiclepositions/SM.json"
                    response = requests.get(url)
                    response.raise_for_status()
                    body = response.content
                    header = "HTTP/1.1 200 OK\r\n"
                    header += "Content-Type: application/json\r\n"
                    header += f"Content-Length: {len(body)}\r\n\r\n"
                except Exception as e:
                    body = json.dumps({"error": str(e)}).encode()
                    header = "HTTP/1.1 500 Internal Server Error\r\n"
                    header += "Content-Type: application/json\r\n"
                    header += f"Content-Length: {len(body)}\r\n\r\n"
            else:
                # Handle static files
                target = (doc_root / path.lstrip("/")).resolve()

                if target.is_dir():
                    target = target / "index.html"

                if target.is_file():
                    body = target.read_bytes()
                    header = "HTTP/1.1 200 OK\r\n"
                    header += f"Content-Length: {len(body)}\r\n\r\n"
                else:
                    body = b"404 Not Found"
                    header = "HTTP/1.1 404 Not Found\r\n"
                    header += f"Content-Length: {len(body)}\r\n\r\n"

            conn.sendall(header.encode() + body)