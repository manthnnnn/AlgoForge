const express = require('express');
const cors    = require('cors');
const { spawn } = require('child_process');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PYTHON_CMD  = process.platform === 'win32' ? 'python' : 'python3';
const BRIDGE_PATH = path.join(__dirname, 'search', 'api_bridge.py');
const ARCHIVE_PATH = path.join(__dirname, 'program_archive.json');

// ── Helper: run Python bridge command ──
function runBridge(args, res) {
    const py = spawn(PYTHON_CMD, [BRIDGE_PATH, ...args]);
    let out = '', err = '';
    py.stdout.on('data', d => out += d.toString());
    py.stderr.on('data', d => err += d.toString());
    py.on('close', code => {
        if (code !== 0) return res.status(500).json({ error: err || 'Python bridge error' });
        try { res.json(JSON.parse(out)); }
        catch(e) { res.status(500).json({ error: 'Invalid JSON from bridge', raw: out.slice(0,200) }); }
    });
}

// ════════════════════════════════════════
//  API: Benchmark Tasks
// ════════════════════════════════════════
app.get('/api/tasks', (req, res) => {
    runBridge(['tasks'], res);
});

// ════════════════════════════════════════
//  API: Live SSE Synthesis Stream
// ════════════════════════════════════════
app.get('/api/synthesize/stream', (req, res) => {
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.flushHeaders();

    const q = req.query;
    const args = [
        BRIDGE_PATH, 'synthesize',
        '--task',           q.task           || 'sort_2',
        '--pop',            q.pop            || '60',
        '--gen',            q.gen            || '50',
        '--mutation_rate',  q.mutation_rate  || '0.35',
        '--crossover_rate', q.crossover_rate || '0.70',
        '--max_depth',      q.max_depth      || '6',
        '--seed',           q.seed           || '0'
    ];

    const py = spawn(PYTHON_CMD, args);

    py.stdout.on('data', data => {
        data.toString().split('\n').forEach(line => {
            if (line.trim()) res.write(`data: ${line.trim()}\n\n`);
        });
    });

    py.stderr.on('data', d => console.error('[Python]', d.toString()));
    py.on('close', () => { res.write(`data: {"type":"done"}\n\n`); res.end(); });
    req.on('close', () => py.kill());
});

// ════════════════════════════════════════
//  API: Execute AST Program
// ════════════════════════════════════════
app.post('/api/execute', (req, res) => {
    const { ast, input } = req.body;
    if (!ast || !input) return res.status(400).json({ error: 'ast and input required' });
    runBridge(['execute', '--ast', JSON.stringify(ast), '--input', JSON.stringify(input)], res);
});

// ════════════════════════════════════════
//  API: Program Archive & Pareto Front
// ════════════════════════════════════════
app.get('/api/archive', (req, res) => {
    const args = ['archive'];
    if (req.query.task) args.push('--task', req.query.task);
    runBridge(args, res);
});

// ════════════════════════════════════════
//  API: Hall of Fame — Best per Task
// ════════════════════════════════════════
app.get('/api/halloffame', (req, res) => {
    try {
        if (!fs.existsSync(ARCHIVE_PATH)) return res.json({ hall: [] });
        const entries = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf-8'));

        // Group by task, pick best fitness per task
        const best = {};
        entries.forEach(e => {
            if (!best[e.task_name] || e.fitness > best[e.task_name].fitness) {
                best[e.task_name] = e;
            }
        });

        const hall = Object.values(best).map(e => ({
            task:      e.task_name,
            fitness:   e.fitness,
            ast_depth: e.ast_depth,
            timestamp: e.timestamp,
            is_novel:  !e.is_duplicate,
            is_best:   e.is_best,
            algo_name: (e.metadata && e.metadata.algo_name) || `Run-${e.id}`
        })).sort((a,b) => b.fitness - a.fitness);

        res.json({ hall });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ════════════════════════════════════════
//  API: Stats Summary
// ════════════════════════════════════════
app.get('/api/stats', (req, res) => {
    try {
        if (!fs.existsSync(ARCHIVE_PATH)) return res.json({ total: 0, novel: 0, tasks: 0, best: 0 });
        const entries = JSON.parse(fs.readFileSync(ARCHIVE_PATH, 'utf-8'));
        const novel   = entries.filter(e => !e.is_duplicate).length;
        const tasks   = new Set(entries.map(e => e.task_name)).size;
        const best    = entries.reduce((max, e) => Math.max(max, e.fitness), 0);
        res.json({ total: entries.length, novel, tasks, best: Math.round(best * 10) / 10 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ════════════════════════════════════════
//  Start
// ════════════════════════════════════════
app.listen(PORT, () => {
    console.log(`⚡ ALGOFORGE — AI Algorithm Invention Engine`);
    console.log(`   Running at http://localhost:${PORT}`);
    console.log(`   Press Ctrl+C to stop`);
});
