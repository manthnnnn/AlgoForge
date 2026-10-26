/**
 * ALGOFORGE AI — Interactive Problem & Algorithm Visualizer
 * Renders problem input representations (Step 2) and step-by-step
 * educational algorithm execution traces (Step 3).
 */

(function(exports) {
    'use strict';

    class AlgoVisualizer {
        constructor() {
            this.currentTrace = [];
            this.stepIndex = 0;
            this.timer = null;
            this.isPlaying = false;
            this.speedMs = 700;
            this.activeProblemId = null;
            this.activeApproachId = null;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 2: UNDERSTAND PROBLEM VISUALIZER
        // ─────────────────────────────────────────────────────────────────────────
        renderProblemOverview(problem, containerEl) {
            if (!containerEl) return;
            this.activeProblemId = problem.id;

            if (problem.id === 'find_duplicates') {
                this.renderDuplicatesOverview(problem, containerEl);
            } else if (problem.id === 'shortest_path') {
                this.renderGraphOverview(problem, containerEl);
            } else if (problem.id === 'schedule_tasks') {
                this.renderScheduleOverview(problem, containerEl);
            }
        }

        renderDuplicatesOverview(problem, container) {
            const arr = problem.sampleInput;
            const expected = problem.sampleExpected;

            container.innerHTML = `
                <div class="vis-overview-card">
                    <div class="vis-header">
                        <div class="vis-title"><i class="fa-solid fa-list-ol"></i> Visual Representation of Input List</div>
                        <span class="vis-badge">N = ${arr.length} elements</span>
                    </div>
                    <div class="vis-body">
                        <p class="vis-hint">Repeated values are highlighted with matching color rings:</p>
                        <div class="array-chips-container" id="overviewChips">
                            ${arr.map((val, idx) => {
                                const isDup = expected.includes(val);
                                const dupColor = val === 4 ? 'chip-dup-purple' : val === 2 ? 'chip-dup-cyan' : 'chip-unique';
                                return `
                                    <div class="array-chip ${dupColor}" title="Index ${idx}: Value ${val}">
                                        <span class="chip-index">#${idx}</span>
                                        <span class="chip-val">${val}</span>
                                        ${isDup ? '<span class="chip-dup-tag">DUP</span>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="vis-output-summary">
                            <div class="vis-summary-item">
                                <span class="summary-label">Input Array:</span>
                                <code>[${arr.join(', ')}]</code>
                            </div>
                            <div class="vis-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="vis-summary-item highlight-box">
                                <span class="summary-label">Expected Output:</span>
                                <code>[${expected.join(', ')}]</code>
                                <span class="expected-badge">2 Unique Duplicates Found</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderGraphOverview(problem, container) {
            const graph = problem.sampleGraph;
            container.innerHTML = `
                <div class="vis-overview-card">
                    <div class="vis-header">
                        <div class="vis-title"><i class="fa-solid fa-route"></i> Graph Network Topology</div>
                        <span class="vis-badge">${graph.nodes.length} Vertices · ${graph.edges.length} Weighted Edges</span>
                    </div>
                    <div class="vis-body">
                        <p class="vis-hint">Objective: Find lowest cumulative weight path from Start <strong>(${graph.start})</strong> to Target <strong>(${graph.target})</strong>:</p>
                        <div class="graph-svg-wrap">
                            <svg class="graph-svg" viewBox="0 0 540 240" id="graphOverviewSvg">
                                <!-- Edges -->
                                <line x1="60" y1="120" x2="160" y2="50" class="edge-line" />
                                <text x="100" y="75" class="edge-weight">4</text>

                                <line x1="60" y1="120" x2="160" y2="190" class="edge-line optimal-edge" />
                                <text x="100" y="170" class="edge-weight">2</text>

                                <line x1="160" y1="50" x2="160" y2="190" class="edge-line optimal-edge" />
                                <text x="170" y="125" class="edge-weight">1</text>

                                <line x1="160" y1="50" x2="280" y2="50" class="edge-line optimal-edge" />
                                <text x="220" y="40" class="edge-weight">5</text>

                                <line x1="160" y1="190" x2="280" y2="190" class="edge-line" />
                                <text x="220" y="210" class="edge-weight">10</text>

                                <line x1="280" y1="50" x2="390" y2="120" class="edge-line optimal-edge" />
                                <text x="345" y="75" class="edge-weight">2</text>

                                <line x1="280" y1="190" x2="390" y2="120" class="edge-line" />
                                <text x="340" y="175" class="edge-weight">6</text>

                                <line x1="390" y1="120" x2="480" y2="120" class="edge-line optimal-edge" />
                                <text x="435" y="110" class="edge-weight">2</text>

                                <!-- Nodes -->
                                <g class="graph-node-group start-node" transform="translate(60, 120)">
                                    <circle r="22" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">A (Start)</text>
                                </g>
                                <g class="graph-node-group" transform="translate(160, 50)">
                                    <circle r="18" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">B</text>
                                </g>
                                <g class="graph-node-group" transform="translate(160, 190)">
                                    <circle r="18" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">C</text>
                                </g>
                                <g class="graph-node-group" transform="translate(280, 50)">
                                    <circle r="18" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">D</text>
                                </g>
                                <g class="graph-node-group" transform="translate(280, 190)">
                                    <circle r="18" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">E</text>
                                </g>
                                <g class="graph-node-group target-node" transform="translate(480, 120)">
                                    <circle r="22" class="node-circle" />
                                    <text dy="5" text-anchor="middle" class="node-text">F (End)</text>
                                </g>
                            </svg>
                        </div>
                        <div class="vis-output-summary">
                            <div class="vis-summary-item">
                                <span class="summary-label">Start / Destination:</span>
                                <code>A → F</code>
                            </div>
                            <div class="vis-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="vis-summary-item highlight-box">
                                <span class="summary-label">Optimal Route (Dijkstra):</span>
                                <code>A → C → B → D → E → F</code>
                                <span class="expected-badge">Total Cost = 12</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderScheduleOverview(problem, container) {
            const tasks = problem.sampleTasks;
            container.innerHTML = `
                <div class="vis-overview-card">
                    <div class="vis-header">
                        <div class="vis-title"><i class="fa-solid fa-calendar-days"></i> Task Intervals & Timeline Constraints</div>
                        <span class="vis-badge">${tasks.length} Competing Tasks · Timeline [0 → 11]</span>
                    </div>
                    <div class="vis-body">
                        <p class="vis-hint">Objective: Select the maximum number of non-overlapping tasks on a single timeline:</p>
                        <div class="gantt-timeline-wrap">
                            <div class="gantt-ruler">
                                ${Array.from({ length: 12 }, (_, i) => `<span class="ruler-tick">${i}h</span>`).join('')}
                            </div>
                            <div class="gantt-bars">
                                ${tasks.map(t => {
                                    const leftPct = (t.start / 11) * 100;
                                    const widthPct = ((t.end - t.start) / 11) * 100;
                                    const isOptimal = ['T1', 'T4', 'T8'].includes(t.id);
                                    return `
                                        <div class="gantt-row">
                                            <span class="task-tag">${t.id}</span>
                                            <div class="gantt-track">
                                                <div class="gantt-bar ${isOptimal ? 'optimal-bar' : 'overlap-bar'}"
                                                     style="left: ${leftPct}%; width: ${widthPct}%;"
                                                     title="${t.name} [${t.start} → ${t.end}]">
                                                    <span class="bar-label">${t.name} [${t.start}-${t.end}]</span>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                        <div class="vis-output-summary">
                            <div class="vis-summary-item">
                                <span class="summary-label">Total Candidate Jobs:</span>
                                <code>8 Overlapping Intervals</code>
                            </div>
                            <div class="vis-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                            <div class="vis-summary-item highlight-box">
                                <span class="summary-label">Max Compatible Schedule:</span>
                                <code>T1 [1-4], T4 [5-7], T8 [8-11]</code>
                                <span class="expected-badge">Optimal: 3 Non-Conflicting Tasks</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // STEP 3: STEP-BY-STEP ALGORITHM TRACE VISUALIZER
        // ─────────────────────────────────────────────────────────────────────────
        loadTrace(problem, approach, containerEl) {
            this.stopAutoPlay();
            this.activeProblemId = problem.id;
            this.activeApproachId = approach.id;

            if (problem.id === 'find_duplicates') {
                this.currentTrace = approach.createTrace(problem.sampleInput);
            } else if (problem.id === 'shortest_path') {
                this.currentTrace = approach.createTrace(problem.sampleGraph);
            } else if (problem.id === 'schedule_tasks') {
                this.currentTrace = approach.createTrace(problem.sampleTasks);
            }

            this.stepIndex = 0;
            this.renderTraceControls(containerEl, approach);
            this.renderCurrentStep();
        }

        renderTraceControls(container, approach) {
            container.innerHTML = `
                <div class="step-trace-card" id="stepTraceCard">
                    <div class="trace-header">
                        <div class="trace-title-group">
                            <span class="trace-tag">${approach.classification}</span>
                            <h4>${approach.name} — Step-by-Step Visualization</h4>
                        </div>
                        <div class="trace-progress-pill">
                            Step <span id="traceStepNum">1</span> / <span id="traceStepTotal">${this.currentTrace.length}</span>
                        </div>
                    </div>

                    <!-- Visual Stage Area -->
                    <div class="trace-stage" id="traceStageArea"></div>

                    <!-- Step Narration -->
                    <div class="trace-narrative" id="traceNarrative">
                        <div class="narrative-badge" id="narrativeTitle">Initializing...</div>
                        <p class="narrative-text" id="narrativeDesc">Loading algorithm execution trace...</p>
                    </div>

                    <!-- Controls -->
                    <div class="trace-controls">
                        <div class="trace-btn-group">
                            <button class="trace-btn" id="btnTraceReset" title="Reset to start"><i class="fa-solid fa-rotate-left"></i> Reset</button>
                            <button class="trace-btn" id="btnTracePrev" title="Previous step"><i class="fa-solid fa-backward-step"></i> Previous</button>
                            <button class="trace-btn btn-primary" id="btnTracePlay" title="Play / Pause"><i class="fa-solid fa-play"></i> Play</button>
                            <button class="trace-btn" id="btnTraceNext" title="Next step">Next <i class="fa-solid fa-forward-step"></i></button>
                        </div>
                        <div class="trace-speed-group">
                            <span class="speed-label">Speed:</span>
                            <button class="speed-pill" data-speed="1100">Slow</button>
                            <button class="speed-pill on" data-speed="650">Normal</button>
                            <button class="speed-pill" data-speed="300">Fast</button>
                        </div>
                    </div>
                </div>
            `;

            // Bind controls
            document.getElementById('btnTraceReset')?.addEventListener('click', () => {
                this.stopAutoPlay();
                this.stepIndex = 0;
                this.renderCurrentStep();
            });

            document.getElementById('btnTracePrev')?.addEventListener('click', () => {
                this.stopAutoPlay();
                if (this.stepIndex > 0) {
                    this.stepIndex--;
                    this.renderCurrentStep();
                }
            });

            document.getElementById('btnTraceNext')?.addEventListener('click', () => {
                this.stopAutoPlay();
                if (this.stepIndex < this.currentTrace.length - 1) {
                    this.stepIndex++;
                    this.renderCurrentStep();
                }
            });

            document.getElementById('btnTracePlay')?.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.stopAutoPlay();
                } else {
                    this.startAutoPlay();
                }
            });

            // Speed pills
            container.querySelectorAll('.speed-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    container.querySelectorAll('.speed-pill').forEach(p => p.classList.remove('on'));
                    pill.classList.add('on');
                    this.speedMs = parseInt(pill.dataset.speed, 10);
                    if (this.isPlaying) {
                        this.stopAutoPlay();
                        this.startAutoPlay();
                    }
                });
            });
        }

        renderCurrentStep() {
            if (!this.currentTrace || this.currentTrace.length === 0) return;
            const step = this.currentTrace[this.stepIndex];
            if (!step) return;

            // Update step indicator
            const numEl = document.getElementById('traceStepNum');
            if (numEl) numEl.textContent = this.stepIndex + 1;

            // Update narrative
            const titleEl = document.getElementById('narrativeTitle');
            const descEl = document.getElementById('narrativeDesc');
            if (titleEl) titleEl.textContent = step.title;
            if (descEl) descEl.textContent = step.description;

            // Render stage content depending on problem
            const stage = document.getElementById('traceStageArea');
            if (!stage) return;

            if (this.activeProblemId === 'find_duplicates') {
                this.renderDuplicateTraceStage(step, stage);
            } else if (this.activeProblemId === 'shortest_path') {
                this.renderGraphTraceStage(step, stage);
            } else if (this.activeProblemId === 'schedule_tasks') {
                this.renderScheduleTraceStage(step, stage);
            }
        }

        renderDuplicateTraceStage(step, container) {
            const arr = step.arr || [];
            const found = step.found || [];
            const seen = step.seen || [];

            container.innerHTML = `
                <div class="trace-elements-wrap">
                    <div class="trace-subheading">Current Array Elements:</div>
                    <div class="array-chips-container">
                        ${arr.map((val, idx) => {
                            let chipClass = 'chip-idle';
                            let pointerLabel = '';

                            if (idx === step.i && idx === step.j) {
                                chipClass = 'chip-active-both';
                                pointerLabel = 'i, j';
                            } else if (idx === step.i) {
                                chipClass = 'chip-pointer-i';
                                pointerLabel = 'pointer i';
                            } else if (idx === step.j) {
                                chipClass = 'chip-pointer-j';
                                pointerLabel = 'pointer j';
                            }

                            if (step.highlightState === 'match' && (idx === step.i || idx === step.j)) {
                                chipClass = 'chip-match-glow';
                            }

                            return `
                                <div class="array-chip ${chipClass}">
                                    <span class="chip-index">#${idx}</span>
                                    <span class="chip-val">${val}</span>
                                    ${pointerLabel ? `<span class="chip-pointer-marker">${pointerLabel}</span>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Hash Set / Collector Box -->
                    <div class="trace-aux-row">
                        ${seen.length > 0 ? `
                            <div class="aux-box">
                                <span class="aux-label"><i class="fa-solid fa-database"></i> Hash Set (Seen Values):</span>
                                <div class="aux-tags">
                                    ${seen.map(s => `<span class="aux-tag">${s}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <div class="aux-box duplicates-box">
                            <span class="aux-label"><i class="fa-solid fa-copy"></i> Discovered Duplicates:</span>
                            <div class="aux-tags">
                                ${found.length > 0
                                    ? found.map(f => `<span class="aux-tag tag-dup">${f}</span>`).join('')
                                    : '<span class="aux-empty">None detected yet</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        renderGraphTraceStage(step, container) {
            const visited = step.visited || [];
            const activePath = step.activePath || [];
            const current = step.current;

            container.innerHTML = `
                <div class="trace-elements-wrap">
                    <div class="trace-subheading">Graph Exploration State:</div>
                    <div class="graph-status-bar">
                        <div class="status-item"><span class="status-dot visited"></span> Visited: <strong>${visited.join(', ') || 'None'}</strong></div>
                        <div class="status-item"><span class="status-dot active"></span> Current Node: <strong>${current || 'Start'}</strong></div>
                        <div class="status-item"><span class="status-dot path"></span> Active Frontier: <strong>${activePath.join(' → ') || '—'}</strong></div>
                    </div>
                </div>
            `;
        }

        renderScheduleTraceStage(step, container) {
            const scheduled = step.scheduled || [];
            const rejected = step.rejected || [];
            const current = step.currentTask;

            container.innerHTML = `
                <div class="trace-elements-wrap">
                    <div class="trace-subheading">Interval Scheduling Timeline State:</div>
                    <div class="schedule-status-row">
                        <div class="sched-column accepted-col">
                            <span class="sched-col-title"><i class="fa-solid fa-circle-check"></i> Accepted Schedule (${scheduled.length})</span>
                            <div class="sched-list">
                                ${scheduled.length > 0
                                    ? scheduled.map(t => `<span class="sched-item accepted">${t.id}: [${t.start} → ${t.end}]</span>`).join('')
                                    : '<span class="sched-empty">None scheduled</span>'}
                            </div>
                        </div>
                        <div class="sched-column rejected-col">
                            <span class="sched-col-title"><i class="fa-solid fa-circle-xmark"></i> Skipped / Overlaps (${rejected.length})</span>
                            <div class="sched-list">
                                ${rejected.length > 0
                                    ? rejected.map(t => `<span class="sched-item skipped">${t.id}: [${t.start} → ${t.end}]</span>`).join('')
                                    : '<span class="sched-empty">None skipped</span>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        startAutoPlay() {
            this.isPlaying = true;
            const playBtn = document.getElementById('btnTracePlay');
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';

            this.timer = setInterval(() => {
                if (this.stepIndex < this.currentTrace.length - 1) {
                    this.stepIndex++;
                    this.renderCurrentStep();
                } else {
                    this.stopAutoPlay();
                }
            }, this.speedMs);
        }

        stopAutoPlay() {
            this.isPlaying = false;
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
            const playBtn = document.getElementById('btnTracePlay');
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
        }
    }

    exports.AlgoForgeVisualizer = new AlgoVisualizer();

})(typeof window !== 'undefined' ? window : module.exports);
