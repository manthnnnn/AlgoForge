/* ═══════════════════════════════════════════════════════════
   ALGOFORGE 2.0 — Scientific Research Lab UI Controller
   Connects to Canonical Python Research Engine REST Endpoints.
   Renders experiment metrics, search reduction, ablation matrix,
   transfer graph, reproducibility replays, and research paper export.
   ═══════════════════════════════════════════════════════════ */

const ResearchLab = {
    currentExperiments: [],
    memoryData: { strategies: [], transfers: [], artifacts: [] },

    init() {
        this.bindEvents();
        this.fetchMemoryData();
    },

    bindEvents() {
        const btnExp = document.getElementById('btn-run-exp');
        if (btnExp) btnExp.addEventListener('click', () => this.runExperiment());

        const btnAbl = document.getElementById('btn-run-ablation');
        if (btnAbl) btnAbl.addEventListener('click', () => this.runAblation());

        const btnRep = document.getElementById('btn-generate-report');
        if (btnRep) btnRep.addEventListener('click', () => this.generateReport());
    },

    async fetchMemoryData() {
        try {
            const res = await fetch('/api/research/memory');
            if (res.ok) {
                this.memoryData = await res.json();
                this.renderMemoryView();
                this.renderArtifactsTable();
            }
        } catch (e) {
            console.warn('[ResearchLab] Using local memory state:', e);
        }
    },

    async runExperiment() {
        const problemId = document.getElementById('exp-problem-select')?.value || 'sort_3';
        const method = document.getElementById('exp-method-select')?.value || 'memory_augmented';
        const seedsInput = document.getElementById('exp-seeds-input')?.value || '42,101,202,303,404';
        const pop = parseInt(document.getElementById('exp-pop-input')?.value || '40');
        const gen = parseInt(document.getElementById('exp-gen-input')?.value || '25');

        const btn = document.getElementById('btn-run-exp');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Experiment...'; }

        try {
            const res = await fetch('/api/research/run_experiment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: problemId, method, seeds: seedsInput, pop, gen })
            });

            if (res.ok) {
                const data = await res.json();
                this.currentExperiments.unshift(data);
                this.renderExperimentResults(data);
                await this.fetchMemoryData();
            } else {
                alert('Experiment execution returned an error.');
            }
        } catch (e) {
            alert('Failed to connect to Python Research Engine. Make sure server is running.');
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-flask"></i> Execute Controlled Experiment'; }
        }
    },

    async runAblation() {
        const problemId = document.getElementById('exp-problem-select')?.value || 'sort_3';
        const seedsInput = document.getElementById('exp-seeds-input')?.value || '42,101,202';

        const btn = document.getElementById('btn-run-ablation');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Ablation Matrix...'; }

        try {
            const res = await fetch('/api/research/run_ablation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: problemId, seeds: seedsInput })
            });

            if (res.ok) {
                const data = await res.json();
                this.renderAblationMatrix(data);
            }
        } catch (e) {
            console.error('Ablation error:', e);
        } finally {
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-layer-group"></i> Run 5-Tier Ablation Study'; }
        }
    },

    async reproduceExperiment(expId) {
        try {
            const res = await fetch('/api/research/reproduce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exp_id: expId })
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Reproducibility Match: ${data.deterministic_match ? 'SUCCESS (100% Deterministic Match)' : 'MISMATCH'}\nEvaluations Matched: ${data.evaluations_matched}`);
            }
        } catch (e) {
            alert('Error reproducing experiment: ' + e);
        }
    },

    async generateReport() {
        try {
            const res = await fetch('/api/research/report');
            if (res.ok) {
                const data = await res.json();
                const container = document.getElementById('report-output');
                if (container) {
                    container.innerHTML = `<pre class="code-out">${this.escapeHtml(data.markdown)}</pre>`;
                }
                document.getElementById('modal-report')?.classList.add('on');
            }
        } catch (e) {
            alert('Error generating report: ' + e);
        }
    },

    renderExperimentResults(data) {
        const container = document.getElementById('exp-results-card');
        if (!container) return;

        const m = data.metrics;
        container.innerHTML = `
            <div class="guide-box sky">
                <div class="gicon"><i class="fa-solid fa-chart-line"></i></div>
                <div class="gcontent">
                    <h4>Experiment Completed: ${data.problem_id.toUpperCase()} (${data.method})</h4>
                    <p>Tested across <strong>${data.seeds_tested} random seeds</strong>. Validated using benchmark-specific solution criteria.</p>
                </div>
            </div>

            <div class="metrics mt">
                <div class="m-card">
                    <div class="m-icon mi-indigo"><i class="fa-solid fa-bullseye"></i></div>
                    <div>
                        <span class="m-lab">Discovery Success</span>
                        <span class="m-val">${m.success_rate}%</span>
                    </div>
                </div>
                <div class="m-card">
                    <div class="m-icon mi-sky"><i class="fa-solid fa-calculator"></i></div>
                    <div>
                        <span class="m-lab">Mean Evaluations</span>
                        <span class="m-val">${m.mean_evaluations_success}</span>
                    </div>
                </div>
                <div class="m-card">
                    <div class="m-icon mi-mint"><i class="fa-solid fa-clock"></i></div>
                    <div>
                        <span class="m-lab">Mean Runtime</span>
                        <span class="m-val">${m.mean_runtime_seconds}s</span>
                    </div>
                </div>
                <div class="m-card">
                    <div class="m-icon mi-violet"><i class="fa-solid fa-hourglass-end"></i></div>
                    <div>
                        <span class="m-lab">Censored Timeouts</span>
                        <span class="m-val">${m.timeout_count}</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderAblationMatrix(data) {
        const container = document.getElementById('ablation-results-card');
        if (!container) return;

        let rows = '';
        for (const [tier, m] of Object.entries(data.ablation_matrix)) {
            rows += `
                <tr>
                    <td><strong>${tier}</strong></td>
                    <td>${m.success_rate}%</td>
                    <td>${m.mean_evaluations_success}</td>
                    <td>${m.timeout_count}</td>
                    <td>${m.mean_runtime_seconds}s</td>
                </tr>
            `;
        }

        container.innerHTML = `
            <h3><i class="fa-solid fa-layer-group"></i> 5-Tier Ablation Study Results (${data.problem_id})</h3>
            <table class="dtable mt">
                <thead>
                    <tr>
                        <th>Ablation Tier</th>
                        <th>Success Rate</th>
                        <th>Mean Evaluations</th>
                        <th>Censored Timeouts</th>
                        <th>Mean Runtime</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    },

    renderMemoryView() {
        const container = document.getElementById('memory-strategies-list');
        if (!container) return;

        const strats = this.memoryData.strategies || [];
        if (strats.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-brain"></i><p>No algorithmic strategies stored in memory yet. Execute discovery or experiments to populate strategy memory.</p></div>`;
            return;
        }

        let html = '';
        strats.forEach(s => {
            html += `
                <div class="m-card mt" style="flex-direction:column; align-items:flex-start;">
                    <div style="display:flex; justify-content:space-between; width:100%;">
                        <strong style="color:var(--sky); font-family:var(--mono);">${s.strategy_id}</strong>
                        <span class="chip c-medium">${s.strategy_class}</span>
                    </div>
                    <p style="font-size:12.5px; color:var(--t2); margin-top:6px;">
                        Source Task: <code>${s.source_problem_id}</code> | Fitness: <strong>${s.fitness}%</strong> | Transfers: <strong>${s.successful_transfers}/${s.transfer_attempts}</strong>
                    </p>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderArtifactsTable() {
        const container = document.getElementById('artifacts-list');
        if (!container) return;

        const arts = this.memoryData.artifacts || [];
        if (arts.length === 0) {
            container.innerHTML = `<p class="empty-state">No experiment artifacts stored yet.</p>`;
            return;
        }

        let rows = '';
        arts.forEach(a => {
            rows += `
                <tr>
                    <td style="font-family:var(--mono); font-size:11px;">${a.experiment_id}</td>
                    <td>${a.problem_id}</td>
                    <td><span class="chip ${a.method === 'memory_augmented' ? 'c-medium' : 'c-novel'}">${a.method}</span></td>
                    <td>${a.seed}</td>
                    <td><strong>${a.evaluations_to_solution}</strong></td>
                    <td><span class="badge ${a.run_status === 'SUCCESS' ? 'b-done' : 'b-running'}">${a.run_status}</span></td>
                    <td>
                        <button class="btn btn-ghost" style="padding:4px 10px; font-size:11px;" onclick="ResearchLab.reproduceExperiment('${a.experiment_id}')">
                            <i class="fa-solid fa-rotate-right"></i> Replay
                        </button>
                    </td>
                </tr>
            `;
        });

        container.innerHTML = `
            <table class="dtable">
                <thead>
                    <tr>
                        <th>Experiment ID</th>
                        <th>Problem</th>
                        <th>Method</th>
                        <th>Seed</th>
                        <th>Evals to Sol</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    },

    escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => ResearchLab.init());
