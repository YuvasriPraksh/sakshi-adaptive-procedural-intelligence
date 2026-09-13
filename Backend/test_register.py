#!/usr/bin/env python3
import urllib.request
import json

url = "http://localhost:8000/api/v1/auth/register"
payload = {
    "name": "Test Officer",
    "email": "test.officer@sakshi.gov.in",
    "password": "Simple123"  # Short password
}

print(f"Password: {payload['password']}")
print(f"Password length: {len(payload['password'])} chars, {len(payload['password'].encode('utf-8'))} bytes")

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        text = response.read().decode('utf-8')
        print(f"Status: {response.status}")
        print(f"Response: {text}")
        try:
            data = json.loads(text)
            print("\nParsed JSON:")
            print(json.dumps(data, indent=2))
        except Exception as e:
            print(f"JSON parse error: {e}")
except urllib.error.HTTPError as e:
    text = e.read().decode('utf-8')
    print(f"Status: {e.code}")
    print(f"Error Response: {text}")
    try:
        data = json.loads(text)
        print("\nParsed JSON:")
        print(json.dumps(data, indent=2))
    except Exception as ex:
        print(f"JSON parse error: {ex}")
