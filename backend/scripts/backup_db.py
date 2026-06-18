import os
import shutil
import sys
from datetime import datetime
from pathlib import Path

def run_backup():
    print("=== Starting PDFMount SQLite Database Backup ===")
    
    # 1. Determine paths
    # Assuming execution from project directory or backend directory
    base_dir = Path("E:/PDFMOUNT")
    db_path = base_dir / "data" / "welovepdf.db"
    
    # Fallback for production server paths (Ubuntu /opt/pdfmount/data)
    if not db_path.exists():
        db_path = Path("/opt/pdfmount/data/welovepdf.db")
        
    if not db_path.exists():
        # Fallback to current working directory lookup
        db_path = Path("./data/welovepdf.db")
        
    if not db_path.exists():
        print("Notice: No active database file found yet. Skipping backup.")
        sys.exit(0)
        
    backup_dir = db_path.parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    # 2. Perform copy
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"welovepdf_backup_{timestamp}.db"
    
    try:
        shutil.copy2(db_path, backup_file)
        print(f"Database successfully backed up to: {backup_file}")
    except Exception as e:
        print(f"Error copying database file: {e}")
        sys.exit(1)
        
    # 3. Clean up older backups (keep last 5 backups only)
    try:
        all_backups = sorted(
            [p for p in backup_dir.glob("welovepdf_backup_*.db")],
            key=os.path.getmtime
        )
        if len(all_backups) > 5:
            to_delete = all_backups[:-5]
            for p in to_delete:
                p.unlink()
                print(f"Deleted old backup: {p.name}")
    except Exception as e:
        print(f"Warning: Failed to clean up old backups: {e}")
        
    print("=== Database Backup Completed ===")

if __name__ == "__main__":
    run_backup()
