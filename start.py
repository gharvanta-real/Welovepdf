import subprocess
import os
import sys
import time
import threading

def free_port(port):
    print(f"Checking port {port}...")
    if sys.platform.startswith("win"):
        try:
            # Run netstat to find PIDs on the port
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            pids = set()
            for line in output.strip().split("\n"):
                parts = line.split()
                if len(parts) >= 5:
                    local_addr = parts[1]
                    if f":{port}" in local_addr:
                        pid = parts[-1]
                        if pid.isdigit() and pid != "0":
                            pids.add(int(pid))
            
            for pid in pids:
                print(f"Killing process {pid} using port {port}...")
                subprocess.run(f"taskkill /F /PID {pid}", shell=True)
                time.sleep(0.5)
        except subprocess.CalledProcessError:
            # No process found on this port
            pass
        except Exception as e:
            print(f"Error freeing port {port} on Windows: {e}")
    else:
        # Unix/macOS fallback
        try:
            output = subprocess.check_output(f"lsof -t -i:{port}", shell=True).decode()
            pids = [line.strip() for line in output.strip().split("\n") if line.strip().isdigit()]
            for pid in pids:
                print(f"Killing process {pid} using port {port}...")
                subprocess.run(f"kill -9 {pid}", shell=True)
                time.sleep(0.5)
        except subprocess.CalledProcessError:
            pass
        except Exception as e:
            print(f"Error freeing port {port} on Unix: {e}")

def stream_output(process, name):
    try:
        for line in iter(process.stdout.readline, ''):
            sys.stdout.write(f"[{name}] {line}")
            sys.stdout.flush()
    except Exception:
        pass

def stream_error(process, name):
    try:
        for line in iter(process.stderr.readline, ''):
            sys.stderr.write(f"[{name}] [ERR] {line}")
            sys.stderr.flush()
    except Exception:
        pass

def main():
    print("=== Initializing WeLovePDF Dev Servers ===")
    
    # Free ports 8080 (backend) and 5173 (frontend)
    free_port(8080)
    free_port(5173)
    
    print("\nStarting Backend Server (Rust)...")
    # Use shell=True to handle PATH resolution on Windows
    backend_proc = subprocess.Popen(
        "cargo run",
        cwd="backend",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    print("Starting Frontend Dev Server (Vite)...")
    frontend_proc = subprocess.Popen(
        "npm run dev",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Start threads to stream stdout/stderr
    threading.Thread(target=stream_output, args=(backend_proc, "BACKEND"), daemon=True).start()
    threading.Thread(target=stream_error, args=(backend_proc, "BACKEND"), daemon=True).start()
    threading.Thread(target=stream_output, args=(frontend_proc, "FRONTEND"), daemon=True).start()
    threading.Thread(target=stream_error, args=(frontend_proc, "FRONTEND"), daemon=True).start()
    
    print("\nDev environment running!")
    print("Backend: http://127.0.0.1:8080")
    print("Frontend: http://127.0.0.1:5173")
    print("Press Ctrl+C to stop both servers.\n")
    
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("\n[BACKEND] Process exited.")
                break
            if frontend_proc.poll() is not None:
                print("\n[FRONTEND] Process exited.")
                break
    except KeyboardInterrupt:
        print("\nStopping servers...")
    finally:
        # Terminate processes
        try:
            if sys.platform.startswith("win"):
                # On Windows, subprocess Popen with shell=True creates cmd.exe which spawns the actual command.
                # We need to terminate the process tree using taskkill to ensure the actual server shuts down.
                subprocess.run(f"taskkill /F /T /PID {backend_proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(f"taskkill /F /T /PID {frontend_proc.pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                backend_proc.terminate()
                frontend_proc.terminate()
        except Exception:
            pass
        
        # Make sure ports are free
        free_port(8080)
        free_port(5173)
        print("Done.")

if __name__ == "__main__":
    main()
