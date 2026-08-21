/* ═══════════════════════════════════════════════════════════
   ALGOFORGE — Universal Knowledge Oracle v1.0
   Covers: Physics · Algorithms · Mathematics · Engineering · Biology
   Groq AI fallback for any unknown query
   ═══════════════════════════════════════════════════════════ */

const ORACLE_KB = [
  // ──── PHYSICS ────
  { id:'gravity', domain:'physics', tags:['gravity','force','mass','newton','orbit','acceleration'],
    name:"Newton's Law of Universal Gravitation",
    emoji:'🍎', formula:'F = G·m₁·m₂ / r²',
    eli5:"Every object in the universe pulls every other object toward it. The heavier they are and the closer they are, the stronger the pull.",
    explanation:"The gravitational force between two masses m₁ and m₂ is directly proportional to the product of their masses and inversely proportional to the square of the distance r between their centres. G = 6.674×10⁻¹¹ N·m²/kg² is the universal gravitational constant.",
    complexity:"Constant-time to evaluate, O(N²) for N-body simulation",
    code:`import numpy as np

G = 6.674e-11  # N·m²/kg²

def gravitational_force(m1, m2, r):
    """Returns gravitational force in Newtons."""
    return G * m1 * m2 / r**2

# Example: Earth–Moon
F = gravitational_force(5.97e24, 7.35e22, 3.84e8)
print(f"Earth-Moon gravity: {F:.3e} N")  # ≈ 1.98e20 N

# N-body 2D simulation (Euler integration)
def simulate(bodies, dt=3600, steps=100):
    """bodies: list of dicts with keys: mass, pos=[x,y], vel=[vx,vy]"""
    pos = np.array([b['pos'] for b in bodies], dtype=float)
    vel = np.array([b['vel'] for b in bodies], dtype=float)
    mass = np.array([b['mass'] for b in bodies])
    for _ in range(steps):
        acc = np.zeros_like(pos)
        for i in range(len(bodies)):
            for j in range(len(bodies)):
                if i == j: continue
                r_vec = pos[j] - pos[i]
                r_mag = np.linalg.norm(r_vec) + 1e-9
                acc[i] += G * mass[j] / r_mag**2 * (r_vec / r_mag)
        vel += acc * dt
        pos += vel * dt
    return pos, vel
`},

  { id:'kepler', domain:'physics', tags:['kepler','orbit','planet','period','ellipse','astronomy'],
    name:"Kepler's Third Law of Planetary Motion",
    emoji:'🪐', formula:'T² ∝ a³  →  T = 2π√(a³/GM)',
    eli5:"The farther a planet is from the Sun, the longer its year. A planet twice as far takes 2^(3/2) ≈ 2.83 times longer to orbit.",
    explanation:"The square of the orbital period T equals (4π²/GM) times the cube of the semi-major axis a. This connects orbital shape to timing and is the same formula NASA uses to find exoplanet masses from transit data.",
    complexity:"O(1) calculation",
    code:`import math

G = 6.674e-11
M_sun = 1.989e30  # kg

def orbital_period(a_metres):
    """Semi-major axis in metres → period in seconds."""
    return 2 * math.pi * math.sqrt(a_metres**3 / (G * M_sun))

planets = {
    'Mercury': 5.79e10, 'Venus': 1.08e11,
    'Earth':   1.50e11, 'Mars':  2.28e11,
}
for name, a in planets.items():
    T_days = orbital_period(a) / 86400
    print(f"{name}: {T_days:.1f} days")
`},

  { id:'thermodynamics', domain:'physics', tags:['heat','entropy','thermodynamics','temperature','energy','carnot'],
    name:"Second Law of Thermodynamics",
    emoji:'🔥', formula:'ΔS_universe ≥ 0   |   η_Carnot = 1 - T_cold/T_hot',
    eli5:"Heat always flows from hot to cold, never backwards. You can never build a perfectly efficient engine — some energy always becomes waste heat.",
    explanation:"The total entropy of an isolated system never decreases over time. The Carnot efficiency gives the absolute maximum efficiency any heat engine operating between temperatures T_hot and T_cold can achieve.",
    complexity:"O(1) for efficiency calculation",
    code:`def carnot_efficiency(T_hot_K, T_cold_K):
    """Maximum possible thermal efficiency between two reservoirs."""
    assert T_hot_K > T_cold_K > 0, "Temperatures must be positive Kelvin"
    return 1 - T_cold_K / T_hot_K

# Steam turbine: 600°C → 30°C
T_h = 600 + 273.15
T_c =  30 + 273.15
eta = carnot_efficiency(T_h, T_c)
print(f"Max efficiency: {eta*100:.1f}%")  # ≈ 65%

# Entropy change for heat transfer Q at temperature T
def delta_entropy(Q_joules, T_kelvin):
    return Q_joules / T_kelvin  # J/K
`},

  { id:'relativity', domain:'physics', tags:['einstein','relativity','mass','energy','light','speed'],
    name:"Einstein's Mass-Energy Equivalence",
    emoji:'⚡', formula:'E = mc²',
    eli5:"Mass and energy are the same thing in different forms. A tiny bit of mass contains an enormous amount of energy because c (speed of light) is huge.",
    explanation:"c = 299,792,458 m/s. Even 1 gram of matter contains 89.9 terajoules of energy — equivalent to the Hiroshima bomb. This is the foundation of nuclear energy and particle physics.",
    complexity:"O(1)",
    code:`c = 299_792_458  # m/s

def mass_to_energy(mass_kg):
    """Returns energy in Joules."""
    return mass_kg * c**2

def energy_to_mass(energy_J):
    return energy_J / c**2

# 1 gram → energy
E = mass_to_energy(0.001)
print(f"1g → {E:.3e} J  ({E/4.184e9:.1f} tonnes TNT)")

# Annual fission yield of U-235 power plant
fission_mass_kg = 1.0  # ~1 kg of U-235 fissioned per day
print(f"1 kg U-235 energy: {mass_to_energy(fission_mass_kg)*0.0008:.3e} J (fission uses ~0.08% mass)")
`},

  { id:'waves', domain:'physics', tags:['wave','frequency','wavelength','sound','light','oscillation'],
    name:"Wave Equation & Doppler Effect",
    emoji:'🌊', formula:'v = f·λ   |   f_obs = f_src·(v ± v_obs)/(v ∓ v_src)',
    eli5:"Sound and light travel in waves. When a source moves toward you, the waves bunch up and sound higher (sirens on ambulances).",
    explanation:"Wave speed v equals frequency f times wavelength λ. The Doppler effect shifts the observed frequency when source or observer moves relative to the wave medium.",
    complexity:"O(1)",
    code:`def doppler_frequency(f_src, v_wave, v_observer=0, v_source=0,
                         observer_approaching=True, source_approaching=True):
    """All velocities in m/s. Returns observed frequency."""
    sign_obs = 1 if observer_approaching else -1
    sign_src = -1 if source_approaching else 1
    return f_src * (v_wave + sign_obs * v_observer) / (v_wave + sign_src * v_source)

v_sound = 343  # m/s at 20°C
# Ambulance siren 800 Hz approaching at 30 m/s
f_heard = doppler_frequency(800, v_sound, v_source=30, source_approaching=True)
print(f"Approaching siren: {f_heard:.1f} Hz")  # ~875 Hz

f_gone = doppler_frequency(800, v_sound, v_source=30, source_approaching=False)
print(f"Receding siren: {f_gone:.1f} Hz")     # ~735 Hz
`},

  // ──── ALGORITHMS ────
  { id:'dijkstra', domain:'algorithms', tags:['dijkstra','shortest path','graph','routing','weight','network'],
    name:"Dijkstra's Shortest Path Algorithm",
    emoji:'🗺️', formula:'dist[v] = min(dist[v], dist[u] + w(u,v))',
    eli5:"Like Google Maps: start from your location, always explore the closest unvisited city first, update distances as you go. Guaranteed to find the shortest route.",
    explanation:"Greedy BFS with a priority queue. Visits each node in O(log V) time (heap). Works on weighted directed graphs with non-negative edge weights. Used in routing protocols (OSPF), GPS navigation, game AI pathfinding.",
    complexity:"O((V + E) log V) with binary heap",
    code:`import heapq

def dijkstra(graph, start):
    """graph: {node: [(neighbour, weight), ...]}
    Returns dict of shortest distances from start."""
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    heap = [(0, start)]  # (distance, node)
    
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # stale entry
        for v, weight in graph.get(u, []):
            new_dist = dist[u] + weight
            if new_dist < dist[v]:
                dist[v] = new_dist
                heapq.heappush(heap, (new_dist, v))
    return dist

# Example: city road network
graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('D', 5), ('C', 1)],
    'C': [('B', 1), ('D', 8), ('E', 10)],
    'D': [('E', 2)],
    'E': [],
}
print(dijkstra(graph, 'A'))
# {'A': 0, 'B': 3, 'C': 2, 'D': 8, 'E': 10}
`},

  { id:'sliding_window', domain:'algorithms', tags:['sliding window','subarray','sum','maximum','substring','stream'],
    name:"Sliding Window Technique",
    emoji:'🪟', formula:'window = arr[l..r]  →  shrink/expand to satisfy constraint',
    eli5:"Instead of checking every possible subarray (slow), keep a 'window' that slides along the array, adding from the right and removing from the left.",
    explanation:"Converts O(N²) brute-force subarray problems into O(N). Two variants: fixed-size (always move both pointers) and variable-size (expand right, shrink left when constraint violated). Core to streaming data processing.",
    complexity:"O(N) time, O(1) or O(K) space",
    code:`def max_sum_subarray(arr, k):
    """Maximum sum of any contiguous subarray of size k."""
    if len(arr) < k:
        return None
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum

def longest_substring_k_distinct(s, k):
    """Longest substring with at most k distinct characters."""
    from collections import defaultdict
    freq = defaultdict(int)
    left = max_len = 0
    for right, ch in enumerate(s):
        freq[ch] += 1
        while len(freq) > k:
            freq[s[left]] -= 1
            if freq[s[left]] == 0:
                del freq[s[left]]
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len

print(max_sum_subarray([2, 1, 5, 1, 3, 2], 3))  # 9
print(longest_substring_k_distinct("eceba", 2))   # 3
`},

  { id:'dp', domain:'algorithms', tags:['dynamic programming','memoization','dp','knapsack','fibonacci','optimal','subproblem'],
    name:"Dynamic Programming",
    emoji:'📊', formula:'dp[i] = optimal(dp[i-1], dp[i-2], ...) + current_cost',
    eli5:"Break a big problem into smaller overlapping subproblems. Solve each once, cache the answer. Never recompute the same thing twice.",
    explanation:"Two approaches: top-down (recursive + memoization) and bottom-up (iterative table). Applies when the problem has optimal substructure and overlapping subproblems. Transforms exponential brute force into polynomial.",
    complexity:"O(N·M) for 2D problems, O(N) for 1D",
    code:`# Classic: 0/1 Knapsack — O(N·W)
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])
    return dp[n][capacity]

print(knapsack([2,3,4,5], [3,4,5,6], 5))  # 7

# Classic: Longest Common Subsequence — O(N·M)
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

print(lcs("ABCBDAB", "BDCABA"))  # 4
`},

  { id:'bfs_dfs', domain:'algorithms', tags:['bfs','dfs','graph','traversal','tree','search','connected'],
    name:"BFS & DFS Graph Traversal",
    emoji:'🌳', formula:'BFS: queue FIFO | DFS: stack LIFO / recursion',
    eli5:"BFS explores level by level (like ripples in water). DFS dives deep first then backtracks (like exploring a maze by always turning left).",
    explanation:"BFS finds shortest paths in unweighted graphs and works for level-order tree traversal. DFS finds connected components, detects cycles, topological sort, and is the basis for backtracking algorithms.",
    complexity:"O(V + E) both",
    code:`from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

def dfs(graph, start, visited=None):
    if visited is None: visited = set()
    visited.add(start)
    result = [start]
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            result += dfs(graph, neighbor, visited)
    return result

graph = {'A': ['B','C'], 'B': ['D','E'], 'C': ['F'], 'D':[], 'E':[], 'F':[]}
print("BFS:", bfs(graph, 'A'))  # ['A','B','C','D','E','F']
print("DFS:", dfs(graph, 'A'))  # ['A','B','D','E','C','F']
`},

  { id:'binary_search', domain:'algorithms', tags:['binary search','sorted','search','find','log','lookup'],
    name:"Binary Search",
    emoji:'🎯', formula:'mid = (lo + hi) // 2  →  halve search space each step',
    eli5:"Like guessing a number 1–100: always guess the middle. The answer is either lower or higher, so you eliminate half the possibilities every time.",
    explanation:"Requires a sorted (or monotone) domain. Each comparison halves the search space, yielding O(log N). The abstraction generalises to 'binary search on the answer' for optimisation problems.",
    complexity:"O(log N) time, O(1) space",
    code:`def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1  # not found

# Search on answer: find minimum speed to eat all bananas in H hours
def min_eating_speed(piles, H):
    import math
    def can_finish(speed):
        return sum(math.ceil(p/speed) for p in piles) <= H
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_finish(mid): hi = mid
        else: lo = mid + 1
    return lo

print(binary_search([1,3,5,7,9,11,13], 7))    # 3
print(min_eating_speed([3,6,7,11], 8))          # 4
`},

  { id:'hashing', domain:'algorithms', tags:['hash','hashmap','dictionary','lookup','collision','O(1)','cache'],
    name:"Hash Tables",
    emoji:'#️⃣', formula:'index = hash(key) % table_size',
    eli5:"Imagine a library where every book's location is computed from its title in one step, instead of searching shelf by shelf.",
    explanation:"A hash function maps keys to array indices. Collisions (two keys hash to same index) are resolved by chaining or open addressing. Average O(1) insert/lookup/delete. Foundation of databases, caches, and compilers.",
    complexity:"O(1) average, O(N) worst case (all collisions)",
    code:`# Python dict is a hash table under the hood
# Let's implement a basic one with chaining

class HashMap:
    def __init__(self, size=16):
        self.size = size
        self.buckets = [[] for _ in range(size)]
    
    def _hash(self, key):
        return hash(key) % self.size
    
    def put(self, key, value):
        idx = self._hash(key)
        for i, (k, v) in enumerate(self.buckets[idx]):
            if k == key:
                self.buckets[idx][i] = (key, value)
                return
        self.buckets[idx].append((key, value))
    
    def get(self, key, default=None):
        idx = self._hash(key)
        for k, v in self.buckets[idx]:
            if k == key: return v
        return default
    
    def delete(self, key):
        idx = self._hash(key)
        self.buckets[idx] = [(k,v) for k,v in self.buckets[idx] if k != key]

hm = HashMap()
hm.put("name", "Alice"); hm.put("age", 25)
print(hm.get("name"))  # Alice
print(hm.get("age"))   # 25
`},

  // ──── MATHEMATICS ────
  { id:'fourier', domain:'mathematics', tags:['fourier','signal','frequency','fft','transform','spectrum','audio'],
    name:"Fourier Transform",
    emoji:'📡', formula:'F(ω) = ∫ f(t)·e^(-iωt) dt   |   FFT: O(N log N)',
    eli5:"Any complex wave (music, heartbeat, earthquake signal) is just a sum of simple sine waves. The Fourier transform figures out which frequencies are present and how strong each is.",
    explanation:"Decomposes a time-domain signal into its frequency components. The Fast Fourier Transform (FFT) computes this in O(N log N) instead of O(N²). Foundation of audio compression (MP3), image compression (JPEG), MRI, spectral analysis.",
    complexity:"O(N log N) FFT",
    code:`import numpy as np
import matplotlib.pyplot as plt

def analyse_signal(signal, sample_rate=1000):
    """Decompose signal into frequency components."""
    N = len(signal)
    fft_vals = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(N, d=1/sample_rate)
    amplitudes = np.abs(fft_vals) / N * 2
    return freqs, amplitudes

# Synthesise a signal with 3 frequency components
t = np.linspace(0, 1, 1000, endpoint=False)
signal = (np.sin(2*np.pi*5*t) +       # 5 Hz
          0.5*np.sin(2*np.pi*20*t) +   # 20 Hz
          0.3*np.sin(2*np.pi*50*t))    # 50 Hz

freqs, amps = analyse_signal(signal, sample_rate=1000)
# Peaks at 5, 20, 50 Hz
top = sorted(zip(amps, freqs), reverse=True)[:5]
for amp, freq in top:
    if amp > 0.1:
        print(f"Frequency: {freq:.1f} Hz  Amplitude: {amp:.2f}")
`},

  { id:'probability', domain:'mathematics', tags:['probability','bayes','statistics','random','distribution','prior','posterior'],
    name:"Bayes' Theorem",
    emoji:'🎲', formula:"P(A|B) = P(B|A)·P(A) / P(B)",
    eli5:"Update your belief about A happening after you learn B happened. Medical tests, spam filters, and self-driving cars all work this way.",
    explanation:"Relates conditional probabilities. P(A) is the prior belief; P(A|B) is the posterior belief after observing evidence B. Foundational to Bayesian statistics, Naive Bayes classifiers, SLAM in robotics.",
    complexity:"O(1) for discrete; O(N) for updates over N events",
    code:`def bayes_update(prior, likelihood_given_positive, likelihood_given_negative):
    """Classic disease test example.
    prior: P(disease)
    likelihood_given_positive: P(test_pos | disease)  — sensitivity
    likelihood_given_negative: P(test_pos | no_disease) — false positive rate
    Returns P(disease | test_positive)
    """
    p_pos = prior * likelihood_given_positive + (1 - prior) * likelihood_given_negative
    posterior = (likelihood_given_positive * prior) / p_pos
    return posterior

# COVID test: disease prevalence 1%, sensitivity 95%, false-positive 5%
posterior = bayes_update(prior=0.01,
                         likelihood_given_positive=0.95,
                         likelihood_given_negative=0.05)
print(f"P(COVID | positive test) = {posterior*100:.1f}%")  # ~16%
# Surprising! Most positives are false positives when prevalence is low.

# Bayesian spam filter (Naive Bayes)
class NaiveBayes:
    def fit(self, X, y):
        import numpy as np
        self.classes = np.unique(y)
        self.priors = {c: np.mean(y==c) for c in self.classes}
        self.likelihoods = {}
        for c in self.classes:
            self.likelihoods[c] = (X[y==c].mean(axis=0) + 1e-9)
    def predict(self, x):
        import numpy as np
        scores = {}
        for c in self.classes:
            scores[c] = np.log(self.priors[c]) + np.sum(np.log(self.likelihoods[c]) * x)
        return max(scores, key=scores.get)
`},

  { id:'graph_theory', domain:'mathematics', tags:['graph','euler','hamilton','topology','network','vertex','edge'],
    name:"Graph Theory Fundamentals",
    emoji:'🕸️', formula:'|E| ≤ |V|·(|V|-1)/2  |  Euler: path iff 0 or 2 odd-degree vertices',
    eli5:"A graph is just dots (nodes) connected by lines (edges). Graph theory solves problems like 'Can I cross all 7 bridges of Königsberg without repeating?' (Euler's famous problem).",
    explanation:"Euler proved in 1736 that crossing all edges exactly once (Eulerian path) is possible only if the graph has 0 or 2 odd-degree vertices. Graph theory now powers social networks, circuit design, and protein interaction maps.",
    complexity:"Eulerian path: O(E), Hamiltonian path: NP-complete",
    code:`from collections import defaultdict

def find_euler_path(graph):
    """Hierholzer's algorithm — O(E)."""
    degree = defaultdict(int)
    adj = defaultdict(list)
    for u, v in graph:
        adj[u].append(v); adj[v].append(u)
        degree[u] += 1; degree[v] += 1
    
    odd_vertices = [v for v in degree if degree[v] % 2 != 0]
    if len(odd_vertices) not in (0, 2):
        return None  # No Eulerian path
    
    start = odd_vertices[0] if odd_vertices else next(iter(adj))
    stack = [start]; path = []
    local_adj = {k: list(v) for k, v in adj.items()}
    
    while stack:
        v = stack[-1]
        if local_adj.get(v):
            u = local_adj[v].pop()
            local_adj[u].remove(v)
            stack.append(u)
        else:
            path.append(stack.pop())
    return path[::-1]

edges = [('A','B'),('A','C'),('B','C'),('B','D'),('C','D')]
print("Euler path:", find_euler_path(edges))
`},

  // ──── ENGINEERING ────
  { id:'pid', domain:'engineering', tags:['pid','control','feedback','temperature','robot','motor','stability','controller'],
    name:"PID Controller",
    emoji:'⚙️', formula:'u(t) = Kp·e(t) + Ki·∫e dt + Kd·de/dt',
    eli5:"Your home thermostat turned smart. P reacts to current error (how far off). I fixes persistent steady-state errors. D damps overshooting by sensing how fast the error is changing.",
    explanation:"Proportional-Integral-Derivative controller is the most widely used feedback control algorithm in industry. Used in temperature control, motor drives, drone flight, CNC machines, and process plants. The three gains (Kp, Ki, Kd) are tuned via Ziegler-Nichols or auto-tune methods.",
    complexity:"O(1) per control tick",
    code:`class PIDController:
    def __init__(self, Kp, Ki, Kd, setpoint=0,
                 output_limits=(-float('inf'), float('inf'))):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.setpoint = setpoint
        self.output_limits = output_limits
        self._integral = 0
        self._prev_error = 0
    
    def compute(self, measurement, dt):
        error = self.setpoint - measurement
        self._integral += error * dt
        derivative = (error - self._prev_error) / dt
        output = self.Kp*error + self.Ki*self._integral + self.Kd*derivative
        output = max(self.output_limits[0], min(self.output_limits[1], output))
        self._prev_error = error
        return output

# Simulate temperature control
pid = PIDController(Kp=2.0, Ki=0.5, Kd=0.1, setpoint=100, output_limits=(0,100))
temperature = 20.0  # starting temp
print("Time | Temp   | Heater")
for t in range(20):
    heater = pid.compute(temperature, dt=0.1)
    temperature += (heater - (temperature - 20) * 0.1) * 0.1  # simplified thermal model
    print(f"{t:4d} | {temperature:6.1f}°C | {heater:5.1f}%")
`},

  { id:'queue_theory', domain:'engineering', tags:['queue','queueing','littles law','throughput','latency','server','traffic'],
    name:"Queueing Theory & Little's Law",
    emoji:'🏪', formula:"L = λ·W  |  ρ = λ/μ  (ρ < 1 for stability)",
    eli5:"How long will the line at the supermarket be? Little's Law: average people waiting = arrival rate × average waiting time. It works for checkout lines, web servers, hospitals — any queue.",
    explanation:"L: average queue length. λ: arrival rate. W: average wait time. ρ: server utilisation (λ/μ). When ρ → 1, queue length → ∞. Foundation of capacity planning for web services and networks.",
    complexity:"O(1) for M/M/1 formulas",
    code:`class MMOneQueue:
    """M/M/1 queue: Poisson arrivals, exponential service, 1 server."""
    
    def __init__(self, arrival_rate, service_rate):
        self.lam = arrival_rate    # λ: requests per second
        self.mu = service_rate     # μ: service rate per second
        self.rho = arrival_rate / service_rate  # utilisation
        if self.rho >= 1:
            raise ValueError(f"System unstable! ρ = {self.rho:.2f} ≥ 1")
    
    @property
    def avg_queue_length(self):      # L
        return self.rho / (1 - self.rho)
    
    @property
    def avg_wait_in_queue(self):     # Wq
        return self.rho / (self.mu * (1 - self.rho))
    
    @property
    def avg_time_in_system(self):    # W
        return 1 / (self.mu - self.lam)
    
    def report(self):
        print(f"Utilisation (ρ):   {self.rho*100:.1f}%")
        print(f"Avg queue length:  {self.avg_queue_length:.2f} requests")
        print(f"Avg wait in queue: {self.avg_wait_in_queue*1000:.1f} ms")
        print(f"Avg time in system:{self.avg_time_in_system*1000:.1f} ms")

# Web server: 90 req/s arriving, 100 req/s capacity
q = MMOneQueue(arrival_rate=90, service_rate=100)
q.report()
`},

  { id:'neural_net', domain:'engineering', tags:['neural network','deep learning','backpropagation','perceptron','mlp','ai','weights'],
    name:"Neural Network & Backpropagation",
    emoji:'🧠', formula:'output = σ(W·x + b)  |  ∂L/∂W = δ·xᵀ',
    eli5:"A neural network is a chain of 'filters'. Each layer extracts higher-level features. Backpropagation is just the chain rule of calculus — blame is passed backwards to each weight based on how much it contributed to the error.",
    explanation:"Forward pass: data flows through weighted layers with activation functions (ReLU, sigmoid). Backward pass: compute gradient of loss w.r.t. each weight using chain rule, then update with gradient descent.",
    complexity:"O(L·N²) per forward+backward pass for L layers of width N",
    code:`import numpy as np

def sigmoid(x): return 1 / (1 + np.exp(-x))
def sigmoid_deriv(x): s = sigmoid(x); return s * (1 - s)
def relu(x): return np.maximum(0, x)
def relu_deriv(x): return (x > 0).astype(float)

class MLP:
    def __init__(self, layer_sizes, lr=0.01):
        self.lr = lr
        self.weights = [np.random.randn(layer_sizes[i+1], layer_sizes[i]) * 0.1
                        for i in range(len(layer_sizes)-1)]
        self.biases  = [np.zeros((s, 1)) for s in layer_sizes[1:]]
    
    def forward(self, x):
        self.zs, self.activations = [], [x]
        for W, b in zip(self.weights, self.biases):
            z = W @ self.activations[-1] + b
            self.zs.append(z)
            self.activations.append(sigmoid(z))
        return self.activations[-1]
    
    def backward(self, y_true):
        delta = (self.activations[-1] - y_true) * sigmoid_deriv(self.zs[-1])
        for i in reversed(range(len(self.weights))):
            dW = delta @ self.activations[i].T
            db = delta
            self.weights[i] -= self.lr * dW
            self.biases[i]  -= self.lr * db
            if i > 0:
                delta = (self.weights[i].T @ delta) * sigmoid_deriv(self.zs[i-1])
    
    def train(self, X, Y, epochs=1000):
        for e in range(epochs):
            loss = 0
            for x, y in zip(X.T, Y.T):
                out = self.forward(x.reshape(-1,1))
                self.backward(y.reshape(-1,1))
                loss += np.mean((out - y)**2)
            if e % 200 == 0:
                print(f"Epoch {e}: Loss = {loss/len(X.T):.4f}")

# XOR problem
X = np.array([[0,0,1,1],[0,1,0,1]])
Y = np.array([[0,1,1,0]])
net = MLP([2, 4, 1], lr=0.5)
net.train(X, Y, epochs=1000)
`},

  // ──── BIOLOGY / SCIENCE ────
  { id:'dna', domain:'science', tags:['dna','genetics','mutation','evolution','sequence','genome','bioinformatics'],
    name:"DNA Sequence Alignment (Needleman-Wunsch)",
    emoji:'🧬', formula:'F(i,j) = max(F(i-1,j-1)+s(a,b), F(i-1,j)-gap, F(i,j-1)-gap)',
    eli5:"Finding how similar two DNA strings are — like spell-checking but for genetic sequences. Aligning 'ACGT' and 'AGT' might show a deletion happened.",
    explanation:"Global alignment using dynamic programming. The scoring matrix rewards matches and penalises mismatches/gaps. Used in BLAST, genome assembly, and vaccine development.",
    complexity:"O(N·M) time and space for sequences of length N, M",
    code:`def needleman_wunsch(seq1, seq2, match=1, mismatch=-1, gap=-2):
    """Global DNA/protein sequence alignment."""
    m, n = len(seq1), len(seq2)
    # Initialise scoring matrix
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(m+1): dp[i][0] = i * gap
    for j in range(n+1): dp[0][j] = j * gap
    # Fill
    for i in range(1, m+1):
        for j in range(1, n+1):
            score = match if seq1[i-1] == seq2[j-1] else mismatch
            dp[i][j] = max(dp[i-1][j-1] + score,
                           dp[i-1][j]   + gap,
                           dp[i][j-1]   + gap)
    # Traceback
    aligned1, aligned2 = [], []
    i, j = m, n
    while i > 0 or j > 0:
        if i > 0 and j > 0:
            score = match if seq1[i-1] == seq2[j-1] else mismatch
            if dp[i][j] == dp[i-1][j-1] + score:
                aligned1.append(seq1[i-1]); aligned2.append(seq2[j-1]); i -= 1; j -= 1
            elif dp[i][j] == dp[i-1][j] + gap:
                aligned1.append(seq1[i-1]); aligned2.append('-'); i -= 1
            else:
                aligned1.append('-'); aligned2.append(seq2[j-1]); j -= 1
        elif i > 0:
            aligned1.append(seq1[i-1]); aligned2.append('-'); i -= 1
        else:
            aligned1.append('-'); aligned2.append(seq2[j-1]); j -= 1
    return ''.join(reversed(aligned1)), ''.join(reversed(aligned2)), dp[m][n]

a1, a2, score = needleman_wunsch("ACGT", "AGT")
print(f"Seq1: {a1}\\nSeq2: {a2}\\nScore: {score}")
`},

  { id:'epidemic', domain:'science', tags:['sir','epidemic','virus','spread','infection','pandemic','model'],
    name:"SIR Epidemic Model",
    emoji:'🦠', formula:'dS/dt = -βSI/N  |  dI/dt = βSI/N - γI  |  dR/dt = γI',
    eli5:"Models how a disease spreads: Susceptible people get Infected, then Recover (or die). β is how contagious it is; γ is how fast people recover. R₀ = β/γ tells you if it will spread (R₀>1) or die out (R₀<1).",
    explanation:"The SIR model is the foundation of epidemiology. COVID-19, flu, and Ebola models all derive from this. Herd immunity threshold is 1 - 1/R₀. Real models add Exposed (SEIR), vaccination, and age strata.",
    complexity:"O(T) for T time steps",
    code:`def sir_model(N, I0, R0_basic, gamma, days):
    """
    N: total population
    I0: initial infected
    R0_basic: basic reproduction number (e.g., 2.5 for COVID)
    gamma: recovery rate (1/days to recover)
    days: simulation duration
    """
    beta = R0_basic * gamma  # transmission rate
    S, I, R = N - I0, I0, 0
    dt = 0.1
    history = []
    
    t = 0
    while t <= days:
        dS = -beta * S * I / N * dt
        dI = (beta * S * I / N - gamma * I) * dt
        dR = gamma * I * dt
        S += dS; I += dI; R += dR
        t += dt
        if abs(t - round(t)) < dt/2:
            history.append({'day': int(round(t)), 'S': S, 'I': I, 'R': R})
    
    return history

results = sir_model(N=1_000_000, I0=100, R0_basic=2.5, gamma=1/10, days=180)
peak = max(results, key=lambda x: x['I'])
print(f"Peak infections: {peak['I']:,.0f} on day {peak['day']}")
print(f"Total infected: {results[-1]['R']:,.0f} ({results[-1]['R']/1e6*100:.1f}%)")
herd_immunity = (1 - 1/2.5) * 100
print(f"Herd immunity threshold: {herd_immunity:.1f}%")
`},
];

/* ─── Oracle Search Engine ─── */
const OracleEngine = {
  async search(query) {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    // Score every KB entry
    const scored = ORACLE_KB.map(item => {
      let score = 0;
      item.tags.forEach(tag => {
        if (q.includes(tag)) score += 3;
        if (tag.includes(q) || q.includes(tag.split(' ')[0])) score += 1;
      });
      if (q.includes(item.name.toLowerCase())) score += 10;
      if (q.includes(item.id)) score += 5;
      // fuzzy: individual words
      q.split(/\s+/).forEach(word => {
        if (word.length < 3) return;
        item.tags.forEach(tag => { if (tag.includes(word)) score += 2; });
        if (item.name.toLowerCase().includes(word)) score += 3;
      });
      return { item, score };
    });

    const best = scored.sort((a,b) => b.score - a.score)[0];
    if (best.score >= 2) return { source: 'kb', data: best.item };

    // Fallback to Groq AI
    try {
      const aiResult = await OracleEngine.callGroq(query);
      return { source: 'ai', data: aiResult };
    } catch(e) {
      return { source: 'error', msg: e.message };
    }
  },

  async callGroq(query) {
    const cfg = window.ALGOFORGE_CONFIG;
    if (!cfg || !cfg.GROQ_API_KEY) throw new Error("No Groq API key configured");

    const prompt = `You are a universal scientific knowledge oracle. The user asked: "${query}"

Find the most relevant concept, law, algorithm, or theory across ANY domain (physics, CS, mathematics, biology, chemistry, engineering, economics, etc.)

Respond with ONLY this JSON (no markdown):
{
  "name": "Full official name of the law/algorithm/concept",
  "emoji": "one relevant emoji",
  "domain": "physics|algorithms|mathematics|engineering|science|economics|chemistry",
  "formula": "Core equation or pseudocode (one line)",
  "eli5": "Explain Like I'm 5: 1-2 simple sentences anyone can understand",
  "explanation": "Clear 2-3 sentence technical explanation for a developer/scientist",
  "complexity": "Time/space complexity or computational cost",
  "code": "Runnable Python code (20-40 lines) demonstrating the concept with real numbers"
}`;

    const res = await fetch(cfg.GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: cfg.GROQ_MODEL,
        messages: [
          { role: 'system', content: 'Output ONLY valid compact JSON. No markdown. No explanation outside JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) throw new Error(`Groq API error ${res.status}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  },

  getDomainColor(domain) {
    const map = {
      physics: '#38bdf8',
      algorithms: '#a78bfa',
      mathematics: '#34d399',
      engineering: '#f59e0b',
      science: '#fb923c',
      economics: '#60a5fa',
      chemistry: '#f472b6',
    };
    return map[domain] || '#8a8a8a';
  },

  getDomainLabel(domain) {
    const map = {
      physics: '🚀 Physics',
      algorithms: '💻 Algorithm',
      mathematics: '📐 Mathematics',
      engineering: '⚙️ Engineering',
      science: '🔬 Science',
      economics: '📈 Economics',
      chemistry: '⚗️ Chemistry',
    };
    return map[domain] || domain;
  }
};

window.OracleEngine = OracleEngine;
window.ORACLE_KB = ORACLE_KB;
