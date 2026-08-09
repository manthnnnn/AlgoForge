# ⚡ ALGOFORGE

> **Automated Program Synthesis & Evolutionary Algorithm Optimization Engine**

ALGOFORGE is a program synthesis framework designed to automatically invent, evolve, and optimize algorithms (such as array sorting and reversal routines) using Genetic Programming over an Abstract Syntax Tree (AST) Domain-Specific Language (DSL).

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9%2B-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)
![Architecture](https://img.shields.io/badge/Architecture-AST%20%7C%20Interpreter%20%7C%20Genetic-purple)

---

## 🌟 Key Features

- **AST Domain Specific Language (DSL):** Custom imperative AST nodes supporting loops (`LoopNode`), conditionals (`IfNode`), Compare-and-Swap primitives (`CompareSwapNode`), assignments (`AssignNode`), and binary expressions (`BinaryOpNode`).
- **Sandboxed Execution Interpreter:** Isolated runtime with strict step-bounding, out-of-bounds safety, and step-by-step state snapshot tracing.
- **Genetic Search Engine:** Multi-objective evolutionary search featuring subtree crossover, point & replacement mutations, tournament selection, and elitism.
- **Multi-Objective Pareto Memory Archive:** Pareto-frontier optimization balancing algorithm correctness, AST depth, and execution step count.
- **Real-Time Node.js Web Dashboard:** Glassmorphism UI built with Node.js Express, Server-Sent Events (SSE) live evolution streaming, interactive array swap animator, and Chart.js metrics.

---

## 🏗️ System Architecture

```
                       ┌────────────────────────┐
                       │  AST Generator         │
                       │  (Generates Random     │
                       │   AST Trees)           │
                       └───────────┬────────────┘
                                   │
                                   ▼
┌──────────────────┐    ┌────────────────────────┐
│  Test Cases      │───>│  Sandbox Interpreter   │
│  Input:  [3, 1]  │    │  - Executes AST        │
│  Target: [1, 3]  │    │  - Step Bounding       │
└──────────────────┘    │  - Trace Recording     │
                        └───────────┬────────────┘
                                   │
                                   ▼
                        ┌────────────────────────┐
                        │  Fitness Evaluator     │
                        │  Correctness % - Penalty│
                        └───────────┬────────────┘
                                   │
                                   ▼ (Selection, Crossover, Mutation)
                        ┌────────────────────────┐
                        │  Node.js Web Dashboard │
                        │  (Express + SSE + JS)  │
                        └────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js v18+**

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
npm install
```

---

## 🖥️ Running the Node.js Web Dashboard

Start the Express web application:

```bash
npm start
# Or
node server.js
```

Open your browser and navigate to:
```
http://localhost:3000
```

### Web Dashboard Features:
1. **Live Synthesis Studio:** Select a benchmark task (`sort_2`, `sort_3`, `reverse_3`, `min_first`), adjust genetic parameters, and watch real-time evolution metrics stream via Server-Sent Events (SSE).
2. **Step-by-Step Array Swap Animator:** Input custom array JSON (e.g. `[9, 2, 7, 1, 5]`) and scrub step-by-step through execution snapshots.
3. **Pareto Archive Explorer:** View saved programs and multi-objective Pareto trade-off scatter plots.

---

## 🧪 Running CLI Benchmarks & Tests

### Run Benchmark Suite in Terminal
```bash
python -m benchmarks.suite
```

### Run Unit Tests
```bash
python tests/test_interpreter.py
python tests/test_ast_and_binary_op.py
python tests/test_genetic_engine.py
python tests/test_memory_and_benchmarks.py
```

---

## 📁 Repository Structure

```
ALGOFORGE/
├── dsl/
│   ├── ast_nodes.py         # AST node hierarchy (Loop, If, CompareSwap, BinaryOp)
│   └── interpreter.py       # Sandboxed execution interpreter with trace snapshots
├── search/
│   ├── fitness.py           # Multi-objective fitness scoring function
│   ├── genetic_engine.py    # AST Generator, crossover, mutation & evolutionary engine
│   └── api_bridge.py        # Python CLI bridge for Node.js backend integration
├── memory/
│   └── program_archive.py   # Multi-objective Pareto-optimal program archive
├── benchmarks/
│   └── suite.py             # Benchmark tasks and tabulate report runner
├── public/                  # Node.js Web Frontend (HTML5, CSS3, ES6 JS, Chart.js)
├── server.js                # Express web server with SSE streaming & REST APIs
├── package.json             # Node.js package specification
├── requirements.txt         # Python dependencies
└── tests/                   # Automated unit test suite
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
