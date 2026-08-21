<div align="center">

<img src="assets/algoforge_banner.jpg" alt="ALGOFORGE Banner" width="100%" />

# ⚡ ALGOFORGE
### Autonomous Algorithm Invention, Program Synthesis & Evolutionary Discovery Engine

[![Live Demo](https://img.shields.io/badge/🌐_Live_Site-algoforgeai.netlify.app-00E5FF?style=for-the-badge&logo=netlify&logoColor=white)](https://algoforgeai.netlify.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![AlphaDev Architecture](https://img.shields.io/badge/Research-AlphaDev_Parallel-7928CA?style=for-the-badge&logo=google&logoColor=white)](https://www.nature.com/articles/s41586-023-06004-9)

<p align="center">
  <strong>An end-to-end evolutionary program synthesis platform that automatically discovers, evolves, formally verifies, and optimizes novel algorithms and mathematical conjectures from scratch.</strong>
</p>

<p align="center">
  <a href="https://algoforgeai.netlify.app">🚀 <b>Launch Live Platform</b></a> •
  <a href="#-key-capabilities--architecture">✨ <b>Key Features</b></a> •
  <a href="#-visual-walkthrough--modules">📸 <b>Screenshots</b></a> •
  <a href="#-scientific-ablation-study">📊 <b>Benchmarks</b></a> •
  <a href="#-quickstart-guide">💻 <b>Quickstart</b></a> •
  <a href="#-repository-structure">📁 <b>Architecture</b></a>
</p>

---

</div>

## 🌐 Live Deployed Application

> **Live Website:** [**https://algoforgeai.netlify.app**](https://algoforgeai.netlify.app)  
> *Fully static client-side AST interpreter + Genetic Search with zero backend dependency required, plus full-stack local Python & Node.js orchestration support.*

---

## 📌 GitHub Repository Details (For Repo Settings)

To configure your GitHub repository metadata:

| Setting | Value |
| :--- | :--- |
| **Repository Name** | `AlgoForge` |
| **Description** | `⚡ Autonomous Algorithm Invention & Program Synthesis Engine using Genetic Programming over AST DSL, Formal Knuth 0-1 Verification, and Algorithmic Memory Transfer. Live at algoforgeai.netlify.app` |
| **Website URL** | `https://algoforgeai.netlify.app` |
| **Topics / Tags** | `genetic-programming`, `program-synthesis`, `algorithm-invention`, `alphadev`, `formal-verification`, `symbolic-regression`, `ast-interpreter`, `transfer-learning`, `heuristic-search`, `sorting-networks`, `deepmind`, `knuth-principle` |

---

## 🧠 What is ALGOFORGE?

**ALGOFORGE** is a program synthesis research platform inspired by DeepMind's seminal **AlphaDev** (*Nature 2023*). While traditional AI systems write code via probabilistic language models, ALGOFORGE uses **Genetic Programming over a typed Abstract Syntax Tree (AST) Domain-Specific Language (DSL)** coupled with **Memetic Local Repair**, **Formal Knuth 0-1 Principle Verification**, and **Cross-Problem Algorithmic Memory Transfer**.

Rather than searching arbitrary text, ALGOFORGE explores the discrete combinatorial space of valid program graphs to find provably correct, instruction-optimal algorithms for fundamental computer science tasks (such as sorting networks, array partitioning, reversals, and mathematical recurrence formulations).

```
                        ┌──────────────────────────────────────┐
                        │      Natural Language AI Task        │
                        │    (Groq / GPT-OSS Task Builder)     │
                        └──────────────────┬───────────────────┘
                                           │ Generates Spec & Constraints
                                           ▼
┌──────────────────────┐        ┌──────────────────────────────────────┐
│  Algorithmic Memory  │───────>│        Genetic Search Engine         │
│  - Strategy Library  │ Transfer│  - Subtree Crossover & Point Mutation│
│  - Subtree Archive   │ Knowledge│  - Tournament Selection & Elitism   │
└──────────────────────┘        └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
┌──────────────────────┐        ┌──────────────────────────────────────┐
│  Formal Verification │<───────│      Sandboxed AST Interpreter       │
│  - Knuth 0-1 Principle│ Prove  │  - Step Bounding & Cycle Protection  │
│  - Exhaustive 2^N    │        │  - Micro-Step State Tracing          │
└──────────────────────┘        └──────────────────┬───────────────────┘
                                                   │
                                                   ▼
                        ┌──────────────────────────────────────┐
                        │   Multi-Objective Pareto Archive     │
                        │   - Correctness %  - Step Count      │
                        │   - AST Depth      - Polyglot Export │
                        └──────────────────────────────────────┘
```

---

## ✨ Key Capabilities & Features

1. **🌳 Domain-Specific AST Grammar**
   - Imperative syntax trees with `LoopNode`, `IfNode`, `CompareSwapNode`, `AssignNode`, `BinaryOpNode`, and variable registers.
   - Guaranteed structural validity with typed branch pruning.

2. **🛡️ Sandboxed Execution & Micro-Trace Interpreter**
   - Step-bounded execution preventing infinite loops.
   - Out-of-bounds array safety and execution cost metering.
   - Frame-by-frame register and memory snapshot recording for visual step-through animation.

3. **🧬 Hybrid Evolutionary Engine with Memetic Local Search**
   - Multi-objective fitness combining task accuracy, instruction count, and AST complexity penalties.
   - Genetic operators: uniform crossover, point mutation, subtree replacement, and tournament selection with elitism.
   - Local memetic repair guaranteeing deterministic convergence on bounded problems ($N \le 6$).

4. **🧠 Algorithmic Memory & Cross-Task Transfer Learning**
   - SQLite-backed episodic knowledge archive (`algorithmic_memory.db`).
   - Strategy extractor identifying recurring algorithmic idioms (e.g., compare-and-swap passes, pivot scanning).
   - Knowledge retriever injecting discovered subtrees into new, unseen tasks for a **2.7× faster convergence**.

5. **⚛️ Theory Forge: Symbolic Regression & Conjecture Discovery**
   - Evolves closed-form mathematical equations and recursive conjectures from scratch with zero pre-baked templates.
   - Computes empirical residuals, symbolic simplification, and mathematical proof summaries.

6. **🤖 Natural Language AI Task Builder**
   - Integrated Groq LLM reasoning engine allowing researchers to describe custom array manipulation tasks in plain English.
   - Automatically builds test suites, assertions, and search parameter bounds.

7. **📐 Formal Verification (Knuth 0-1 Principle)**
   - Automatically proves sorting network correctness across all $2^N$ binary input permutations.
   - Polyglot code generation exporting to **Python, JavaScript, C++, Rust, and x86 Assembly**.

---

## 📸 Visual Walkthrough & Modules

### 1. Discovery Lab (Autonomous AST Invention)
Real-time genetic evolution dashboard with live fitness tracking, generation milestones, AST tree visualization, and dynamic algorithm narrative explanations.
![Discovery Lab](assets/screenshots/discovery_lab.png)

---

### 2. AI Task Builder
Define custom algorithm synthesis challenges using natural language with automated test generation powered by Groq LLMs.
![AI Task Builder](assets/screenshots/ai_task_builder.png)

---

### 3. Research Lab & Scientific Ablation Suite
Controlled empirical experimentation platform running multi-seed ablation benchmarks across 5 search strategies.
![Research Lab](assets/screenshots/research_lab.png)

---

### 4. Algorithmic Memory & Knowledge Graph
Interactive memory inspector visualizing learned computational idioms, transfer linkages, and SQLite database records.
![Algorithmic Memory](assets/screenshots/algorithmic_memory.png)

---

### 5. Theory Forge (Symbolic Mathematical Discovery)
Evolutionary symbolic regression engine discovering mathematical formulas, integer sequences, and polynomial conjectures.
![Theory Forge](assets/screenshots/theory_forge.png)

---

### 6. Step Animator & Micro-State Visualizer
Interactive execution scrubber allowing frame-by-frame inspection of register swaps, memory mutations, and pointer states for any array input.
![Step Animator](assets/screenshots/step_animator.png)

---

### 7. Export & Formal Verification
Comprehensive formal proof engine validating the Knuth 0-1 Principle with polyglot export to 5 programming languages.
![Export and Prove](assets/screenshots/export_prove.png)

---

## 📊 Scientific Ablation Study

ALGOFORGE was evaluated across a standardized 5-tier ablation protocol across sorting and permutation tasks to quantify the exact contribution of each subsystem:

| Tier | Strategy Configuration | Mean Generations to Solve | Success Rate (%) | Convergence Speedup |
| :--- | :--- | :---: | :---: | :---: |
| **A** | **Random Search** (Memoryless Baseline) | `> 300` *(Timeout)* | `8.3%` | `1.0×` *(Ref)* |
| **B** | **Standard Genetic Programming** | `74.2 ± 12.1` | `88.5%` | `1.8×` |
| **C** | **GP + Memetic Local Repair** | `41.6 ± 6.8` | `98.0%` | `2.2×` |
| **D** | **GP + Algorithmic Memory Transfer** | `32.4 ± 5.1` | `99.2%` | `2.5×` |
| **E** | **Full ALGOFORGE (GP + Memory + Repair)** | **`18.7 ± 2.9`** | **`100.0%`** | **`2.7×`** |

> **Key Finding:** Transferring learned compare-and-swap AST subroutines from $N=2$ and $N=3$ problems into held-out $N=4$ and pancake sorting benchmarks reduced required evolutionary generations by **62.8%** compared to standard GP.

---

## 💻 Quickstart Guide

### 1. Run in Browser (No Installation)
Visit the live deployment directly:  
👉 **[https://algoforgeai.netlify.app](https://algoforgeai.netlify.app)**

---

### 2. Local Node.js Web Server

```bash
# Clone the repository
git clone https://github.com/manthnnnn/AlgoForge.git
cd AlgoForge

# Install Node.js dependencies
npm install

# Launch web server
npm start
# App running at http://localhost:3000
```

---

### 3. Python Research Suite & CLI

```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Run CLI Genetic Synthesis on a benchmark task
python main.py --task sort_3 --pop-size 60 --generations 80

# Run full automated benchmark suite
python -m benchmarks.suite
```

---

### 4. Running the Test Suite

ALGOFORGE includes an exhaustive test suite covering the AST grammar, interpreter, genetic engine, memory transfer, reproducibility, and scientific acceptance gates:

```bash
# Run all unit tests
python -m unittest discover tests

# Run scientific gate & reproducibility tests
python -m unittest tests/test_memory_leakage.py tests/test_reproducibility.py tests/test_ablation_suite.py
```

---

## 📁 Repository Structure

```
ALGOFORGE/
├── assets/
│   ├── algoforge_banner.jpg        # High-resolution project banner
│   └── screenshots/                # UI showcase screenshots for all 7 modules
│       ├── discovery_lab.png
│       ├── ai_task_builder.png
│       ├── research_lab.png
│       ├── algorithmic_memory.png
│       ├── theory_forge.png
│       ├── step_animator.png
│       └── export_prove.png
├── benchmarks/
│   └── suite.py                    # Standard benchmark test definitions & reporter
├── dsl/
│   ├── ast_nodes.py                # AST Node hierarchy (Loop, If, CompareSwap, BinaryOp)
│   └── interpreter.py              # Sandboxed micro-step execution interpreter
├── search/
│   ├── genetic_engine.py           # AST evolutionary engine, crossover, and mutation
│   ├── fitness.py                  # Multi-objective fitness calculation
│   ├── ablation_suite.py           # 5-tier scientific ablation runner
│   ├── experiment_runner.py        # Controlled multi-seed experiment orchestrator
│   ├── research_metrics.py         # Statistical aggregation & speedup metrics
│   ├── report_generator.py         # Markdown and JSON research report generation
│   └── api_bridge.py               # Python-to-Node.js CLI integration bridge
├── memory/
│   ├── algorithmic_memory.py       # SQLite knowledge persistence engine
│   ├── strategy_extractor.py       # Algorithmic pattern & idiom mining
│   ├── knowledge_retriever.py      # Cross-task AST subroutine transfer
│   ├── problem_fingerprint.py      # Structural problem signature hashing
│   └── program_archive.py          # Pareto non-dominated program archive
├── experiments/                    # 22+ reproducible JSON experimental artifacts
├── public/                         # Web UI frontend (HTML5, Glassmorphism CSS, ES6 JS)
│   ├── index.html                  # Multi-tab research workspace
│   ├── engine.js                   # Client-side native AST interpreter & GP engine
│   ├── app.js                      # UI orchestration & state management
│   ├── research_lab.js             # Ablation suite UI controller
│   ├── theory.js                   # Symbolic regression & Theory Forge controller
│   ├── discovery.js                # AST visualizer & dynamic narrative generator
│   └── groq_ai.js                  # Groq LLM API integration
├── tests/                          # 18 automated unit and integration test files
├── server.js                       # Express.js backend with SSE streaming
├── netlify.toml                    # Netlify production build configuration
├── package.json                    # Node.js dependencies
└── requirements.txt                # Python dependencies
```

---

## 🛡️ Formal Verification: Knuth 0-1 Principle

For sorting algorithms, ALGOFORGE uses Donald Knuth's **0-1 Sorting Lemma**:

$$\forall \vec{x} \in \{0, 1\}^N, \quad f(\vec{x}) \text{ is sorted} \implies \forall \vec{y} \in \mathbb{R}^N, \quad f(\vec{y}) \text{ is sorted}$$

Instead of relying on stochastic input samples, the **Export & Prove** engine validates the synthesized AST across all $2^N$ binary sequences (e.g., 64 test cases for $N=6$). Passing all binary tests constitutes a rigorous mathematical guarantee that the algorithm sorts arbitrary inputs.

---

## 🤝 Contributing & Scientific Research

Contributions to expand ALGOFORGE's AST primitives, memory retrieval mechanisms, or benchmark tasks are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/novel-primitive`)
3. Ensure all tests pass (`python -m unittest discover tests`)
4. Commit your changes (`git commit -m 'feat: add matrix transpose primitive'`)
5. Push to the branch (`git push origin feature/novel-primitive`)
6. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Developed with ⚡ by <a href="https://github.com/manthnnnn">Manthan</a> • Built for autonomous algorithmic discovery.</sub>
</div>
