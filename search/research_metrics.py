# ══════════════════════════════════════════════════════════════════════
#  ALGOFORGE 2.0 — Research Metrics Engine
#  Computes rigorous statistics, Search Cost Reduction %, censored run
#  classifications, and transfer classifications (Positive, Neutral, Negative).
# ══════════════════════════════════════════════════════════════════════

import math
from typing import List, Dict, Any
from memory.schemas import ExperimentArtifact, RunStatus

class ResearchMetricsEngine:
    """Computes research-grade metrics and statistical summaries across experiment runs."""

    @staticmethod
    def calculate_experiment_metrics(artifacts: List[ExperimentArtifact]) -> Dict[str, Any]:
        if not artifacts:
            return {
                "total_runs": 0,
                "success_rate": 0.0,
                "timeout_count": 0,
                "failed_count": 0,
                "message": "No experimental data available."
            }

        total_runs = len(artifacts)
        successes = [a for a in artifacts if a.run_status == RunStatus.SUCCESS.value]
        timeouts  = [a for a in artifacts if a.run_status == RunStatus.TIMEOUT.value]
        failures  = [a for a in artifacts if a.run_status == RunStatus.FAILED.value]

        success_rate = (len(successes) / total_runs) * 100.0 if total_runs > 0 else 0.0

        evals = [a.evaluations_to_solution for a in successes]
        mean_evals   = sum(evals) / len(evals) if evals else 0.0
        median_evals = sorted(evals)[len(evals)//2] if evals else 0.0
        std_evals    = math.sqrt(sum((x - mean_evals)**2 for x in evals) / len(evals)) if len(evals) > 1 else 0.0

        runtimes = [a.runtime_seconds for a in artifacts]
        mean_runtime = sum(runtimes) / len(runtimes) if runtimes else 0.0

        return {
            "total_runs": total_runs,
            "success_count": len(successes),
            "timeout_count": len(timeouts),
            "failed_count": len(failures),
            "success_rate": round(success_rate, 2),
            "mean_evaluations_success": round(mean_evals, 1),
            "median_evaluations_success": median_evals,
            "std_evaluations_success": round(std_evals, 1),
            "mean_runtime_seconds": round(mean_runtime, 2)
        }

    @staticmethod
    def calculate_paired_search_reduction(
        baseline_artifacts: List[ExperimentArtifact],
        memory_artifacts: List[ExperimentArtifact]
    ) -> Dict[str, Any]:

        # Map by (problem_id, seed)
        base_map = {(a.problem_id, a.seed): a for a in baseline_artifacts}
        mem_map  = {(a.problem_id, a.seed): a for a in memory_artifacts}

        common_keys = set(base_map.keys()).intersection(set(mem_map.keys()))

        paired_reductions = []
        positive_transfers = 0
        neutral_transfers  = 0
        negative_transfers = 0

        for key in common_keys:
            b_art = base_map[key]
            m_art = mem_map[key]

            if b_art.run_status == RunStatus.SUCCESS.value and m_art.run_status == RunStatus.SUCCESS.value:
                b_evals = b_art.evaluations_to_solution
                m_evals = m_art.evaluations_to_solution

                if b_evals > 0:
                    reduction = (1.0 - (m_evals / b_evals)) * 100.0
                    paired_reductions.append(reduction)

                    if reduction > 5.0:
                        positive_transfers += 1
                    elif reduction < -5.0:
                        negative_transfers += 1
                    else:
                        neutral_transfers += 1

        mean_reduction = sum(paired_reductions) / len(paired_reductions) if paired_reductions else 0.0
        median_reduction = sorted(paired_reductions)[len(paired_reductions)//2] if paired_reductions else 0.0

        return {
            "paired_success_runs": len(paired_reductions),
            "mean_search_cost_reduction_pct": round(mean_reduction, 2),
            "median_search_cost_reduction_pct": round(median_reduction, 2),
            "positive_transfers": positive_transfers,
            "neutral_transfers": neutral_transfers,
            "negative_transfers": negative_transfers
        }
