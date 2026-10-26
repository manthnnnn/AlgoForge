/**
 * ALGOFORGE AI — Algorithm Discovery Platform
 * Verified Computational Problems, Real Deterministic Implementations,
 * Test Suites, and Step-by-Step Trace Generators.
 */

(function(exports) {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────────
    // PRNG (Pseudorandom Number Generator) for reproducible deterministic benchmarks
    // ─────────────────────────────────────────────────────────────────────────────
    class SeededPRNG {
        constructor(seed = 123456789) {
            this.seed = seed % 2147483647;
            if (this.seed <= 0) this.seed += 2147483646;
        }
        next() {
            this.seed = (this.seed * 16807) % 2147483647;
            return (this.seed - 1) / 2147483646;
        }
        nextInt(min, max) {
            return Math.floor(this.next() * (max - min + 1)) + min;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // PROBLEM 1: FIND DUPLICATES
    // ─────────────────────────────────────────────────────────────────────────────
    const FindDuplicatesProblem = {
        id: 'find_duplicates',
        title: 'Find duplicate values in a list',
        shortTitle: 'Find duplicates',
        category: 'Array & Set Theory',
        oneLiner: 'Discover different ways to identify repeated values in a list.',
        tagline: 'Given a list of values, identify which values appear more than once.',
        interestingWhy: 'Different approaches produce the same correct answer while requiring vastly different amounts of time (O(N²) vs O(N log N) vs O(N)) or memory.',
        tags: ['Arrays', 'Frequency', 'Hash Set', 'Sorting'],

        // Sample input for explanation & visualizer
        sampleInput: [4, 2, 7, 2, 9, 4],
        sampleExpected: [2, 4],

        // Input sizes for benchmarks with repetition batches for high timing stability
        sizes: {
            small: { label: 'Small', count: 600, repetitions: 15, desc: '600 items — Fast baseline validation' },
            medium: { label: 'Medium', count: 3000, repetitions: 8, desc: '3,000 items — Noticeable algorithmic separation' },
            large: { label: 'Large', count: 12000, repetitions: 3, desc: '12,000 items — Dramatic asymptotic O(N²) vs O(N) scaling' }
        },

        // Generate deterministic dataset with controlled duplicate frequency (~25% duplicates)
        generateDataset(sizeKey = 'medium', seed = 42) {
            const count = this.sizes[sizeKey]?.count || 3000;
            const prng = new SeededPRNG(seed);
            const arr = [];
            const uniqueRange = Math.max(10, Math.floor(count * 0.7));
            for (let i = 0; i < count; i++) {
                arr.push(prng.nextInt(1, uniqueRange));
            }
            return arr;
        },

        // Canonical correctness check
        normalizeResult(res) {
            if (!Array.isArray(res)) return [];
            return [...new Set(res)].sort((a, b) => a - b);
        },

        // Deterministic Test Cases (including edge cases)
        testCases: [
            {
                name: 'Standard list with duplicate pairs',
                input: [4, 2, 7, 2, 9, 4],
                expected: [2, 4],
                description: 'Values 2 and 4 appear multiple times.'
            },
            {
                name: 'All unique elements',
                input: [1, 3, 5, 7, 9, 11],
                expected: [],
                description: 'No duplicates exist in the collection.'
            },
            {
                name: 'Multiple repetitions of single value',
                input: [8, 8, 8, 8, 8],
                expected: [8],
                description: 'Single repeated number repeated 5 times.'
            },
            {
                name: 'Empty array edge case',
                input: [],
                expected: [],
                description: 'Zero elements input handling.'
            },
            {
                name: 'Single element edge case',
                input: [42],
                expected: [],
                description: 'Single element cannot have a duplicate.'
            },
            {
                name: 'Negative integers and zero',
                input: [-5, 10, -5, 0, 3, 10, -2],
                expected: [-5, 10],
                description: 'Handles negative values and zero correctly.'
            },
            {
                name: 'Minimal duplicate pair',
                input: [99, 99],
                expected: [99],
                description: 'Two identical numbers.'
            }
        ],

        // Algorithmic Approaches
        approaches: [
            {
                id: 'nested_comparison',
                name: 'Nested Pair Comparisons',
                shortName: 'Nested Loops',
                classification: 'Standard Baseline (Existing)',
                badge: 'O(N²) Time',
                timeComplexity: 'O(N²)',
                spaceComplexity: 'O(1) extra space',
                oneSentence: 'Compares each element against every subsequent element in a double loop.',
                explanation: 'A straightforward brute-force technique. For every element at index i, a nested loop scans all subsequent indices j. If arr[i] === arr[j] and the value is not already recorded, it is marked as a duplicate.',
                strengths: 'Requires no auxiliary sorting or hashing libraries; minimal memory overhead.',
                tradeoffs: 'Quadratic time complexity: for 12,000 items it performs ~72,000,000 comparisons, becoming noticeably slow.',
                code: `function findDuplicatesNested(arr) {
    const duplicates = [];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (arr[i] === arr[j]) {
                if (!duplicates.includes(arr[i])) {
                    duplicates.push(arr[i]);
                }
                break; // Found duplicate for this item, advance i
            }
        }
    }
    return duplicates;
}`,
                run(arr) {
                    const duplicates = [];
                    const n = arr.length;
                    for (let i = 0; i < n; i++) {
                        for (let j = i + 1; j < n; j++) {
                            if (arr[i] === arr[j]) {
                                if (!duplicates.includes(arr[i])) {
                                    duplicates.push(arr[i]);
                                }
                                break;
                            }
                        }
                    }
                    return duplicates;
                },
                createTrace(sampleArr) {
                    const arr = [...sampleArr];
                    const steps = [];
                    const found = [];
                    const n = arr.length;

                    steps.push({
                        title: 'Initialization',
                        description: `Starting nested comparison on array of ${n} elements.`,
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        found: [],
                        highlightState: 'idle'
                    });

                    for (let i = 0; i < n; i++) {
                        for (let j = i + 1; j < n; j++) {
                            const isMatch = arr[i] === arr[j];
                            const isNewDuplicate = isMatch && !found.includes(arr[i]);
                            if (isNewDuplicate) found.push(arr[i]);

                            steps.push({
                                title: isMatch ? 'Duplicate Detected!' : 'Comparing Elements',
                                description: `Comparing index ${i} (value ${arr[i]}) with index ${j} (value ${arr[j]}).${isMatch ? ` Match found! Added ${arr[i]} to duplicates.` : ''}`,
                                arr: [...arr],
                                i: i,
                                j: j,
                                found: [...found],
                                highlightState: isMatch ? 'match' : 'compare'
                            });

                            if (isMatch) break;
                        }
                    }

                    steps.push({
                        title: 'Search Completed',
                        description: `Finished scanning all pairs. Discovered duplicates: [${found.join(', ')}].`,
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        found: [...found],
                        highlightState: 'done'
                    });

                    return steps;
                }
            },
            {
                id: 'sort_and_scan',
                name: 'Sort & Scan Adjacent',
                shortName: 'Sort & Scan',
                classification: 'Divide & Conquer (Existing)',
                badge: 'O(N log N) Time',
                timeComplexity: 'O(N log N)',
                spaceComplexity: 'O(N) space',
                oneSentence: 'Sorts the collection so identical items become neighbors, then scans once.',
                explanation: 'By sorting the array first in O(N log N), any duplicates are clustered together. A single linear pass (O(N)) then checks if adjacent elements match.',
                strengths: 'Significantly faster than nested loops for medium and large collections.',
                tradeoffs: 'Requires sorting the array, which creates an array copy or mutates original input ordering.',
                code: `function findDuplicatesSorted(arr) {
    if (arr.length <= 1) return [];
    // Create copy and sort numerically
    const sorted = [...arr].sort((a, b) => a - b);
    const duplicates = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i] === sorted[i + 1]) {
            if (duplicates[duplicates.length - 1] !== sorted[i]) {
                duplicates.push(sorted[i]);
            }
        }
    }
    return duplicates;
}`,
                run(arr) {
                    if (arr.length <= 1) return [];
                    const sorted = [...arr].sort((a, b) => a - b);
                    const duplicates = [];
                    for (let i = 0; i < sorted.length - 1; i++) {
                        if (sorted[i] === sorted[i + 1]) {
                            if (duplicates[duplicates.length - 1] !== sorted[i]) {
                                duplicates.push(sorted[i]);
                            }
                        }
                    }
                    return duplicates;
                },
                createTrace(sampleArr) {
                    const steps = [];
                    const orig = [...sampleArr];
                    steps.push({
                        title: 'Original Input',
                        description: `Starting with unsorted array: [${orig.join(', ')}].`,
                        arr: [...orig],
                        i: -1,
                        j: -1,
                        found: [],
                        highlightState: 'idle'
                    });

                    const sorted = [...orig].sort((a, b) => a - b);
                    steps.push({
                        title: 'Array Sorted',
                        description: `Array sorted in O(N log N) time: [${sorted.join(', ')}]. All duplicates are now adjacent neighbors.`,
                        arr: [...sorted],
                        i: -1,
                        j: -1,
                        found: [],
                        highlightState: 'sorted'
                    });

                    const found = [];
                    for (let i = 0; i < sorted.length - 1; i++) {
                        const isMatch = sorted[i] === sorted[i + 1];
                        const isNew = isMatch && found[found.length - 1] !== sorted[i];
                        if (isNew) found.push(sorted[i]);

                        steps.push({
                            title: isMatch ? 'Adjacent Match Found' : 'Scanning Adjacent Pair',
                            description: `Checking neighbor pair at [${i}] (${sorted[i]}) and [${i + 1}] (${sorted[i + 1]}).${isMatch ? ` Duplicate confirmed: ${sorted[i]}.` : ''}`,
                            arr: [...sorted],
                            i: i,
                            j: i + 1,
                            found: [...found],
                            highlightState: isMatch ? 'match' : 'compare'
                        });
                    }

                    steps.push({
                        title: 'Scan Finished',
                        description: `Single pass scan complete. Found duplicates: [${found.join(', ')}].`,
                        arr: [...sorted],
                        i: -1,
                        j: -1,
                        found: [...found],
                        highlightState: 'done'
                    });

                    return steps;
                }
            },
            {
                id: 'hash_set',
                name: 'Hash Set Direct Lookup',
                shortName: 'Hash Set',
                classification: 'Lookup Optimized (Existing)',
                badge: 'O(N) Time',
                timeComplexity: 'O(N)',
                spaceComplexity: 'O(N) space',
                oneSentence: 'Tracks seen values in a hash set for immediate O(1) average lookup.',
                explanation: 'Iterates through the collection exactly once. For each item, it queries a Set. If the item was already seen, it is confirmed as a duplicate; otherwise, it is inserted into the seen set.',
                strengths: 'Optimal theoretical time complexity: linear O(N) execution time.',
                tradeoffs: 'Consumes O(N) auxiliary memory to store hash table buckets and pointers.',
                code: `function findDuplicatesHashSet(arr) {
    const seen = new Set();
    const duplicates = new Set();
    
    for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        if (seen.has(val)) {
            duplicates.add(val);
        } else {
            seen.add(val);
        }
    }
    return Array.from(duplicates);
}`,
                run(arr) {
                    const seen = new Set();
                    const duplicates = new Set();
                    for (let i = 0; i < arr.length; i++) {
                        const val = arr[i];
                        if (seen.has(val)) {
                            duplicates.add(val);
                        } else {
                            seen.add(val);
                        }
                    }
                    return Array.from(duplicates);
                },
                createTrace(sampleArr) {
                    const steps = [];
                    const arr = [...sampleArr];
                    const seen = [];
                    const duplicates = [];

                    steps.push({
                        title: 'Initialize Hash Set',
                        description: 'Create empty "Seen" Set and "Duplicates" Set. Starting single pass.',
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        seen: [],
                        found: [],
                        highlightState: 'idle'
                    });

                    for (let i = 0; i < arr.length; i++) {
                        const val = arr[i];
                        const alreadySeen = seen.includes(val);

                        if (alreadySeen) {
                            if (!duplicates.includes(val)) duplicates.push(val);
                        } else {
                            seen.push(val);
                        }

                        steps.push({
                            title: alreadySeen ? `Collision: "${val}" already in Seen Set` : `Inserted "${val}" into Seen Set`,
                            description: alreadySeen
                                ? `Value ${val} is already in the Hash Set! Added to duplicates.`
                                : `Value ${val} is new. Recorded in Seen Set (O(1) insertion).`,
                            arr: [...arr],
                            i: i,
                            j: -1,
                            seen: [...seen],
                            found: [...duplicates],
                            highlightState: alreadySeen ? 'match' : 'visit'
                        });
                    }

                    steps.push({
                        title: 'Hash Set Pass Finished',
                        description: `Completed in 1 pass (${arr.length} lookups). Duplicates: [${duplicates.join(', ')}].`,
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        seen: [...seen],
                        found: [...duplicates],
                        highlightState: 'done'
                    });

                    return steps;
                }
            },
            {
                id: 'frequency_index',
                name: 'Direct Frequency Indexing',
                shortName: 'Frequency Index',
                classification: 'Domain Candidate (Candidate)',
                badge: 'O(N) Time · Bounded',
                timeComplexity: 'O(N)',
                spaceComplexity: 'O(Range)',
                oneSentence: 'For positive integer keys, uses direct array indexing as an ultra-fast counter.',
                explanation: 'A candidate optimization for integer ranges. Instead of generic hash buckets with hashing overhead, it maps values directly to indices in a contiguous TypedArray or integer array.',
                strengths: 'Zero hash collision overhead; extreme cache locality for bounded integers.',
                tradeoffs: 'Only applicable to integer inputs within a known positive bound; requires offset translation for negative numbers.',
                code: `function findDuplicatesFrequencyIndex(arr) {
    if (arr.length <= 1) return [];
    let min = arr[0], max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
    }
    const range = max - min + 1;
    if (range > 2000000) {
        // Fallback for extreme sparse range
        const seen = new Set(), dups = new Set();
        for (let x of arr) { if (seen.has(x)) dups.add(x); else seen.add(x); }
        return Array.from(dups);
    }
    const count = new Uint16Array(range);
    const duplicates = [];
    for (let i = 0; i < arr.length; i++) {
        const offset = arr[i] - min;
        count[offset]++;
        if (count[offset] === 2) {
            duplicates.push(arr[i]);
        }
    }
    return duplicates;
}`,
                run(arr) {
                    if (arr.length <= 1) return [];
                    let min = arr[0], max = arr[0];
                    for (let i = 1; i < arr.length; i++) {
                        if (arr[i] < min) min = arr[i];
                        if (arr[i] > max) max = arr[i];
                    }
                    const range = max - min + 1;
                    if (range > 2000000) {
                        const seen = new Set(), dups = new Set();
                        for (let x of arr) { if (seen.has(x)) dups.add(x); else seen.add(x); }
                        return Array.from(dups);
                    }
                    const count = new Uint16Array(range);
                    const duplicates = [];
                    for (let i = 0; i < arr.length; i++) {
                        const offset = arr[i] - min;
                        count[offset]++;
                        if (count[offset] === 2) {
                            duplicates.push(arr[i]);
                        }
                    }
                    return duplicates;
                },
                createTrace(sampleArr) {
                    const steps = [];
                    const arr = [...sampleArr];
                    let min = Math.min(...arr);
                    let max = Math.max(...arr);
                    const range = max - min + 1;

                    steps.push({
                        title: 'Determine Domain Range',
                        description: `Input values range from min=${min} to max=${max} (span = ${range}). Allocating direct counter array of size ${range}.`,
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        found: [],
                        highlightState: 'idle'
                    });

                    const counts = new Array(range).fill(0);
                    const duplicates = [];

                    for (let i = 0; i < arr.length; i++) {
                        const val = arr[i];
                        const offset = val - min;
                        counts[offset]++;
                        const isDup = counts[offset] === 2;
                        if (isDup) duplicates.push(val);

                        steps.push({
                            title: `Increment Index [${offset}] (Value ${val})`,
                            description: `Offset ${val} - ${min} = ${offset}. Frequency count incremented to ${counts[offset]}.${isDup ? ` Reached count 2! Recorded as duplicate.` : ''}`,
                            arr: [...arr],
                            i: i,
                            j: -1,
                            found: [...duplicates],
                            highlightState: isDup ? 'match' : 'visit'
                        });
                    }

                    steps.push({
                        title: 'Indexing Complete',
                        description: `Finished direct indexing pass. Discovered duplicates: [${duplicates.join(', ')}].`,
                        arr: [...arr],
                        i: -1,
                        j: -1,
                        found: [...duplicates],
                        highlightState: 'done'
                    });

                    return steps;
                }
            }
        ]
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // PROBLEM 2: SHORTEST PATH IN A GRAPH
    // ─────────────────────────────────────────────────────────────────────────────
    const ShortestPathProblem = {
        id: 'shortest_path',
        title: 'Find the shortest path in a graph',
        shortTitle: 'Find the shortest path',
        category: 'Graph Theory & Routing',
        oneLiner: 'Explore how algorithms find efficient routes through a graph.',
        tagline: 'Given a weighted network, discover the lowest-cost path from start to destination.',
        interestingWhy: 'Uninformed exploration (BFS) wanders outward evenly, while greedy distance relaxation (Dijkstra) navigates toward minimal cumulative cost.',
        tags: ['Graphs', 'Dijkstra', 'BFS', 'Shortest Path'],

        sampleGraph: {
            nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
            edges: [
                { u: 'A', v: 'B', weight: 4 },
                { u: 'A', v: 'C', weight: 2 },
                { u: 'B', v: 'C', weight: 1 },
                { u: 'B', v: 'D', weight: 5 },
                { u: 'C', v: 'D', weight: 8 },
                { u: 'C', v: 'E', weight: 10 },
                { u: 'D', v: 'E', weight: 2 },
                { u: 'D', v: 'F', weight: 6 },
                { u: 'E', v: 'F', weight: 2 }
            ],
            start: 'A',
            target: 'F'
        },

        sizes: {
            small: { label: 'Small', count: 10, repetitions: 20, desc: '10 nodes, 22 edges — Clear path topology' },
            medium: { label: 'Medium', count: 45, repetitions: 10, desc: '45 nodes, 130 edges — Realistic routing network' },
            large: { label: 'Large', count: 150, repetitions: 4, desc: '150 nodes, 500 edges — Dense network routing' }
        },

        generateDataset(sizeKey = 'medium', seed = 77) {
            const nodeCount = this.sizes[sizeKey]?.count || 45;
            const prng = new SeededPRNG(seed);
            const nodes = [];
            for (let i = 0; i < nodeCount; i++) {
                nodes.push(`N${i}`);
            }
            const edges = [];
            // Ensure connectivity by building a spanning backbone
            for (let i = 1; i < nodeCount; i++) {
                const parent = prng.nextInt(0, i - 1);
                edges.push({
                    u: nodes[parent],
                    v: nodes[i],
                    weight: prng.nextInt(1, 15)
                });
            }
            // Add cross edges
            const extraEdges = Math.floor(nodeCount * 2.5);
            for (let k = 0; k < extraEdges; k++) {
                const u = nodes[prng.nextInt(0, nodeCount - 1)];
                const v = nodes[prng.nextInt(0, nodeCount - 1)];
                if (u !== v && !edges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u))) {
                    edges.push({ u, v, weight: prng.nextInt(1, 20) });
                }
            }
            return {
                nodes,
                edges,
                start: nodes[0],
                target: nodes[nodeCount - 1]
            };
        },

        testCases: [
            {
                name: 'Standard 6-node weighted network',
                input: {
                    nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
                    edges: [
                        { u: 'A', v: 'B', weight: 4 },
                        { u: 'A', v: 'C', weight: 2 },
                        { u: 'B', v: 'C', weight: 1 },
                        { u: 'B', v: 'D', weight: 5 },
                        { u: 'C', v: 'D', weight: 8 },
                        { u: 'C', v: 'E', weight: 10 },
                        { u: 'D', v: 'E', weight: 2 },
                        { u: 'D', v: 'F', weight: 6 },
                        { u: 'E', v: 'F', weight: 2 }
                    ],
                    start: 'A',
                    target: 'F'
                },
                expectedCost: 12,
                description: 'Shortest weighted route A→C→B→D→E→F (cost 12). Unweighted BFS finds 3-hop route A→B→D→F (cost 15).'
            },
            {
                name: 'Unweighted grid (Equal weights)',
                input: {
                    nodes: ['U1', 'U2', 'U3', 'U4'],
                    edges: [
                        { u: 'U1', v: 'U2', weight: 1 },
                        { u: 'U2', v: 'U4', weight: 1 },
                        { u: 'U1', v: 'U3', weight: 1 },
                        { u: 'U3', v: 'U4', weight: 1 }
                    ],
                    start: 'U1',
                    target: 'U4'
                },
                expectedCost: 2,
                description: 'All edge weights are 1; BFS and Dijkstra both find the optimal 2-hop route.'
            },
            {
                name: 'Direct single-edge route',
                input: {
                    nodes: ['X', 'Y'],
                    edges: [{ u: 'X', v: 'Y', weight: 7 }],
                    start: 'X',
                    target: 'Y'
                },
                expectedCost: 7,
                description: 'Direct single edge route is trivially optimal (cost 7).'
            },
            {
                name: 'Linear chain',
                input: {
                    nodes: ['1', '2', '3', '4'],
                    edges: [
                        { u: '1', v: '2', weight: 3 },
                        { u: '2', v: '3', weight: 4 },
                        { u: '3', v: '4', weight: 5 }
                    ],
                    start: '1',
                    target: '4'
                },
                expectedCost: 12,
                description: 'Single chain of nodes with cumulative cost 12.'
            },
            {
                name: 'Disconnected target',
                input: {
                    nodes: ['A', 'B', 'C', 'Isolated'],
                    edges: [
                        { u: 'A', v: 'B', weight: 2 },
                        { u: 'B', v: 'C', weight: 3 }
                    ],
                    start: 'A',
                    target: 'Isolated'
                },
                expectedCost: Infinity,
                description: 'Target is completely unreachable from start.'
            }
        ],

        normalizeResult(res) {
            if (!res) return { cost: Infinity, path: [] };
            return {
                cost: res.cost,
                path: Array.isArray(res.path) ? res.path : []
            };
        },

        approaches: [
            {
                id: 'bfs_shortest',
                name: 'Breadth-First Search (Hop Minimum)',
                shortName: 'BFS (Hop Count)',
                classification: 'Standard Baseline (Unweighted)',
                badge: 'O(V + E) Time',
                timeComplexity: 'O(V + E)',
                spaceComplexity: 'O(V) space',
                oneSentence: 'Explores radially by edge count; optimal for unweighted graphs, but ignores weights.',
                explanation: 'BFS expands node frontiers in concentric rings using a FIFO queue. While it guarantees the minimum number of edge hops, it does not account for edge weights in weighted networks.',
                strengths: 'Very simple to implement; lightning fast O(V + E) runtime.',
                tradeoffs: 'Often yields suboptimal paths in weighted networks because fewer hops can have higher cumulative weight.',
                code: `function shortestPathBFS(graph) {
    const { nodes, edges, start, target } = graph;
    const adj = {};
    for (let n of nodes) adj[n] = [];
    for (let e of edges) {
        adj[e.u].push({ node: e.v, weight: e.weight });
        adj[e.v].push({ node: e.u, weight: e.weight });
    }
    const queue = [start];
    const visited = new Set([start]);
    const prev = {};
    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr === target) break;
        for (let edge of adj[curr] || []) {
            if (!visited.has(edge.node)) {
                visited.add(edge.node);
                prev[edge.node] = { from: curr, weight: edge.weight };
                queue.push(edge.node);
            }
        }
    }
    if (!visited.has(target)) return { cost: Infinity, path: null };
    const path = [];
    let curr = target, cost = 0;
    while (curr) {
        path.unshift(curr);
        if (prev[curr]) cost += prev[curr].weight;
        curr = prev[curr]?.from;
    }
    return { cost, path };
}`,
                run(graph) {
                    const { nodes, edges, start, target } = graph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        if (adj[e.u]) adj[e.u].push({ node: e.v, weight: e.weight });
                        if (adj[e.v]) adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    const queue = [start];
                    const visited = new Set([start]);
                    const prev = {};
                    while (queue.length > 0) {
                        const curr = queue.shift();
                        if (curr === target) break;
                        for (let edge of adj[curr] || []) {
                            if (!visited.has(edge.node)) {
                                visited.add(edge.node);
                                prev[edge.node] = { from: curr, weight: edge.weight };
                                queue.push(edge.node);
                            }
                        }
                    }
                    if (!visited.has(target)) return { cost: Infinity, path: null };
                    const path = [];
                    let curr = target, cost = 0;
                    while (curr) {
                        path.unshift(curr);
                        if (prev[curr]) cost += prev[curr].weight;
                        curr = prev[curr]?.from;
                    }
                    return { cost, path };
                },
                createTrace(sampleGraph) {
                    const steps = [];
                    const { nodes, edges, start, target } = sampleGraph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        adj[e.u].push({ node: e.v, weight: e.weight });
                        adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    const queue = [start];
                    const visited = new Set([start]);
                    const prev = {};

                    steps.push({
                        title: 'BFS Frontier Initialized',
                        description: `Starting BFS at node "${start}". Queue: [${start}].`,
                        visited: [start],
                        queue: [...queue],
                        current: start,
                        activePath: [start]
                    });

                    while (queue.length > 0) {
                        const curr = queue.shift();
                        if (curr === target) {
                            steps.push({
                                title: 'Target Reached by BFS',
                                description: `Target node "${target}" reached via hop-frontier!`,
                                visited: Array.from(visited),
                                queue: [...queue],
                                current: curr,
                                activePath: [curr]
                            });
                            break;
                        }

                        for (let edge of adj[curr] || []) {
                            if (!visited.has(edge.node)) {
                                visited.add(edge.node);
                                prev[edge.node] = { from: curr, weight: edge.weight };
                                queue.push(edge.node);

                                steps.push({
                                    title: `Expanding to "${edge.node}"`,
                                    description: `Visited node "${edge.node}" from "${curr}" (edge weight ${edge.weight}).`,
                                    visited: Array.from(visited),
                                    queue: [...queue],
                                    current: edge.node,
                                    activePath: [curr, edge.node]
                                });
                            }
                        }
                    }

                    const path = [];
                    let curr = target, cost = 0;
                    while (curr) {
                        path.unshift(curr);
                        if (prev[curr]) cost += prev[curr].weight;
                        curr = prev[curr]?.from;
                    }

                    steps.push({
                        title: 'BFS Route Completed',
                        description: `Path found: ${path.join(' → ')} with total weight ${cost} (${path.length - 1} hops).`,
                        visited: Array.from(visited),
                        queue: [],
                        current: target,
                        activePath: path
                    });

                    return steps;
                }
            },
            {
                id: 'dijkstra_shortest',
                name: "Dijkstra's Priority Algorithm",
                shortName: "Dijkstra's Algorithm",
                classification: 'Greedy Optimization (Existing)',
                badge: 'O((V + E) log V) Time',
                timeComplexity: 'O((V + E) log V)',
                spaceComplexity: 'O(V) space',
                oneSentence: 'Greedily relaxes minimum distance nodes; provably optimal for non-negative weights.',
                explanation: 'Maintains a table of tentative distances from start. In each round, it selects the unvisited node with lowest cumulative distance, relaxing edges to its neighbors. Guarantees true minimum total cost.',
                strengths: 'Mathematically optimal route on all non-negative weighted networks.',
                tradeoffs: 'Requires maintaining distance states and priority relaxation.',
                code: `function dijkstra(graph) {
    const { nodes, edges, start, target } = graph;
    const adj = {};
    for (let n of nodes) adj[n] = [];
    for (let e of edges) {
        adj[e.u].push({ node: e.v, weight: e.weight });
        adj[e.v].push({ node: e.u, weight: e.weight });
    }
    const dist = {}, prev = {}, unvisited = new Set(nodes);
    for (let n of nodes) dist[n] = Infinity;
    dist[start] = 0;
    
    while (unvisited.size > 0) {
        let u = null, minDist = Infinity;
        for (let n of unvisited) {
            if (dist[n] < minDist) { minDist = dist[n]; u = n; }
        }
        if (u === null || minDist === Infinity || u === target) break;
        unvisited.delete(u);
        for (let edge of adj[u] || []) {
            if (unvisited.has(edge.node)) {
                const alt = dist[u] + edge.weight;
                if (alt < dist[edge.node]) {
                    dist[edge.node] = alt;
                    prev[edge.node] = u;
                }
            }
        }
    }
    if (dist[target] === Infinity) return { cost: Infinity, path: null };
    const path = [];
    let curr = target;
    while (curr) { path.unshift(curr); curr = prev[curr]; }
    return { cost: dist[target], path };
}`,
                run(graph) {
                    const { nodes, edges, start, target } = graph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        if (adj[e.u]) adj[e.u].push({ node: e.v, weight: e.weight });
                        if (adj[e.v]) adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    const dist = {}, prev = {}, unvisited = new Set(nodes);
                    for (let n of nodes) dist[n] = Infinity;
                    dist[start] = 0;

                    while (unvisited.size > 0) {
                        let u = null, minDist = Infinity;
                        for (let n of unvisited) {
                            if (dist[n] < minDist) { minDist = dist[n]; u = n; }
                        }
                        if (u === null || minDist === Infinity || u === target) break;
                        unvisited.delete(u);
                        for (let edge of adj[u] || []) {
                            if (unvisited.has(edge.node)) {
                                const alt = dist[u] + edge.weight;
                                if (alt < dist[edge.node]) {
                                    dist[edge.node] = alt;
                                    prev[edge.node] = u;
                                }
                            }
                        }
                    }
                    if (dist[target] === Infinity) return { cost: Infinity, path: null };
                    const path = [];
                    let curr = target;
                    while (curr) { path.unshift(curr); curr = prev[curr]; }
                    return { cost: dist[target], path };
                },
                createTrace(sampleGraph) {
                    const steps = [];
                    const { nodes, edges, start, target } = sampleGraph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        adj[e.u].push({ node: e.v, weight: e.weight });
                        adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    const dist = {}, prev = {}, unvisited = new Set(nodes);
                    for (let n of nodes) dist[n] = Infinity;
                    dist[start] = 0;

                    steps.push({
                        title: "Initialize Dijkstra's Distances",
                        description: `Start node "${start}" distance = 0. All other nodes distance = ∞.`,
                        visited: [start],
                        dist: { ...dist },
                        current: start,
                        activePath: [start]
                    });

                    while (unvisited.size > 0) {
                        let u = null, minDist = Infinity;
                        for (let n of unvisited) {
                            if (dist[n] < minDist) { minDist = dist[n]; u = n; }
                        }
                        if (u === null || minDist === Infinity) break;
                        unvisited.delete(u);

                        steps.push({
                            title: `Selected Min-Distance Node "${u}"`,
                            description: `Greedily chosen unvisited node with lowest cumulative distance: "${u}" (distance: ${dist[u]}).`,
                            visited: nodes.filter(n => !unvisited.has(n)),
                            dist: { ...dist },
                            current: u,
                            activePath: [u]
                        });

                        if (u === target) break;

                        for (let edge of adj[u] || []) {
                            if (unvisited.has(edge.node)) {
                                const alt = dist[u] + edge.weight;
                                if (alt < dist[edge.node]) {
                                    dist[edge.node] = alt;
                                    prev[edge.node] = u;
                                    steps.push({
                                        title: `Relaxed Edge to "${edge.node}"`,
                                        description: `Found shorter route to "${edge.node}": dist[${u}] (${dist[u]}) + weight (${edge.weight}) = ${alt}.`,
                                        visited: nodes.filter(n => !unvisited.has(n)),
                                        dist: { ...dist },
                                        current: edge.node,
                                        activePath: [u, edge.node]
                                    });
                                }
                            }
                        }
                    }

                    const path = [];
                    let curr = target;
                    while (curr) { path.unshift(curr); curr = prev[curr]; }

                    steps.push({
                        title: 'Optimal Path Confirmed',
                        description: `Dijkstra confirmed optimal route: ${path.join(' → ')} with lowest possible total cost = ${dist[target]}.`,
                        visited: nodes.filter(n => !unvisited.has(n)),
                        dist: { ...dist },
                        current: target,
                        activePath: path
                    });

                    return steps;
                }
            },
            {
                id: 'exhaustive_dfs',
                name: 'Exhaustive All-Paths Search',
                shortName: 'Exhaustive DFS',
                classification: 'Brute Force Exploration (Existing)',
                badge: 'O(V!) Time · Exponential',
                timeComplexity: 'O(V!)',
                spaceComplexity: 'O(V) space',
                oneSentence: 'Recursively explores every permutation of paths to find the absolute minimum.',
                explanation: 'A brute force traversal that explores every simple path in the graph, accumulating cost and pruning paths that exceed the best known minimum.',
                strengths: 'Conceptually trivial; guarantees optimal path by exhaustive evaluation.',
                tradeoffs: 'Exponential time complexity O(V!). Infeasible on graphs with more than ~15-20 vertices without aggressive pruning.',
                code: `function shortestPathExhaustive(graph) {
    const { nodes, edges, start, target } = graph;
    const adj = {};
    for (let n of nodes) adj[n] = [];
    for (let e of edges) {
        adj[e.u].push({ node: e.v, weight: e.weight });
        adj[e.v].push({ node: e.u, weight: e.weight });
    }
    let bestCost = Infinity, bestPath = null, stepsBudget = 25000;
    function dfs(curr, visited, currentCost, path) {
        if (--stepsBudget <= 0) return;
        if (currentCost >= bestCost) return;
        if (curr === target) { bestCost = currentCost; bestPath = [...path]; return; }
        for (let edge of adj[curr] || []) {
            if (!visited.has(edge.node)) {
                visited.add(edge.node);
                path.push(edge.node);
                dfs(edge.node, visited, currentCost + edge.weight, path);
                path.pop();
                visited.delete(edge.node);
            }
        }
    }
    dfs(start, new Set([start]), 0, [start]);
    return { cost: bestCost, path: bestPath };
}`,
                run(graph) {
                    const { nodes, edges, start, target } = graph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        if (adj[e.u]) adj[e.u].push({ node: e.v, weight: e.weight });
                        if (adj[e.v]) adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    let bestCost = Infinity, bestPath = null, stepsBudget = 25000;
                    function dfs(curr, visited, currentCost, path) {
                        if (--stepsBudget <= 0) return;
                        if (currentCost >= bestCost) return;
                        if (curr === target) { bestCost = currentCost; bestPath = [...path]; return; }
                        for (let edge of adj[curr] || []) {
                            if (!visited.has(edge.node)) {
                                visited.add(edge.node);
                                path.push(edge.node);
                                dfs(edge.node, visited, currentCost + edge.weight, path);
                                path.pop();
                                visited.delete(edge.node);
                            }
                        }
                    }
                    dfs(start, new Set([start]), 0, [start]);
                    return { cost: bestCost, path: bestPath };
                },
                createTrace(sampleGraph) {
                    const steps = [];
                    const { nodes, edges, start, target } = sampleGraph;
                    const adj = {};
                    for (let n of nodes) adj[n] = [];
                    for (let e of edges) {
                        adj[e.u].push({ node: e.v, weight: e.weight });
                        adj[e.v].push({ node: e.u, weight: e.weight });
                    }
                    let bestCost = Infinity, bestPath = null;

                    steps.push({
                        title: 'DFS Exhaustive Search Started',
                        description: `Exploring all paths from "${start}" to "${target}". Initial best cost = ∞.`,
                        visited: [start],
                        activePath: [start],
                        current: start
                    });

                    function dfsTrace(curr, visited, currentCost, path) {
                        if (steps.length > 25) return;
                        if (curr === target) {
                            if (currentCost < bestCost) {
                                bestCost = currentCost;
                                bestPath = [...path];
                                steps.push({
                                    title: `New Best Path Found: ${path.join(' → ')}`,
                                    description: `Target reached! Cumulative cost = ${currentCost}.`,
                                    visited: Array.from(visited),
                                    activePath: [...path],
                                    current: curr
                                });
                            }
                            return;
                        }
                        for (let edge of adj[curr] || []) {
                            if (!visited.has(edge.node)) {
                                visited.add(edge.node);
                                path.push(edge.node);
                                dfsTrace(edge.node, visited, currentCost + edge.weight, path);
                                path.pop();
                                visited.delete(edge.node);
                            }
                        }
                    }

                    dfsTrace(start, new Set([start]), 0, [start]);
                    steps.push({
                        title: 'Exhaustive Search Done',
                        description: `All viable paths checked. Best path: ${bestPath ? bestPath.join(' → ') : 'None'} (cost = ${bestCost}).`,
                        visited: nodes,
                        activePath: bestPath || [],
                        current: target
                    });

                    return steps;
                }
            }
        ]
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // PROBLEM 3: TASK SCHEDULING (INTERVAL SCHEDULING)
    // ─────────────────────────────────────────────────────────────────────────────
    const TaskSchedulingProblem = {
        id: 'schedule_tasks',
        title: 'Schedule tasks under constraints',
        shortTitle: 'Schedule tasks',
        category: 'Combinatorial Optimization',
        oneLiner: 'Compare approaches for arranging tasks under simple constraints.',
        tagline: 'Given a set of tasks with start and end times, schedule the maximum number of non-overlapping jobs.',
        interestingWhy: 'Greedy choice property proves that picking tasks with the earliest finish time is provably optimal, beating brute-force search in O(N log N) time.',
        tags: ['Greedy', 'Sorting', 'Intervals', 'Scheduling'],

        sampleTasks: [
            { id: 'T1', name: 'Code Review', start: 1, end: 4 },
            { id: 'T2', name: 'Standup Sync', start: 3, end: 5 },
            { id: 'T3', name: 'Workshop', start: 0, end: 6 },
            { id: 'T4', name: 'Sprint Demo', start: 5, end: 7 },
            { id: 'T5', name: 'Refactoring', start: 3, end: 9 },
            { id: 'T6', name: 'Design Review', start: 5, end: 9 },
            { id: 'T7', name: 'Architecture', start: 6, end: 10 },
            { id: 'T8', name: 'Deploy Wrap', start: 8, end: 11 }
        ],

        sizes: {
            small: { label: 'Small', count: 12, repetitions: 25, desc: '12 tasks — Clear visual calendar' },
            medium: { label: 'Medium', count: 60, repetitions: 12, desc: '60 tasks — Dense overlapping calendar' },
            large: { label: 'Large', count: 250, repetitions: 5, desc: '250 tasks — Heavy enterprise scheduling' }
        },

        generateDataset(sizeKey = 'medium', seed = 99) {
            const count = this.sizes[sizeKey]?.count || 60;
            const prng = new SeededPRNG(seed);
            const tasks = [];
            const maxTimeline = Math.floor(count * 2.2);
            for (let i = 0; i < count; i++) {
                const start = prng.nextInt(0, maxTimeline - 8);
                const duration = prng.nextInt(2, 12);
                tasks.push({
                    id: `T${i + 1}`,
                    name: `Job-${i + 1}`,
                    start: start,
                    end: start + duration
                });
            }
            return tasks;
        },

        testCases: [
            {
                name: 'Standard 8-task interval set',
                input: [
                    { id: 'T1', name: 'T1', start: 1, end: 4 },
                    { id: 'T2', name: 'T2', start: 3, end: 5 },
                    { id: 'T3', name: 'T3', start: 0, end: 6 },
                    { id: 'T4', name: 'T4', start: 5, end: 7 },
                    { id: 'T5', name: 'T5', start: 3, end: 9 },
                    { id: 'T6', name: 'T6', start: 5, end: 9 },
                    { id: 'T7', name: 'T7', start: 6, end: 10 },
                    { id: 'T8', name: 'T8', start: 8, end: 11 }
                ],
                expectedCount: 3,
                description: 'Optimal schedule fits 3 non-overlapping tasks (T1 [1-4], T4 [5-7], T8 [8-11]).'
            },
            {
                name: 'Heuristic counterexample (Short task blocks two longer tasks)',
                input: [
                    { id: 'T_Left', name: 'Task Left', start: 0, end: 5 },
                    { id: 'T_Short', name: 'Short Middle', start: 4, end: 7 },
                    { id: 'T_Right', name: 'Task Right', start: 6, end: 11 }
                ],
                expectedCount: 2,
                description: 'Optimal Earliest Finish accepts 2 tasks (Left + Right); Shortest Duration naively takes Short Middle and gets only 1.'
            },
            {
                name: 'All non-overlapping tasks',
                input: [
                    { id: 'A', name: 'A', start: 1, end: 3 },
                    { id: 'B', name: 'B', start: 4, end: 6 },
                    { id: 'C', name: 'C', start: 7, end: 9 }
                ],
                expectedCount: 3,
                description: 'Zero conflicts; all 3 tasks can be safely scheduled.'
            },
            {
                name: 'All overlapping tasks',
                input: [
                    { id: 'X', name: 'X', start: 2, end: 8 },
                    { id: 'Y', name: 'Y', start: 3, end: 7 },
                    { id: 'Z', name: 'Z', start: 1, end: 9 }
                ],
                expectedCount: 1,
                description: 'All tasks mutually overlap; exactly 1 can be chosen.'
            },
            {
                name: 'Empty schedule edge case',
                input: [],
                expectedCount: 0,
                description: 'Zero tasks input handling.'
            }
        ],

        normalizeResult(res) {
            if (!Array.isArray(res)) return [];
            return res.map(t => t.id || t);
        },

        approaches: [
            {
                id: 'greedy_earliest_finish',
                name: 'Greedy Earliest Finish Time (EDF)',
                shortName: 'Greedy Earliest Finish',
                classification: 'Provably Optimal Greedy (Existing)',
                badge: 'O(N log N) Time',
                timeComplexity: 'O(N log N)',
                spaceComplexity: 'O(N) space',
                oneSentence: 'Sorts by finish time and greedily accepts non-conflicting tasks.',
                explanation: 'A classic algorithm: sorting tasks by finish time (end time) frees up the resource as early as possible for future tasks. Provably maximizes the total number of scheduled tasks.',
                strengths: 'Provably optimal schedule in O(N log N) time; fast and elegant.',
                tradeoffs: 'Requires sorting the task list before interval selection.',
                code: `function scheduleEarliestFinish(tasks) {
    if (tasks.length === 0) return [];
    const sorted = [...tasks].sort((a, b) => a.end - b.end);
    const scheduled = [sorted[0]];
    let lastEnd = sorted[0].end;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start >= lastEnd) {
            scheduled.push(sorted[i]);
            lastEnd = sorted[i].end;
        }
    }
    return scheduled;
}`,
                run(tasks) {
                    if (tasks.length === 0) return [];
                    const sorted = [...tasks].sort((a, b) => a.end - b.end);
                    const scheduled = [sorted[0]];
                    let lastEnd = sorted[0].end;
                    for (let i = 1; i < sorted.length; i++) {
                        if (sorted[i].start >= lastEnd) {
                            scheduled.push(sorted[i]);
                            lastEnd = sorted[i].end;
                        }
                    }
                    return scheduled;
                },
                createTrace(sampleTasks) {
                    const steps = [];
                    const tasks = [...sampleTasks];
                    steps.push({
                        title: 'Tasks Loaded',
                        description: `Received ${tasks.length} tasks with various start and end times.`,
                        tasks: [...tasks],
                        scheduled: [],
                        rejected: [],
                        currentTask: null,
                        lastEnd: 0
                    });

                    const sorted = [...tasks].sort((a, b) => a.end - b.end);
                    steps.push({
                        title: 'Sorted by Earliest Finish Time',
                        description: `Tasks sorted by end time: ${sorted.map(t => `${t.id} (ends ${t.end})`).join(', ')}.`,
                        tasks: [...sorted],
                        scheduled: [],
                        rejected: [],
                        currentTask: null,
                        lastEnd: 0
                    });

                    const scheduled = [];
                    const rejected = [];
                    let lastEnd = -1;

                    for (let i = 0; i < sorted.length; i++) {
                        const t = sorted[i];
                        const isCompatible = t.start >= lastEnd;

                        if (isCompatible) {
                            scheduled.push(t);
                            lastEnd = t.end;
                            steps.push({
                                title: `Accepted ${t.id} (${t.name})`,
                                description: `Task ${t.id} [${t.start} → ${t.end}] scheduled (resource busy until ${lastEnd}).`,
                                tasks: [...sorted],
                                scheduled: [...scheduled],
                                rejected: [...rejected],
                                currentTask: t,
                                lastEnd: lastEnd
                            });
                        } else {
                            rejected.push(t);
                            steps.push({
                                title: `Conflict: Skipped ${t.id}`,
                                description: `Task ${t.id} [${t.start} → ${t.end}] conflicts with current schedule (busy until ${lastEnd}).`,
                                tasks: [...sorted],
                                scheduled: [...scheduled],
                                rejected: [...rejected],
                                currentTask: t,
                                lastEnd: lastEnd
                            });
                        }
                    }

                    steps.push({
                        title: 'Greedy Scheduling Complete',
                        description: `Optimal schedule: ${scheduled.length} non-conflicting tasks (${scheduled.map(t => t.id).join(', ')}).`,
                        tasks: [...sorted],
                        scheduled: [...scheduled],
                        rejected: [...rejected],
                        currentTask: null,
                        lastEnd: lastEnd
                    });

                    return steps;
                }
            },
            {
                id: 'shortest_duration_first',
                name: 'Shortest Duration First (SDF)',
                shortName: 'Shortest Duration Heuristic',
                classification: 'Heuristic Candidate (Candidate)',
                badge: 'O(N log N) Time · Heuristic',
                timeComplexity: 'O(N log N)',
                spaceComplexity: 'O(N) space',
                oneSentence: 'Greedily prioritizes tasks with the shortest duration (length).',
                explanation: 'A tempting heuristic that prioritizes short jobs so they consume minimal total time. However, a short task in the middle of two longer non-overlapping tasks can block both, yielding fewer total scheduled tasks.',
                strengths: 'Fast and intuitive for minimizing average job length.',
                tradeoffs: 'Not guaranteed to find the maximum number of scheduled tasks; can be suboptimal.',
                code: `function scheduleShortestDuration(tasks) {
    if (tasks.length === 0) return [];
    const sorted = [...tasks].sort((a, b) => (a.end - a.start) - (b.end - b.start));
    const scheduled = [];
    for (let t of sorted) {
        const conflict = scheduled.some(s => Math.max(t.start, s.start) < Math.min(t.end, s.end));
        if (!conflict) scheduled.push(t);
    }
    return scheduled.sort((a, b) => a.start - b.start);
}`,
                run(tasks) {
                    if (tasks.length === 0) return [];
                    const sorted = [...tasks].sort((a, b) => (a.end - a.start) - (b.end - b.start));
                    const scheduled = [];
                    for (let t of sorted) {
                        const conflict = scheduled.some(s => Math.max(t.start, s.start) < Math.min(t.end, s.end));
                        if (!conflict) scheduled.push(t);
                    }
                    return scheduled.sort((a, b) => a.start - b.start);
                },
                createTrace(sampleTasks) {
                    const steps = [];
                    const tasks = [...sampleTasks];
                    const sorted = [...tasks].sort((a, b) => (a.end - a.start) - (b.end - b.start));

                    steps.push({
                        title: 'Sort by Shortest Duration',
                        description: `Tasks sorted by duration: ${sorted.map(t => `${t.id} (${t.end - t.start}h)`).join(', ')}.`,
                        tasks: [...sorted],
                        scheduled: [],
                        rejected: [],
                        currentTask: null,
                        lastEnd: 0
                    });

                    const scheduled = [];
                    const rejected = [];

                    for (let t of sorted) {
                        const conflict = scheduled.find(s => Math.max(t.start, s.start) < Math.min(t.end, s.end));
                        if (!conflict) {
                            scheduled.push(t);
                            steps.push({
                                title: `Accepted Shortest ${t.id}`,
                                description: `Task ${t.id} [${t.start} → ${t.end}] does not overlap with any previously accepted tasks.`,
                                tasks: [...sorted],
                                scheduled: [...scheduled],
                                rejected: [...rejected],
                                currentTask: t,
                                lastEnd: 0
                            });
                        } else {
                            rejected.push(t);
                            steps.push({
                                title: `Conflict: Skipped ${t.id}`,
                                description: `Task ${t.id} conflicts with task ${conflict.id} [${conflict.start} → ${conflict.end}]. Skipped.`,
                                tasks: [...sorted],
                                scheduled: [...scheduled],
                                rejected: [...rejected],
                                currentTask: t,
                                lastEnd: 0
                            });
                        }
                    }

                    steps.push({
                        title: 'SDF Heuristic Complete',
                        description: `Heuristic scheduled ${scheduled.length} tasks.`,
                        tasks: [...sorted],
                        scheduled: [...scheduled],
                        rejected: [...rejected],
                        currentTask: null,
                        lastEnd: 0
                    });

                    return steps;
                }
            },
            {
                id: 'brute_force_subsets',
                name: 'Exhaustive Subset Search',
                shortName: 'Brute Force Subsets',
                classification: 'Exhaustive Baseline (Existing)',
                badge: 'O(2^N) Time · Exponential',
                timeComplexity: 'O(2^N)',
                spaceComplexity: 'O(N) space',
                oneSentence: 'Examines all 2^N subset combinations to find the largest compatible schedule.',
                explanation: 'A combinatorial brute-force approach. Evaluates every possible subset of tasks, verifies whether the subset has zero mutual conflicts, and picks the subset with the greatest task count.',
                strengths: 'Guarantees the global maximum by checking all subsets.',
                tradeoffs: 'Exponential time complexity O(2^N). Clamped to small N to prevent browser freezing.',
                code: `function scheduleBruteForce(tasks) {
    let bestSchedule = [];
    const n = Math.min(tasks.length, 12);
    const subTasks = tasks.slice(0, n);
    const totalSubsets = 1 << n;
    for (let mask = 0; mask < totalSubsets; mask++) {
        const subset = [];
        let valid = true;
        for (let i = 0; i < n; i++) {
            if ((mask & (1 << i)) !== 0) {
                const t = subTasks[i];
                for (let s of subset) {
                    if (Math.max(t.start, s.start) < Math.min(t.end, s.end)) { valid = false; break; }
                }
                if (!valid) break;
                subset.push(t);
            }
        }
        if (valid && subset.length > bestSchedule.length) bestSchedule = subset;
    }
    return bestSchedule;
}`,
                run(tasks) {
                    let bestSchedule = [];
                    const n = Math.min(tasks.length, 12);
                    const subTasks = tasks.slice(0, n);
                    const totalSubsets = 1 << n;
                    for (let mask = 0; mask < totalSubsets; mask++) {
                        const subset = [];
                        let valid = true;
                        for (let i = 0; i < n; i++) {
                            if ((mask & (1 << i)) !== 0) {
                                const t = subTasks[i];
                                for (let s of subset) {
                                    if (Math.max(t.start, s.start) < Math.min(t.end, s.end)) { valid = false; break; }
                                }
                                if (!valid) break;
                                subset.push(t);
                            }
                        }
                        if (valid && subset.length > bestSchedule.length) bestSchedule = subset;
                    }
                    return bestSchedule;
                },
                createTrace(sampleTasks) {
                    const steps = [];
                    const tasks = sampleTasks.slice(0, 6);
                    steps.push({
                        title: 'Subset Evaluation Started',
                        description: `Evaluating all 2^${tasks.length} = ${1 << tasks.length} subset permutations for mutual compatibility.`,
                        tasks: [...tasks],
                        scheduled: [],
                        rejected: [],
                        currentTask: null,
                        lastEnd: 0
                    });

                    const res = this.run(tasks);
                    steps.push({
                        title: 'Subset Search Completed',
                        description: `Evaluated subsets. Largest compatible schedule found: ${res.length} tasks (${res.map(t => t.id).join(', ')}).`,
                        tasks: [...tasks],
                        scheduled: [...res],
                        rejected: tasks.filter(t => !res.some(r => r.id === t.id)),
                        currentTask: null,
                        lastEnd: 0
                    });

                    return steps;
                }
            }
        ]
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // PROBLEM CATALOG REGISTRY
    // ─────────────────────────────────────────────────────────────────────────────
    const PROBLEMS = {
        find_duplicates: FindDuplicatesProblem,
        shortest_path: ShortestPathProblem,
        schedule_tasks: TaskSchedulingProblem
    };

    exports.AlgoForgeAlgorithms = {
        PROBLEMS,
        getProblem(id) {
            return PROBLEMS[id] || PROBLEMS.find_duplicates;
        },
        getAllProblems() {
            return Object.values(PROBLEMS);
        }
    };

})(typeof window !== 'undefined' ? window : module.exports);
