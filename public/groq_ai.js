/* ═══════════════════════════════════════════════════════════
   ALGOFORGE — Groq AI Integration
   1. Natural Language → Test Cases → GP Synthesis
   2. AI Algorithm Explainer (post-synthesis)
   ═══════════════════════════════════════════════════════════ */

const GroqAI = {

    // ── Core API caller ──
    async call(messages, temperature = 0.3, maxTokens = 1024) {
        const cfg = window.ALGOFORGE_CONFIG;
        if (!cfg || !cfg.GROQ_API_KEY) {
            throw new Error("Groq API key not found. Check public/config.js");
        }
        const res = await fetch(cfg.GROQ_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cfg.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: cfg.GROQ_MODEL,
                messages,
                temperature,
                max_tokens: maxTokens,
                response_format: { type: "json_object" }
            })
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Groq API error ${res.status}: ${err}`);
        }
        const data = await res.json();
        return data.choices[0].message.content;
    },

    // ── 1. Natural Language → Task Config ──
    async descriptionToTask(description) {
        const prompt = `Design an algorithm task for a Genetic Programming engine.

Task: "${description}"

Rules:
- Pick ONE array size N (3, 4, or 5). ALL arrays must be exactly length N.
- Use integers 1-15 only.
- Provide exactly 4 test cases, all same length.
- Engine supports: compare-swap, swap, reverse-range, loops.

Respond with ONLY this JSON (no extra text):
{"task_name":"snake_case","task_description":"one sentence","difficulty":"Easy","array_size":4,"test_cases":[[[4,2,3,1],[1,2,3,4]],[[3,1,4,2],[1,2,3,4]],[[2,4,1,3],[1,2,3,4]],[[4,3,2,1],[1,2,3,4]]],"hint":"use compare-swap pairs"}`;

        const raw = await this.call([
            { role: "system", content: "Output ONLY valid compact JSON. No markdown. No explanation. Every array must be exactly array_size length." },
            { role: "user",   content: prompt }
        ], 0.1, 400);

        const task = JSON.parse(raw);

        // Auto-repair: find dominant array size and filter to matching cases
        const sizes = (task.test_cases || []).map(([inp]) => inp.length);
        const freq  = {};
        sizes.forEach(s => { freq[s] = (freq[s] || 0) + 1; });
        const dominantN = parseInt(Object.keys(freq).sort((a,b) => freq[b]-freq[a])[0] || task.array_size || 4);
        task.array_size = dominantN;
        task.test_cases = (task.test_cases || []).filter(([inp, out]) =>
            Array.isArray(inp) && Array.isArray(out) &&
            inp.length === dominantN && out.length === dominantN
        );
        return task;
    },

    // ── 2. Post-synthesis AI explanation of the evolved AST ──
    async explainAlgorithm(taskName, taskDescription, astRepr, fitness, steps) {
        const prompt = `A Genetic Programming engine evolved an algorithm:
Task: ${taskName} — ${taskDescription}
Fitness: ${fitness}%
Steps: ${steps.slice(0,5).map((s,i)=>`${i+1}. ${s}`).join(' | ')}

Respond with ONLY JSON:
{"headline":"one punchy sentence naming the strategy","explanation":"2-3 sentences explaining what it does and why it works","insight":"one interesting observation","algorithm_family":"e.g. Sorting Network, Selection Sort variant"}`;

        const raw = await this.call([
            { role: "system", content: "Output ONLY valid compact JSON. No markdown." },
            { role: "user",   content: prompt }
        ], 0.4, 300);

        return JSON.parse(raw);
    },

    // ── 3. Generate task variations ──
    async suggestVariations(taskName, description) {
        const prompt = `Given algorithm task: "${taskName} — ${description}"
Suggest 3 related tasks solvable by compare-swap on integer arrays size 3-5.
Respond with ONLY JSON:
{"variations":[{"name":"snake_name","description":"one sentence","difficulty":"Easy"},{"name":"snake_name","description":"one sentence","difficulty":"Medium"},{"name":"snake_name","description":"one sentence","difficulty":"Hard"}]}`;

        const raw = await this.call([
            { role: "system", content: "Output ONLY valid compact JSON. No markdown." },
            { role: "user",   content: prompt }
        ], 0.6, 250);

        return JSON.parse(raw);
    }
};
