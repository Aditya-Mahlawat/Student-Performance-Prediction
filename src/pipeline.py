from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

NUM = ["age","study_hours_per_week","attendance_rate","previous_gpa",
       "assignments_completed","study_consistency","gpa_normalized"]
CAT = ["gender","major","parent_education","income_level","extracurriculars","has_tutor"]

num = Pipeline([("imp", SimpleImputer(strategy="median")),("sc", StandardScaler())])
cat = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                ("ohe", OneHotEncoder(handle_unknown="ignore"))])

pre = ColumnTransformer([("num", num, NUM), ("cat", cat, CAT)])
