import pandas as pd

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["study_consistency"] = df["study_hours_per_week"] * df["attendance_rate"]
    df["gpa_normalized"] = df["previous_gpa"] / 4.0
    return df
