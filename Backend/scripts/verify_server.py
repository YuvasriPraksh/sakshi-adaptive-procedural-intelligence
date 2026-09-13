"""
Quick server verification script.
Run after uvicorn is already started in a separate process.
"""
import http.client
import json
import sys

HOST = "127.0.0.1"
PORT = 8000

TESTS = [
    ("GET", "/",                      {"message": "SAKSHI Backend Running"}),
    ("GET", "/health",                {"status": "healthy"}),
    ("GET", "/api/v1/public/ping",    {"ping": "pong"}),
    ("GET", "/api/v1/public/status",  {"api": "v1", "status": "operational"}),
]

def check(method, path, expected):
    conn = http.client.HTTPConnection(HOST, PORT, timeout=5)
    conn.request(method, path)
    resp = conn.getresponse()
    body = json.loads(resp.read().decode())
    conn.close()

    status_ok = resp.status == 200
    body_ok   = body == expected

    mark = "✅" if (status_ok and body_ok) else "❌"
    print(f"{mark}  {method} {path}")
    print(f"     Status : {resp.status}")
    print(f"     Body   : {body}")
    if not body_ok:
        print(f"     Expected: {expected}")
    return status_ok and body_ok

all_passed = all(check(m, p, e) for m, p, e in TESTS)

# Docs endpoint (just check 200)
conn = http.client.HTTPConnection(HOST, PORT, timeout=5)
conn.request("GET", "/docs")
resp = conn.getresponse()
conn.close()
docs_ok = resp.status == 200
print(f"{'✅' if docs_ok else '❌'}  GET /docs  →  {resp.status}")

print()
if all_passed and docs_ok:
    print("🎉  All checks passed — SAKSHI Backend is running correctly!")
    sys.exit(0)
else:
    print("⚠️  Some checks failed.")
    sys.exit(1)
