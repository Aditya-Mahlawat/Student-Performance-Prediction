from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../src'))
from features import add_features

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("../models/student_model.joblib")

class Student(BaseModel):
    age: int
    gender: str
    major: str
    study_hours_per_week: float
    attendance_rate: float
    previous_gpa: float
    assignments_completed: float
    parent_education: str
    income_level: str
    extracurriculars: bool
    has_tutor: bool

@app.post("/predict")
def predict(s: Student):
    df = pd.DataFrame([s.model_dump()])
    df = add_features(df)
    CAT = ["gender","major","parent_education","income_level","extracurriculars","has_tutor"]
    df[CAT] = df[CAT].astype("object")
    
    p = float(model.predict_proba(df)[0,1])
    # Grade band rules: A if p>0.9, B if p>0.7, C if p>0.5, F otherwise
    band = "A" if p>0.9 else "B" if p>0.7 else "C" if p>0.5 else "F"
    return {"pass_prob": p, "grade_band": band, "at_risk": p < 0.5}
