# 🌫️ VayuNetra — Delhi NCR Air Quality Intelligence Platform

<div align="center">

![VayuNetra](https://img.shields.io/badge/VayuNetra-Air%20Quality%20Intelligence-0b5fa3?style=for-the-badge&logo=airplayvideo&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![AWS](https://img.shields.io/badge/AWS-Cloud%20Infrastructure-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![WRF-Chem](https://img.shields.io/badge/WRF--Chem-Atmospheric%20Model-2E86AB?style=flat-square)](https://www2.mmm.ucar.edu/wrf/users/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend%20API-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

**A production-grade, dual-loop atmospheric chemistry and air quality forecasting platform for the Delhi NCR region — powered by WRF-Chem, satellite data, and AWS cloud infrastructure.**

</div>

---

## 📌 Overview

**VayuNetra** (वायुनेत्र — *Eye of the Air*) is a full-stack air quality intelligence platform for Delhi NCR. It combines WRF-Chem numerical weather prediction, satellite fire/smoke data (VIIRS/MODIS/FIRMS), real-time sensor ingestion, and ML-augmented forecasting to deliver accurate 24/48/72-hour air quality forecasts.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          AWS Cloud Infrastructure                         │
│                                                                           │
│  EC2 (WRF HPC)  ──→  EC2 (FastAPI)  ──→  RDS (PostgreSQL+PostGIS)       │
│       │                    │                        │                     │
│  S3 (NetCDF)         ElastiCache (Redis)      CloudWatch                 │
│       │                    │                        │                     │
│  AWS Batch (Scheduled WRF runs)          CloudFront + S3 (Frontend)      │
│  Lambda (FIRMS satellite ingestion)                                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### Dual-Loop Model

```
FORWARD LOOP (Meteorology → Chemistry)
  Temperature → Wind → PBL Height → Radiation → Atmospheric Inversion
                            ↓
          Transport + Mixing + Chemical Reactions
                            ↓
              PM2.5 / PM10 / O3 / NO / NO2 / CO

REVERSE LOOP (Aerosol → Meteorology)
  PM2.5/PM10 → Aerosol Optical Depth → Radiation Attenuation
                            ↓
     Surface Temperature → Atmospheric Stability → PBL Height
                            ↓
         Turbulent Mixing → Pollutant Concentration
```

---

## 🧱 Project Structure

```
VayuNetra/
│
├── Backend/
│   ├── stage4/          # Delhi NCR Spatial Transport Model
│   ├── stage5/          # Spatial Emission Inventory
│   ├── stage6/          # Satellite Biomass-Burning (VIIRS/MODIS/FIRMS)
│   ├── stage8/          # WRF-Chem Chemistry + Aerosols
│   ├── stage9/          # Two-Way Aerosol–Meteorology Feedback
│   ├── stage10/         # 24/48/72-Hour Forecasting Pipeline
│   │   ├── config/      # Pipeline configuration
│   │   ├── database/    # Forecast storage
│   │   ├── emissions/   # Real-time emission updates
│   │   ├── forecast/    # Forecast modules (24h, 48h, 72h)
│   │   ├── ingestion/   # AQ + satellite data ingestion
│   │   ├── outputs/     # Forecast database
│   │   └── validation/  # Forecast metrics
│   └── data/            # WRF-Chem NetCDF outputs
│
├── Frontend/
│   └── index.html       # Real-time AQ dashboard (Leaflet, Chart.js)
│
└── README.md
```

---

## 🔬 11-Stage Pipeline

| Stage | Name | Description |
|-------|------|-------------|
| **1** | Dual-Loop Prototype | Python dual-loop meteo–chemistry model |
| **2** | Real Meteorological Data | IMD/ERA5 weather data integration |
| **3** | AQ Observations + Validation | CPCB sensor ingestion and validation |
| **4** | Delhi NCR Spatial Model | Grid-based spatial transport (NCR domain) |
| **5** | Spatial Emission Inventory | Traffic, industrial, biomass gridding |
| **6** | Satellite Fire Emissions | VIIRS/MODIS/FIRMS stubble-burning integration |
| **7** | WRF Meteorology | WRF NWP for physically consistent met fields |
| **8** | WRF-Chem | Full chemistry + aerosol simulation |
| **9** | Aerosol–Meteo Feedback | Two-way aerosol–radiation–meteorology coupling |
| **10** | 24/48/72h Forecasting | Production forecast pipeline |
| **11** | Real-Time Dashboard API | FastAPI backend + live dashboard |

---

## ☁️ AWS Infrastructure

| Service | Usage |
|---------|-------|
| **EC2 (c5n.18xlarge / HPC)** | WRF-Chem simulation (MPI-parallel) |
| **EC2 (t3.large)** | FastAPI backend server |
| **S3** | NetCDF storage, forecast archives, static hosting |
| **RDS (PostgreSQL + PostGIS)** | Spatial forecast and station data |
| **ElastiCache (Redis)** | Real-time API response caching |
| **CloudFront** | CDN for frontend dashboard |
| **CloudWatch** | Pipeline monitoring and alerting |
| **AWS Batch** | Scheduled WRF-Chem runs (every 6 hours) |
| **Lambda** | Event-driven FIRMS satellite ingestion |
| **VPC** | Private networking between compute and DB |

---

## 🛠️ Tech Stack

### Atmospheric Modeling
- **WRF-Chem** — Coupled chemistry-meteorology model
- **WPS** — WRF Pre-processing System
- **OpenMPI** — Parallel WRF execution on EC2 HPC
- **NetCDF4 / xarray** — WRF output reading

### Backend
- **Python 3.11+** — Pipeline orchestration
- **NumPy / SciPy** — Numerical computations
- **FastAPI + Uvicorn** — REST API server
- **SQLite / PostgreSQL + PostGIS** — Forecast storage
- **GeoPandas / Rasterio** — Spatial emission gridding
- **XGBoost / PyTorch** — ML forecast bias correction
- **Matplotlib / Plotly** — Scientific visualization

### Data Sources
- **CPCB / OpenAQ** — Real-time AQ station data
- **IMD / ERA5** — Meteorological observations & reanalysis
- **VIIRS / MODIS / NASA FIRMS** — Satellite fire detection
- **CAMS (Copernicus)** — Emission inventory

### Frontend
- **HTML5 / JavaScript** — Single-page dashboard
- **Tailwind CSS** — Utility-first styling
- **Leaflet.js** — Interactive Delhi NCR map
- **Chart.js** — 72-hour forecast charts
- **Inter (Google Fonts)** — Typography

---

## 📊 Pollutants Modeled

| Pollutant | Description |
|-----------|-------------|
| **PM2.5** | Fine particulate matter (< 2.5 µm) |
| **PM10** | Coarse particulate matter (< 10 µm) |
| **O3** | Ozone (photochemical) |
| **NO / NO2** | Nitrogen oxides (combustion) |
| **CO** | Carbon monoxide (incomplete combustion) |

---

## ⚙️ Setup

### Backend

```bash
git clone https://github.com/YashRawate/VayuNetra.git
cd VayuNetra
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install numpy scipy xarray netCDF4 matplotlib fastapi uvicorn \
            geopandas rasterio plotly xgboost torch pandas sqlalchemy \
            psycopg2-binary redis python-dotenv

# Run Stage 10 forecasting pipeline
cd Backend/stage10
python -m forecast.forecast_24h
python -m forecast.forecast_48h
python -m forecast.forecast_72h

# Start API server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
# No build step required — open directly
open Frontend/index.html

# Or serve locally
python -m http.server 3000
# Navigate to http://localhost:3000/Frontend/
```

### AWS Deployment

```bash
# Upload data to S3
aws s3 sync Backend/data/ s3://vayunetra-data/

# Deploy frontend
aws s3 sync Frontend/ s3://vayunetra-dashboard/ --acl public-read
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/forecast/24h` | 24-hour AQ forecast |
| `GET` | `/api/forecast/48h` | 48-hour AQ forecast |
| `GET` | `/api/forecast/72h` | 72-hour AQ forecast |
| `GET` | `/api/stations` | All monitoring stations |
| `GET` | `/api/aqi/current` | Current AQI for NCR zones |
| `GET` | `/api/alerts` | Active health advisories |
| `GET` | `/api/fires/active` | Active fire detections (FIRMS) |

---

## 🗺️ Domain

```
Region: Delhi NCR + surrounding source regions
Domain: ~200 × 200 km
Resolution: 5 km (WRF inner domain)
Vertical Levels: 40–50 sigma levels
Center: 28.6°N, 77.2°E
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ for cleaner air in Delhi NCR</sub>
</div>
