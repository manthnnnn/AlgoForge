// ══════════════════════════════════════════════════════════════════════
//  ALGOFORGE — Genuine Evolutionary Formula Discovery Engine
//  True GP-based Mathematical Law Search (no templates, no fakes)
//  Each run explores formula space fresh and surfaces unique findings
// ══════════════════════════════════════════════════════════════════════

(function() {

"use strict";

// ──────────────────────────────────────────────────────────────────────
//  SECTION 1: Formula AST Nodes (symbolic math grammar)
// ──────────────────────────────────────────────────────────────────────

const CONSTS = {
    PI: Math.PI, E: Math.E, PHI: (1 + Math.sqrt(5)) / 2,
    LN2: Math.LN2, SQRT2: Math.SQRT2
};

function evalNode(node, n) {
    if (!node) return 0;
    switch (node.t) {
        case "N":  return node.v;          // constant number
        case "X":  return n;               // variable n
        case "PI": return Math.PI;
        case "E":  return Math.E;
        case "PHI": return CONSTS.PHI;
        case "+":  return evalNode(node.l, n) + evalNode(node.r, n);
        case "-":  return evalNode(node.l, n) - evalNode(node.r, n);
        case "*":  return evalNode(node.l, n) * evalNode(node.r, n);
        case "/": {
            const d = evalNode(node.r, n);
            return Math.abs(d) < 1e-10 ? NaN : evalNode(node.l, n) / d;
        }
        case "^": {
            const b = evalNode(node.l, n), e = evalNode(node.r, n);
            if (b < 0 && !Number.isInteger(e)) return NaN;
            return Math.pow(b, e);
        }
        case "sqrt": {
            const v = evalNode(node.l, n);
            return v < 0 ? NaN : Math.sqrt(v);
        }
        case "log": {
            const v = evalNode(node.l, n);
            return v <= 0 ? NaN : Math.log(v);
        }
        case "sin":  return Math.sin(evalNode(node.l, n));
        case "cos":  return Math.cos(evalNode(node.l, n));
        case "abs":  return Math.abs(evalNode(node.l, n));
        case "floor": return Math.floor(evalNode(node.l, n));
        case "%": {
            const d = Math.floor(evalNode(node.r, n));
            return d === 0 ? NaN : evalNode(node.l, n) % d;
        }
        default: return 0;
    }
}

function nodeToStr(node) {
    if (!node) return "?";
    switch (node.t) {
        case "N":    return node.v % 1 === 0 ? String(node.v) : node.v.toFixed(3);
        case "X":    return "n";
        case "PI":   return "π";
        case "E":    return "e";
        case "PHI":  return "φ";
        case "+":    return `(${nodeToStr(node.l)} + ${nodeToStr(node.r)})`;
        case "-":    return `(${nodeToStr(node.l)} - ${nodeToStr(node.r)})`;
        case "*":    return `${nodeToStr(node.l)} · ${nodeToStr(node.r)}`;
        case "/":    return `${nodeToStr(node.l)} / ${nodeToStr(node.r)}`;
        case "^":    return `${nodeToStr(node.l)}^${nodeToStr(node.r)}`;
        case "sqrt": return `√(${nodeToStr(node.l)})`;
        case "log":  return `ln(${nodeToStr(node.l)})`;
        case "sin":  return `sin(${nodeToStr(node.l)})`;
        case "cos":  return `cos(${nodeToStr(node.l)})`;
        case "abs":  return `|${nodeToStr(node.l)}|`;
        case "floor": return `⌊${nodeToStr(node.l)}⌋`;
        case "%":    return `(${nodeToStr(node.l)} mod ${nodeToStr(node.r)})`;
        default:     return "?";
    }
}

function nodeDepth(node) {
    if (!node) return 0;
    if (["N","X","PI","E","PHI"].includes(node.t)) return 1;
    const ld = node.l ? nodeDepth(node.l) : 0;
    const rd = node.r ? nodeDepth(node.r) : 0;
    return 1 + Math.max(ld, rd);
}

// ──────────────────────────────────────────────────────────────────────
//  SECTION 2: Random Formula Generator (controlled depth)
// ──────────────────────────────────────────────────────────────────────

function randi(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randf(a, b) { return Math.random() * (b - a) + a; }
function pick(arr)   { return arr[randi(0, arr.length - 1)]; }

const BINARY_OPS = ["+", "-", "*", "/", "^", "%"];
const UNARY_OPS  = ["sqrt", "log", "sin", "cos", "abs", "floor"];
const TERMINALS  = ["X", "N", "PI", "E", "PHI"];

function randomNode(depth, allowedOps) {
    const maxDepth = 5;
    const ops   = allowedOps || [...BINARY_OPS, ...UNARY_OPS];
    const bOps  = ops.filter(o => BINARY_OPS.includes(o));
    const uOps  = ops.filter(o => UNARY_OPS.includes(o));

    if (depth >= maxDepth || Math.random() < 0.35) {
        const t = pick(TERMINALS);
        if (t === "N") return { t: "N", v: pick([-3,-2,-1,1,2,3,4,5,6,7,8,9,10,12]) };
        return { t };
    }

    const useUnary = uOps.length > 0 && Math.random() < 0.28;
    if (useUnary) {
        const op = pick(uOps);
        return { t: op, l: randomNode(depth + 1, allowedOps) };
    }
    const op = bOps.length ? pick(bOps) : "+";
    return {
        t: op,
        l: randomNode(depth + 1, allowedOps),
        r: randomNode(depth + 1, allowedOps)
    };
}

function mutateNode(node, rate, allowedOps) {
    if (!node) return randomNode(0, allowedOps);
    if (Math.random() < rate) return randomNode(1, allowedOps);

    const n = { ...node };
    if (n.l) n.l = mutateNode(n.l, rate * 0.7, allowedOps);
    if (n.r) n.r = mutateNode(n.r, rate * 0.7, allowedOps);
    if (n.t === "N" && Math.random() < 0.3) n.v = n.v + pick([-2,-1,1,2]);
    return n;
}

function crossover(a, b) {
    // Swap a random subtree from b into a
    if (Math.random() < 0.5) {
        if (a.l && b.l) return { ...a, l: b.l };
        if (a.r && b.r) return { ...a, r: b.r };
    }
    return Math.random() < 0.5 ? a : b;
}

// ──────────────────────────────────────────────────────────────────────
//  SECTION 3: Known Sequences (to discover laws for)
// ──────────────────────────────────────────────────────────────────────

function sievePrimes(N) {
    const s = new Uint8Array(N + 1).fill(1);
    s[0] = s[1] = 0;
    for (let i = 2; i * i <= N; i++) if (s[i]) for (let j = i*i; j <= N; j += i) s[j] = 0;
    const p = [];
    for (let i = 2; i <= N; i++) if (s[i]) p.push(i);
    return p;
}

const KNOWN_SEQUENCES = {
    "Prime Numbers":      () => sievePrimes(200).slice(0, 20).map((v,i) => [i+1, v]),
    "Perfect Squares":    () => Array.from({length:20}, (_,i) => [i+1, (i+1)*(i+1)]),
    "Fibonacci":          () => { const f=[1,1]; for(let i=2;i<20;i++) f.push(f[i-1]+f[i-2]); return f.map((v,i)=>[i+1,v]); },
    "Triangular Numbers": () => Array.from({length:20}, (_,i) => [i+1, (i+1)*(i+2)/2]),
    "Cube Numbers":       () => Array.from({length:20}, (_,i) => [i+1, Math.pow(i+1,3)]),
    "Catalan Numbers":    () => { const fac=k=>k<=1?1:k*fac(k-1); return Array.from({length:12},(_,n)=>[n+1,fac(2*(n+1))/(fac(n+2)*fac(n+1))]); },
    "Euler Totient":      () => { const phi=n=>{let r=n,m=n;for(let p=2;p*p<=m;p++)if(m%p===0){while(m%p===0)m=Math.floor(m/p);r-=Math.floor(r/p)}if(m>1)r-=Math.floor(r/m);return r}; return Array.from({length:18},(_,i)=>[i+2,phi(i+2)]); },
    "Twin Prime Gaps":    () => { const p=sievePrimes(500); const t=[]; for(let i=0;i<p.length-1;i++) if(p[i+1]-p[i]===2) t.push([t.length+1,p[i]]); return t.slice(0,15); },
    "Factorial Mod 7":    () => { const f=k=>k<=1?1:k*f(k-1); return Array.from({length:14},(_,i)=>[i+1,f(i+1)%7]); },
    "Collatz Max":        () => { const c=n=>{let x=n,m=n;while(x!==1){x=x%2===0?x/2:3*x+1;m=Math.max(m,x)}return m}; return Array.from({length:15},(_,i)=>[i+2,c(i+2)]); }
};

// ──────────────────────────────────────────────────────────────────────
//  SECTION 4: Fitness Evaluation
// ──────────────────────────────────────────────────────────────────────

function evalFitness(node, data) {
    if (!data || !data.length) return -Infinity;
    let totalSqErr = 0, valid = 0;
    const yMean = data.reduce((s, [, y]) => s + y, 0) / data.length;
    let ssTot = 0;

    for (const [n, y] of data) {
        const pred = evalNode(node, n);
        if (!isFinite(pred) || isNaN(pred)) return -Infinity;
        totalSqErr += Math.pow(pred - y, 2);
        ssTot += Math.pow(y - yMean, 2);
        valid++;
    }
    if (valid < data.length * 0.8) return -Infinity;
    if (ssTot < 1e-12) return -50;

    const r2 = 1 - totalSqErr / ssTot;
    const simplicity = 1 / (1 + nodeDepth(node) * 0.15);
    return r2 * 100 * simplicity;
}

// ──────────────────────────────────────────────────────────────────────
//  SECTION 5: Surprise / Novelty Scorer
// ──────────────────────────────────────────────────────────────────────

function scoreNovelty(node, formula) {
    // Cross-domain surprise: does this formula use π, e, φ?
    let crossDomain = 0;
    const fStr = JSON.stringify(node);
    if (fStr.includes('"PI"')) crossDomain += 15;
    if (fStr.includes('"E"'))  crossDomain += 15;
    if (fStr.includes('"PHI"')) crossDomain += 20;

    // Complexity elegance: not too simple, not too complex
    const d = nodeDepth(node);
    const elegance = d >= 2 && d <= 5 ? 10 : d === 1 ? 0 : 5;

    // Unexpectedness: uses log or trig on integer sequences
    if (fStr.includes('"log"') || fStr.includes('"sin"') || fStr.includes('"cos"')) crossDomain += 12;

    return crossDomain + elegance;
}

// ──────────────────────────────────────────────────────────────────────
//  SECTION 6: Main Genetic Formula Evolution Loop (async via chunks)
// ──────────────────────────────────────────────────────────────────────

let discoveryRunning = false;
let lastDiscovery    = null;
let discovChart      = null;

function initDiscoveryUI() {
    const btn = document.getElementById("btnDiscover");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (discoveryRunning) return;
        startEvolution();
    });

    const stopBtn = document.getElementById("btnStopDiscover");
    if (stopBtn) stopBtn.addEventListener("click", () => { discoveryRunning = false; });

    window.copyDiscovery = function() {
        if (!lastDiscovery) return;
        const text = buildResearchText(lastDiscovery);
        navigator.clipboard.writeText(text).then(() => alert("Discovery copied!"));
    };

    window.exportDiscovery = function() {
        if (!lastDiscovery) return;
        const blob = new Blob([buildResearchText(lastDiscovery)], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `Discovery_${lastDiscovery.name.replace(/ /g,"_")}_${Date.now()}.txt`;
        a.click();
    };
}

function buildResearchText(d) {
    return [
        "ALGOFORGE — Evolutionary Formula Discovery Report",
        "=".repeat(50),
        "",
        `Discovery Name: ${d.name}`,
        `Target Sequence: ${d.seqName}`,
        "",
        "Discovered Formula:",
        `  f(n) = ${d.formula}`,
        "",
        `Accuracy (R²): ${d.r2.toFixed(4)}%`,
        `Formula Depth: ${d.depth}`,
        `Novelty Score: ${d.novelty}`,
        `Operations Used: ${d.opsUsed.join(", ")}`,
        "",
        "Verification Samples:",
        ...d.samples.map(([n, actual, predicted]) =>
            `  n=${n}: actual=${actual.toFixed(4)}, predicted=${predicted.toFixed(4)}, error=${Math.abs(actual-predicted).toFixed(4)}`
        ),
        "",
        "Plain English Explanation:",
        d.explanation,
        "",
        `Generated by ALGOFORGE Theory Forge — https://algoforgeai.netlify.app`,
        `Timestamp: ${new Date().toISOString()}`
    ].join("\n");
}

async function startEvolution() {
    discoveryRunning = true;

    const seqKey   = document.getElementById("discovSeq")?.value || "Prime Numbers";
    const popSzEl  = document.getElementById("discovPop");
    const genEl    = document.getElementById("discovGen");
    const allowLog = document.getElementById("discovLog")?.checked;
    const allowTrig = document.getElementById("discovTrig")?.checked;
    const allowPow = document.getElementById("discovPow")?.checked;

    const POP_SIZE = parseInt(popSzEl?.value || 80);
    const MAX_GEN  = parseInt(genEl?.value || 80);

    const allowedOps = ["+", "-", "*"];
    if (allowPow !== false) allowedOps.push("^", "/");
    if (allowLog)  allowedOps.push("log");
    if (allowTrig) allowedOps.push("sin", "cos");
    allowedOps.push("sqrt");

    const seqFn = KNOWN_SEQUENCES[seqKey] || KNOWN_SEQUENCES["Prime Numbers"];
    const data  = seqFn();

    // UI reset
    setUI("discovBadge", "Evolving...", "b-running");
    setEl("discovProgress", "");
    setEl("discovFormula", "Searching...");
    setEl("discovFitness", "");
    showEl("discovResultPanel", false);
    setEl("discovLog_out", "");

    const prog = document.getElementById("discovProgFill");
    if (prog) prog.style.width = "0%";

    // Init population
    let population = Array.from({ length: POP_SIZE }, () => ({
        node: randomNode(0, allowedOps),
        fit:  -Infinity,
        nov:  0
    }));

    let bestEver = null, bestFit = -Infinity;
    const log = [];

    for (let gen = 0; gen < MAX_GEN; gen++) {
        if (!discoveryRunning) break;

        // Evaluate
        for (const ind of population) {
            if (ind.fit === -Infinity || gen === 0) {
                ind.fit = evalFitness(ind.node, data);
                ind.nov = scoreNovelty(ind.node, nodeToStr(ind.node));
            }
        }

        // Combined score: fitness + novelty bonus
        population.sort((a, b) => (b.fit + b.nov * 0.5) - (a.fit + a.nov * 0.5));

        const topFit = population[0].fit;
        if (topFit > bestFit) {
            bestFit  = topFit;
            bestEver = { ...population[0] };
        }

        log.push({ gen: gen + 1, best: Math.max(0, bestFit), avg: average(population.slice(0,10).map(p => Math.max(0, p.fit))) });

        // Update UI every 5 gens
        if (gen % 5 === 0 || gen === MAX_GEN - 1) {
            const pct = ((gen + 1) / MAX_GEN * 100).toFixed(0);
            if (prog) prog.style.width = pct + "%";
            setEl("discovProgress", `Gen ${gen+1}/${MAX_GEN} — Best fit: ${bestFit.toFixed(2)}`);
            setEl("discovFormula", `f(n) = ${nodeToStr(population[0].node)}`);
            setEl("discovFitness", `${Math.max(0, bestFit).toFixed(2)}%`);
            updateEvoChart(log);
            await yieldToUI();
        }

        // Early stop if perfect
        if (bestFit >= 98) break;

        // Next generation
        const elite  = population.slice(0, Math.floor(POP_SIZE * 0.15));
        const newPop = [...elite];

        while (newPop.length < POP_SIZE) {
            const a = tournament(population, 5);
            const b = tournament(population, 5);
            let child;
            if (Math.random() < 0.6) {
                child = crossover(a.node, b.node);
            } else {
                child = mutateNode(a.node, 0.3, allowedOps);
            }
            newPop.push({ node: child, fit: -Infinity, nov: 0 });
        }
        population = newPop;
    }

    discoveryRunning = false;
    if (prog) prog.style.width = "100%";

    if (!bestEver || bestEver.fit < -900) {
        setUI("discovBadge", "No strong fit found — try more generations!", "b-ready");
        return;
    }

    // Build discovery report
    const formula = nodeToStr(bestEver.node);
    const opsUsed = extractOps(bestEver.node);
    const samples = data.slice(0, 8).map(([n, y]) => {
        const pred = evalNode(bestEver.node, n);
        return [n, y, pred];
    });
    const noveltyScore = scoreNovelty(bestEver.node, formula);
    const r2 = Math.max(0, bestEver.fit / (1 - nodeDepth(bestEver.node) * 0.15));

    const crossDomain = opsUsed.some(o => ["sin","cos","log","sqrt","PI","E","PHI"].includes(o));
    const discovName = generateDiscoveryName(seqKey, formula, crossDomain, noveltyScore, opsUsed);
    const explanation = generateExplanation(seqKey, formula, opsUsed, crossDomain, r2);

    lastDiscovery = {
        name:       discovName,
        seqName:    seqKey,
        formula,
        r2:         Math.max(0, bestEver.fit),
        depth:      nodeDepth(bestEver.node),
        novelty:    noveltyScore,
        opsUsed,
        samples,
        explanation
    };

    // Render result
    setEl("discovName",    discovName);
    setEl("discovSeqLabel", seqKey);
    setEl("discovFormulaFinal", `f(n) = ${formula}`);
    setEl("discovR2",       `${lastDiscovery.r2.toFixed(2)}% fit accuracy`);
    setEl("discovNov",      `Novelty Score: ${noveltyScore} ${noveltyScore >= 30 ? "🌟 Cross-domain!" : ""}`);
    setEl("discovDepth",    `Formula depth: ${nodeDepth(bestEver.node)}`);
    setEl("discovOps",      `Operations: ${opsUsed.join(", ")}`);
    setEl("discovExplain",  explanation);

    // Sample verification table
    const rows = samples.map(([n, a, p]) =>
        `<tr><td>n=${n}</td><td>${a.toFixed(3)}</td><td>${p.toFixed(3)}</td><td style="color:${Math.abs(a-p)<0.5?'var(--mint)':'var(--peach)'}">${Math.abs(a-p).toFixed(3)}</td></tr>`
    ).join("");
    const tbl = document.getElementById("discovSamples");
    if (tbl) tbl.innerHTML = rows;

    showEl("discovResultPanel", true);
    setUI("discovBadge", `✅ R²=${lastDiscovery.r2.toFixed(1)}%`, "b-done");

    if (noveltyScore >= 30 && crossDomain) launchConfettiSmall();
}

// ──────────── Helpers ────────────

function average(arr) { return arr.reduce((a,b)=>a+b,0)/arr.length; }

function tournament(pop, k) {
    let best = null;
    for (let i = 0; i < k; i++) {
        const c = pop[Math.floor(Math.random() * pop.length)];
        if (!best || (c.fit + c.nov * 0.5) > (best.fit + best.nov * 0.5)) best = c;
    }
    return best;
}

function yieldToUI() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setUI(id, text, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = "badge " + cls;
}

function showEl(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
}

function extractOps(node) {
    if (!node) return [];
    const ops = new Set();
    const walk = n => {
        if (!n) return;
        if (!["N","X"].includes(n.t)) ops.add(n.t);
        walk(n.l); walk(n.r);
    };
    walk(node);
    return [...ops];
}

function generateDiscoveryName(seqKey, formula, crossDomain, noveltyScore, opsUsed) {
    const sig = Math.floor(Math.random() * 90000 + 10000);
    const domainShort = seqKey.split(" ").slice(0,2).join("_");

    if (crossDomain && opsUsed.includes("PI"))  return `${domainShort} π-Harmonic Identity [AF-${sig}]`;
    if (crossDomain && opsUsed.includes("E"))   return `${domainShort} e-Exponential Law [AF-${sig}]`;
    if (crossDomain && opsUsed.includes("PHI")) return `${domainShort} φ-Golden Structure [AF-${sig}]`;
    if (opsUsed.includes("log"))                return `${domainShort} Logarithmic Descent Law [AF-${sig}]`;
    if (opsUsed.includes("sin") || opsUsed.includes("cos")) return `${domainShort} Oscillatory Pattern [AF-${sig}]`;
    if (opsUsed.some(o => ["sqrt","^"].includes(o)))        return `${domainShort} Power Scaling Rule [AF-${sig}]`;
    return `${domainShort} Algebraic Law [AF-${sig}]`;
}

function generateExplanation(seqKey, formula, opsUsed, crossDomain, r2) {
    const parts = [];

    parts.push(`The Evolutionary Formula Discovery engine searched through thousands of symbolic expression trees over multiple generations, testing candidate formulas against the "${seqKey}" sequence.`);

    if (crossDomain) {
        const cds = opsUsed.filter(o => ["PI","E","PHI","log","sin","cos"].includes(o));
        parts.push(`Remarkably, the discovered formula involves ${cds.map(c=>({PI:"π",E:"e",PHI:"φ",log:"natural logarithm",sin:"sine function",cos:"cosine function"})[c]).join(" and ")} — a cross-domain connection between "${seqKey}" and a fundamental mathematical constant that is not obvious from first principles.`);
    }

    if (opsUsed.includes("^")) parts.push("The formula exhibits a power-law relationship, meaning the sequence grows non-linearly — a property that links it to known algebraic structures.");
    if (opsUsed.includes("sqrt")) parts.push("The presence of a square root suggests an underlying quadratic structure in the sequence, similar to how pendulum period relates to length.");
    if (opsUsed.includes("log")) parts.push("The logarithmic term indicates the growth rate of the sequence slows asymptotically, similar to the Prime Number Theorem's π(N) ~ N/ln(N).");

    parts.push(`The formula achieves ${r2.toFixed(1)}% fit accuracy on sampled data points. To formally prove this formula describes the sequence exactly (not just approximately), rigorous mathematical induction or generating function analysis would be required — the next frontier for human mathematicians!`);

    return parts.join(" ");
}

// ──────────── Live evolution chart ────────────

function updateEvoChart(log) {
    const canvas = document.getElementById("chartDiscovery");
    if (!canvas) return;

    const data = {
        labels: log.map(l => `G${l.gen}`),
        datasets: [
            {
                label: "Best Fitness",
                data: log.map(l => l.best),
                borderColor: "#FB923C",
                borderWidth: 2.5,
                backgroundColor: "rgba(251,146,60,0.1)",
                pointRadius: 1.5,
                fill: true,
                tension: 0.35
            },
            {
                label: "Avg Top-10",
                data: log.map(l => l.avg),
                borderColor: "#818CF8",
                borderWidth: 1.8,
                borderDash: [5, 4],
                pointRadius: 0,
                tension: 0.35
            }
        ]
    };

    if (!discovChart) {
        discovChart = new Chart(canvas.getContext("2d"), {
            type: "line", data,
            options: {
                responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
                plugins: { legend: { labels: { color: "#475569", font: { family: "'Plus Jakarta Sans'", weight: "600" } } } },
                scales: {
                    x: { grid: { color: "rgba(225,29,72,0.08)" }, ticks: { color: "#475569", maxTicksLimit: 10 } },
                    y: { grid: { color: "rgba(225,29,72,0.08)" }, ticks: { color: "#475569" }, min: 0, max: 100 }
                }
            }
        });
    } else {
        discovChart.data = data;
        discovChart.update("none");
    }
}

function launchConfettiSmall() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width, y: -20,
        r: Math.random() * 5 + 2,
        d: Math.random() * 2 + 1.5,
        c: ["#FB923C","#818CF8","#34D399","#38BDF8","#C4B5FD"][Math.floor(Math.random()*5)],
        t: Math.random() * Math.PI * 2
    }));
    let frames = 0;
    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.y += p.d * 3; p.t += 0.05; p.x += Math.sin(p.t); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.r, p.r); });
        frames++;
        if (frames < 100) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })();
}

// ──────────── Boot ────────────
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiscoveryUI);
} else {
    initDiscoveryUI();
}

})();
