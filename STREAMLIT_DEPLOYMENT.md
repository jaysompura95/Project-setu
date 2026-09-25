# SETU Streamlit deployment

The Streamlit entrypoint is `app.py`.

## Run locally

```bash
streamlit run app.py --server.port 5000
```

## Deploy to Streamlit Community Cloud

1. Push this repository to GitHub.
2. Create a new app in Streamlit Community Cloud.
3. Select the repository and branch.
4. Set the main file path to `app.py`.
5. Deploy.

The prototype does not require an API key. It uses a transparent multilingual baseline classifier and an evidence-only brief generator. For production, replace the baseline classifier with an approved ASR/translation/NLU service and add durable storage.