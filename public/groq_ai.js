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
        const prompt = `You are an algorithm task designer for a Genetic Programming engine.
The user describes an algorithm they want to discover. Your job is to:
1. Parse their description
2. Generate a precise task configuration with test cases

The GP engine operates on INTEGER ARRAYS only. It can:
- Compare and swap elements (CompareSwap)
- Swap elements (Swap)  
- Reverse a range (ReverseRange)
- Use loops and conditionals

RULES for test cases:
- Input and output must be integer arrays of THE SAME LENGTH (2-6 elements)
- Use small integers (-9 to 99)
- Provide 4-6 diverse test cases that fully characterize the task
- All test cases must have arrays of the same length

User description: "${description}"

Respond with ONLY valid JSON in this exact format:
{
  "task_name": "short_snake_case_name",
  "task_description": "One sentence describing the task clearly",
  "difficulty": "Easy|Medium|Hard",
  "array_size": 3,
  "test_cases": [
    [[input_array], [expected_output_array]],
    [[input_array], [expected_output_array]],
    [[input_array], [expected_output_array]],
    [[input_array], [expected_output_array]]
  ],
  "hint": "What kind of operations will solve this (e.g. compare-swap pairs, reversal, etc.)"
}`;

        const raw = await this.call([
            { role: "system", content: "You are a precise algorithm task designer. Always respond with valid JSON only." },
            { role: "user",   content: prompt }
        ], 0.2, 800);

        return JSON.parse(raw);
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
