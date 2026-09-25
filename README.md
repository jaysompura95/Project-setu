# SETU — Citizen voice to policy

SETU is a Streamlit prototype for turning multilingual citizen infrastructure
reports into explainable, ranked public-infrastructure priorities.

## Run locally

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Deploy on Streamlit Community Cloud

1. Push this repository to GitHub.
2. Create a new app in Streamlit Community Cloud.
3. Select the repository and branch.
4. Set the main file to `app.py`.
5. Click **Deploy**.

The prototype does not require an API key. It includes:

- Multilingual text intake with language and channel selection
- Optional photo and voice evidence
- Explainable sector and urgency classification
- Filterable policy dashboard
- Priority score chart and ranking reasons
- CSV and PDF exports
- Evidence-only policy brief generation

The included records are illustrative. Session submissions are temporary until
production storage, verified government datasets, and approved ASR/translation
services are connected.