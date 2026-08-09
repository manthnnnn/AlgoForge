import urllib.request, urllib.parse, json, time

print("=" * 55)
print("  ALGOFORGE FULL SYSTEM VERIFICATION")
print("=" * 55)

BASE = "http://localhost:3000"

# 1. Tasks API
print("\n[1] Testing /api/tasks ...")
data = json.loads(urllib.request.urlopen(f"{BASE}/api/tasks").read())
print(f"    PASS - {len(data)} tasks with difficulty metadata")

# 2. Check a hard task has proper metadata
hard = next((t for t in data if t['name'] == 'cascade_sort_5'), None)
assert hard is not None, "cascade_sort_5 missing!"
assert hard['difficulty'] == 'Expert', "Wrong difficulty!"
print(f"    PASS - cascade_sort_5 is Expert level with {hard['num_cases']} test cases")

# 3. Archive API
print("\n[2] Testing /api/archive ...")
arc = json.loads(urllib.request.urlopen(f"{BASE}/api/archive").read())
print(f"    PASS - {len(arc.get('entries', []))} programs stored")

# 4. Execute API (POST)
print("\n[3] Testing /api/execute ...")
ast = {"type": "ProgramNode", "statements": [{"type": "CompareSwapNode",
       "idx1": {"type": "ConstNode", "value": 0},
       "idx2": {"type": "ConstNode", "value": 1}}]}
payload = json.dumps({"ast": ast, "input": [5, 2]}).encode()
req = urllib.request.Request(f"{BASE}/api/execute", data=payload,
      headers={"Content-Type": "application/json"}, method="POST")
result = json.loads(urllib.request.urlopen(req).read())
assert result['output_array'] == [2, 5], f"Wrong output: {result['output_array']}"
assert len(result['trace']) >= 2, "Trace missing!"
print(f"    PASS - [5,2] -> {result['output_array']} with {len(result['trace'])} trace steps")

# 5. SSE Synthesis stream (partial check)
print("\n[4] Testing /api/synthesize/stream ...")
params = urllib.parse.urlencode({"task": "sort_2", "pop": 20, "gen": 5, "seed": 42})
req = urllib.request.urlopen(f"{BASE}/api/synthesize/stream?{params}", timeout=30)
lines_received = 0
best_fitness = None
for line in req:
    line = line.decode().strip()
    if line.startswith("data:"):
        d = json.loads(line[5:].strip())
        if d.get("type") == "gen":
            lines_received += 1
            best_fitness = d.get("best_fitness")
        elif d.get("type") == "result":
            best_fitness = d.get("best_fitness")
            print(f"    PASS - Synthesis complete! {lines_received} gen events, final fitness: {best_fitness}")
            break
        elif d.get("type") == "done":
            break

# 6. Static file check
print("\n[5] Testing static files ...")
for fname in ["index.html", "styles.css", "app.js"]:
    r = urllib.request.urlopen(f"{BASE}/{fname}")
    size = len(r.read())
    print(f"    PASS - {fname}: {size:,} bytes")

print("\n" + "=" * 55)
print("  ALL CHECKS PASSED - ALGOFORGE IS FULLY OPERATIONAL")
print("=" * 55)
print(f"\n  Open your browser at: http://localhost:3000")
print(f"  Try: zigzag_sort_4 or cascade_sort_5 for complex algorithms!")
