#!/usr/bin/env python3
"""
Nidaan API Test Script
Usage: python test_api.py <API_URL>
Example: python test_api.py https://abc123.execute-api.ap-south-1.amazonaws.com/prod
"""

import sys
import json
import urllib.request
import urllib.error

# ── Get API URL ──────────────────────────────
if len(sys.argv) < 2:
    print("Usage: python test_api.py <API_URL>")
    print("Example: python test_api.py https://abc123.execute-api.ap-south-1.amazonaws.com/prod")
    sys.exit(1)

BASE_URL = sys.argv[1].rstrip('/')

SAMPLE_REPORT = """Complete Blood Count:
- Hemoglobin: 13.2 g/dL (Normal)
- WBC Count: 7,800/uL (Normal)
Diabetic Panel:
- HbA1c: 7.2% (Elevated)
- Fasting Blood Sugar: 145 mg/dL (High)
Recommendation: Continue diabetes medication and diet control."""

PASS = "✅"
FAIL = "❌"
results = []

def call_api(path, method="GET", body=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except Exception as e:
        return 0, {"error": str(e)}

def test(name, path, method="GET", body=None, check_key=None):
    print(f"\n{'─'*50}")
    print(f"Test: {name}")
    print(f"  {method} {path}")
    if body:
        print(f"  Body: {json.dumps(body, indent=2)[:120]}...")

    status, data = call_api(path, method, body)

    if status == 200:
        print(f"  Status: {status} {PASS}")
        if check_key and check_key in data:
            value = data[check_key]
            preview = str(value)[:120]
            print(f"  {check_key}: {preview}")
            results.append((name, True))
        elif check_key and check_key not in data:
            print(f"  {FAIL} Missing key '{check_key}' in response")
            print(f"  Got: {data}")
            results.append((name, False))
        else:
            print(f"  Response: {json.dumps(data)[:120]}")
            results.append((name, True))
    else:
        print(f"  Status: {status} {FAIL}")
        print(f"  Error: {data}")
        results.append((name, False))

# ── Run Tests ────────────────────────────────

print("\n" + "="*50)
print("  Nidaan API Test Suite")
print(f"  Target: {BASE_URL}")
print("="*50)

# 1. Health check
test(
    "Health Check",
    "/health",
    method="GET",
    check_key="status"
)

# 2. Simplify medical text
test(
    "Simplify Medical Text (English)",
    "/simplify",
    method="POST",
    body={"medical_text": SAMPLE_REPORT},
    check_key="simplified_text"
)

# 3. Translate to Hindi
test(
    "Translate to Hindi",
    "/translate",
    method="POST",
    body={"text": "Your blood sugar is high. Keep taking your medicine.", "target_language": "hi"},
    check_key="translated_text"
)

# 4. Translate to Tamil
test(
    "Translate to Tamil",
    "/translate",
    method="POST",
    body={"text": "Your blood sugar is high. Keep taking your medicine.", "target_language": "ta"},
    check_key="translated_text"
)

# 5. Translate to English (passthrough)
test(
    "Translate to English (passthrough)",
    "/translate",
    method="POST",
    body={"text": "Hello", "target_language": "en"},
    check_key="translated_text"
)

# 6. Simplify and translate to Hindi
test(
    "Simplify + Translate to Hindi",
    "/simplify-and-translate",
    method="POST",
    body={"medical_text": SAMPLE_REPORT, "target_language": "hi"},
    check_key="translated_text"
)

# 7. Simplify and translate to Tamil
test(
    "Simplify + Translate to Tamil",
    "/simplify-and-translate",
    method="POST",
    body={"medical_text": SAMPLE_REPORT, "target_language": "ta"},
    check_key="translated_text"
)

# 8. Missing body validation
test(
    "Validation - Missing text (expect 400)",
    "/simplify",
    method="POST",
    body={}
)

# 9. 404 check
test(
    "404 - Unknown endpoint",
    "/unknown"
)

# ── Summary ──────────────────────────────────
print("\n" + "="*50)
print("  Results Summary")
print("="*50)
passed = sum(1 for _, ok in results if ok)
total = len(results)
for name, ok in results:
    print(f"  {'✅' if ok else '❌'} {name}")
print(f"\n  {passed}/{total} tests passed")
if passed == total:
    print("\n🎉 All tests passed! Your API is working correctly.")
else:
    print(f"\n⚠️  {total - passed} test(s) failed. Check the output above.")
print("="*50 + "\n")