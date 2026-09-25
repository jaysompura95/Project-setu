"""SETU — a Streamlit prototype for multilingual public infrastructure planning."""

from __future__ import annotations

import io
import uuid
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import streamlit as st
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Spacer, Table, TableStyle, Paragraph

from setu_data import (
    CHANNELS,
    HOTSPOTS,
    LANGUAGES,
    SECTORS,
    URGENCIES,
    URGENCY_WEIGHT,
    classify,
    investment_label,
    rank_hotspots,
    ranking_reasons,
)


st.set_page_config(
    page_title="SETU | Citizen voice to policy",
    page_icon="सेतु",
    layout="wide",
    initial_sidebar_state="expanded",
)


def initialise_state() -> None:
    if "submissions" not in st.session_state:
        st.session_state.submissions = []
    if "last_submitted" not in st.session_state:
        st.session_state.last_submitted = None


def format_indian(value: int | float) -> str:
    return f"{int(value):,}"


def base_hotspots() -> list[dict[str, Any]]:
    return [dict(hotspot) for hotspot in HOTSPOTS]


def live_hotspots() -> list[dict[str, Any]]:
    hotspots = base_hotspots()
    submissions = st.session_state.submissions
    for hotspot in hotspots:
        additions = [
            report
            for report in submissions
            if report["district"].casefold() == hotspot["district"].casefold()
            and report["sector"] == hotspot["sector"]
        ]
        hotspot["reports90d"] += len(additions)
        hotspot["liveAdds"] = len(additions)
    return hotspots


def ranked_dataframe(hotspots: list[dict]) -> pd.DataFrame:
    ranked = rank_hotspots(hotspots)
    rows = []
    for index, hotspot in enumerate(ranked, start=1):
        rows.append(
            {
                "Rank": index,
                "District": hotspot["district"],
                "State": hotspot["state"],
                "Sector": hotspot["sector"],
                "Priority score": hotspot["score"],
                "Reports (90d)": hotspot["reports90d"],
                "Urgency": hotspot["urgency"],
                "Population affected": hotspot["population"],
                "Existing investment": investment_label(hotspot["investmentIndex"]),
                "Why this rank": ranking_reasons(hotspot, ranked),
            }
        )
    return pd.DataFrame(rows)


def create_pdf(dataframe: pd.DataFrame) -> bytes:
    buffer = io.BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=0.35 * inch,
        leftMargin=0.35 * inch,
        topMargin=0.35 * inch,
        bottomMargin=0.35 * inch,
    )
    styles = getSampleStyleSheet()
    story = [
        Paragraph("SETU — Ranked infrastructure hotspots", styles["Title"]),
        Paragraph(
            "Priority score = (reports × urgency weight × population affected) ÷ existing investment, normalised to 0–100.",
            styles["BodyText"],
        ),
        Spacer(1, 0.18 * inch),
    ]
    columns = [
        "Rank",
        "District",
        "State",
        "Sector",
        "Priority score",
        "Reports (90d)",
        "Urgency",
        "Population affected",
        "Existing investment",
        "Why this rank",
    ]
    table_data = [columns]
    for row in dataframe.to_dict("records"):
        table_data.append(
            [
                row[column]
                if column not in {"Reports (90d)", "Population affected"}
                else format_indian(row[column])
                for column in columns
            ]
        )
    table = Table(table_data, repeatRows=1, colWidths=[0.4 * inch, 1.15 * inch, 1.0 * inch, 0.85 * inch, 0.7 * inch, 0.8 * inch, 0.75 * inch, 0.95 * inch, 1.0 * inch, 3.0 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17284b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#ccd3df")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f4f6f8")]),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(table)
    document.build(story)
    return buffer.getvalue()


def render_sidebar() -> str:
    st.sidebar.title("सेतु · SETU")
    st.sidebar.caption("Citizen voice → evidence → public infrastructure priorities")
    page = st.sidebar.radio(
        "Navigate",
        ["Overview", "Report an issue", "Policy dashboard", "Method & limits"],
        label_visibility="collapsed",
    )
    st.sidebar.divider()
    st.sidebar.info(
        "Prototype data is illustrative. Connect verified census, infrastructure and investment sources before policy use."
    )
    return page


def render_overview() -> None:
    st.title("A national bridge between citizen voice and policy")
    st.caption("A multilingual Digital Public Good prototype for India")
    st.write(
        "SETU turns citizen development requests from voice, text and messaging channels into "
        "ranked, traceable infrastructure priorities. The prototype runs without the Lovable backend "
        "or any required API key."
    )

    action_col, dashboard_col = st.columns(2)
    with action_col:
        if st.button("Report an issue", type="primary", width="stretch"):
            st.session_state.page_override = "Report an issue"
            st.rerun()
    with dashboard_col:
        if st.button("Open policy dashboard", width="stretch"):
            st.session_state.page_override = "Policy dashboard"
            st.rerun()

    st.divider()
    st.subheader("The problem")
    problem_cols = st.columns(4)
    problems = [
        ("01", "Fragmented systems", "Complaints scatter across portals, helplines and paper registers."),
        ("02", "Misaligned spending", "Investment plans are disconnected from what citizens report."),
        ("03", "Language exclusion", "English-first tools exclude rural and non-literate populations."),
        ("04", "No impact loop", "There is no shared way to measure whether a funded project solved the demand."),
    ]
    for column, (number, title, body) in zip(problem_cols, problems):
        with column:
            st.metric(number, title)
            st.caption(body)

    st.divider()
    st.subheader("From a voice note to a policy line-item")
    stages = st.columns(4)
    pipeline = [
        ("01 · Intake", "Voice, SMS, WhatsApp and web in the citizen's language."),
        ("02 · Understanding", "Detect sector and urgency with transparent keyword rules."),
        ("03 · Correlation", "Join demand with population and existing investment."),
        ("04 · Policy layer", "Publish a ranked list with evidence and reasons."),
    ]
    for column, (title, body) in zip(stages, pipeline):
        with column:
            st.markdown(f"**{title}**")
            st.write(body)

    st.divider()
    st.subheader("Top priorities in the prototype")
    top = rank_hotspots(live_hotspots())[:5]
    top_df = pd.DataFrame(
        [
            {
                "District": hotspot["district"],
                "State": hotspot["state"],
                "Sector": hotspot["sector"],
                "Priority score": hotspot["score"],
                "Reports": hotspot["reports90d"],
            }
            for hotspot in top
        ]
    )
    st.dataframe(top_df, width="stretch", hide_index=True)
    st.caption(
        "Priority = report volume × urgency weight × population affected ÷ existing investment. "
        "Scores are normalised against the visible comparison set."
    )


def render_report() -> None:
    st.title("Tell SETU what your area needs")
    st.caption("Write or record a request in your language. The prototype classifies it and adds it to this session.")
    left, right = st.columns([1.35, 1])

    with left:
        with st.form("citizen_report", clear_on_submit=False):
            channel = st.selectbox("Channel", CHANNELS, index=0)
            language = st.selectbox("Language", LANGUAGES, index=0)
            district = st.text_input("District or locality", placeholder="e.g. Purnia")
            message = st.text_area(
                "Your message",
                height=150,
                placeholder="Example: हमारी कॉलोनी में दो हफ्ते से पानी नहीं आया",
            )
            audio = None
            if channel == "Voice":
                audio_input = getattr(st, "audio_input", None)
                if audio_input is not None:
                    audio = audio_input("Attach a voice recording (optional)")
                else:
                    st.caption("Voice recording is not available in this Streamlit runtime. Add the transcription below.")
            photo = st.file_uploader("Add photo evidence (optional)", type=["png", "jpg", "jpeg"])
            submitted = st.form_submit_button("Submit report", type="primary")

        if message.strip():
            sector, urgency = classify(message)
            st.info(f"Live reading · Sector: **{sector}** · Urgency: **{urgency}** · Language: **{language}**")

        if submitted:
            errors = []
            if not message.strip():
                errors.append("Add a message or transcription.")
            if not district.strip():
                errors.append("Add a district or locality.")
            if errors:
                for error in errors:
                    st.error(error)
            else:
                sector, urgency = classify(message)
                photo_bytes = photo.getvalue() if photo else None
                record = {
                    "id": str(uuid.uuid4()),
                    "text": message.strip(),
                    "language": language,
                    "channel": channel,
                    "district": district.strip(),
                    "sector": sector,
                    "urgency": urgency,
                    "photo": photo_bytes,
                    "has_audio": audio is not None,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                st.session_state.submissions.insert(0, record)
                st.session_state.last_submitted = record
                st.success("Thank you — your report is now part of this session's demand signal.")

    with right:
        st.subheader("How planners read this")
        st.write(
            "Each report is kept with its original message, channel, language and classifier output. "
            "Known hotspot counts update immediately in this session; new localities stay in the intake queue "
            "until verified demographic and infrastructure data is joined."
        )
        last = st.session_state.last_submitted
        if last:
            st.markdown("**Latest submission**")
            st.write(f'{last["district"]} · {last["sector"]} · {last["urgency"]}')
            st.caption(f'{last["channel"]} · {last["language"]}')
        st.subheader("Session submissions")
        if not st.session_state.submissions:
            st.caption("Nothing yet. Submitted reports will appear here.")
        for report in st.session_state.submissions[:5]:
            with st.container(border=True):
                st.write(f'**{report["district"]}** · {report["sector"]} · {report["urgency"]}')
                st.caption(f'{report["channel"]} · {report["language"]}')
                st.write(report["text"])
                if report.get("photo"):
                    st.image(report["photo"], width=220)


def render_dashboard() -> None:
    st.title("Policy dashboard")
    st.caption("Ranked, mapped and traceable to a citizen report")

    hotspots = live_hotspots()
    states = sorted({hotspot["state"] for hotspot in hotspots})
    filter_col_1, filter_col_2, filter_col_3 = st.columns(3)
    with filter_col_1:
        selected_sectors = st.multiselect("Sector", SECTORS, default=SECTORS)
    with filter_col_2:
        selected_states = st.multiselect("State", states, default=states)
    with filter_col_3:
        selected_urgencies = st.multiselect("Urgency", URGENCIES, default=URGENCIES)

    filtered = [
        hotspot
        for hotspot in hotspots
        if hotspot["sector"] in selected_sectors
        and hotspot["state"] in selected_states
        and hotspot["urgency"] in selected_urgencies
    ]
    ranked = rank_hotspots(filtered)
    dataframe = ranked_dataframe(filtered)

    total_reports = sum(item["reports90d"] for item in ranked)
    total_population = sum(item["population"] for item in ranked)
    metric_cols = st.columns(4)
    metric_cols[0].metric("Reports (90 days)", format_indian(total_reports))
    metric_cols[1].metric("Population covered", format_indian(total_population))
    metric_cols[2].metric("Districts flagged", len(ranked))
    metric_cols[3].metric("New session reports", len(st.session_state.submissions))

    if not ranked:
        st.warning("No hotspots match these filters.")
        return

    st.subheader("Ranked demand hotspots")
    st.dataframe(
        dataframe,
        width="stretch",
        hide_index=True,
        column_config={
            "Priority score": st.column_config.ProgressColumn("Priority score", min_value=0, max_value=100, format="%d"),
            "Reports (90d)": st.column_config.NumberColumn(format="%,d"),
            "Population affected": st.column_config.NumberColumn(format="%,d"),
        },
    )

    chart_col, detail_col = st.columns([1, 1])
    with chart_col:
        st.subheader("Score by district")
        chart_df = pd.DataFrame(
            {"Priority score": [item["score"] for item in ranked]},
            index=[item["district"] for item in ranked],
        )
        st.bar_chart(chart_df, horizontal=True)
    with detail_col:
        selected_id = st.selectbox(
            "Inspect a hotspot",
            [item["id"] for item in ranked],
            format_func=lambda item_id: next(item["district"] for item in ranked if item["id"] == item_id),
        )
        selected = next(item for item in ranked if item["id"] == selected_id)
        st.subheader(f'{selected["district"]} — {selected["sector"]}')
        st.write(f'“{selected["sampleQuote"]}”')
        st.caption(f'{selected["channel"]} report · {selected["language"]}, translated')
        st.write(
            f'**Score {selected["score"]}** = ({format_indian(selected["reports90d"])} reports × '
            f'urgency {URGENCY_WEIGHT[selected["urgency"]]} × {format_indian(selected["population"])} people) '
            f'÷ investment {selected["investmentIndex"]}, normalised 0–100.'
        )
        st.info(f'Why this rank: {ranking_reasons(selected, ranked)}.')

    st.divider()
    export_col, brief_col = st.columns([1, 1])
    with export_col:
        st.subheader("Export")
        csv_bytes = dataframe.to_csv(index=False).encode("utf-8")
        pdf_bytes = create_pdf(dataframe)
        st.download_button("Download CSV", csv_bytes, "setu-hotspots.csv", "text/csv", width="stretch")
        st.download_button("Download PDF", pdf_bytes, "setu-hotspots.pdf", "application/pdf", width="stretch")
    with brief_col:
        st.subheader("Evidence brief")
        st.caption("Generated from the visible data only; no external AI key is required.")
        selected_ids = st.multiselect(
            "Hotspots to include",
            [item["id"] for item in ranked],
            default=[item["id"] for item in ranked[:3]],
            format_func=lambda item_id: next(item["district"] for item in ranked if item["id"] == item_id),
        )
        supporting_feedback = st.text_area(
            "Supporting policymaker feedback (optional)",
            placeholder="Add a verified note or local government observation.",
            key="brief_feedback",
        )
        if st.button("Generate evidence brief", type="primary", disabled=not selected_ids):
            chosen = [item for item in ranked if item["id"] in selected_ids]
            lines = [
                "### Summary",
                f"SETU identifies {len(chosen)} priority hotspot(s) from the visible comparison set. "
                "The ranking uses citizen report volume, urgency, affected population and existing investment.",
                "",
                "### Priority projects",
            ]
            for position, item in enumerate(chosen, start=1):
                lines.append(
                    f"{position}. **{item['district']} — {item['sector']}** (score {item['score']}/100): "
                    f"{format_indian(item['reports90d'])} reports in 90 days, "
                    f"population {format_indian(item['population'])}, {item['urgency'].lower()} urgency, "
                    f"existing investment {investment_label(item['investmentIndex']).lower()}."
                )
            lines.extend(["", "### Citizen evidence"])
            for item in chosen:
                lines.append(f'- “{item["sampleQuote"]}” — {item["language"]} {item["channel"].lower()} report.')
            lines.extend(
                [
                    "",
                    "### Recommended next steps",
                    "1. Validate the hotspot with the responsible district department.",
                    "2. Join verified census, infrastructure and investment data before funding decisions.",
                    "3. Publish a completion update and ask affected citizens to confirm resolution.",
                ]
            )
            if supporting_feedback.strip():
                lines.extend(["", "### Supporting note", supporting_feedback.strip()])
            st.markdown("\n".join(lines))


def render_method() -> None:
    st.title("Method and limits")
    st.write(
        "This Streamlit build removes the hidden Lovable dependency and keeps the prototype's core promise "
        "visible: every recommendation can be traced to a report and a scoring formula."
    )
    st.subheader("Explainable priority score")
    st.code("Priority = (reports × urgency weight × population affected) ÷ existing investment")
    st.write(
        "Urgency weights are Routine = 1, Elevated = 2, High = 3 and Emergency = 4. "
        "Scores are normalised to 0–100 against the currently visible comparison set."
    )
    st.subheader("Prototype boundaries")
    st.write(
        "- The included records are illustrative, not official government data.\n"
        "- The classifier is a multilingual keyword baseline, not a production NLU model.\n"
        "- Voice recordings are accepted as evidence; production deployment should connect ASR and translation services.\n"
        "- Session submissions are intentionally temporary. Add PostgreSQL or another durable store before public launch.\n"
        "- New localities are not silently assigned census values; they remain pending data enrichment."
    )
    st.subheader("Production path")
    st.write(
        "Connect Bhashini or another approved ASR/translation provider, load verified data.gov.in and state datasets, "
        "persist submissions with a reviewed schema, and add role-based access before using the dashboard for public decisions."
    )


initialise_state()
sidebar_page = render_sidebar()
page = st.session_state.pop("page_override", None) or sidebar_page
if page == "Overview":
    render_overview()
elif page == "Report an issue":
    render_report()
elif page == "Policy dashboard":
    render_dashboard()
else:
    render_method()