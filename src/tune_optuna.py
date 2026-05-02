import optuna
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
from features import add_features
from pipeline import pre

def main():
    df = pd.read_parquet("../data/students.parquet")
    cut = int(len(df)*0.8)
    tr, va = df.iloc[:cut], df.iloc[cut:]
    tr, va = add_features(tr), add_features(va)
    
    Xtr = tr.drop(columns=["passed_course","student_id"])
    ytr = tr["passed_course"]
    Xva = va.drop(columns=["passed_course","student_id"])
    yva = va["passed_course"]
    
    CAT = ["gender","major","parent_education","income_level","extracurriculars","has_tutor"]
    Xtr[CAT] = Xtr[CAT].astype("object")
    Xva[CAT] = Xva[CAT].astype("object")
    
    def objective(trial):
        params = dict(
            n_estimators=trial.suggest_int("n_estimators",50,150),
            max_depth=trial.suggest_int("max_depth",3,6),
            learning_rate=trial.suggest_float("lr",0.05,0.2,log=True),
            random_state=42, 
            n_jobs=-1
        )
        pipe = Pipeline([("pre", pre), ("xgb", XGBClassifier(**params))])
        pipe.fit(Xtr, ytr)
        p = pipe.predict(Xva)
        return accuracy_score(yva, p)
        
    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=3)
    
    best = study.best_params
    print(best)
    
    final = Pipeline([("pre", pre), ("xgb", XGBClassifier(**best, random_state=42, n_jobs=-1))]).fit(Xtr, ytr)
    
    os.makedirs("../models", exist_ok=True)
    joblib.dump(final, "../models/student_model.joblib")
    print("Model saved")

if __name__ == "__main__":
    main()
