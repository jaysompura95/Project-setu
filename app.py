"""
SETU (सेतु) — AI for Digital Public Infrastructure & Governance
A citizen-feedback-to-policy priority platform.

Run locally:   streamlit run app.py
Deploy:        push to GitHub, connect repo on share.streamlit.io
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import time

# ---------------------------------------------------------------------------
# Page config & theme
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="SETU — Citizen to Policy AI Platform",
    page_icon="🛣️",
    layout="wide",
)

NAVY = "#0B3D91"
NAVY_DARK = "#081E42"
SAFFRON = "#E8871E"
GREEN = "#1E7A4C"
MUTE = "#5B6472"

st.markdown(
    f"""
    <style>
    .setu-header {{
        background:{NAVY_DARK}; padding:22px 28px; border-radius:10px;
        color:white; margin-bottom:22px;
    }}
    .setu-header .dev {{ font-size:26px; font-weight:700; }}
    .setu-header .en {{ font-size:12px; letter-spacing:3px; color:{SAFFRON}; font-weight:700; }}
    .setu-header .track {{ font-size:12px; color:#9FB0C8; margin-top:4px; }}
    .quote-box {{
        border-left:3px solid {SAFFRON}; padding:10px 14px; font-style:italic;
        background:{NAVY_DARK}; color:#C9D3E0; border-radius:6px; font-size:13px;
    }}
    .stage-done {{ color:{GREEN}; font-weight:700; }}
    .stage-active {{ color:{SAFFRON}; font-weight:700; }}
    .stage-pending {{ color:{MUTE}; }}
    </style>
    <div class="setu-header">
        <span class="dev">सेतु</span> &nbsp; <span class="en">SETU</span>
        <div class="track">AI for Digital Public Infrastructure &amp; Governance</div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Mock data
# ---------------------------------------------------------------------------
@st.cache_data
def load_hotspots() -> pd.DataFrame:
    data = [
        dict(name="Bengaluru North", cat="Water", reports=1240, pop=182000,
             inv_weight=1, urg="High", lang="Kannada",
             quote="No piped water for 3 weeks near Yelahanka.", stage=4),
        dict(name="Purnia, Bihar", cat="Roads", reports=980, pop=210500,
             inv_weight=1, urg="High", lang="Hindi",
             quote="सड़क के गड्ढों की वजह से कल एक बाइक सवार गिर गया।", stage=3),
        dict(name="Nagpur East", cat="Sanitation", reports=640, pop=96200,
             inv_weight=2, urg="Medium", lang="Marathi",
             quote="Garbage hasn't been collected on our street in 10 days.", stage=2),
        dict(name="Kohima", cat="Electricity", reports=410, pop=54000,
             inv_weight=2, urg="Medium", lang="English",
             quote="Power cuts every evening for the past month.", stage=2),
        dict(name="Alappuzha", cat="Healthcare", reports=265, pop=71300,
             inv_weight=4, urg="Low", lang="Malayalam",
             quote="Nearest PHC has no doctor on weekends.", stage=1),
        dict(name="Jodhpur Rural", cat="Water", reports=390, pop=88400,
             inv_weight=2, urg="Medium", lang="Hindi",
             quote="बोरवेल तीन हफ्ते से खराब है, टैंकर नहीं आया।", stage=1),
        dict(name="Coimbatore South", cat="Roads", reports=210, pop=63000,
             inv_weight=4, urg="Low", lang="Tamil",
             quote="சாலை விளக்குகள் வேலை செய்யவில்லை.", stage=5),
    ]
    df = pd.DataFrame(data)

    urg_weight = {"Low": 1, "Medium": 2, "High": 3, "Emergency": 4}
    df["urg_weight"] = df["urg"].map(urg_weight)

    # Priority Score = (Reports x Urgency x Population) / Existing Investment
    raw = (df["reports"] * df["urg_weight"] * (df["pop"] / 1000)) / df["inv_weight"]
    df["score"] = (raw / raw.max() * 96 + 3).round().astype(int)  # normalize to ~3-99
    df["score"] = df["score"].clip(upper=99)
    return df.sort_values("score", ascending=False).reset_index(drop=True)


hotspots = load_hotspots()

SECTOR_WORDS = {
    "Water": ["water", "पानी", "बोरवेल", "tanker", "पाइप"],
    "Roads": ["road", "सड़क", "गड्ढ", "pothole", "bike", "traffic"],
    "Sanitation": ["garbage", "कचरा", "drain", "sewage"],
    "Electricity": ["power", "बिजली", "electricity", "outage"],
    "Healthcare": ["hospital", "doctor", "clinic", "phc", "health"],
}
URGENCY_HINTS = ["accident", "injur", "emergency", "weeks", "months", "हफ्ते", "महीने", "गिर"]


def classify_sector(text: str) -> str:
    t = text.lower()
    for sector, words in SECTOR_WORDS.items():
        if any(w.lower() in t for w in words):
            return sector
    return "Roads"


def classify_urgency(text: str) -> str:
    t = text.lower()
    if any(h in t for h in URGENCY_HINTS):
        return "High"
    if len(text) > 40:
        return "Medium"
    return "Low"


# ---------------------------------------------------------------------------
# Tabs
# ---------------------------------------------------------------------------
tab_overview, tab_report, tab_dashboard, tab_impact = st.tabs(
    ["Overview", "Report an Issue", "Priority Dashboard", "Impact Tracker"]
)

# ---------------- Overview ----------------
with tab_overview:
    st.markdown("### A national bridge between citizen voice and infrastructure policy")
    st.caption(
        "SETU aggregates development requests from citizens across India — by voice, "
        "text and messaging apps — and turns them into ranked, explainable priorities "
        "for policymakers."
    )

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Citizen reports aggregated", f"{hotspots['reports'].sum():,}")
    c2.metric("Languages supported", "22")
    c3.metric("Demand hotspots ranked", len(hotspots))
    c4.metric("Sectors tracked", hotspots["cat"].nunique())

    st.markdown("#### How the platform is structured")
    layers = [
        ("1", "Intake", "Voice, SMS, WhatsApp & web — every Indian language, every channel."),
        ("2", "Understanding", "Bhashini/IndicTrans2 translation, sector classification, urgency scoring."),
        ("3", "Correlation", "Joined with Census, NFHS and infrastructure investment data."),
        ("4", "Policy Layer", "Ranked, explainable recommendations for national planners."),
    ]
    for n, title, desc in layers:
        col1, col2 = st.columns([0.06, 0.94])
        col1.markdown(f"**{n}**")
        col2.markdown(f"**{title}** — {desc}")

# ---------------- Report an Issue ----------------
with tab_report:
    left, right = st.columns([1, 1.2])

    with left:
        st.markdown("#### Submit a report")
        st.caption("Pick a language & channel, then describe the issue")
        lang = st.selectbox("Language", ["English", "हिन्दी", "தமிழ்", "বাংলা", "मराठी"])
        channel = st.radio("Channel", ["Text", "Voice", "WhatsApp"], horizontal=True)
        complaint = st.text_area(
            "Describe the issue",
            placeholder="e.g. सड़क में तीन महीने से बड़े गड्ढे हैं, कल एक बाइक सवार गिर गया",
            height=110,
        )
        submitted = st.button("Submit & run AI pipeline", type="primary", use_container_width=True)

    with right:
        st.markdown("#### AI pipeline trace")
        st.caption("What happens after you hit submit")
        placeholder = st.empty()

        steps = [
            "Intake received — report logged with channel, language & timestamp",
            "Speech/text normalized — Bhashini ASR + IndicTrans2 translation",
            "Sector classified — routed to the right infrastructure category",
            "Urgency scored — NLU rates severity from routine to emergency",
            "Geo-tagged & correlated — joined with demographic & investment data",
            "Ranked on dashboard — priority score computed, hotspot updated live",
        ]

        if submitted:
            text = complaint.strip() or "सड़क में तीन महीने से बड़े गड्ढे हैं, कल एक बाइक सवार गिर गया"
            sector = classify_sector(text)
            urgency = classify_urgency(text)

            with placeholder.container():
                progress_area = st.container()
                for i, step in enumerate(steps):
                    progress_area.markdown(f"✅ {step}")
                    time.sleep(0.25)

            st.success(f"**Sector:** {sector}  |  **Urgency:** {urgency}  |  **Channel:** {channel} ({lang})")
            st.info(
                f"This report has been added to the {sector} demand pool and will "
                f"affect its rank on the Priority Dashboard."
            )
        else:
            placeholder.markdown("\n".join(f"⚪ {s}" for s in steps))

# ---------------- Priority Dashboard ----------------
with tab_dashboard:
    st.markdown("#### Ranked hotspots")
    st.caption("Live-ranked demand hotspots across India, filterable by sector")

    cats = ["All"] + sorted(hotspots["cat"].unique().tolist())
    chosen_cat = st.radio("Filter by sector", cats, horizontal=True, label_visibility="collapsed")

    filtered = hotspots if chosen_cat == "All" else hotspots[hotspots["cat"] == chosen_cat]
    filtered = filtered.sort_values("score", ascending=False)

    col_list, col_chart = st.columns([1, 1])

    with col_list:
        selected_name = st.radio(
            "Hotspot",
            filtered["name"].tolist(),
            label_visibility="collapsed",
        )

    with col_chart:
        fig = px.bar(
            filtered.sort_values("score"),
            x="score", y="name", orientation="h",
            color="score", color_continuous_scale=[MUTE, SAFFRON],
            labels={"score": "Priority score", "name": ""},
            height=320,
        )
        fig.update_layout(margin=dict(l=0, r=0, t=10, b=0), coloraxis_showscale=False,
                           plot_bgcolor="white", paper_bgcolor="white")
        st.plotly_chart(fig, use_container_width=True)

    row = hotspots[hotspots["name"] == selected_name].iloc[0]
    st.markdown("---")
    st.markdown(f"##### Why this rank — {row['name']} ({row['cat']})")
    st.markdown(
        f'<div class="quote-box">"{row["quote"]}"<br>— citizen report, {row["lang"]}, machine-translated</div>',
        unsafe_allow_html=True,
    )
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Reports (90d)", f"{row['reports']:,}")
    m2.metric("Population affected", f"{row['pop']:,}")
    m3.metric("Urgency", row["urg"])
    m4.metric("Priority score", int(row["score"]))

# ---------------- Impact Tracker ----------------
with tab_impact:
    st.markdown("#### Impact tracker")
    st.caption(
        "Closes the loop the problem statement asks for — did the recommended "
        "project actually get funded and built?"
    )

    stages = ["Reported", "Recommended", "Funded", "In progress", "Resolved"]
    pick = st.selectbox("Select a hotspot", hotspots["name"].tolist())
    row = hotspots[hotspots["name"] == pick].iloc[0]

    cols = st.columns(len(stages))
    for i, (col, stage_name) in enumerate(zip(cols, stages)):
        if i < row["stage"]:
            col.markdown(f'<div class="stage-done">✅<br>{stage_name}<br>Complete</div>', unsafe_allow_html=True)
        elif i == row["stage"]:
            col.markdown(f'<div class="stage-active">🟠<br>{stage_name}<br>In motion</div>', unsafe_allow_html=True)
        else:
            col.markdown(f'<div class="stage-pending">⚪<br>{stage_name}<br>Pending</div>', unsafe_allow_html=True)

st.markdown("---")
st.caption("SETU — a proposed Digital Public Good for national infrastructure planning · prototype for demo purposes")
