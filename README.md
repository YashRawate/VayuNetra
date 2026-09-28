# 🌫️ VayuNetra — Real-Time Air Quality Intelligence Platform

<div align="center">

![VayuNetra](https://img.shields.io/badge/VayuNetra-AQI%20Intelligence%20Platform-0b5fa3?style=for-the-badge&logoColor=white)

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Serverless%20API-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![AWS](https://img.shields.io/badge/AWS-Cloud%20Native-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![WRF-Chem](https://img.shields.io/badge/WRF--Chem-Atmospheric%20Model-2E86AB?style=flat-square)](https://www2.mmm.ucar.edu/wrf/users/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Interactive%20Map-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Redis](https://img.shields.io/badge/Redis-Hot%20Cache-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)

**A serverless, cloud-native, 4-zone air quality forecasting and visualization platform powered by WRF-Chem, AWS, and real-time multi-source data ingestion.**

</div>

---

## 📌 Overview

**VayuNetra** (वायुनेत्र — *Eye of the Air*) is a production-grade, real-time Air Quality Intelligence Platform built on a **4-Zone architecture**:

| Zone | Name | Role |
|------|------|------|
| **Zone 1** | Users & Data Sources | External APIs, sensors, and end users |
| **Zone 2** | Frontend (Presentation Layer) | AQI Web Dashboard via S3 + CloudFront |
| **Zone 3** | Backend (Application Layer) | Serverless + always-on FastAPI server |
| **Zone 4** | Modelling & Data Layer ("The Brain") | WRF-Chem intelligence engine + storage |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                             │
│  ZONE 1                    ZONE 2                   ZONE 3                   ZONE 4        │
│  Users & Data Sources      Frontend                 Backend                  Modelling     │
│  ─────────────────         (Presentation Layer)     (Application Layer)      & Data Layer  │
│                                                                               "The Brain"  │
│  ┌─────────────────┐       ┌─────────────────┐      ┌──────────────────┐                  │
│  │ Open-Meteo      │       │ AQI Web Dashboard│      │ Backend Server   │  ┌────────────┐  │
│  │ WeatherAPI      │       │ S3 + CloudFront  │      │ Serverless +     │  │ WRF-Chem   │  │
│  │ WAQI (AQI)      │──HTTPS│                 │──HTTP/│ Always-On API    │  │ Intelligence│  │
│  │ CPCB (AQI)      │──────▶│ ├ Interactive   │  HTTPS│ FastAPI / Python │  │ Engine     │  │
│  │ NASA FIRMS      │       │ │  Map (Leaflet) │◀─────│                  │  │            │  │
│  │ LocationIQ      │       │ ├ Current AQI   │      │ ├ API Layer       │  │ Coupled    │  │
│  └─────────────────┘       │ │  Card          │      │ ├ Ingestion Svc  │  │ Weather +  │  │
│                            │ ├ 72-Hour       │      │ ├ Forecast Svc   │◀▶│ Chemistry  │  │
│  ┌─────────────────┐       │ │  Forecast      │      │ ├ Heatmap &      │  │ (WRF-Chem) │  │
│  │  👤 User        │──────▶│ └ Validation &  │      │ │  Emissions Svc  │  │            │  │
│  │  Real-time AQI  │       │    Plume View   │      │ ├ Validation Svc │  │ Emulator   │  │
│  │  Dashboard      │       └─────────────────┘      │ └ Cache Service  │  │ Training   │  │
│  └─────────────────┘                                └──────────────────┘  │ (Step Fns) │  │
│                                                                            │            │  │
│                                                                            │ Storage    │  │
│                                                                            │ S3 +       │  │
│                                                                            │ DynamoDB   │  │
│                                                                            └────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Zone 1 — Users & Data Sources

### External Data Sources (6 APIs)

| Source | Type | Data Provided |
|--------|------|---------------|
| **Open-Meteo** | Weather | Free meteorological forecast data |
| **WeatherAPI** | Weather | Real-time weather observations |
| **WAQI** | AQI | World Air Quality Index station data |
| **CPCB** | AQI | India Central Pollution Control Board readings |
| **NASA FIRMS** | Fire | Active fire detection and radiative power |
| **LocationIQ** | Geocoding | Location resolution and geocoding |

---

## 🖥️ Zone 2 — Frontend (Presentation Layer)

**Static Site hosted on AWS S3 + CloudFront**

### Dashboard Components

| Component | Description |
|-----------|-------------|
| **Interactive Map** | Leaflet.js with real-time AQI heatmap overlay |
| **Current AQI Card** | Live pollutant breakdown (PM2.5, PM10, NO2, O3) |
| **72-Hour Forecast** | Coupled model vs baseline vs CPCB comparison chart |
| **Validation & Plume** | RMSE improvement %, animated plume dispersion view |

### Tech

```
HTML5 / JavaScript   — Single-page dashboard
Leaflet.js           — Interactive map + heatmap overlay
Chart.js             — 72-hour time series forecast charts
Tailwind CSS         — Utility-first responsive styling
Inter (Google Fonts) — Typography
AWS S3               — Static file hosting
AWS CloudFront       — Global CDN delivery
```

---

## ⚙️ Zone 3 — Backend (Application Layer)

**Serverless + Always-On API — FastAPI / Python**

### Architecture

```
FastAPI on systemd (always-on EC2)
    │
    ├── api/* routing
    │
    ├── Ingestion Service        ← Lambda + EventBridge
    │   sensors, weather, fires, CPCB
    │
    ├── Forecast Service         → /api/predict
    │   /api/forecast/24h, /48h, /72h
    │
    ├── Heatmap & Emissions      → /api/heatmap
    │   /api/emissions, /api/fires
    │
    ├── Validation Service       → /api/validation
    │   RMSE vs baseline & CPCB
    │
    └── Cache Service
        ElastiCache Redis (hot cache, 5-min warmer)
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/predict` | Real-time AQI prediction |
| `GET` | `/api/forecast/24h` | 24-hour AQ forecast |
| `GET` | `/api/forecast/48h` | 48-hour AQ forecast |
| `GET` | `/api/forecast/72h` | 72-hour AQ forecast |
| `GET` | `/api/heatmap` | Spatial AQI heatmap data |
| `GET` | `/api/emissions` | Emission source data |
| `GET` | `/api/fires` | Active fire detections (FIRMS) |
| `GET` | `/api/validation` | RMSE vs baseline & CPCB |

---

## 🧠 Zone 4 — Modelling & Data Layer ("The Brain")

### WRF-Chem Intelligence Engine

```
Tech: WRF + WRF-Chem + Python Emulator

Coupled Weather + Chemistry:
  ├── PM2.5
  ├── PM10
  ├── O3
  ├── NO2
  ├── Wind fields
  └── PBL (Planetary Boundary Layer) height
```

### Sub-Components

| Component | Description |
|-----------|-------------|
| **WRF-Chem Engine** | Full coupled weather-chemistry simulation |
| **Coupled Weather + Chemistry** | PM2.5, PM10, O3, NO2, wind, PBL height outputs |
| **Emulator Training** | Weekly — AWS Step Functions → EC2 Spot Grid |
| **Forecast & Validation** | 24/48/72h AQI, RMSE vs baseline & CPCB |
| **Storage** | AWS S3 (NetCDF/files) + DynamoDB (metadata/results) |
| **Observability** | CloudWatch logs, metrics, alarms → auto-heal via EventBridge + Lambda |

---

## ☁️ AWS Infrastructure

| Service | Usage |
|---------|-------|
| **S3** | Static frontend hosting, NetCDF output storage, forecast archives |
| **CloudFront** | CDN delivery of frontend dashboard |
| **Lambda** | Event-driven data ingestion from 6 external APIs |
| **EventBridge** | Scheduled triggers for ingestion + auto-heal orchestration |
| **Step Functions** | Weekly WRF + WRF-Chem + emulator training workflow |
| **EC2 Spot** | WRF-Chem simulation grid (cost-optimised HPC) |
| **ElastiCache (Redis)** | Hot cache for API responses (5-min warmer) |
| **DynamoDB** | Fast key-value store for latest forecasts and metadata |
| **CloudWatch** | Logs, metrics, alarms — full observability |
| **EventBridge + Lambda** | Auto-heal: re-triggers pipeline on CloudWatch alarms |

---

## 🔄 Implementation Process

### Step 1 — Data Collection
> Lambda functions pull weather, AQI, and fire data from **6 external APIs** on a schedule via EventBridge.

```
Open-Meteo + WeatherAPI  →  Weather
WAQI + CPCB              →  AQI readings
NASA FIRMS               →  Fire/smoke data
LocationIQ               →  Geocoding
```

### Step 2 — Storage & Caching
> Raw and cleaned data stored in **S3** and **DynamoDB**. **Redis** holds latest results for low-latency API responses.

```
Lambda ingestion
    ├── Raw data    → S3 (data lake)
    ├── Cleaned     → DynamoDB (query-ready)
    └── Latest      → Redis (hot cache)
```

### Step 3 — Model Training
> Weekly: **Step Functions** orchestrate WRF + WRF-Chem + emulator training across **EC2 Spot** instances.

```
Step Functions (weekly cron)
    ├── Run WRF meteorology
    ├── Run WRF-Chem chemistry
    └── Train Python emulator on EC2 Spot grid
```

### Step 4 — Forecast & Validation
> **FastAPI** serves 24/48/72h AQI forecasts and validates **RMSE** against baseline and CPCB ground truth.

```
Forecast pipeline
    ├── 24h forecast  → /api/forecast/24h
    ├── 48h forecast  → /api/forecast/48h
    ├── 72h forecast  → /api/forecast/72h
    └── Validation    → RMSE vs baseline & CPCB
```

### Step 5 — Web Dashboard
> **Leaflet** map, AQI card, and 72-hour chart delivered via **S3 + CloudFront**.

```
S3 (static hosting)
    └── CloudFront (CDN)
            └── User browser
                    ├── Leaflet interactive map
                    ├── AQI card (live)
                    └── 72-hour forecast chart
```

### Step 6 — Observe & Auto-Heal
> **CloudWatch** alarms trigger **EventBridge + Lambda** to automatically re-trigger the pipeline on failure.

```
CloudWatch (metrics + alarms)
    └── EventBridge (alarm routing)
            └── Lambda (auto-heal)
                    └── Re-trigger ingestion / training / forecast
```

---

## 🛠️ Full Tech Stack

| Category | Technology |
|----------|-----------|
| **Atmospheric Model** | WRF, WRF-Chem |
| **Backend Language** | Python 3.11+ |
| **API Framework** | FastAPI |
| **Frontend Map** | Leaflet.js + heatmap overlay |
| **Caching** | Redis (AWS ElastiCache) |
| **Serverless Functions** | AWS Lambda |
| **Event Scheduling** | AWS EventBridge |
| **Workflow Orchestration** | AWS Step Functions |
| **Object Storage** | AWS S3 |
| **NoSQL Database** | AWS DynamoDB |
| **Compute (HPC)** | AWS EC2 Spot |
| **Monitoring** | AWS CloudWatch |
| **CDN** | AWS CloudFront |

---

## 📊 Pollutants Modeled

| Pollutant | Description | Primary Sources |
|-----------|-------------|-----------------|
| **PM2.5** | Fine particulate matter (< 2.5 µm) | Traffic, industry, stubble burning |
| **PM10** | Coarse particulate matter (< 10 µm) | Dust, construction, traffic |
| **O3** | Tropospheric ozone | Photochemical NOx–VOC reactions |
| **NO2** | Nitrogen dioxide | Vehicular and industrial combustion |
| **Wind** | Wind speed + direction fields | WRF meteorology |
| **PBL** | Planetary Boundary Layer height | WRF meteorology |

---

## 📁 Project Structure

```
VayuNetra/
│
├── Backend/
│   ├── stage4/          # Delhi NCR Spatial Transport Model
│   ├── stage5/          # Spatial Emission Inventory
│   ├── stage6/          # Satellite Biomass/Fire Emissions (VIIRS/MODIS/FIRMS)
│   ├── stage8/          # WRF-Chem Chemistry + Aerosols
│   ├── stage9/          # Two-Way Aerosol–Meteorology Feedback
│   ├── stage10/         # 24/48/72-Hour Forecasting Pipeline
│   │   ├── config/      # Pipeline configuration
│   │   ├── database/    # Forecast storage (SQLite/DynamoDB)
│   │   ├── emissions/   # Real-time emission updates
│   │   ├── forecast/    # Forecast modules (24h, 48h, 72h)
│   │   ├── ingestion/   # AQ + satellite data ingestion
│   │   ├── outputs/     # Forecast outputs
│   │   └── validation/  # RMSE metrics vs baseline & CPCB
│   └── data/            # WRF-Chem NetCDF outputs
│       ├── control/     # Control experiment output
│       ├── feedback/    # Feedback experiment output
│       ├── meteorology/ # Meteorological NetCDF (weather.nc)
│       └── wrfchem/     # WRF-Chem output NetCDF
│
├── Frontend/
│   └── index.html       # Real-time AQI dashboard (Leaflet, Chart.js)
│
└── README.md
```

---

## ⚙️ Setup & Deployment

### Local Backend Setup

```bash
git clone https://github.com/YashRawate/VayuNetra.git
cd VayuNetra

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install fastapi uvicorn numpy scipy xarray netCDF4 matplotlib \
            geopandas rasterio plotly xgboost torch pandas \
            sqlalchemy redis boto3 python-dotenv

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Local Frontend

```bash
# No build step required
python -m http.server 3000
# Open http://localhost:3000/Frontend/
```

### AWS Deployment

```bash
# 1. Deploy Frontend to S3 + CloudFront
aws s3 sync Frontend/ s3://vayunetra-dashboard/ --acl public-read
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"

# 2. Deploy Lambda ingestion functions
aws lambda update-function-code --function-name vayunetra-ingestion \
    --zip-file fileb://ingestion.zip

# 3. Upload WRF-Chem outputs to S3
aws s3 sync Backend/data/ s3://vayunetra-data/

# 4. Trigger Step Functions training workflow
aws stepfunctions start-execution \
    --state-machine-arn arn:aws:states:ap-south-1:<account>:stateMachine:vayunetra-training
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ for cleaner air — VayuNetra</sub>
</div>
