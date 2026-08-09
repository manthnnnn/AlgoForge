# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Automatic Research Report Generator
#  Synthesizes structured Markdown & LaTeX publication-ready paper reports
#  directly from recorded experiment JSON artifacts without fabricated metrics.
# ══════════════════════════════════════════════════════════════════════

import time
from typing import Dict, List, Any
from memory.algorithmic_memory import AlgorithmicMemory
from search.research_metrics import ResearchMetricsEngine

class ResearchReportGenerator:
    """Generates Markdown & LaTeX paper reports from real experiment artifacts."""

    def __init__(self, db_path: str = None):
        self.memory = AlgorithmicMemory(db_path=db_path) if db_path else AlgorithmicMemory()

    def generate_markdown_report(self, problem_id: str = None) -> str:
        all_artifacts = self.memory.get_all_experiment_artifacts()
        if not all_artifacts:
            return "# ALGOFORGE Research Report\n\n> **No experimental data available.** Run controlled experiments to generate paper metrics."

        if problem_id:
            all_artifacts = [a for a in all_artifacts if a.problem_id == problem_id]

        baseline_arts = [a for a in all_artifacts if a.method == "memoryless_baseline"]
        memory_arts   = [a for a in all_artifacts if a.method == "memory_augmented"]

        base_metrics = ResearchMetricsEngine.calculate_experiment_metrics(baseline_arts)
        mem_metrics  = ResearchMetricsEngine.calculate_experiment_metrics(memory_arts)
        transfer     = ResearchMetricsEngine.calculate_paired_search_reduction(baseline_arts, memory_arts)

        strategies = self.memory.get_all_strategies()

        report = []
        report.append("# ALGOFORGE 2.0: Autonomous Algorithm Discovery & Algorithmic Knowledge Evolution")
        report.append(f"**Generated On:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())} | **Artifacts Evaluated:** {len(all_artifacts)}\n")

        report.append("## 1. Executive Summary & Research Hypothesis")
        report.append("> **Research Hypothesis:** *Can an AI system accumulate reusable algorithmic knowledge from previously discovered solutions to reduce the search cost on unseen computational problems?*\n")

        report.append("## 2. Experimental Results Summary")
        report.append("| Metric | Memoryless Baseline GP | ALGOFORGE Memory GP | Improvement / Delta |")
        report.append("|---|---|---|---|")
        report.append(f"| **Total Trials** | {base_metrics.get('total_runs', 0)} | {mem_metrics.get('total_runs', 0)} | — |")
        report.append(f"| **Discovery Success Rate** | {base_metrics.get('success_rate', 0)}% | {mem_metrics.get('success_rate', 0)}% | +{round(mem_metrics.get('success_rate', 0) - base_metrics.get('success_rate', 0), 2)}% |")
        report.append(f"| **Mean Candidate Evaluations** | {base_metrics.get('mean_evaluations_success', 0)} | {mem_metrics.get('mean_evaluations_success', 0)} | **{transfer.get('mean_search_cost_reduction_pct', 0)}% Search Reduction** |")
        report.append(f"| **Median Candidate Evaluations** | {base_metrics.get('median_evaluations_success', 0)} | {mem_metrics.get('median_evaluations_success', 0)} | — |")
        report.append(f"| **Timeout Censored Runs** | {base_metrics.get('timeout_count', 0)} | {mem_metrics.get('timeout_count', 0)} | — |")
        report.append(f"| **Mean Runtime (seconds)** | {base_metrics.get('mean_runtime_seconds', 0)}s | {mem_metrics.get('mean_runtime_seconds', 0)}s | — |\n")

        report.append("## 3. Knowledge Transfer & Failure Analysis")
        report.append(f"- **Paired Success Trials Analyzed:** {transfer.get('paired_success_runs', 0)}")
        report.append(f"- **Positive Transfer Count (>5% Search Reduction):** {transfer.get('positive_transfers', 0)}")
        report.append(f"- **Neutral Transfer Count (-5% to +5% Reduction):** {transfer.get('neutral_transfers', 0)}")
        report.append(f"- **Negative Transfer Count (<-5% Reduction):** {transfer.get('negative_transfers', 0)}")
        report.append(f"- **Accumulated Algorithmic Strategies in Memory:** {len(strategies)}\n")

        report.append("## 4. Reproducibility & Governance")
        report.append("Every trial records `seed`, `problem_id`, `candidate_evaluations`, and `verification_status`. All experiment JSON artifacts are stored in SQLite and can be replayed deterministically.\n")

        return "\n".join(report)

    def generate_latex_report(self, problem_id: str = None) -> str:
        md = self.generate_markdown_report(problem_id)
        # Wrap in LaTeX article format
        latex = []
        latex.append("\\documentclass{article}")
        latex.append("\\usepackage{booktabs}")
        latex.append("\\usepackage{geometry}")
        latex.append("\\geometry{a4paper, margin=1in}")
        latex.append("\\title{ALGOFORGE: Autonomous Algorithm Discovery \\\\ \\large Algorithmic Knowledge Transfer Paper}")
        latex.append("\\author{ALGOFORGE Research System}")
        latex.append("\\date{\\today}")
        latex.append("\\begin{document}")
        latex.append("\\maketitle")
        latex.append("\\begin{abstract}")
        latex.append("We present ALGOFORGE, an autonomous program synthesis platform that extracts structural strategies from synthesized ASTs and investigates cross-problem search cost reduction.")
        latex.append("\\end{abstract}")
        latex.append("\\section{Experimental Results}")
        latex.append("% Raw Markdown data converted for LaTeX compilation")
        latex.append("\\begin{verbatim}")
        latex.append(md)
        latex.append("\\end{verbatim}")
        latex.append("\\end{document}")
        return "\n".join(latex)
