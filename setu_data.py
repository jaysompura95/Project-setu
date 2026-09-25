"""Static prototype data and explainable scoring helpers for SETU."""

from __future__ import annotations

from typing import TypedDict


SECTORS = [
    "Water",
    "Roads",
    "Sanitation",
    "Electricity",
    "Healthcare",
    "Education",
]

LANGUAGES = [
    "Hindi",
    "Kannada",
    "Marathi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Odia",
    "Assamese",
    "English",
]

CHANNELS = ["Voice", "SMS", "WhatsApp", "Web"]
URGENCIES = ["Routine", "Elevated", "High", "Emergency"]
URGENCY_WEIGHT = {"Routine": 1, "Elevated": 2, "High": 3, "Emergency": 4}


class Hotspot(TypedDict):
    id: str
    district: str
    state: str
    sector: str
    reports90d: int
    population: int
    investmentIndex: int
    urgency: str
    sampleQuote: str
    sampleOriginal: str
    language: str
    channel: str


HOTSPOTS: list[Hotspot] = [
    {
        "id": "h1",
        "district": "Bengaluru North",
        "state": "Karnataka",
        "sector": "Water",
        "reports90d": 1240,
        "population": 182000,
        "investmentIndex": 1,
        "urgency": "High",
        "sampleQuote": "No piped water for 3 weeks near Yelahanka. Tankers come once a week.",
        "sampleOriginal": "ಯಲಹಂಕದಲ್ಲಿ ಮೂರು ವಾರಗಳಿಂದ ನೀರು ಬಂದಿಲ್ಲ.",
        "language": "Kannada",
        "channel": "Voice",
    },
    {
        "id": "h2",
        "district": "Purnia",
        "state": "Bihar",
        "sector": "Roads",
        "reports90d": 870,
        "population": 240000,
        "investmentIndex": 1,
        "urgency": "Emergency",
        "sampleQuote": "The road to the block hospital breaks every monsoon; ambulances cannot pass.",
        "sampleOriginal": "ब्लॉक अस्पताल तक की सड़क हर बरसात में टूट जाती है।",
        "language": "Hindi",
        "channel": "WhatsApp",
    },
    {
        "id": "h3",
        "district": "Murshidabad",
        "state": "West Bengal",
        "sector": "Water",
        "reports90d": 610,
        "population": 156000,
        "investmentIndex": 2,
        "urgency": "Emergency",
        "sampleQuote": "Handpump water is salty; children are falling sick every week.",
        "sampleOriginal": "হ্যান্ডপাম্পের জল নোনতা, বাচ্চারা অসুস্থ হচ্ছে।",
        "language": "Bengali",
        "channel": "Voice",
    },
    {
        "id": "h4",
        "district": "Nagpur East",
        "state": "Maharashtra",
        "sector": "Sanitation",
        "reports90d": 520,
        "population": 98000,
        "investmentIndex": 2,
        "urgency": "Elevated",
        "sampleQuote": "Open drains beside the school have not been cleared since March.",
        "sampleOriginal": "शाळेजवळील उघडी गटारे मार्चपासून साफ केलेली नाहीत.",
        "language": "Marathi",
        "channel": "SMS",
    },
    {
        "id": "h5",
        "district": "Kohima",
        "state": "Nagaland",
        "sector": "Electricity",
        "reports90d": 310,
        "population": 74000,
        "investmentIndex": 2,
        "urgency": "High",
        "sampleQuote": "Power cuts of 9 hours a day; the cold storage for our produce is failing.",
        "sampleOriginal": "Power cuts of nine hours daily in our colony.",
        "language": "English",
        "channel": "Web",
    },
    {
        "id": "h6",
        "district": "Ramanathapuram",
        "state": "Tamil Nadu",
        "sector": "Education",
        "reports90d": 240,
        "population": 61000,
        "investmentIndex": 3,
        "urgency": "Elevated",
        "sampleQuote": "Two classrooms have no roof; classes stop when it rains.",
        "sampleOriginal": "இரண்டு வகுப்பறைகளுக்கு கூரை இல்லை.",
        "language": "Tamil",
        "channel": "SMS",
    },
    {
        "id": "h7",
        "district": "Alappuzha",
        "state": "Kerala",
        "sector": "Healthcare",
        "reports90d": 180,
        "population": 52000,
        "investmentIndex": 4,
        "urgency": "Elevated",
        "sampleQuote": "Primary health centre has no night doctor; we travel 40 km after dark.",
        "sampleOriginal": "പ്രാഥമികാരോഗ്യ കേന്ദ്രത്തിൽ രാത്രി ഡോക്ടർ ഇല്ല.",
        "language": "Malayalam",
        "channel": "Voice",
    },
    {
        "id": "h8",
        "district": "Anantapur",
        "state": "Andhra Pradesh",
        "sector": "Electricity",
        "reports90d": 140,
        "population": 48000,
        "investmentIndex": 4,
        "urgency": "Routine",
        "sampleQuote": "Street lights on the highway stretch have been dead for two months.",
        "sampleOriginal": "రహదారిపై వీధి దీపాలు రెండు నెలలుగా పని చేయడం లేదు.",
        "language": "Telugu",
        "channel": "WhatsApp",
    },
]


SECTOR_KEYWORDS: dict[str, tuple[str, ...]] = {
    "Water": (
        "water",
        "tanker",
        "pipe",
        "piped",
        "borewell",
        "handpump",
        "पानी",
        "जल",
        "நீர்",
        "ನೀರು",
        "నీరు",
        "জল",
    ),
    "Roads": (
        "road",
        "pothole",
        "bridge",
        "ambulance cannot pass",
        "सड़क",
        "रस्ता",
        "ರಸ್ತೆ",
        "சாலை",
        "రహదారి",
    ),
    "Sanitation": (
        "drain",
        "garbage",
        "toilet",
        "sewage",
        "waste",
        "कचरा",
        "नाली",
        "கழிவு",
    ),
    "Electricity": (
        "power",
        "electric",
        "light",
        "transformer",
        "बिजली",
        "वीज",
        "மின்சாரம்",
        "విద్యుత్",
    ),
    "Healthcare": (
        "hospital",
        "doctor",
        "clinic",
        "medicine",
        "health centre",
        "अस्पताल",
        "डॉक्टर",
        "மருத்துவ",
        "ആരോഗ്യ",
    ),
    "Education": (
        "school",
        "teacher",
        "classroom",
        "college",
        "स्कूल",
        "शाळा",
        "பள்ளி",
        "పాఠశాల",
    ),
}


def classify(text: str) -> tuple[str, str]:
    """Return a transparent sector and urgency classification for a report."""
    normalized = " ".join(text.casefold().split())
    sector = "Water"
    for candidate, keywords in SECTOR_KEYWORDS.items():
        if any(keyword.casefold() in normalized for keyword in keywords):
            sector = candidate
            break

    emergency_terms = (
        "emergency",
        "ambulance",
        "collapse",
        "flood",
        "fire",
        "no water",
        "cannot pass",
        "मौत",
        "आपात",
    )
    high_terms = (
        "weeks",
        "months",
        "children",
        "sick",
        "broken",
        "danger",
        "days",
        "नहीं",
        "नही",
    )
    if any(term.casefold() in normalized for term in emergency_terms):
        urgency = "Emergency"
    elif any(term.casefold() in normalized for term in high_terms):
        urgency = "High"
    else:
        urgency = "Elevated"
    return sector, urgency


def raw_score(hotspot: dict) -> float:
    return (
        hotspot["reports90d"]
        * URGENCY_WEIGHT[hotspot["urgency"]]
        * hotspot["population"]
        / max(1, hotspot["investmentIndex"])
    )


def rank_hotspots(hotspots: list[dict]) -> list[dict]:
    """Score a list independently so filtered views remain explainable."""
    if not hotspots:
        return []
    maximum = max(raw_score(hotspot) for hotspot in hotspots)
    ranked = []
    for hotspot in hotspots:
        item = dict(hotspot)
        item["score"] = max(1, min(99, round(raw_score(item) / maximum * 98)))
        ranked.append(item)
    return sorted(ranked, key=lambda item: (-item["score"], item["district"]))


def investment_label(index: int) -> str:
    return {
        1: "Very low",
        2: "Low",
        3: "Moderate",
        4: "High",
        5: "Very high",
    }.get(index, "Unknown")


def ranking_reasons(hotspot: dict, all_hotspots: list[dict]) -> str:
    if not all_hotspots:
        return "No comparison set is available."
    max_reports = max(item["reports90d"] for item in all_hotspots)
    max_population = max(item["population"] for item in all_hotspots)
    reasons: list[str] = []
    if URGENCY_WEIGHT[hotspot["urgency"]] >= 3:
        reasons.append(f'{hotspot["urgency"].lower()} urgency')
    if hotspot["reports90d"] >= max_reports * 0.6:
        reasons.append("very high report volume")
    if hotspot["population"] >= max_population * 0.6:
        reasons.append("large affected population")
    if hotspot["investmentIndex"] <= 1:
        reasons.append("very low existing investment")
    elif hotspot["investmentIndex"] >= 4:
        reasons.append("high existing investment lowers priority")
    if hotspot.get("liveAdds", 0):
        reasons.append(f'{hotspot["liveAdds"]} new citizen report(s)')
    return "; ".join(reasons) or "moderate volume, urgency and population relative to peers"