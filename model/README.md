# PDFMount Resume AI Model

This directory is dedicated to the development, training, and integration of the AI model for resume layout classification, data extraction, and content organization.

## Dataset
We are leveraging the [Kaggle Resume Dataset](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset) which contains:
- **2400+ Resumes** in both plain text (`resume_str`) and raw HTML (`resume_html`) formats.
- **25+ Job Categories** (e.g. HR, IT, Finance, Engineering, Healthcare, Sales, etc.).

## Goals
1. **Resume Parsing & Information Extraction (NER):** Extract contact details, work experience segments, educational achievements, skills, and projects dynamically from unstructured text.
2. **Layout & Category Awareness:** Predict the most suitable template style (e.g., ATS vs Recruiter layout) based on the target job category.
3. **Structured JSON Output:** Parse raw resume uploads (PDF/TXT) into the standard `ResumeData` JSON structure defined in our frontend.

## Structure
- `/scripts`: Jupyter notebooks and Python scripts for training on Kaggle.
- `/data`: Sample datasets and feature maps.
- `/exported`: Saved model checkpoints and weights (e.g., ONNX, PyTorch, or TensorFlow Lite formats).
