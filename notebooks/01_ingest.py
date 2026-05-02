import pandas as pd
import numpy as np
import os

def generate_synthetic_data(n=10000):
    np.random.seed(42)
    
    study_hours_per_week = np.random.uniform(0, 40, size=n)
    attendance_rate = np.clip(np.random.normal(0.85, 0.15, size=n), 0, 1)
    previous_gpa = np.clip(np.random.normal(2.5, 0.8, size=n), 0, 4.0)
    assignments_completed = np.random.randint(0, 50, size=n)
    
    # Pass probability logic
    logits = -3.0 + 0.1 * study_hours_per_week + 5.0 * attendance_rate + 1.0 * previous_gpa + 0.05 * assignments_completed
    
    parent_education = np.random.choice(["HighSchool", "Bachelors", "Masters", "PhD"], size=n)
    income_level = np.random.choice(["Low", "Medium", "High"], size=n)
    extracurriculars = np.random.choice([True, False], size=n)
    has_tutor = np.random.choice([True, False], size=n, p=[0.2, 0.8])
    
    logits += 0.5 * has_tutor
    logits += np.random.normal(0, 1, size=n) # noise
    
    probs = 1 / (1 + np.exp(-logits))
    passed_course = (np.random.rand(n) < probs).astype(int)
    
    df = pd.DataFrame({
        "student_id": [f"S_{i:05d}" for i in range(n)],
        "age": np.random.randint(18, 25, size=n),
        "gender": np.random.choice(["M", "F", "Other"], size=n),
        "major": np.random.choice(["STEM", "Arts", "Business", "Humanities"], size=n),
        "study_hours_per_week": study_hours_per_week,
        "attendance_rate": attendance_rate,
        "previous_gpa": previous_gpa,
        "assignments_completed": assignments_completed,
        "parent_education": parent_education,
        "income_level": income_level,
        "extracurriculars": extracurriculars,
        "has_tutor": has_tutor,
        "passed_course": passed_course
    })
    
    SCHEMA = {
        "student_id":"string","age":"int64","gender":"string","major":"string",
        "study_hours_per_week":"float64","attendance_rate":"float64",
        "previous_gpa":"float64","assignments_completed":"float64",
        "parent_education":"string","income_level":"string",
        "extracurriculars":"bool","has_tutor":"bool",
        "passed_course":"int64"
    }
    
    df = df.astype(SCHEMA)
    os.makedirs("../data", exist_ok=True)
    df.to_parquet("../data/students.parquet")
    print("Generated synthetic data.")
    print("Shape:", df.shape)
    print("Pass rate:", df.passed_course.mean())

if __name__ == "__main__":
    generate_synthetic_data()
