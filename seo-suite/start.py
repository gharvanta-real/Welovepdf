import os
import sys
import subprocess
import time
import webbrowser

def kill_process_on_port(port):
    print(f"Checking port {port}...")
    if os.name == 'nt': # Windows
        try:
            # Query active processes on port
            cmd = f'netstat -aon | findstr :{port}'
            out = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
            pids = set()
            for line in out.strip().split('\n'):
                line = line.strip()
                if not line:
                    continue
                parts = line.split()
                if len(parts) >= 5:
                    local_addr = parts[1]
                    if f":{port}" in local_addr:
                        pid = parts[-1]
                        pids.add(pid)
            
            for pid in pids:
                print(f"Killing process with PID {pid} on port {port}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception:
            pass
    else: # Linux / macOS
        try:
            cmd = f'lsof -t -i :{port}'
            out = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
            pids = out.split('\n')
            for pid in pids:
                if pid:
                    print(f"Killing process with PID {pid} on port {port}...")
                    subprocess.run(f"kill -9 {pid}", shell=True)
        except Exception:
            pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Clean ports
    kill_process_on_port(5173) # Frontend Port
    kill_process_on_port(3001) # Backend Port
    
    print("Waiting for ports to clear...")
    time.sleep(1)
    
    # 2. Start Backend
    backend_dir = os.path.join(root_dir, 'backend')
    print("Starting backend dev server...")
    backend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=backend_dir,
        shell=True
    )
    
    # 3. Start Frontend
    frontend_dir = os.path.join(root_dir, 'frontend')
    print("Starting frontend dev server...")
    frontend_proc = subprocess.Popen(
        ['npm', 'run', 'dev'],
        cwd=frontend_dir,
        shell=True
    )
    
    print("Waiting for dev servers to boot up...")
    time.sleep(3)
    
    # 4. Open page
    print("Opening application in browser...")
    webbrowser.open("http://localhost:5173")
    
    print("\nPress Ctrl+C to stop both dev servers.")
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend server stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend server stopped unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\nStopping dev servers...")
    finally:
        # Clean up processes tree
        if os.name == 'nt':
            subprocess.run(f"taskkill /F /T /PID {backend_proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.run(f"taskkill /F /T /PID {frontend_proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
        print("Servers stopped successfully. Done.")

if __name__ == '__main__':
    main()
