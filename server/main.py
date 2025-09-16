# minimal_http.py  (Python ≥3.8)
import socket, pathlib

HOST, PORT = "0.0.0.0", 8080           # serve on all interfaces
doc_root = pathlib.Path("./public")    # folder with site files

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
            target = (doc_root / path.lstrip("/")).resolve()

            if target.is_file() and doc_root in target.parents:
                body = target.read_bytes()
                header = "HTTP/1.1 200 OK\r\n"
                header += f"Content-Length: {len(body)}\r\n\r\n"
            else:
                body = b"405 Not Found"
                header = "HTTP/1.1 404 Not Found\r\n"
                header += f"Content-Length: {len(body)}\r\n\r\n"

            conn.sendall(header.encode() + body)