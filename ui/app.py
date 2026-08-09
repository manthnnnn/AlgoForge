import sys
import os
import time
import json
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# Add parent directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dsl.ast_nodes import ProgramNode, deserialize_node
from dsl.interpreter import SandboxInterpreter
from search.genetic_engine import GeneticEngine
from memory.program_archive import ProgramArchive
from benchmarks.suite import get_benchmark_tasks

# Page configuration
st.set_page_config(
    page_title="ALGOFORGE - Program Synthesis Engine",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark modern aesthetic
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(90deg, #FF4B4B, #FF8F00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #A0AAB8;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #1E222A;
        border-radius: 10px;
        padding: 15px;
        border-left: 4px solid #FF4B4B;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">⚡ ALGOFORGE Dashboard</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Automated Program Synthesis & Evolutionary Algorithm Optimization Engine</div>', unsafe_allow_html=True)

# Initialize Session State
if "best_program" not in st.session_state:
    st.session_state.best_program = None
if "history" not in st.session_state:
    st.session_state.history = []
if "last_task" not in st.session_state:
    st.session_state.last_task = "sort_2"

# Sidebar controls
st.sidebar.header("⚙️ Evolution Parameters")

task_options = list(get_benchmark_tasks().keys())
selected_task = st.sidebar.selectbox("Select Target Benchmark", task_options, index=0)

pop_size = st.sidebar.slider("Population Size", min_value=10, max_value=100, value=40, step=5)
generations = st.sidebar.slider("Generations", min_value=5, max_value=100, value=25, step=5)
mutation_rate = st.sidebar.slider("Mutation Rate", min_value=0.05, max_value=0.8, value=0.3, step=0.05)
crossover_rate = st.sidebar.slider("Crossover Rate", min_value=0.1, max_value=1.0, value=0.7, step=0.05)
max_depth = st.sidebar.slider("Max AST Depth", min_value=3, max_value=8, value=5, step=1)
seed = st.sidebar.number_input("Random Seed (0 for random)", min_value=0, max_value=9999, value=42)

st.sidebar.markdown("---")
archive_path = st.sidebar.text_input("Archive Path", value="program_archive.json")
archive = ProgramArchive(storage_path=archive_path)

# Tabs layout
tab1, tab2, tab3 = st.tabs(["🚀 Live Synthesis Studio", "🎬 Execution Animator", "🏛️ Program Archive & Pareto Front"])

# ================= TAB 1: Live Synthesis Studio =================
with tab1:
    col_ctrl, col_stats = st.columns([1, 2])
    
    with col_ctrl:
        st.subheader("Task Details")
        all_tasks = get_benchmark_tasks()
        test_cases = all_tasks[selected_task]
        
        st.write(f"**Selected Task:** `{selected_task}`")
        st.write(f"**Test Cases Count:** {len(test_cases)}")
        
        with st.expander("View Input/Output Test Cases"):
            for idx, (inp, expected) in enumerate(test_cases):
                st.code(f"Case {idx+1}: Input {inp} ➔ Expected {expected}", language="python")
                
        start_btn = st.button("⚡ Start Evolutionary Synthesis", type="primary", use_container_width=True)

    with col_stats:
        st.subheader("Real-Time Synthesis Progress")
        chart_placeholder = st.empty()
        status_placeholder = st.empty()

    if start_btn:
        engine = GeneticEngine(
            population_size=pop_size,
            generations=generations,
            mutation_rate=mutation_rate,
            crossover_rate=crossover_rate,
            max_depth=max_depth,
            seed=seed if seed != 0 else None
        )
        
        progress_bar = st.progress(0.0)
        history_data = []

        def on_generation_step(gen, best_fit, avg_fit, best_prog):
            progress_bar.progress(gen / generations)
            history_data.append({"Generation": gen, "Best Fitness": best_fit, "Avg Fitness": avg_fit})
            
            fig = go.Figure()
            gens = [d["Generation"] for d in history_data]
            b_fits = [d["Best Fitness"] for d in history_data]
            a_fits = [d["Avg Fitness"] for d in history_data]
            
            fig.add_trace(go.Scatter(x=gens, y=b_fits, mode='lines+markers', name='Best Fitness', line=dict(color='#FF4B4B', width=3)))
            fig.add_trace(go.Scatter(x=gens, y=a_fits, mode='lines', name='Avg Fitness', line=dict(color='#00C0F2', dash='dash')))
            fig.update_layout(
                title="Fitness Optimization Across Generations",
                xaxis_title="Generation",
                yaxis_title="Fitness Score",
                template="plotly_dark",
                margin=dict(l=20, r=20, t=40, b=20),
                height=320
            )
            chart_placeholder.plotly_chart(fig, use_container_width=True)

        start_time = time.time()
        res = engine.evolve(test_cases, callback=on_generation_step)
        elapsed = time.time() - start_time
        
        progress_bar.progress(1.0)
        st.session_state.best_program = res.best_program
        st.session_state.history = res.history
        st.session_state.last_task = selected_task

        archive.add_program(
            task_name=selected_task,
            program=res.best_program,
            fitness=res.best_fitness,
            steps_taken=0,
            generation=res.total_generations,
            metadata={"time_seconds": elapsed}
        )

        status_placeholder.success(f"Synthesis Complete in {elapsed:.2f}s! Best Fitness: {res.best_fitness:.2f}")

    if st.session_state.best_program:
        st.markdown("---")
        mcol1, mcol2, mcol3, mcol4 = st.columns(4)
        mcol1.metric("Best Fitness", f"{st.session_state.history[-1]['best_fitness']:.2f}" if st.session_state.history else "N/A")
        mcol2.metric("Generations Run", f"{len(st.session_state.history)}")
        mcol3.metric("AST Depth", f"{st.session_state.best_program.get_depth()}")
        mcol4.metric("Engine Status", "Converged ✅" if st.session_state.history and st.session_state.history[-1]['best_fitness'] > 90 else "Completed ⏱️")

        st.subheader("Synthesized AST Program Node")
        code_col1, code_col2 = st.columns(2)
        with code_col1:
            st.write("**JSON AST Structure:**")
            st.json(st.session_state.best_program.to_dict())
        with code_col2:
            st.write("**Program Representation:**")
            st.code(str(st.session_state.best_program), language="python")


# ================= TAB 2: Execution Animator =================
with tab2:
    st.subheader("Step-by-Step Array Swap Animator")
    st.write("Input a custom array and watch how the synthesized AST program operates on it step-by-step.")

    if st.session_state.best_program is None:
        st.warning("Please run a synthesis task in Tab 1 first to generate a program!")
    else:
        sample_input = "[9, 2, 7, 1, 5]"
        user_input_str = st.text_input("Input Array (JSON format)", value=sample_input)
        
        try:
            input_arr = json.loads(user_input_str)
            if not isinstance(input_arr, list):
                st.error("Input must be a JSON array of integers.")
                input_arr = [9, 2, 7, 1, 5]
        except Exception:
            st.error("Invalid array JSON. Using default [9, 2, 7, 1, 5].")
            input_arr = [9, 2, 7, 1, 5]

        interpreter = SandboxInterpreter(max_steps=500)
        result = interpreter.execute(st.session_state.best_program, input_arr)
        
        st.write(f"**Execution Summary:** Steps = `{result.steps_taken}` | Timed Out = `{result.timed_out}` | Errors = `{result.error_encountered}`")
        if result.error_encountered:
            st.error(f"Execution Error: {result.error_message}")
            
        trace = result.trace
        if trace:
            step_idx = st.slider("Scrub Execution Steps", min_value=0, max_value=len(trace)-1, value=0)
            current_snapshot = trace[step_idx]

            st.info(f"**Step {current_snapshot['step']}**: {current_snapshot['action']}")

            arr_vals = current_snapshot["array"]
            x_indices = [f"Idx {i}" for i in range(len(arr_vals))]

            fig_bar = px.bar(
                x=x_indices,
                y=arr_vals,
                text=arr_vals,
                labels={"x": "Array Index", "y": "Value"},
                title=f"Array Snapshot at Step {step_idx}: {arr_vals}"
            )
            fig_bar.update_traces(marker_color='#FF4B4B', textposition='outside')
            fig_bar.update_layout(template="plotly_dark", height=380)
            st.plotly_chart(fig_bar, use_container_width=True)

            with st.expander("View Complete Execution Trace Logs"):
                for t in trace:
                    st.write(f"- **Step {t['step']}**: `{t['action']}` ➔ `{t['array']}` | env: `{t['env']}`")


# ================= TAB 3: Program Archive & Pareto Front =================
with tab3:
    st.subheader("Stored Program Archive & Pareto-Optimal Frontier")
    
    entries = archive.entries
    if not entries:
        st.info("No saved programs in archive yet. Run synthesis tasks in Tab 1 to populate the archive!")
    else:
        st.write(f"Total Programs in Archive: **{len(entries)}**")

        # Multi-objective Pareto plot
        fits = [e["fitness"] for e in entries]
        depths = [e["ast_depth"] for e in entries]
        tasks = [e["task_name"] for e in entries]
        ids = [f"ID #{e['id']}" for e in entries]

        fig_pareto = px.scatter(
            x=depths,
            y=fits,
            color=tasks,
            hover_name=ids,
            size=[12]*len(entries),
            labels={"x": "AST Depth (Lower is Better)", "y": "Fitness Score (Higher is Better)"},
            title="Multi-Objective Pareto Tradeoff (Fitness vs Depth)"
        )
        fig_pareto.update_layout(template="plotly_dark", height=400)
        st.plotly_chart(fig_pareto, use_container_width=True)

        st.subheader("Archive Data Table")
        st.dataframe(entries, use_container_width=True)

        selected_task_pareto = st.selectbox("View Pareto Front for Task", list(set(tasks)))
        if selected_task_pareto:
            pareto_items = archive.get_pareto_front(selected_task_pareto)
            st.write(f"Pareto Optimal Programs for `{selected_task_pareto}`:")
            st.json(pareto_items)
