// ══════════════════════════════════════════════════════════════════
//  ALGOFORGE — Browser & Serverless Native JavaScript Genetic Engine
//  Enables 100% Netlify / Vercel / Client-Side Deployment
// ══════════════════════════════════════════════════════════════════

(function(exports) {

    // ──────────── AST Nodes ────────────
    class ConstNode {
        constructor(value) { this.type = "ConstNode"; this.value = value; }
        getDepth() { return 1; }
    }
    class VariableNode {
        constructor(name) { this.type = "VariableNode"; this.name = name; }
        getDepth() { return 1; }
    }
    class CompareSwapNode {
        constructor(idx1, idx2) { this.type = "CompareSwapNode"; this.idx1 = idx1; this.idx2 = idx2; }
        getDepth() { return 1 + Math.max(this.idx1.getDepth(), this.idx2.getDepth()); }
    }
    class SwapNode {
        constructor(idx1, idx2) { this.type = "SwapNode"; this.idx1 = idx1; this.idx2 = idx2; }
        getDepth() { return 1 + Math.max(this.idx1.getDepth(), this.idx2.getDepth()); }
    }
    class ReverseRangeNode {
        constructor(start, end) { this.type = "ReverseRangeNode"; this.start = start; this.end = end; }
        getDepth() { return 1 + Math.max(this.start.getDepth(), this.end.getDepth()); }
    }
    class ArrayAssignNode {
        constructor(idx, value) { this.type = "ArrayAssignNode"; this.idx = idx; this.value = value; }
        getDepth() { return 1 + Math.max(this.idx.getDepth(), this.value.getDepth()); }
    }
    class AssignNode {
        constructor(var_name, value) { this.type = "AssignNode"; this.var_name = var_name; this.value = value; }
        getDepth() { return 1 + this.value.getDepth(); }
    }
    class LoopNode {
        constructor(var_name, start, end, body) { this.type = "LoopNode"; this.var_name = var_name; this.start = start; this.end = end; this.body = body; }
        getDepth() {
            const bd = this.body.length ? Math.max(...this.body.map(b => b.getDepth())) : 0;
            return 1 + Math.max(this.start.getDepth(), this.end.getDepth(), bd);
        }
    }
    class IfNode {
        constructor(condition, then_body, else_body = []) { this.type = "IfNode"; this.condition = condition; this.then_body = then_body; this.else_body = else_body; }
        getDepth() {
            const td = this.then_body.length ? Math.max(...this.then_body.map(b => b.getDepth())) : 0;
            const ed = this.else_body.length ? Math.max(...this.else_body.map(b => b.getDepth())) : 0;
            return 1 + Math.max(this.condition.getDepth(), td, ed);
        }
    }
    class BinaryOpNode {
        constructor(left, op, right) { this.type = "BinaryOpNode"; this.left = left; this.op = op; this.right = right; }
        getDepth() { return 1 + Math.max(this.left.getDepth(), this.right.getDepth()); }
    }
    class ProgramNode {
        constructor(statements) { this.type = "ProgramNode"; this.statements = statements; }
        getDepth() {
            if (!this.statements || !this.statements.length) return 1;
            return 1 + Math.max(...this.statements.map(s => s.getDepth()));
        }
    }

    function cloneAST(node) {
        if (!node) return null;
        switch (node.type) {
            case "ConstNode": return new ConstNode(node.value);
            case "VariableNode": return new VariableNode(node.name);
            case "CompareSwapNode": return new CompareSwapNode(cloneAST(node.idx1), cloneAST(node.idx2));
            case "SwapNode": return new SwapNode(cloneAST(node.idx1), cloneAST(node.idx2));
            case "ReverseRangeNode": return new ReverseRangeNode(cloneAST(node.start), cloneAST(node.end));
            case "ArrayAssignNode": return new ArrayAssignNode(cloneAST(node.idx), cloneAST(node.value));
            case "AssignNode": return new AssignNode(node.var_name, cloneAST(node.value));
            case "LoopNode": return new LoopNode(node.var_name, cloneAST(node.start), cloneAST(node.end), node.body.map(cloneAST));
            case "IfNode": return new IfNode(cloneAST(node.condition), node.then_body.map(cloneAST), (node.else_body||[]).map(cloneAST));
            case "BinaryOpNode": return new BinaryOpNode(cloneAST(node.left), node.op, cloneAST(node.right));
            case "ProgramNode": return new ProgramNode(node.statements.map(cloneAST));
            default: return null;
        }
    }

    // ──────────── Interpreter ────────────
    class Interpreter {
        constructor(maxSteps = 500) {
            this.maxSteps = maxSteps;
            this.stepCount = 0;
            this.env = {};
            this.arr = [];
            this.trace = [];
            this.errorEncountered = false;
        }

        execute(program, inputArr) {
            this.stepCount = 0;
            this.errorEncountered = false;
            this.arr = [...inputArr];
            this.env = { len: this.arr.length };
            this.trace = [{ step: 0, action: "Initial state", array: [...this.arr] }];

            try {
                this._eval(program);
            } catch (e) {
                this.errorEncountered = true;
            }

            return {
                output_array: this.arr,
                steps_taken: this.stepCount,
                error_encountered: this.errorEncountered,
                trace: this.trace
            };
        }

        _eval(node) {
            this.stepCount++;
            if (this.stepCount >= this.maxSteps) throw new Error("Step limit exceeded");
            if (!node) return null;

            switch (node.type) {
                case "ProgramNode":
                    for (const stmt of node.statements) this._eval(stmt);
                    return null;

                case "ConstNode": return node.value;
                case "VariableNode":
                    if (node.name in this.env) return this.env[node.name];
                    if (node.name === "arr") return this.arr;
                    throw new Error("Undefined variable: " + node.name);

                case "BinaryOpNode": {
                    const l = this._eval(node.left), r = this._eval(node.right);
                    switch (node.op) {
                        case "+": return l + r;
                        case "-": return l - r;
                        case "*": return l * r;
                        case "%": return r !== 0 ? l % r : 0;
                        case "//": return r !== 0 ? Math.floor(l / r) : 0;
                        case "&": return l & r;
                        case "|": return l | r;
                        case "^": return l ^ r;
                        case "<": return l < r;
                        case ">": return l > r;
                        case "==": return l === r;
                        case "!=": return l !== r;
                        case "<=": return l <= r;
                        case ">=": return l >= r;
                    }
                    return 0;
                }

                case "CompareSwapNode": {
                    const i1 = this._eval(node.idx1), i2 = this._eval(node.idx2);
                    if (i1 >= 0 && i1 < this.arr.length && i2 >= 0 && i2 < this.arr.length) {
                        let swapped = false;
                        if (this.arr[i1] > this.arr[i2]) {
                            const t = this.arr[i1]; this.arr[i1] = this.arr[i2]; this.arr[i2] = t;
                            swapped = true;
                        }
                        this.trace.push({ step: this.stepCount, action: `CompareSwap(${i1}, ${i2}) -> ${swapped?"swapped":"no swap"}`, array: [...this.arr] });
                    }
                    return null;
                }

                case "SwapNode": {
                    const i1 = this._eval(node.idx1), i2 = this._eval(node.idx2);
                    if (i1 >= 0 && i1 < this.arr.length && i2 >= 0 && i2 < this.arr.length) {
                        const t = this.arr[i1]; this.arr[i1] = this.arr[i2]; this.arr[i2] = t;
                        this.trace.push({ step: this.stepCount, action: `Swap(${i1}, ${i2})`, array: [...this.arr] });
                    }
                    return null;
                }

                case "ReverseRangeNode": {
                    const s = Math.max(0, Math.min(this._eval(node.start), this.arr.length));
                    const e = Math.max(s, Math.min(this._eval(node.end), this.arr.length));
                    if (e > s) {
                        const sub = this.arr.slice(s, e).reverse();
                        this.arr.splice(s, sub.length, ...sub);
                        this.trace.push({ step: this.stepCount, action: `ReverseRange(${s}, ${e})`, array: [...this.arr] });
                    }
                    return null;
                }

                case "ArrayAssignNode": {
                    const idx = this._eval(node.idx), val = this._eval(node.value);
                    if (idx >= 0 && idx < this.arr.length) {
                        this.arr[idx] = val;
                        this.trace.push({ step: this.stepCount, action: `ArrayAssign arr[${idx}] = ${val}`, array: [...this.arr] });
                    }
                    return null;
                }

                case "AssignNode": {
                    const val = this._eval(node.value);
                    this.env[node.var_name] = val;
                    return null;
                }

                case "LoopNode": {
                    const start = this._eval(node.start), end = this._eval(node.end);
                    for (let i = start; i < end; i++) {
                        this.env[node.var_name] = i;
                        for (const b of node.body) this._eval(b);
                    }
                    return null;
                }

                case "IfNode": {
                    if (this._eval(node.condition)) {
                        for (const b of node.then_body) this._eval(b);
                    } else if (node.else_body) {
                        for (const b of node.else_body) this._eval(b);
                    }
                    return null;
                }
            }
        }
    }

    // ──────────── Fitness Evaluator ────────────
    function evaluateFitness(program, testCases) {
        const interp = new Interpreter();
        let totalCorrect = 0, totalSteps = 0;
        if (!testCases || !testCases.length) return 0;

        for (const [inArr, expArr] of testCases) {
            const res = interp.execute(program, inArr);
            if (res.error_encountered) return -1000;
            let correct = 0;
            const maxLen = Math.max(res.output_array.length, expArr.length);
            for (let i = 0; i < maxLen; i++) {
                if (res.output_array[i] === expArr[i]) correct++;
            }
            totalCorrect += (correct / maxLen) * 100;
            totalSteps += res.steps_taken;
        }

        const avgCorrect = totalCorrect / testCases.length;
        const avgSteps = totalSteps / testCases.length;
        const depth = program.getDepth();
        return avgCorrect - (avgSteps * 0.01) - (depth * 0.1);
    }

    // ──────────── Local Repair ────────────
    function localRepair(program, testCases) {
        const interp = new Interpreter();
        let currentFit = evaluateFitness(program, testCases);
        if (currentFit >= 95) return program;

        const sampleIn = testCases[0][0];
        const n = sampleIn.length;
        const isSorting = testCases.every(([inArr, expArr]) => JSON.stringify(expArr) === JSON.stringify([...inArr].sort((a,b)=>a-b)));

        if (isSorting) {
            const failingPairs = new Set();
            for (const [inArr, expArr] of testCases) {
                const res = interp.execute(program, inArr);
                const out = res.output_array;
                for (let i = 0; i < out.length; i++) {
                    for (let j = i + 1; j < out.length; j++) {
                        if (out[i] > out[j]) failingPairs.add(`${i},${j}`);
                    }
                }
            }

            if (failingPairs.size > 0) {
                const newStmts = [...program.statements];
                for (const pairStr of failingPairs) {
                    const [i, j] = pairStr.split(",").map(Number);
                    newStmts.push(new CompareSwapNode(new ConstNode(i), new ConstNode(j)));
                }
                const cand = new ProgramNode(newStmts);
                const candFit = evaluateFitness(cand, testCases);
                if (candFit > currentFit) {
                    program = cand;
                    currentFit = candFit;
                }
            }

            if (currentFit < 95) {
                const networkStmts = [];
                for (let i = 0; i < n; i++) {
                    for (let j = i + 1; j < n; j++) {
                        networkStmts.push(new CompareSwapNode(new ConstNode(i), new ConstNode(j)));
                    }
                }
                const structProg = new ProgramNode(networkStmts);
                const structFit = evaluateFitness(structProg, testCases);
                if (structFit > currentFit) return structProg;
            }
        }
        return program;
    }

    // ──────────── Seeded PRNG (Mulberry32) ────────────
    function makePRNG(seed) {
        let s = seed >>> 0;
        return function() {
            s += 0x6D2B79F5;
            let t = s;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // ──────────── Random AST Generator ────────────
    function randomAST(rand, maxDepth, n) {
        // Generate a random sorting-oriented program
        const stmts = [];
        const stmtCount = Math.floor(rand() * (n * 2)) + 1;
        for (let k = 0; k < stmtCount; k++) {
            stmts.push(randomStmt(rand, maxDepth - 1, n));
        }
        return new ProgramNode(stmts);
    }

    function randomStmt(rand, depth, n) {
        if (depth <= 0 || rand() < 0.65) {
            // Leaf: compare-swap with random indices
            const i = Math.floor(rand() * n);
            let j = Math.floor(rand() * n);
            if (j === i) j = (i + 1) % n;
            return new CompareSwapNode(new ConstNode(i), new ConstNode(j));
        }
        const r = rand();
        if (r < 0.5) {
            // Swap node
            const i = Math.floor(rand() * n);
            let j = Math.floor(rand() * n);
            if (j === i) j = (i + 1) % n;
            return new SwapNode(new ConstNode(i), new ConstNode(j));
        }
        if (r < 0.75 && n >= 3) {
            // Loop
            const start = Math.floor(rand() * (n - 1));
            const end = start + 1 + Math.floor(rand() * (n - start - 1));
            const body = [];
            const bodyLen = Math.floor(rand() * 3) + 1;
            for (let b = 0; b < bodyLen; b++) {
                const ii = Math.floor(rand() * n);
                let jj = Math.floor(rand() * n);
                if (jj === ii) jj = (ii + 1) % n;
                body.push(new CompareSwapNode(new ConstNode(ii), new ConstNode(jj)));
            }
            return new LoopNode("i", new ConstNode(start), new ConstNode(end), body);
        }
        // Default: compare-swap
        const i = Math.floor(rand() * n);
        let j = Math.floor(rand() * n);
        if (j === i) j = (i + 1) % n;
        return new CompareSwapNode(new ConstNode(i), new ConstNode(j));
    }

    // ──────────── Mutate AST ────────────
    function mutateAST(program, rand, n) {
        const clone = cloneAST(program);
        const stmts = clone.statements;
        if (!stmts || stmts.length === 0) return clone;

        const r = rand();
        if (r < 0.3 && stmts.length < 20) {
            // Add a random statement
            const i = Math.floor(rand() * n);
            let j = Math.floor(rand() * n);
            if (j === i) j = (i + 1) % n;
            stmts.push(new CompareSwapNode(new ConstNode(i), new ConstNode(j)));
        } else if (r < 0.55 && stmts.length > 1) {
            // Remove a random statement
            const idx = Math.floor(rand() * stmts.length);
            stmts.splice(idx, 1);
        } else {
            // Mutate a random statement's indices
            const idx = Math.floor(rand() * stmts.length);
            const i = Math.floor(rand() * n);
            let j = Math.floor(rand() * n);
            if (j === i) j = (i + 1) % n;
            stmts[idx] = new CompareSwapNode(new ConstNode(i), new ConstNode(j));
        }
        return clone;
    }

    // ──────────── Crossover ────────────
    function crossover(a, b, rand) {
        const sa = a.statements || [];
        const sb = b.statements || [];
        if (sa.length === 0) return cloneAST(b);
        if (sb.length === 0) return cloneAST(a);
        const cut = Math.floor(rand() * sa.length);
        const newStmts = [
            ...sa.slice(0, cut).map(cloneAST),
            ...sb.slice(cut).map(cloneAST)
        ];
        return new ProgramNode(newStmts.length > 0 ? newStmts : sa.map(cloneAST));
    }

    // ──────────── Genetic Engine ────────────
    class GeneticEngine {
        constructor(options = {}) {
            this.popSize      = options.popSize      || 60;
            this.maxGen       = options.maxGen       || 80;
            this.mutRate      = options.mutRate      || 0.35;
            this.crsRate      = options.crsRate      || 0.6;
            this.maxDepth     = options.maxDepth     || 6;
            this.seed         = options.seed         || Math.floor(Math.random() * 99999) + 1;
            this.onGeneration = options.onGeneration || null; // callback(gen, bestFit, avgFit, bestProg)
            this.rand         = makePRNG(this.seed);
        }

        run(testCases) {
            const n = testCases[0][0].length;
            const rand = this.rand;

            // Initialise population
            let population = [];
            for (let i = 0; i < this.popSize; i++) {
                population.push(randomAST(rand, this.maxDepth, n));
            }

            let bestProg = population[0];
            let bestFit  = -Infinity;

            for (let gen = 1; gen <= this.maxGen; gen++) {
                // Evaluate
                const scored = population.map(p => ({ prog: p, fit: evaluateFitness(p, testCases) }));
                scored.sort((a, b) => b.fit - a.fit);

                if (scored[0].fit > bestFit) {
                    bestFit = scored[0].fit;
                    bestProg = scored[0].prog;
                }

                const avgFit = scored.reduce((s, x) => s + x.fit, 0) / scored.length;

                if (this.onGeneration) {
                    this.onGeneration(gen, Math.max(0, bestFit), Math.max(0, avgFit), bestProg);
                }

                // Early exit if perfect
                if (bestFit >= 99) break;

                // Build next generation
                const elite = scored.slice(0, Math.max(2, Math.floor(this.popSize * 0.1)));
                const next  = elite.map(e => cloneAST(e.prog));

                while (next.length < this.popSize) {
                    // Tournament selection
                    const pick = () => {
                        const a = scored[Math.floor(rand() * scored.length)];
                        const b = scored[Math.floor(rand() * scored.length)];
                        return a.fit >= b.fit ? a.prog : b.prog;
                    };
                    const p1 = pick(), p2 = pick();
                    let child;
                    if (rand() < this.crsRate) {
                        child = crossover(p1, p2, rand);
                    } else {
                        child = cloneAST(rand() < 0.5 ? p1 : p2);
                    }
                    if (rand() < this.mutRate) {
                        child = mutateAST(child, rand, n);
                    }
                    next.push(child);
                }
                population = next;
            }

            // Final repair pass
            const repaired = localRepair(bestProg, testCases);
            const finalFit = evaluateFitness(repaired, testCases);
            if (finalFit > bestFit) {
                bestProg = repaired;
                bestFit  = finalFit;
            }

            return { bestProg, bestFit: Math.min(100, Math.max(0, bestFit)) };
        }
    }

    // ──────────── Exports for Browser / Node ────────────
    exports.ConstNode = ConstNode;
    exports.VariableNode = VariableNode;
    exports.CompareSwapNode = CompareSwapNode;
    exports.SwapNode = SwapNode;
    exports.ReverseRangeNode = ReverseRangeNode;
    exports.ArrayAssignNode = ArrayAssignNode;
    exports.AssignNode = AssignNode;
    exports.LoopNode = LoopNode;
    exports.IfNode = IfNode;
    exports.BinaryOpNode = BinaryOpNode;
    exports.ProgramNode = ProgramNode;
    exports.Interpreter = Interpreter;
    exports.evaluateFitness = evaluateFitness;
    exports.localRepair = localRepair;
    exports.GeneticEngine = GeneticEngine;

})(typeof exports !== "undefined" ? exports : (window.AlgoEngine = {}));
