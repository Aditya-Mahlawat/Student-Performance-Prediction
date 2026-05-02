# Student Performance Prediction System

> **Pass/Fail classification with grade band prediction** to help educators identify at-risk students.

## Project Structure
```
Student-Performance-Prediction/
├── data/
│   └── students.parquet   # 10,000 synthetic student records
├── notebooks/
│   └── 01_ingest.py       # Data generation
├── src/
│   ├── features.py        # Feature engineering (study_consistency, gpa_normalized)
│   ├── pipeline.py        # Preprocessing pipeline
│   └── tune_optuna.py     # Optuna HPO + XGBoost
├── models/
│   └── student_model.joblib
├── serving/
│   └── app.py             # POST /predict → pass_prob, grade_band, at_risk
├── apps/web/              # Next.js Student Success Dashboard
└── venv/
```

## Quick Start

### 1. Generate Data & Train
```powershell
cd notebooks
..\venv\Scripts\python.exe 01_ingest.py

cd ..\src
..\venv\Scripts\python.exe tune_optuna.py
```

### 2. Run Backend
```powershell
cd serving
..\venv\Scripts\python.exe -m uvicorn app:app --port 8000 --reload
```

### 3. Run Frontend
```powershell
cd apps\web
C:\Program Files\nodejs\npm.cmd run dev
```

## API Reference

### POST /predict
```json
{
  "age": 20, "gender": "F", "major": "STEM",
  "study_hours_per_week": 15.0, "attendance_rate": 0.9,
  "previous_gpa": 3.2, "assignments_completed": 30,
  "parent_education": "Bachelors", "income_level": "Medium",
  "extracurriculars": true, "has_tutor": false
}
```
**Response:**
```json
{
  "pass_prob": 0.998,
  "grade_band": "A",
  "at_risk": false
}
```

## Tech Stack
- **ML**: XGBoost + Optuna HPO
- **Backend**: FastAPI + Uvicorn
- **Frontend**: Next.js 16 + TypeScript + TailwindCSS
- **Data**: Synthetic (10,000 students)
