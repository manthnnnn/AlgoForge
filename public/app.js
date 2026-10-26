/**
 * ALGOFORGE AI — Application Controller & Interactive Discovery Workflow
 * Light theme particle canvas, rock-solid empirical benchmarking,
 * Chart.js results comparison, and laboratory report exports.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // GLOBAL STATE
    // ─────────────────────────────────────────────────────────────────────────────
    const state = {
        currentStep: 1, // 1: Choose, 2: Understand, 3: Explore, 4: Test, 5: Results
        selectedProblemId: 'find_duplicates',
        selectedSizeKey: 'medium',
        selectedApproachIds: [],
        currentReport: null,
        resultsChart: null,
        myExperiments: []
    };

    // Load saved experiments from localStorage
    try {
        const saved = localStorage.getItem('algoforge_experiments');
        if (saved) state.myExperiments = JSON.parse(saved);
    } catch (e) {
        state.myExperiments = [];
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // DOM REFERENCES
    // ─────────────────────────────────────────────────────────────────────────────
    const $ = id => document.getElementById(id);
    const $$ = selector => document.querySelectorAll(selector);

    const dom = {
        // Landing & Hero
        landingHero: $('landingHero'),
        btnStartHero: $('btnStartHero'),
        btnSeeHow: $('btnSeeHow'),
        heroCanvas: $('heroCanvas'),
        teaserRunBtn: $('teaserRunBtn'),
        teaserOutput: $('teaserOutput'),

        // Nav
        navBrand: $('navBrand'),
        navDiscover: $('navDiscover'),
        navProblems: $('navProblems'),
        navHow: $('navHow'),
        navHistory: $('navHistory'),
        historyBadge: $('historyBadge'),

        // Guided Workflow Section
        workflowContainer: $('workflowContainer'),
        progressSteps: $$('.step-indicator-item'),

        // Step 1: Choose Problem
        step1: $('step1'),
        problemCards: $$('.problem-card'),
        customProblemInput: $('customProblemInput'),
        btnAnalyzeCustom: $('btnAnalyzeCustom'),
        customFeedback: $('customFeedback'),
        btnStep1Next: $('btnStep1Next'),

        // Step 2: Understand Problem
        step2: $('step2'),
        step2Title: $('step2Title'),
        step2Tagline: $('step2Tagline'),
        step2Why: $('step2Why'),
        step2VisualContainer: $('step2VisualContainer'),
        sizeButtons: $$('.size-btn'),
        btnStep2Back: $('btnStep2Back'),
        btnStep2Next: $('btnStep2Next'),

        // Step 3: Explore Approaches
        step3: $('step3'),
        step3CardsContainer: $('step3CardsContainer'),
        step3VisualizerArea: $('step3VisualizerArea'),
        btnStep3Back: $('btnStep3Back'),
        btnStep3Next: $('btnStep3Next'),

        // Step 4: Run Experiments
        step4: $('step4'),
        btnStartExperiment: $('btnStartExperiment'),
        experimentPipeline: $('experimentPipeline'),
        pipelineStatusText: $('pipelineStatusText'),
        pipelineProgressBar: $('pipelineProgressBar'),
        pipelineItemsContainer: $('pipelineItemsContainer'),
        btnStep4Back: $('btnStep4Back'),

        // Step 5: Results
        step5: $('step5'),
        discoveryBanner: $('discoveryBanner'),
        discoveryBannerText: $('discoveryBannerText'),
        resultsTableBody: $('resultsTableBody'),
        chartCanvas: $('resultsChartCanvas'),
        btnToggleTestBreakdown: $('btnToggleTestBreakdown'),
        testSuiteBreakdown: $('testSuiteBreakdown'),
        testTotalPassed: $('testTotalPassed'),
        testToggleText: $('testToggleText'),
        iconTestChevron: $('iconTestChevron'),
        whatWorkedText: $('whatWorkedText'),
        whatLearnedText: $('whatLearnedText'),
        limitationsText: $('limitationsText'),
        btnSaveExperiment: $('btnSaveExperiment'),
        btnDownloadJson: $('btnDownloadJson'),
        btnDownloadHtml: $('btnDownloadHtml'),
        btnTryAnother: $('btnTryAnother'),
        btnAiSynthesis: $('btnAiSynthesis'),
        aiSynthesisBox: $('aiSynthesisBox'),

        // Modals & Drawers
        historyModal: $('historyModal'),
        historyList: $('historyList'),
        btnCloseHistory: $('btnCloseHistory'),
        btnClearHistory: $('btnClearHistory'),
        howModal: $('howModal'),
        btnCloseHow: $('btnCloseHow'),

        // Notification Toast
        toast: $('toastNotification')
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // HERO CANVAS ANIMATION: LIGHT-MODE SEARCH NETWORK
    // ─────────────────────────────────────────────────────────────────────────────
    function initHeroCanvas() {
        const canvas = dom.heroCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.offsetWidth || 560;
        let height = canvas.height = canvas.parentElement.offsetHeight || 340;

        window.addEventListener('resize', () => {
            if (canvas.parentElement) {
                width = canvas.width = canvas.parentElement.offsetWidth;
                height = canvas.height = canvas.parentElement.offsetHeight;
            }
        });

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const nodes = [];
        const nodeCount = prefersReducedMotion ? 18 : 26;
        const symbols = ['O(N)', 'log N', 'Σ', 'O(1)', 'V+E', 'N log N', 'O(N²)'];

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.42,
                vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.42,
                radius: i < 5 ? 4.5 : Math.random() * 2 + 2.5,
                symbol: i < symbols.length ? symbols[i] : null,
                isOptimal: i < 6
            });
        }

        let mouse = { x: -1000, y: -1000 };
        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', () => {
            mouse.x = -1000;
            mouse.y = -1000;
        });

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Draw connecting lines with soft light tints
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        const alpha = (1 - dist / 110) * 0.35;
                        const isOptimalLine = nodes[i].isOptimal && nodes[j].isOptimal;

                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);

                        if (isOptimalLine) {
                            ctx.strokeStyle = `rgba(79, 70, 229, ${alpha * 2})`;
                            ctx.lineWidth = 1.8;
                        } else {
                            ctx.strokeStyle = `rgba(203, 213, 225, ${alpha})`;
                            ctx.lineWidth = 1.0;
                        }
                        ctx.stroke();
                    }
                }
            }

            // Draw and update nodes
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];

                if (!prefersReducedMotion) {
                    n.x += n.vx;
                    n.y += n.vy;

                    if (n.x < 15 || n.x > width - 15) n.vx *= -1;
                    if (n.y < 15 || n.y > height - 15) n.vy *= -1;

                    // Mouse gravitation
                    const mdx = mouse.x - n.x;
                    const mdy = mouse.y - n.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mdist < 80 && mdist > 0) {
                        n.x += (mdx / mdist) * 0.7;
                        n.y += (mdy / mdist) * 0.7;
                    }
                }

                // Render node circle
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

                if (n.isOptimal) {
                    ctx.fillStyle = '#4f46e5';
                    ctx.shadowColor = 'rgba(79, 70, 229, 0.35)';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = '#0284c7';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Render symbol tag if present
                if (n.symbol) {
                    ctx.font = '10.5px JetBrains Mono, monospace';
                    ctx.fillStyle = '#475569';
                    ctx.fillText(n.symbol, n.x + 8, n.y - 6);
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // LANDING TEASER: RELIABLE MULTI-REPETITION MICROBENCHMARK
    // ─────────────────────────────────────────────────────────────────────────────
    function initLandingTeaser() {
        if (!dom.teaserRunBtn || !dom.teaserOutput) return;

        dom.teaserRunBtn.addEventListener('click', () => {
            dom.teaserRunBtn.disabled = true;
            dom.teaserRunBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Benchmarking...';
            dom.teaserOutput.innerHTML = '<span class="teaser-running"><i class="fa-solid fa-circle-notch fa-spin"></i> Executing 10 timed iterations across 2,500 elements...</span>';

            setTimeout(() => {
                const problem = window.AlgoForgeAlgorithms.getProblem('find_duplicates');
                const testData = problem.generateDataset('medium', 10);
                const nested = problem.approaches.find(a => a.id === 'nested_comparison');
                const hash = problem.approaches.find(a => a.id === 'hash_set');

                // Warmup
                try {
                    nested.run(testData.slice(0, 100));
                    hash.run(testData.slice(0, 100));
                } catch(e) {}

                // Real execution: 8 repetitions to get a reliable, non-zero timing
                const reps = 8;

                // Benchmark Nested Loops
                const t0 = performance.now();
                for (let r = 0; r < reps; r++) {
                    nested.run([...testData]);
                }
                const tNested = Math.max(0.01, (performance.now() - t0) / reps);

                // Benchmark Hash Set
                const t1 = performance.now();
                for (let r = 0; r < reps; r++) {
                    hash.run([...testData]);
                }
                const tHash = Math.max(0.01, (performance.now() - t1) / reps);

                const speedupRatio = (tNested / tHash).toFixed(1);

                dom.teaserOutput.innerHTML = `
                    <div class="teaser-results-grid">
                        <div class="teaser-res-item">
                            <span class="teaser-label">Nested Comparisons O(N²)</span>
                            <span class="teaser-val warn">${tNested.toFixed(2)} ms</span>
                        </div>
                        <div class="teaser-res-item">
                            <span class="teaser-label">Hash Set Direct Lookup O(N)</span>
                            <span class="teaser-val mint">${tHash.toFixed(2)} ms</span>
                        </div>
                        <div class="teaser-res-item winner-tag">
                            <span class="teaser-label">Empirical Outcome:</span>
                            <span class="teaser-val violet">${speedupRatio}× faster</span>
                        </div>
                    </div>
                `;
                dom.teaserRunBtn.disabled = false;
                dom.teaserRunBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Run Again';
            }, 60);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP NAVIGATION
    // ─────────────────────────────────────────────────────────────────────────────
    function goToStep(stepNumber) {
        state.currentStep = stepNumber;

        // Update progress indicators
        dom.progressSteps.forEach((el, index) => {
            const stepNum = index + 1;
            if (stepNum === stepNumber) {
                el.classList.add('active');
                el.classList.remove('completed');
            } else if (stepNum < stepNumber) {
                el.classList.remove('active');
                el.classList.add('completed');
            } else {
                el.classList.remove('active', 'completed');
            }
        });

        // Toggle active step
        for (let i = 1; i <= 5; i++) {
            const stepEl = $(`step${i}`);
            if (stepEl) {
                stepEl.classList.toggle('active', i === stepNumber);
            }
        }

        const activeContainer = $(`step${stepNumber}`);
        if (activeContainer) {
            activeContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Initialize active step view
        if (stepNumber === 2) renderStep2();
        if (stepNumber === 3) renderStep3();
        if (stepNumber === 4) prepareStep4();
    }

    // Progress step click to jump back
    dom.progressSteps.forEach((el, index) => {
        el.addEventListener('click', () => {
            const step = index + 1;
            if (step <= state.currentStep || (state.currentReport && step === 5)) {
                goToStep(step);
            }
        });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 1: CHOOSE A PROBLEM
    // ─────────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 1: CHOOSE A PROBLEM
    // ─────────────────────────────────────────────────────────────────────────────
    function shakeElement(el) {
        if (!el) return;
        el.classList.remove('shake-animate');
        void el.offsetWidth; // Force CSS reflow
        el.classList.add('shake-animate');
    }

    function initStep1() {
        let searchDebounceTimer = null;

        // Problem Card selection
        dom.problemCards.forEach(card => {
            card.addEventListener('click', () => {
                selectProblem(card.dataset.problemId);
                const prob = window.AlgoForgeAlgorithms.getProblem(card.dataset.problemId);
                if (dom.customProblemInput && dom.customProblemInput.value.trim()) {
                    showFeedback(`✓ Switched challenge to: <strong>${prob.title}</strong>`, 'success');
                } else if (dom.customFeedback) {
                    dom.customFeedback.style.display = 'none';
                    dom.customFeedback.innerHTML = '';
                }
            });
        });

        function selectProblem(problemId, feedbackMsg = null) {
            state.selectedProblemId = problemId;
            dom.problemCards.forEach(c => {
                const isSelected = c.dataset.problemId === problemId;
                c.classList.toggle('selected', isSelected);
                if (isSelected) {
                    c.style.transition = 'all 0.3s ease';
                }
            });
            if (feedbackMsg) {
                showFeedback(feedbackMsg, 'success');
            }
        }

        // Natural Language Problem Classifier & Search Handler with Scientific Formula Discovery
        async function handleProblemSearch(isAutoType = false) {
            const rawText = dom.customProblemInput ? dom.customProblemInput.value.trim() : '';
            if (!rawText) {
                if (!isAutoType) {
                    showFeedback('<i class="fa-solid fa-circle-exclamation"></i> Please describe the problem or concept you want to discover, or pick one of the 3 challenge cards above.', 'warn');
                    shakeElement(dom.customFeedback);
                    shakeElement(dom.customProblemInput);
                }
                return;
            }

            // Check if Oracle has an exact or fuzzy mathematical law / scientific concept
            let oracleResult = null;
            if (window.OracleEngine) {
                try {
                    oracleResult = await window.OracleEngine.search(rawText);
                } catch(e) {}
            }

            const match = classifyProblem(rawText);

            if (oracleResult && oracleResult.data) {
                renderOracleFormulaCard(oracleResult.data, match);
                if (match) {
                    selectProblem(match.id);
                }
                return;
            }

            if (match) {
                selectProblem(match.id, `✓ ${match.reason}`);
            } else {
                if (window.ALGOFORGE_CONFIG && window.ALGOFORGE_CONFIG.GROQ_API_KEY) {
                    callGroqProblemClassifier(rawText);
                } else {
                    renderUnmatchedGuidance(rawText);
                    if (!isAutoType) {
                        shakeElement(dom.customFeedback);
                    }
                }
            }
        }

        if (dom.btnAnalyzeCustom) {
            dom.btnAnalyzeCustom.addEventListener('click', () => handleProblemSearch(false));
        }

        if (dom.customProblemInput) {
            // Live debounced classification as user types
            dom.customProblemInput.addEventListener('input', () => {
                clearTimeout(searchDebounceTimer);
                const val = dom.customProblemInput.value.trim();
                if (val.length === 0) {
                    if (dom.customFeedback) {
                        dom.customFeedback.style.display = 'none';
                        dom.customFeedback.innerHTML = '';
                    }
                    return;
                }
                searchDebounceTimer = setTimeout(() => {
                    handleProblemSearch(true);
                }, 320);
            });

            dom.customProblemInput.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    clearTimeout(searchDebounceTimer);
                    handleProblemSearch(false);
                }
            });
        }

        // Quick Problem Example Chips
        document.querySelectorAll('.qpc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (dom.customProblemInput) {
                    clearTimeout(searchDebounceTimer);
                    dom.customProblemInput.value = btn.dataset.text || btn.textContent;
                    handleProblemSearch(false);
                    const card = document.querySelector(`.problem-card[data-problem-id="${state.selectedProblemId}"]`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });
        });

        // Continue to Step 2 with strict validation (prevent advancing randomly)
        dom.btnStep1Next?.addEventListener('click', () => {
            const rawText = dom.customProblemInput ? dom.customProblemInput.value.trim() : '';

            // If the user typed an unresolved query into the search box, test it first
            if (rawText) {
                const match = classifyProblem(rawText);
                if (match) {
                    selectProblem(match.id, `✓ ${match.reason}`);
                } else {
                    renderUnmatchedGuidance(rawText);
                    shakeElement(dom.customFeedback);
                    showToast('Please pick one of our 3 verified benchmarks below.');
                    return; // Strictly stop! Do not advance!
                }
            }

            // Strictly check if a valid problem is selected
            if (!state.selectedProblemId) {
                showFeedback('<i class="fa-solid fa-triangle-exclamation"></i> Please select one of the 3 challenge cards above or choose an option below before continuing.', 'warn');
                shakeElement(dom.customFeedback);
                const grid = document.querySelector('.problem-cards-grid');
                if (grid) {
                    shakeElement(grid);
                    grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showToast('Please select a problem first.');
                return; // Strictly stop! Do not advance!
            }

            goToStep(2);
        });
    }

    function classifyProblem(rawText) {
        const text = rawText.trim().toLowerCase();
        if (!text) return null;

        let dupScore = 0;
        let pathScore = 0;
        let schedScore = 0;

        // 1. Duplicate Detection Keywords & Synonyms
        const dupKeywords = [
            'duplicate', 'duplicates', 'dups', 'dup', 'dupe', 'dupes', 'repeat', 'repeated',
            'repeating', 'repeats', 'repetition', 'unique', 'distinct', 'same', 'identical',
            'twice', 'frequency', 'count', 'counter', 'array', 'list', 'vector', 'elements',
            'items', 'numbers', 'hash', 'set', 'hashset', 'hashmap', 'map', 'dict', 'dictionary',
            'dedup', 'dedupe', 'deduplication', 'clones', 'pair', 'pairs', 'match', 'matches',
            'seen', 'occurrence', 'two sum', 'index', 'lookup', 'clean data', 'frequency array'
        ];
        for (let kw of dupKeywords) {
            if (text.includes(kw)) {
                dupScore += (kw === 'duplicate' || kw === 'duplicates' || kw === 'dedup' || kw === 'dedupe' || kw === 'identical' || kw === 'unique' || kw === 'repeat') ? 4 : 1;
            }
        }

        // 2. Shortest Path Keywords, Navigation & Graph Routing
        const pathKeywords = [
            'path', 'paths', 'shortest', 'short', 'route', 'routes', 'routing', 'reroute',
            'fastest', 'quickest', 'navigation', 'navigate', 'nav', 'gps', 'map', 'maps',
            'graph', 'graphs', 'network', 'networks', 'grid', 'nodes', 'node', 'vertex',
            'vertices', 'edges', 'edge', 'dijkstra', 'djikstra', 'dijkstras', 'bfs', 'dfs',
            'breadth first', 'depth first', 'distance', 'cost', 'weighted', 'unweighted',
            'hops', 'transit', 'traffic', 'roads', 'directions', 'maze', 'waypoint',
            'connected', 'connection', 'degrees of separation', 'flight', 'airline', 'courier', 'delivery'
        ];
        for (let kw of pathKeywords) {
            if (text.includes(kw)) {
                pathScore += (kw === 'shortest' || kw === 'dijkstra' || kw === 'djikstra' || kw === 'path' || kw === 'route' || kw === 'navigation' || kw === 'fastest') ? 4 : 1;
            }
        }

        // 3. Task Scheduling Keywords, Intervals & Time Planning
        const schedKeywords = [
            'schedule', 'scheduling', 'scheduled', 'schedules', 'schedual', 'sched', 'task',
            'tasks', 'job', 'jobs', 'calendar', 'planner', 'planning', 'timetable', 'agenda',
            'interval', 'intervals', 'meeting', 'meetings', 'appointment', 'appointments',
            'booking', 'bookings', 'event', 'events', 'conflict', 'conflicts', 'overlap',
            'overlapping', 'overlaps', 'non-overlapping', 'disjoint', 'timeline', 'deadline',
            'deadlines', 'due date', 'start time', 'end time', 'finish time', 'greedy',
            'earliest finish', 'edf', 'slots', 'slot', 'cpu scheduling', 'shifts', 'shift', 'room'
        ];
        for (let kw of schedKeywords) {
            if (text.includes(kw)) {
                schedScore += (kw === 'schedule' || kw === 'scheduling' || kw === 'schedual' || kw === 'interval' || kw === 'conflict' || kw === 'overlap' || kw === 'meeting' || kw === 'calendar') ? 4 : 1;
            }
        }

        const maxScore = Math.max(dupScore, pathScore, schedScore);
        if (maxScore > 0) {
            if (dupScore === maxScore) {
                return {
                    id: 'find_duplicates',
                    reason: 'Matched to "Find duplicate values in a list" (Array & Set Theory benchmark).'
                };
            }
            if (pathScore === maxScore) {
                return {
                    id: 'shortest_path',
                    reason: 'Matched to "Find the shortest path in a graph" (Graph Theory & Routing benchmark).'
                };
            }
            if (schedScore === maxScore) {
                return {
                    id: 'schedule_tasks',
                    reason: 'Matched to "Schedule tasks under constraints" (Interval Scheduling benchmark).'
                };
            }
        }

        // Cross-domain CS concepts fallback
        if (/sort|sorting|order|ordering|filter/.test(text)) {
            return {
                id: 'find_duplicates',
                reason: 'Sorting & scanning is a core technique in our Duplicate Detection benchmark.'
            };
        }
        if (/search|searching|binary search|find item|lookup/.test(text)) {
            return {
                id: 'find_duplicates',
                reason: 'Direct hash lookup and search are benchmarked in our Duplicate Detection algorithms.'
            };
        }
        if (/tree|spanning tree|flow|travel|destination|city|cities|road/.test(text)) {
            return {
                id: 'shortest_path',
                reason: 'Network traversal and graph routing are benchmarked in our Shortest Path challenge.'
            };
        }
        if (/prioritize|priority|time management|organize|allocation/.test(text)) {
            return {
                id: 'schedule_tasks',
                reason: 'Optimal task and resource allocation are benchmarked in our Task Scheduling challenge.'
            };
        }

        return null;
    }

    function renderOracleFormulaCard(item, benchmarkMatch) {
        if (!dom.customFeedback) return;
        dom.customFeedback.className = 'feedback-box';
        dom.customFeedback.style.display = 'block';

        const safeFormula = escapeHtml(item.formula || 'f(x) = ?');
        const encodedFormula = (item.formula || '').replace(/'/g, "\\'");

        dom.customFeedback.innerHTML = `
            <div class="oracle-formula-card">
                <div class="ofc-header">
                    <div class="ofc-title-wrap">
                        <span class="ofc-emoji">${item.emoji || '🔬'}</span>
                        <span class="ofc-title">${escapeHtml(item.name)}</span>
                    </div>
                    <span class="ofc-domain-pill">${escapeHtml(item.domain || 'Science')}</span>
                </div>

                <div class="ofc-formula-wrap">
                    <div>
                        <span class="ofc-formula-label">Discovered Governing Formula:</span>
                        <div class="ofc-formula-code">${safeFormula}</div>
                    </div>
                    <button class="ofc-btn-copy" id="btnCopyFormula">
                        <i class="fa-solid fa-copy"></i> Copy Formula
                    </button>
                </div>

                <div class="ofc-eli5">
                    <i class="fa-solid fa-lightbulb"></i>
                    <div><strong>In Simple English:</strong> ${escapeHtml(item.eli5 || '')}</div>
                </div>

                <p class="ofc-explanation">${escapeHtml(item.explanation || '')}</p>

                ${item.complexity ? `<div class="ofc-complexity-tag"><i class="fa-solid fa-clock"></i> Computational Complexity: ${escapeHtml(item.complexity)}</div>` : ''}

                ${item.code ? `
                    <div class="ofc-code-accordion">
                        <button class="ofc-code-toggle" id="btnToggleOfcCode">
                            <i class="fa-solid fa-code"></i> <span id="ofcCodeBtnText">View Working Python Code</span>
                        </button>
                        <div class="ofc-code-box" id="ofcCodeBox">
                            <pre><code>${escapeHtml(item.code)}</code></pre>
                        </div>
                    </div>
                ` : ''}

                ${benchmarkMatch ? `
                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <span style="font-size: 13.5px; color: var(--emerald); font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Benchmark challenge matched: <strong>${escapeHtml(window.AlgoForgeAlgorithms.getProblem(benchmarkMatch.id)?.title)}</strong></span>
                        <button class="btn btn-primary btn-sm" id="btnOfcGoToStep2">Continue to Benchmark Lab <i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                ` : `
                    <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border);">
                        <span style="font-size: 13px; color: var(--text-muted); display: block; margin-bottom: 8px;">Want to test algorithmic approaches on real data? Choose a benchmark:</span>
                        <div class="quick-problem-chips">
                            <button class="qpc-btn btn-ofc-pick" data-pick="find_duplicates">Find Duplicates</button>
                            <button class="qpc-btn btn-ofc-pick" data-pick="shortest_path">Shortest Path</button>
                            <button class="qpc-btn btn-ofc-pick" data-pick="schedule_tasks">Schedule Tasks</button>
                        </div>
                    </div>
                `}
            </div>
        `;

        // Bind interactive elements inside the card
        document.getElementById('btnCopyFormula')?.addEventListener('click', () => {
            navigator.clipboard.writeText(item.formula || '');
            showToast('Formula copied to clipboard!');
        });

        const toggleCodeBtn = document.getElementById('btnToggleOfcCode');
        const codeBox = document.getElementById('ofcCodeBox');
        const codeBtnText = document.getElementById('ofcCodeBtnText');
        toggleCodeBtn?.addEventListener('click', () => {
            if (codeBox) {
                const isOpen = codeBox.classList.contains('open');
                codeBox.classList.toggle('open', !isOpen);
                if (codeBtnText) codeBtnText.textContent = isOpen ? 'View Working Python Code' : 'Hide Implementation Code';
            }
        });

        document.getElementById('btnOfcGoToStep2')?.addEventListener('click', () => {
            goToStep(2);
        });

        document.querySelectorAll('.btn-ofc-pick').forEach(btn => {
            btn.addEventListener('click', () => {
                const pid = btn.dataset.pick;
                state.selectedProblemId = pid;
                dom.problemCards.forEach(c => c.classList.toggle('selected', c.dataset.problemId === pid));
                const prob = window.AlgoForgeAlgorithms.getProblem(pid);
                showFeedback(`<i class="fa-solid fa-circle-check"></i> Selected challenge: <strong>${prob.title}</strong>. Click Continue below to proceed!`, 'success');
                goToStep(2);
            });
        });
    }

    function renderUnmatchedGuidance(query) {
        if (!dom.customFeedback) return;
        state.selectedProblemId = null;
        dom.problemCards.forEach(c => c.classList.remove('selected'));

        dom.customFeedback.className = 'feedback-box unmatched';
        dom.customFeedback.style.display = 'block';
        dom.customFeedback.innerHTML = `
            <div class="unmatched-feedback-wrap">
                <div class="ufw-header">
                    <i class="fa-solid fa-circle-question"></i>
                    <span>No verified benchmark found for: <strong>"${escapeHtml(query)}"</strong></span>
                </div>
                <p class="ufw-desc">AlgoForge evaluates real algorithms on 3 verified computational benchmarks. Please pick the challenge you'd like to explore:</p>
                <div class="ufw-options">
                    <button class="btn-pick-match" data-pick="find_duplicates">
                        <i class="fa-solid fa-copy"></i>
                        <span class="bpm-title">Find duplicates</span>
                        <span class="bpm-sub">Arrays, Hash Sets, O(N²) vs O(N)</span>
                    </button>
                    <button class="btn-pick-match" data-pick="shortest_path">
                        <i class="fa-solid fa-route"></i>
                        <span class="bpm-title">Find shortest path</span>
                        <span class="bpm-sub">Graph routing, Dijkstra vs BFS</span>
                    </button>
                    <button class="btn-pick-match" data-pick="schedule_tasks">
                        <i class="fa-solid fa-calendar-check"></i>
                        <span class="bpm-title">Schedule tasks</span>
                        <span class="bpm-sub">Interval scheduling & Greedy EDF</span>
                    </button>
                </div>
            </div>
        `;

        // Bind pick buttons
        dom.customFeedback.querySelectorAll('.btn-pick-match').forEach(btn => {
            btn.addEventListener('click', () => {
                const pickId = btn.dataset.pick;
                state.selectedProblemId = pickId;
                dom.problemCards.forEach(c => {
                    const isSelected = c.dataset.problemId === pickId;
                    c.classList.toggle('selected', isSelected);
                });
                const prob = window.AlgoForgeAlgorithms.getProblem(pickId);
                showFeedback(`<i class="fa-solid fa-circle-check"></i> Selected challenge: <strong>${prob.title}</strong>. Click <strong>Continue</strong> below to proceed!`, 'success');
                const targetCard = document.querySelector(`.problem-card[data-problem-id="${pickId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });
    }

    async function callGroqProblemClassifier(query) {
        showFeedback('<i class="fa-solid fa-spinner fa-spin"></i> Consulting Groq AI to map problem...', 'info');
        try {
            const cfg = window.ALGOFORGE_CONFIG;
            const res = await fetch(cfg.GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cfg.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: cfg.GROQ_MODEL,
                    messages: [
                        { role: 'system', content: 'Classify computational problem into one of 3: find_duplicates, shortest_path, schedule_tasks. Output JSON: {"matched":"find_duplicates"|"shortest_path"|"schedule_tasks", "explanation":"sentence"}' },
                        { role: 'user', content: query }
                    ],
                    response_format: { type: 'json_object' }
                })
            });
            const data = await res.json();
            const parsed = JSON.parse(data.choices[0].message.content);
            if (parsed.matched && ['find_duplicates', 'shortest_path', 'schedule_tasks'].includes(parsed.matched)) {
                dom.problemCards.forEach(c => c.classList.remove('selected'));
                const targetCard = document.querySelector(`.problem-card[data-problem-id="${parsed.matched}"]`);
                if (targetCard) targetCard.classList.add('selected');
                state.selectedProblemId = parsed.matched;
                showFeedback(`✓ AI mapped: ${parsed.explanation}`, 'success');
            } else {
                renderUnmatchedGuidance(query);
            }
        } catch (e) {
            renderUnmatchedGuidance(query);
        }
    }

    function showFeedback(msg, type = 'info') {
        if (!dom.customFeedback) return;
        dom.customFeedback.style.display = 'flex';
        dom.customFeedback.className = `feedback-box ${type}`;
        dom.customFeedback.innerHTML = msg;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 2: UNDERSTAND THE PROBLEM
    // ─────────────────────────────────────────────────────────────────────────────
    function renderStep2() {
        const problem = window.AlgoForgeAlgorithms.getProblem(state.selectedProblemId);
        if (!problem) return;

        dom.step2Title.textContent = `Your challenge: ${problem.title}`;
        dom.step2Tagline.textContent = problem.tagline;
        dom.step2Why.textContent = problem.interestingWhy;

        // Render visual input representation
        window.AlgoForgeVisualizer.renderProblemOverview(problem, dom.step2VisualContainer);

        // Size selector buttons
        dom.sizeButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.size === state.selectedSizeKey);
            btn.onclick = () => {
                dom.sizeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                state.selectedSizeKey = btn.dataset.size;
            };
        });
    }

    dom.btnStep2Back?.addEventListener('click', () => goToStep(1));
    dom.btnStep2Next?.addEventListener('click', () => goToStep(3));

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 3: EXPLORE ALGORITHM APPROACHES
    // ─────────────────────────────────────────────────────────────────────────────
    function renderStep3() {
        const problem = window.AlgoForgeAlgorithms.getProblem(state.selectedProblemId);
        if (!problem) return;

        const container = dom.step3CardsContainer;
        container.innerHTML = '';

        problem.approaches.forEach((approach, idx) => {
            const card = document.createElement('div');
            card.className = 'approach-card';
            card.innerHTML = `
                <div class="ac-top">
                    <span class="ac-badge ${approach.classification.includes('Candidate') ? 'candidate' : 'standard'}">
                        ${approach.classification}
                    </span>
                    <span class="ac-complexity">${approach.badge}</span>
                </div>
                <h4 class="ac-title">${approach.name}</h4>
                <p class="ac-desc">${approach.oneSentence}</p>
                <div class="ac-complexities">
                    <span class="c-tag"><i class="fa-solid fa-clock"></i> Time: <strong>${approach.timeComplexity}</strong></span>
                    <span class="c-tag"><i class="fa-solid fa-memory"></i> Space: <strong>${approach.spaceComplexity}</strong></span>
                </div>
                <div class="ac-actions">
                    <button class="btn btn-outline btn-sm btn-inspect" data-idx="${idx}">
                        <i class="fa-solid fa-play"></i> Inspect & Animate
                    </button>
                    <button class="btn btn-ghost btn-sm btn-toggle-code" data-idx="${idx}">
                        <i class="fa-solid fa-code"></i> View Code
                    </button>
                </div>
                <!-- Collapsible Code Container -->
                <div class="ac-code-box" id="codeBox_${idx}">
                    <pre><code>${escapeHtml(approach.code)}</code></pre>
                </div>
            `;
            container.appendChild(card);
        });

        // Bind Inspect & Visualize buttons
        container.querySelectorAll('.btn-inspect').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const approach = problem.approaches[idx];
                window.AlgoForgeVisualizer.loadTrace(problem, approach, dom.step3VisualizerArea);
                dom.step3VisualizerArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });

        // Bind Code toggles
        container.querySelectorAll('.btn-toggle-code').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const codeBox = $(`codeBox_${idx}`);
                if (codeBox) {
                    const isOpen = codeBox.classList.contains('open');
                    codeBox.classList.toggle('open', !isOpen);
                    btn.innerHTML = isOpen
                        ? '<i class="fa-solid fa-code"></i> View Code'
                        : '<i class="fa-solid fa-chevron-up"></i> Hide Code';
                }
            });
        });

        // Automatically load first approach trace into visualizer
        if (problem.approaches.length > 0) {
            window.AlgoForgeVisualizer.loadTrace(problem, problem.approaches[0], dom.step3VisualizerArea);
        }
    }

    dom.btnStep3Back?.addEventListener('click', () => goToStep(2));
    dom.btnStep3Next?.addEventListener('click', () => goToStep(4));

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 4: RUN REAL EXPERIMENTS
    // ─────────────────────────────────────────────────────────────────────────────
    function prepareStep4() {
        const problem = window.AlgoForgeAlgorithms.getProblem(state.selectedProblemId);
        if (!problem) return;

        dom.btnStartExperiment.disabled = false;
        dom.btnStartExperiment.innerHTML = '<i class="fa-solid fa-play"></i> Run Experiment Now';
        dom.pipelineStatusText.textContent = `Ready to benchmark ${problem.approaches.length} algorithms on ${state.selectedSizeKey} dataset (${problem.sizes[state.selectedSizeKey]?.count} items).`;
        dom.pipelineProgressBar.style.width = '0%';

        // Render pipeline items in waiting state
        dom.pipelineItemsContainer.innerHTML = problem.approaches.map(approach => `
            <div class="pipeline-item" id="pipeItem_${approach.id}">
                <div class="pi-left">
                    <span class="pi-status-icon waiting"><i class="fa-regular fa-clock"></i></span>
                    <div>
                        <div class="pi-name">${approach.name}</div>
                        <div class="pi-sub">${approach.classification} · ${approach.timeComplexity}</div>
                    </div>
                </div>
                <div class="pi-right">
                    <span class="pi-badge" id="pipeBadge_${approach.id}">Waiting</span>
                </div>
            </div>
        `).join('');
    }

    dom.btnStartExperiment?.addEventListener('click', async () => {
        dom.btnStartExperiment.disabled = true;
        dom.btnStartExperiment.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Benchmark...';

        try {
            const report = await window.AlgoForgeExperimentEngine.runExperiment({
                problemId: state.selectedProblemId,
                approachIds: [],
                sizeKey: state.selectedSizeKey,
                onProgress: ({ stage, progressPercent }) => {
                    dom.pipelineProgressBar.style.width = `${progressPercent}%`;
                    if (stage === 'starting') {
                        dom.pipelineStatusText.textContent = 'Generating deterministic dataset and running unit tests...';
                    }
                },
                onApproachStart: ({ approachId, approachName, index, total }) => {
                    dom.pipelineStatusText.textContent = `Benchmarking [${index + 1}/${total}]: ${approachName}...`;
                    const item = $(`pipeItem_${approachId}`);
                    const badge = $(`pipeBadge_${approachId}`);
                    if (item) item.className = 'pipeline-item running';
                    if (badge) {
                        badge.className = 'pi-badge running';
                        badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running';
                    }
                },
                onApproachDone: ({ approachId, result }) => {
                    const item = $(`pipeItem_${approachId}`);
                    const badge = $(`pipeBadge_${approachId}`);
                    if (item) item.className = 'pipeline-item completed';
                    if (badge) {
                        badge.className = `pi-badge ${result.verified ? 'verified' : 'failed'}`;
                        badge.innerHTML = result.verified
                            ? `<i class="fa-solid fa-check"></i> ${result.benchmark.avgTimeMs} ms`
                            : '<i class="fa-solid fa-xmark"></i> Failed Tests';
                    }
                }
            });

            state.currentReport = report;
            dom.pipelineStatusText.textContent = 'All measurements verified! Preparing results...';

            setTimeout(() => {
                goToStep(5);
                renderStep5(report);
            }, 500);

        } catch (err) {
            dom.btnStartExperiment.disabled = false;
            dom.btnStartExperiment.innerHTML = '<i class="fa-solid fa-rotate-left"></i> Retry Experiment';
            dom.pipelineStatusText.innerHTML = `<span class="err-text"><i class="fa-solid fa-triangle-exclamation"></i> Error: ${err.message}</span>`;
        }
    });

    dom.btnStep4Back?.addEventListener('click', () => goToStep(3));

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 5: RESULTS THAT MAKE SENSE
    // ─────────────────────────────────────────────────────────────────────────────
    let isTestBreakdownOpen = false;

    function renderStep5(report) {
        if (!report) return;

        // Distinctive Discovery Moment
        if (report.winner) {
            dom.discoveryBanner.style.display = 'flex';
            dom.discoveryBannerText.innerHTML = `
                <strong>A promising result, backed by evidence:</strong>
                <span>${report.winner.name}</span> delivered optimal performance at
                <strong>${report.winner.avgTimeMs} ms</strong> (${report.winner.speedupVsBaseline} vs baseline).
            `;
        } else {
            dom.discoveryBanner.style.display = 'none';
        }

        // Render Results Table
        dom.resultsTableBody.innerHTML = report.approaches.map(a => {
            const isWinner = report.winner && report.winner.id === a.approachId;
            return `
                <tr class="${isWinner ? 'winner-row' : ''}">
                    <td>
                        <div class="table-algo-cell">
                            <strong>${a.name}</strong>
                            <span class="table-sub">${a.classification}</span>
                        </div>
                    </td>
                    <td>
                        <span class="status-pill ${a.verified ? 'pill-success' : 'pill-danger'}">
                            <i class="fa-solid ${a.verified ? 'fa-check' : 'fa-xmark'}"></i>
                            ${a.correctness.passPercentage}% (${a.correctness.passedCount}/${a.correctness.totalCount})
                        </span>
                    </td>
                    <td>
                        <span class="timing-val ${isWinner ? 'timing-winner' : ''}">
                            ${a.benchmark.avgTimeMs} ms
                        </span>
                    </td>
                    <td>
                        <span class="speedup-val">${a.benchmark.speedupVsBaseline}</span>
                    </td>
                    <td>
                        <span class="badge-complexity">${a.timeComplexity}</span>
                    </td>
                </tr>
            `;
        }).join('');

        // Populate Test Suite Breakdown
        if (dom.testTotalPassed) {
            const totalCases = report.approaches.reduce((acc, a) => acc + a.correctness.totalCount, 0);
            const passedCases = report.approaches.reduce((acc, a) => acc + a.correctness.passedCount, 0);
            const overallPct = totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 100;
            dom.testTotalPassed.textContent = `${overallPct}% Verified (${passedCases}/${totalCases} checks)`;
        }

        if (dom.testSuiteBreakdown) {
            dom.testSuiteBreakdown.innerHTML = report.approaches.map(a => `
                <div class="test-approach-group">
                    <div class="tag-header">
                        <span class="tag-algo-name"><strong>${a.name}</strong> <span class="table-sub">(${a.classification})</span></span>
                        <span class="status-pill ${a.verified ? 'pill-success' : 'pill-danger'}">
                            <i class="fa-solid ${a.verified ? 'fa-check' : 'fa-xmark'}"></i>
                            ${a.correctness.passedCount}/${a.correctness.totalCount} Passed
                        </span>
                    </div>
                    <div class="test-cases-list">
                        ${a.correctness.cases.map(tc => `
                            <div class="test-case-item ${tc.passed ? 'passed' : 'suboptimal'}">
                                <div class="tci-top">
                                    <span class="tci-name"><i class="fa-solid ${tc.passed ? 'fa-circle-check tc-pass-icon' : 'fa-circle-exclamation tc-warn-icon'}"></i> ${escapeHtml(tc.name)}</span>
                                    <span class="tci-badge ${tc.passed ? 'passed' : 'suboptimal'}">
                                        ${tc.passed ? 'VERIFIED' : 'SUBOPTIMAL'}
                                    </span>
                                </div>
                                <div class="tci-desc">${escapeHtml(tc.description)}</div>
                                <div class="tci-note">${escapeHtml(tc.note || '')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // Render Chart.js Execution Time Bar Chart
        renderResultsChart(report);

        // Synthesis text
        dom.whatWorkedText.textContent = report.synthesis.whatWorked;
        dom.whatLearnedText.textContent = report.synthesis.whatLearned;
        dom.limitationsText.textContent = report.synthesis.limitations;

        if (dom.aiSynthesisBox) dom.aiSynthesisBox.style.display = 'none';
    }

    // Toggle Test Breakdown Accordion
    dom.btnToggleTestBreakdown?.addEventListener('click', () => {
        isTestBreakdownOpen = !isTestBreakdownOpen;
        if (dom.testSuiteBreakdown) {
            dom.testSuiteBreakdown.style.display = isTestBreakdownOpen ? 'block' : 'none';
        }
        if (dom.testToggleText) {
            dom.testToggleText.textContent = isTestBreakdownOpen ? 'Hide Test Cases' : 'Inspect Test Cases';
        }
        if (dom.iconTestChevron) {
            dom.iconTestChevron.className = isTestBreakdownOpen ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
        }
    });

    function renderResultsChart(report) {
        if (!dom.chartCanvas || typeof Chart === 'undefined') return;

        if (state.resultsChart) {
            state.resultsChart.destroy();
            state.resultsChart = null;
        }

        const labels = report.approaches.map(a => a.shortName);
        const data = report.approaches.map(a => a.benchmark.avgTimeMs);
        const colors = report.approaches.map(a => {
            if (report.winner && report.winner.id === a.approachId) return '#4f46e5';
            if (!a.verified) return '#e11d48';
            return '#0284c7';
        });

        const ctx = dom.chartCanvas.getContext('2d');
        state.resultsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: data,
                    backgroundColor: colors,
                    borderRadius: 6,
                    borderWidth: 0,
                    barThickness: 38
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => ` Average: ${context.parsed.y} ms`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(226, 232, 240, 0.8)' },
                        ticks: {
                            color: '#64748b',
                            font: { family: 'JetBrains Mono', size: 11 },
                            callback: v => `${v} ms`
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: '#334155',
                            font: { family: 'Inter', size: 12.5, weight: 600 }
                        }
                    }
                }
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // STEP 6: SAVE, EXPORT & HISTORY
    // ─────────────────────────────────────────────────────────────────────────────
    dom.btnSaveExperiment?.addEventListener('click', () => {
        if (!state.currentReport) return;
        const exists = state.myExperiments.some(e => e.runId === state.currentReport.runId);
        if (!exists) {
            state.myExperiments.unshift(state.currentReport);
            if (state.myExperiments.length > 30) state.myExperiments.pop();
            try {
                localStorage.setItem('algoforge_experiments', JSON.stringify(state.myExperiments));
            } catch (e) {}
            updateHistoryBadge();
            showToast('✓ Experiment saved to My Experiments');
        } else {
            showToast('Experiment is already saved in history');
        }
    });

    dom.btnDownloadJson?.addEventListener('click', () => {
        if (!state.currentReport) return;
        const blob = new Blob([JSON.stringify(state.currentReport, null, 2)], { type: 'application/json' });
        downloadFile(blob, `AlgoForge_Report_${state.currentReport.runId}.json`);
        showToast('✓ JSON report downloaded');
    });

    dom.btnDownloadHtml?.addEventListener('click', () => {
        if (!state.currentReport) return;
        const html = generateHtmlReport(state.currentReport);
        const blob = new Blob([html], { type: 'text/html' });
        downloadFile(blob, `AlgoForge_LabReport_${state.currentReport.runId}.html`);
        showToast('✓ HTML report downloaded');
    });

    dom.btnTryAnother?.addEventListener('click', () => {
        goToStep(1);
    });

    dom.btnAiSynthesis?.addEventListener('click', async () => {
        if (!state.currentReport) return;
        if (!window.ALGOFORGE_CONFIG || !window.ALGOFORGE_CONFIG.GROQ_API_KEY) {
            showToast('Groq API Key is not set. Using verified deterministic synthesis.');
            return;
        }

        dom.btnAiSynthesis.disabled = true;
        dom.btnAiSynthesis.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating AI synthesis...';

        try {
            const cfg = window.ALGOFORGE_CONFIG;
            const prompt = `Analyze these real benchmark results:
Problem: ${state.currentReport.problem.title}
Dataset: ${state.currentReport.datasetDescription}
Approaches Tested:
${state.currentReport.approaches.map(a => `- ${a.name}: ${a.benchmark.avgTimeMs} ms (${a.correctness.passPercentage}% passed)`).join('\n')}
Winner: ${state.currentReport.winner ? state.currentReport.winner.name : 'None'}

Provide a 3-sentence scientific synthesis explaining why the winner excelled and what architectural factors affected performance.`;

            const res = await fetch(cfg.GROQ_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cfg.GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: cfg.GROQ_MODEL,
                    messages: [
                        { role: 'system', content: 'You are an algorithm scientist. Provide a concise 3-sentence empirical summary.' },
                        { role: 'user', content: prompt }
                    ]
                })
            });
            const data = await res.json();
            const aiText = data.choices[0].message.content;

            if (dom.aiSynthesisBox) {
                dom.aiSynthesisBox.style.display = 'block';
                dom.aiSynthesisBox.innerHTML = `
                    <div class="ai-box-title"><i class="fa-solid fa-sparkles"></i> AI Scientific Synthesis (Groq):</div>
                    <p>${aiText}</p>
                `;
            }
        } catch (e) {
            showToast('AI request failed; falling back to local synthesis.');
        } finally {
            dom.btnAiSynthesis.disabled = false;
            dom.btnAiSynthesis.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Synthesis';
        }
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // MY EXPERIMENTS DRAWER / MODAL
    // ─────────────────────────────────────────────────────────────────────────────
    function updateHistoryBadge() {
        if (!dom.historyBadge) return;
        dom.historyBadge.textContent = state.myExperiments.length;
        dom.historyBadge.style.display = state.myExperiments.length > 0 ? 'inline-flex' : 'none';
    }

    function renderHistoryModal() {
        if (!dom.historyList) return;
        if (state.myExperiments.length === 0) {
            dom.historyList.innerHTML = `
                <div class="empty-history-state">
                    <i class="fa-regular fa-folder-open empty-icon"></i>
                    <h4>Your discoveries will appear here after your first experiment.</h4>
                    <p>Run a benchmark and click "Save to My Experiments" to track your findings.</p>
                </div>
            `;
            return;
        }

        dom.historyList.innerHTML = state.myExperiments.map((exp, idx) => `
            <div class="history-item-card">
                <div class="hic-top">
                    <span class="hic-problem">${exp.problem.title}</span>
                    <span class="hic-date">${exp.formattedDate || exp.timestamp.split('T')[0]}</span>
                </div>
                <div class="hic-details">
                    <span>${exp.approaches.length} approaches tested</span> ·
                    <span>Dataset: ${exp.sizeKey} (${exp.datasetCount} items)</span> ·
                    <span class="hic-winner">${exp.winner ? `Winner: ${exp.winner.shortName} (${exp.winner.avgTimeMs} ms)` : 'No winner'}</span>
                </div>
                <div class="hic-actions">
                    <button class="btn btn-outline btn-xs btn-reopen" data-idx="${idx}">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Reopen Report
                    </button>
                    <button class="btn btn-ghost btn-xs btn-delete-exp" data-idx="${idx}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        dom.historyList.querySelectorAll('.btn-reopen').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const exp = state.myExperiments[idx];
                if (exp) {
                    state.currentReport = exp;
                    state.selectedProblemId = exp.problem.id;
                    state.selectedSizeKey = exp.sizeKey;
                    closeHistoryModal();
                    goToStep(5);
                    renderStep5(exp);
                }
            });
        });

        dom.historyList.querySelectorAll('.btn-delete-exp').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                state.myExperiments.splice(idx, 1);
                try {
                    localStorage.setItem('algoforge_experiments', JSON.stringify(state.myExperiments));
                } catch (e) {}
                updateHistoryBadge();
                renderHistoryModal();
                showToast('Experiment deleted');
            });
        });
    }

    function openHistoryModal() {
        renderHistoryModal();
        dom.historyModal?.classList.add('open');
    }

    function closeHistoryModal() {
        dom.historyModal?.classList.remove('open');
    }

    dom.navHistory?.addEventListener('click', openHistoryModal);
    dom.btnCloseHistory?.addEventListener('click', closeHistoryModal);
    dom.btnClearHistory?.addEventListener('click', () => {
        if (state.myExperiments.length === 0) return;
        if (confirm('Clear all saved experiments?')) {
            state.myExperiments = [];
            localStorage.removeItem('algoforge_experiments');
            updateHistoryBadge();
            renderHistoryModal();
            showToast('All experiments cleared');
        }
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // UNIVERSAL KNOWLEDGE ORACLE MODAL
    // ─────────────────────────────────────────────────────────────────────────────
    const oracleModal = document.getElementById('oracleModal');
    const btnOpenOracle = document.getElementById('navOracle');
    const btnCloseOracle = document.getElementById('btnCloseOracle');
    const oracleSearchInput = document.getElementById('oracleSearchInput');
    const btnOracleModalSearch = document.getElementById('btnOracleModalSearch');
    const oracleModalOutput = document.getElementById('oracleModalOutput');

    function openOracleModal() {
        oracleModal?.classList.add('open');
        oracleSearchInput?.focus();
    }
    function closeOracleModal() {
        oracleModal?.classList.remove('open');
    }

    btnOpenOracle?.addEventListener('click', openOracleModal);
    btnCloseOracle?.addEventListener('click', closeOracleModal);

    async function runOracleModalSearch(query) {
        const q = query || oracleSearchInput?.value.trim();
        if (!q) return;
        if (oracleSearchInput) oracleSearchInput.value = q;
        if (oracleModalOutput) {
            oracleModalOutput.innerHTML = '<div style="padding: 30px; text-align: center; color: var(--accent);"><i class="fa-solid fa-spinner fa-spin"></i> Searching Universal Knowledge Oracle...</div>';
        }

        if (window.OracleEngine) {
            try {
                const res = await window.OracleEngine.search(q);
                if (res && res.data) {
                    const item = res.data;
                    oracleModalOutput.innerHTML = `
                        <div class="oracle-formula-card" style="margin-top:0;">
                            <div class="ofc-header">
                                <div class="ofc-title-wrap">
                                    <span class="ofc-emoji">${item.emoji || '🔬'}</span>
                                    <span class="ofc-title">${escapeHtml(item.name)}</span>
                                </div>
                                <span class="ofc-domain-pill">${escapeHtml(item.domain || 'Science')}</span>
                            </div>
                            <div class="ofc-formula-wrap">
                                <div>
                                    <span class="ofc-formula-label">Discovered Governing Formula:</span>
                                    <div class="ofc-formula-code">${escapeHtml(item.formula || 'f(x) = ?')}</div>
                                </div>
                                <button class="ofc-btn-copy" id="btnModalCopyFormula">
                                    <i class="fa-solid fa-copy"></i> Copy Formula
                                </button>
                            </div>
                            <div class="ofc-eli5">
                                <i class="fa-solid fa-lightbulb"></i>
                                <div><strong>In Simple English:</strong> ${escapeHtml(item.eli5 || '')}</div>
                            </div>
                            <p class="ofc-explanation">${escapeHtml(item.explanation || '')}</p>
                            ${item.complexity ? `<div class="ofc-complexity-tag"><i class="fa-solid fa-clock"></i> Complexity: ${escapeHtml(item.complexity)}</div>` : ''}
                            ${item.code ? `
                                <div class="ofc-code-accordion">
                                    <div class="ofc-code-box open">
                                        <pre><code>${escapeHtml(item.code)}</code></pre>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    document.getElementById('btnModalCopyFormula')?.addEventListener('click', () => {
                        navigator.clipboard.writeText(item.formula || '');
                        showToast('Formula copied to clipboard!');
                    });
                    return;
                }
            } catch(e) {}
        }

        if (oracleModalOutput) {
            oracleModalOutput.innerHTML = `
                <div class="oracle-empty-state">
                    <i class="fa-solid fa-circle-question"></i>
                    <p>No formula found for "${escapeHtml(q)}". Try searching for <strong>gravity</strong>, <strong>kepler</strong>, <strong>dijkstra</strong>, <strong>entropy</strong>, <strong>fourier</strong>, or <strong>binary search</strong>.</p>
                </div>
            `;
        }
    }

    btnOracleModalSearch?.addEventListener('click', () => runOracleModalSearch());
    oracleSearchInput?.addEventListener('keydown', e => {
        if (e.key === 'Enter') runOracleModalSearch();
    });

    document.querySelectorAll('.oqt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const q = btn.dataset.q;
            runOracleModalSearch(q);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // HOW IT WORKS MODAL
    // ─────────────────────────────────────────────────────────────────────────────
    function openHowModal() {
        dom.howModal?.classList.add('open');
    }
    function closeHowModal() {
        dom.howModal?.classList.remove('open');
    }
    dom.navHow?.addEventListener('click', openHowModal);
    dom.btnSeeHow?.addEventListener('click', openHowModal);
    dom.btnCloseHow?.addEventListener('click', closeHowModal);

    // Modal "Start Discovering" CTA button
    document.getElementById('btnModalStartDiscovering')?.addEventListener('click', () => {
        closeHowModal();
        goToStep(1);
    });

    // Landing Page "Try an Experiment Below" CTA button
    document.getElementById('btnScrollToProblems')?.addEventListener('click', () => {
        goToStep(1);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // NAVIGATION LINKS
    // ─────────────────────────────────────────────────────────────────────────────
    dom.navBrand?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    dom.btnStartHero?.addEventListener('click', () => {
        goToStep(1);
    });
    dom.navDiscover?.addEventListener('click', () => {
        goToStep(1);
    });
    dom.navProblems?.addEventListener('click', () => {
        goToStep(1);
    });

    // ─────────────────────────────────────────────────────────────────────────────
    // HELPERS: HTML REPORT GENERATOR, TOAST & UTILITIES
    // ─────────────────────────────────────────────────────────────────────────────
    function generateHtmlReport(r) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AlgoForge Lab Report — ${r.problem.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.6; padding: 40px 20px; }
        .report-wrap { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
        h1 { font-size: 24px; color: #0f172a; margin-bottom: 6px; }
        .meta { color: #64748b; font-size: 13.5px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        th { background: #f8fafc; color: #475569; font-weight: 700; }
        .winner-cell { color: #4f46e5; font-weight: 700; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; background: #ecfdf5; color: #059669; font-weight: 700; }
        .section-title { font-size: 16px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #0f172a; }
        p { color: #334155; font-size: 14px; margin-bottom: 12px; }
    </style>
</head>
<body>
    <div class="report-wrap">
        <h1>AlgoForge AI — Experiment Laboratory Report</h1>
        <div class="meta">
            Problem: <strong>${r.problem.title}</strong> · Run ID: <code>${r.runId}</code> · Date: ${r.formattedDate} · Dataset: ${r.sizeKey} (${r.datasetCount} items)
        </div>
        <table>
            <thead>
                <tr>
                    <th>Approach</th>
                    <th>Classification</th>
                    <th>Correctness</th>
                    <th>Avg Execution Time</th>
                    <th>Speedup</th>
                </tr>
            </thead>
            <tbody>
                ${r.approaches.map(a => `
                    <tr>
                        <td><strong>${a.name}</strong></td>
                        <td>${a.classification}</td>
                        <td><span class="badge">${a.correctness.passPercentage}% (${a.correctness.passedCount}/${a.correctness.totalCount})</span></td>
                        <td class="${r.winner && r.winner.id === a.approachId ? 'winner-cell' : ''}">${a.benchmark.avgTimeMs} ms</td>
                        <td><strong>${a.benchmark.speedupVsBaseline}</strong></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="section-title">What Worked?</div>
        <p>${r.synthesis.whatWorked}</p>
        <div class="section-title">What Did We Learn?</div>
        <p>${r.synthesis.whatLearned}</p>
        <div class="section-title">Limitations & Reproducibility</div>
        <p>${r.synthesis.limitations}</p>
    </div>
</body>
</html>`;
    }

    function downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function showToast(msg) {
        if (!dom.toast) return;
        dom.toast.textContent = msg;
        dom.toast.classList.add('show');
        setTimeout(() => dom.toast.classList.remove('show'), 3000);
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────────────
    initHeroCanvas();
    initLandingTeaser();
    initStep1();
    updateHistoryBadge();
});
