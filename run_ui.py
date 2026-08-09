import sys
import subprocess
import os

def main():
    python_exe = sys.executable
    ui_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "ui", "app.py"))
    
    print("⚡ Launching ALGOFORGE Web UI Dashboard...")
    print(f"Executing: {python_exe} -m streamlit run {ui_script}")
    
    try:
        subprocess.run([python_exe, "-m", "streamlit", "run", ui_script])
    except KeyboardInterrupt:
        print("\nStopping ALGOFORGE Web UI.")

if __name__ == "__main__":
    main()
