"""
run_all_stages.py

Runs Stages 1-10 in sequence, starting from live data pulled from S3.

This is the orchestrator. Each stage is a subprocess.
Failures don't crash the pipeline — stages are best-effort.

Usage:
    python run_all_stages.py
    python run_all_stages.py --skip 7,8,9    # skip heavy WRF stages
    python run_all_stages.py --only 10       # run only Stage 10
"""

import os
import sys
import time
import json
import argparse
import logging
import subprocess
from pathlib import Path
from datetime import datetime

BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
OUTPUTS_DIR = BACKEND_DIR / "outputs"
LOGS_DIR = BACKEND_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ============================================================
# Stage definitions — exact entry script for each stage
# ============================================================

STAGES = {
    1:  {"name": "Dual-loop prototype",       "script": "stage1/main.py",              "timeout": 300},
    2:  {"name": "Meteorology processing",    "script": "stage2/main_real_data.py",    "timeout": 600},
    3:  {"name": "AQ validation",             "script": "stage3/main_stage3.py",       "timeout": 600},
    4:  {"name": "Spatial transport",         "script": "stage4/main_stage4.py",       "timeout": 900},
    5:  {"name": "Emission inventory",        "script": "stage5/main_stage5.py",       "timeout": 600},
    6:  {"name": "Satellite fires",           "script": "stage6/main_stage6.py",       "timeout": 600},
    7:  {"name": "WRF meteorology",           "script": "stage7/scripts/03_run_wrf.sh","timeout": 21600},  # 6h
    8:  {"name": "WRF-Chem",                  "script": "stage8/scripts/05_run_wrfchem.sh", "timeout": 86400},  # 24h
    9:  {"name": "Aerosol feedback",          "script": "stage9/python/main_stage9.py","timeout": 21600},
    10: {"name": "72h forecast pipeline",     "script": "stage10/main_stage10.py",     "timeout": 900},
}


# ============================================================
# Auto-detect actual entry script for each stage
# ============================================================

def find_stage_script(stage_num):
    """
    Look for the entry script in the stage folder.
    Tries multiple common naming patterns.
    Returns Path or None.
    """
    stage_dir = BACKEND_DIR / f"stage{stage_num}"
    if not stage_dir.exists():
        return None

    candidates = [
        stage_dir / "main.py",
        stage_dir / f"main_stage{stage_num}.py",
        stage_dir / f"main_stage{stage_num}.sh",
        stage_dir / "run.py",
        stage_dir / "scripts" / "03_run_wrf.sh",
        stage_dir / "scripts" / "05_run_wrfchem.sh",
        stage_dir / "python" / f"main_stage{stage_num}.py",
    ]

    # Also scan subdirectories
    for sub in ["scripts", "python"]:
        subdir = stage_dir / sub
        if subdir.exists():
            for f in subdir.iterdir():
                if f.is_file() and f.suffix in (".py", ".sh"):
                    if "main" in f.name.lower() or f.name.startswith("0"):
                        candidates.append(f)

    for c in candidates:
        if c.exists():
            return c

    return None


# ============================================================
# S3 sync (pull live data from Lambda-ingested S3)
# ============================================================

def sync_from_s3():
    """Download latest live data from S3 to data/ folder."""
    logger.info("📥 Syncing live data from S3...")

    try:
        import boto3
        import pandas as pd
    except ImportError:
        logger.warning("⚠️  boto3/pandas not installed — skipping S3 sync")
        return {"synced": [], "errors": ["boto3 not available"]}

    s3 = boto3.client("s3", region_name="us-east-1")
    synced = []
    errors = []

    # --- Weather ---
    try:
        local = DATA_DIR / "meteorology" / "weather_latest.json"
        local.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file("aqi-raw", "weather/latest.json", str(local))
        synced.append("weather")
        logger.info(f"✅ Weather downloaded ({local.stat().st_size} bytes)")
    except Exception as e:
        errors.append(f"weather: {e}")

    # --- Sensors → CSV ---
    try:
        local_json = DATA_DIR / "air_quality" / "sensors_latest.json"
        local_json.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file("aqi-raw", "sensors/latest.json", str(local_json))

        with open(local_json) as f:
            data = json.load(f)

        stations = data.get("stations", [])
        if stations:
            csv_path = DATA_DIR / "air_quality" / "delhi_air_quality.csv"
            pd.DataFrame(stations).to_csv(csv_path, index=False)
            synced.append(f"sensors ({len(stations)} stations)")
            logger.info(f"✅ Sensors downloaded ({len(stations)} stations)")

            # Also write to observations format for Stage 3/10
            obs_rows = []
            fetched_at = data.get("fetched_at", datetime.utcnow().isoformat())
            for s in stations:
                obs_rows.append({
                    "datetime": fetched_at,
                    "station": s.get("name", "unknown"),
                    "PM25": s.get("pm25"),
                    "PM10": s.get("pm10"),
                    "NO2": s.get("no2"),
                    "O3": s.get("o3"),
                    "CO": s.get("co"),
                })
            obs_path = DATA_DIR / "observations" / "air_quality.csv"
            pd.DataFrame(obs_rows).to_csv(obs_path, index=False)
            logger.info(f"✅ Observations CSV written ({len(obs_rows)} rows)")
    except Exception as e:
        errors.append(f"sensors: {e}")

    # --- Fires → CSV ---
    try:
        local_json = DATA_DIR / "satellite" / "fires_latest.json"
        local_json.parent.mkdir(parents=True, exist_ok=True)
        s3.download_file("aqi-raw", "fires/latest.json", str(local_json))

        with open(local_json) as f:
            data = json.load(f)

        fires = data.get("fires", [])
        if fires:
            csv_path = DATA_DIR / "satellite" / "fires.csv"
            pd.DataFrame(fires).to_csv(csv_path, index=False)
            synced.append(f"fires ({len(fires)} fires)")
            logger.info(f"✅ Fires downloaded ({len(fires)} fires)")
    except Exception as e:
        errors.append(f"fires: {e}")

    return {"synced": synced, "errors": errors}


# ============================================================
# Stage runner
# ============================================================

def run_stage(stage_num, skip=False, only=None):
    """Run a single stage. Returns True/False for success."""
    if only and stage_num not in only:
        return None
    if skip and stage_num in skip:
        logger.info(f"⏭️  Stage {stage_num} skipped")
        return None

    info = STAGES[stage_num]
    logger.info(f"\n{'='*60}")
    logger.info(f"▶️  Stage {stage_num}: {info['name']}")
    logger.info(f"{'='*60}")

    script = find_stage_script(stage_num)
    if script is None:
        logger.warning(f"⚠️  Stage {stage_num} script not found — skipping")
        return False

    logger.info(f"Running: {script}")

    start = time.time()

    # Handle shell scripts vs Python
    if script.suffix == ".sh":
        cmd = ["bash", str(script)]
    else:
        cmd = [sys.executable, str(script)]

    try:
        result = subprocess.run(
            cmd,
            cwd=str(script.parent),
            capture_output=True,
            text=True,
            timeout=info["timeout"],
        )

        elapsed = time.time() - start
        log_file = LOGS_DIR / f"stage{stage_num}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.log"

        with open(log_file, "w") as f:
            f.write(f"Stage {stage_num}: {info['name']}\n")
            f.write(f"Script: {script}\n")
            f.write(f"Elapsed: {elapsed:.1f}s\n")
            f.write(f"Return code: {result.returncode}\n\n")
            f.write("=== STDOUT ===\n")
            f.write(result.stdout or "(empty)")
            f.write("\n\n=== STDERR ===\n")
            f.write(result.stderr or "(empty)")

        if result.returncode == 0:
            logger.info(f"✅ Stage {stage_num} completed in {elapsed:.1f}s")
            return True
        else:
            logger.warning(f"⚠️  Stage {stage_num} returned code {result.returncode} "
                           f"({elapsed:.1f}s) — check {log_file}")
            return False

    except subprocess.TimeoutExpired:
        logger.error(f"❌ Stage {stage_num} TIMED OUT after {info['timeout']}s")
        return False
    except Exception as e:
        logger.error(f"❌ Stage {stage_num} crashed: {e}")
        return False


# ============================================================
# Upload outputs to S3
# ============================================================

def upload_outputs_to_s3():
    """Upload final outputs to aqi-forecast bucket."""
    logger.info("\n📤 Uploading outputs to S3...")

    try:
        import boto3
    except ImportError:
        return

    s3 = boto3.client("s3", region_name="us-east-1")

    uploads = [
        ("regional_forecast.csv",         "aqi-forecast",   "forecasts/regional_forecast.csv"),
        ("spatial_model_results.csv",     "aqi-forecast",   "spatial/spatial_model_results.csv"),
        ("validation_metrics.csv",        "aqi-validation", "validation/metrics.csv"),
        ("biomass_fire_emissions.csv",    "aqi-raw",        "fires/biomass_fire_emissions.csv"),
        ("spatial_emission_inventory.csv","aqi-processed",  "emissions/inventory.csv"),
        ("chemistry_summary.csv",         "aqi-wrfchem",    "chemistry/summary.csv"),
        ("feedback_summary.csv",          "aqi-wrfchem",    "feedback/summary.csv"),
        ("live_raw.json",                 "aqi-raw",        "live/latest.json"),
    ]

    for filename, bucket, key in uploads:
        local_path = OUTPUTS_DIR / filename
        if not local_path.exists():
            continue
        try:
            s3.upload_file(str(local_path), bucket, key)
            logger.info(f"✅ {filename} → s3://{bucket}/{key}")
        except Exception as e:
            logger.warning(f"⚠️  Upload failed {filename}: {e}")

    # Plots
    for png in OUTPUTS_DIR.glob("*.png"):
        try:
            s3.upload_file(str(png), "aqi-forecast", f"plots/{png.name}")
        except Exception:
            pass


# ============================================================
# Main pipeline
# ============================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip", help="Comma-separated stages to skip (e.g. 7,8,9)")
    parser.add_argument("--only", help="Comma-separated stages to run exclusively (e.g. 10)")
    parser.add_argument("--no-sync", action="store_true", help="Skip S3 sync")
    args = parser.parse_args()

    skip = set(int(x) for x in args.skip.split(",")) if args.skip else set()
    only = set(int(x) for x in args.only.split(",")) if args.only else None

    logger.info("=" * 70)
    logger.info("🚀 Vital 2.0 — Full Pipeline")
    logger.info(f"   Started: {datetime.utcnow().isoformat()}Z")
    logger.info(f"   Skip: {skip or 'none'}")
    logger.info(f"   Only: {only or 'all'}")
    logger.info("=" * 70)

    # Step 1: Sync live data from S3
    if not args.no_sync:
        sync_result = sync_from_s3()
        logger.info(f"   Synced: {sync_result['synced']}")
        if sync_result["errors"]:
            logger.warning(f"   Sync errors: {sync_result['errors']}")

    # Step 2: Run each stage
    results = {}
    total_start = time.time()

    for stage_num in sorted(STAGES.keys()):
        if stage_num == 10:
            # Save the best for last
            pass
        result = run_stage(stage_num, skip=skip, only=only)
        results[stage_num] = result

    total_elapsed = time.time() - total_start

    # Step 3: Upload
    if not args.no_sync:
        upload_outputs_to_s3()

    # Step 4: Summary
    logger.info("\n" + "=" * 70)
    logger.info("📊 PIPELINE SUMMARY")
    logger.info("=" * 70)
    for stage_num, status in sorted(results.items()):
        if status is None:
            symbol = "⏭️ "
            label = "skipped"
        elif status:
            symbol = "✅"
            label = "success"
        else:
            symbol = "⚠️ "
            label = "failed/warning"

        logger.info(f"   {symbol} Stage {stage_num:2d}  {STAGES[stage_num]['name']:30s}  {label}")

    logger.info(f"\n⏱️  Total elapsed: {total_elapsed:.1f}s ({total_elapsed/60:.1f}min)")
    logger.info("=" * 70)


if __name__ == "__main__":
    main()
