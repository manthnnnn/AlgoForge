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
        const prompt = `You are an algorithm task designer for a Genetic Programming engine that works on INTEGER ARRAYS.

CRITICAL RULES — follow exactly:
1. Pick ONE fixed array size N between 3 and 5. Every single test case must use EXACTLY N integers for input AND N integers for output.
2. Do NOT mix array sizes. If N=4, every input is [a,b,c,d] and every output is [a,b,c,d].
3. The engine can only: compare-swap two positions, swap two positions, reverse a subrange, loop over indices.
4. Use only small integers (1-20) for clarity.
5. Provide exactly 5 test cases, all with the same N.

User wants: "${description}"

Example of CORRECT output for "sort 4 numbers ascending" (N=4, all arrays length 4):
{
  "task_name": "sort_4_asc",
  "task_description": "Sort 4 integers in ascending order",
  "difficulty": "Medium",
  "array_size": 4,
  "test_cases": [
    [[4,2,3,1],[1,2,3,4]],
    [[1,3,2,4],[1,2,3,4]],
    [[4,3,2,1],[1,2,3,4]],
    [[2,1,4,3],[1,2,3,4]],
    [[3,4,1,2],[1,2,3,4]]
  ],
  "hint": "Use compare-swap pairs covering all positions"
}

Now generate JSON for: "${description}"
ALL arrays must be length array_size. No exceptions.

Respond with ONLY valid JSON matching the exact structure above.`;

        const raw = await this.call([
            { role: "system", content: "You are a precise algorithm task designer. Output ONLY valid JSON. Every test case input and output array must have exactly the same length as array_size." },
            { role: "user",   content: prompt }
        ], 0.1, 900);

        const task = JSON.parse(raw);

        // ── Auto-repair: find the majority array size and filter to matching cases ──
        const n = task.array_size || 4;
        const sizes = (task.test_cases || []).map(([inp]) => inp.length);
        // Find most common size
        const freq = {};
        sizes.forEach(s => { freq[s] = (freq[s] || 0) + 1; });
        const dominantN = parseInt(Object.keys(freq).sort((a,b) => freq[b]-freq[a])[0] || n);

        // Keep only cases where both input and output match dominantN
        const fixed = (task.test_cases || []).filter(([inp, out]) =>
            Array.isArray(inp) && Array.isArray(out) &&
            inp.length === dominantN && out.length === dominantN
        );

        task.array_size  = dominantN;
        task.test_cases  = fixed;
        return task;
    },

    // ── 2. Post-synthesis AI explanation of the evolved AST ──
    async explainAlgorithm(taskName, taskDescription, astRepr, fitness, steps) {
        const prompt = `You are an expert computer science educator explaining a discovered algorithm.

A Genetic Programming engine evolved the following algorithm for this task:
- Task: ${taskName}
- Description: ${taskDescription}
- Fitness achieved: ${fitness}%
- AST structure: ${astRepr.substring(0, 600)}

Step-by-step execution trace:
${steps.slice(0, 8).map((s, i) => `Step ${i+1}: ${s}`).join('\n')}

Write a clear, engaging explanation (3-5 sentences) that:
1. Describes what strategy the algorithm discovered
2. Explains WHY this sequence of operations achieves the goal
3. Notes anything clever or interesting about the discovered approach
4. Compares it to any well-known algorithm if relevant

Respond with ONLY valid JSON:
{
  "headline": "One punchy sentence naming the strategy (e.g. 'Discovered a 3-comparator optimal network')",
  "explanation": "3-5 sentence plain English explanation",
  "insight": "One sentence about what makes this interesting or clever",
  "algorithm_family": "The family this belongs to (e.g. Sorting Network, Bubble Sort variant, Selection Sort variant)"
}`;

        const raw = await this.call([
            { role: "system", content: "You are an expert CS educator. Always respond with valid JSON only." },
            { role: "user",   content: prompt }
        ], 0.5, 600);

        return JSON.parse(raw);
    },

    // ── 3. Generate task variations ──
    async suggestVariations(taskName, description) {
        const prompt = `Given this algorithm task: "${taskName} — ${description}"
Suggest 3 interesting related tasks that would be good to try next.
Each should be solvable by compare-swap operations on integer arrays of size 3-5.

Respond with ONLY valid JSON:
{
  "variations": [
    { "name": "task_name", "description": "one sentence", "difficulty": "Easy|Medium|Hard" },
    { "name": "task_name", "description": "one sentence", "difficulty": "Easy|Medium|Hard" },
    { "name": "task_name", "description": "one sentence", "difficulty": "Easy|Medium|Hard" }
  ]
}`;

        const raw = await this.call([
            { role: "system", content: "You are a creative algorithm task designer. Always respond with valid JSON only." },
            { role: "user",   content: prompt }
        ], 0.7, 400);

        return JSON.parse(raw);
    }
};
