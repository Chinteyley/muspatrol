#!/usr/bin/env python3
"""Generate Khmer copy from code points so the source stays ASCII-safe."""

from pathlib import Path


def k(*cps: int) -> str:
    return "".join(chr(c) for c in cps)


# Independent vowels / punctuation used below
KHAN = 0x17D4
COLON = 0x17D6
SPACE = 0x0020
SLASH = 0x002F
DIGIT3 = 0x17E3

COPY = {
    "labels": {
        "bucket": {
            "en": "plastic bucket / basin",
            "km": k(0x1792, 0x17BB, 0x1784, SPACE, SLASH, SPACE, 0x17A2, 0x17B6, 0x1784),
        },
        "saucer": {
            "en": "flower-pot saucer",
            "km": k(
                0x1785, 0x17B6, 0x1793, SPACE,
                0x1780, 0x17D2, 0x179A, 0x17C4, 0x1798, SPACE,
                0x1795, 0x17BE, 0x1784,
            ),
        },
        "tire": {
            "en": "old tire",
            "km": k(
                0x179F, 0x17C6, 0x1794, 0x1780,
                0x1780, 0x1784, 0x17CB, SPACE,
                0x1785, 0x17B6, 0x179F, 0x17CB,
            ),
        },
        "discard": {
            "en": "shell / cup / bottle",
            "km": k(
                0x179F, 0x17C6, 0x1794, 0x1780, 0x178A, 0x17BC, 0x1784, SPACE, SLASH, SPACE,
                0x1796, 0x17C2, 0x1784, SPACE, SLASH, SPACE,
                0x178A, 0x1794,
            ),
        },
        "jar": {
            "en": "water jar / barrel",
            "km": k(
                0x1796, 0x17B6, 0x1784, SPACE, SLASH, SPACE,
                0x1792, 0x17BB, 0x1784, 0x1792, 0x17C6,
            ),
        },
        "ant_trap": {
            "en": "ant-trap bowl",
            "km": k(
                0x1785, 0x17B6, 0x1793, SPACE,
                0x1780, 0x17B6, 0x179A, 0x1796, 0x17B6, 0x179A, SPACE,
                0x179F, 0x17D2, 0x179A, 0x1798, 0x17C4, 0x1785,
            ),
        },
        "shrine": {
            "en": "spirit-house water",
            "km": k(
                0x1791, 0x17B9, 0x1780, SPACE,
                0x1793, 0x17C5, SPACE,
                0x1795, 0x17D2, 0x1791, 0x17C7, 0x1791, 0x17C1, 0x1796,
            ),
        },
        "pet_bowl": {
            "en": "pet water bowl",
            "km": k(
                0x1785, 0x17B6, 0x1793, 0x1791, 0x17B9, 0x1780, SPACE,
                0x179F, 0x178F, 0x17D2, 0x179C,
            ),
        },
        "gutter": {
            "en": "gutter / tarp puddle",
            "km": k(
                0x1791, 0x17B9, 0x1780, SPACE,
                0x1793, 0x17C5, SPACE,
                0x179A, 0x1793, 0x17B6, 0x17C6, 0x1784, SPACE, SLASH, SPACE,
                0x1794, 0x17B6, 0x178F,
            ),
        },
        "drain": {
            "en": "roadside drain",
            "km": k(0x179B, 0x17BC, SPACE, 0x1795, 0x17D2, 0x179B, 0x17BC, 0x179C),
        },
        "grass": {
            "en": "dry ground / grass",
            "km": k(
                0x179F, 0x17D2, 0x1798, 0x17C5, SPACE, SLASH, SPACE,
                0x178A, 0x17B8, SPACE,
                0x179F, 0x17D2, 0x1784, 0x17BD, 0x178F,
            ),
        },
    },
    "actions": {
        "TIP": {"en": "TIP", "km": k(0x1785, 0x17B6, 0x1780, 0x17CB)},
        "SCRUB": {"en": "SCRUB", "km": k(0x1780, 0x1780, 0x17B7, 0x178F)},
        "COVER": {"en": "COVER", "km": k(0x1782, 0x17D2, 0x179A, 0x1794)},
        "TOSS": {"en": "TOSS", "km": k(0x1794, 0x17C4, 0x17C7)},
        "CHANGE": {"en": "CHANGE", "km": k(0x1794, 0x17D2, 0x178A, 0x17BC, 0x179A)},
        "REPORT": {
            "en": "REPORT",
            "km": k(
                0x179A, 0x17B6, 0x1799,
                0x1780, 0x17B6, 0x179A, 0x178E, 0x17CD,
            ),
        },
        "NONE": {"en": "LOOK", "km": k(0x1798, 0x17BE, 0x179B)},
    },
    "orders": {
        "bucket_wet": {
            "en": "Eggs stick to the walls. Tip it, scrub, store upside-down.",
            "km": k(
                0x1796, 0x1784, SPACE,
                0x1787, 0x17B6, 0x1794, 0x17CB, SPACE,
                0x1787, 0x1789, 0x17D2, 0x1787, 0x17B6, 0x17C6, 0x1784, KHAN, SPACE,
                0x1785, 0x17B6, 0x1780, 0x17CB, 0x1785, 0x17C4, 0x179B, SPACE,
                0x1780, 0x1780, 0x17B7, 0x178F, SPACE,
                0x17A0, 0x17BE, 0x1799, SPACE,
                0x178A, 0x17B6, 0x1780, 0x17CB, 0x1795, 0x17D2, 0x1780, 0x17B6, 0x1794, 0x17CB, KHAN,
            ),
        },
        "bucket_dry": {
            "en": "Scrub the dry film, then store it upside-down.",
            "km": k(
                0x1780, 0x1780, 0x17B7, 0x178F, SPACE,
                0x1792, 0x17BB, 0x1784, SPACE,
                0x179F, 0x17D2, 0x1784, 0x17BD, 0x178F, SPACE,
                0x17A0, 0x17BE, 0x1799, SPACE,
                0x178A, 0x17B6, 0x1780, 0x17CB, 0x1795, 0x17D2, 0x1780, 0x17B6, 0x1794, 0x17CB, KHAN,
            ),
        },
        "saucer_wet": {
            "en": "Empty it, or fill the saucer with sand.",
            "km": k(
                0x1785, 0x17B6, 0x1780, 0x17CB, 0x1791, 0x17B9, 0x1780, 0x1785, 0x17C4, 0x179B, SPACE,
                0x17AC, SPACE,
                0x178A, 0x17B6, 0x1780, 0x17CB, 0x1781, 0x17D2, 0x179F, 0x17B6, 0x1785, 0x17CB, SPACE,
                0x1780, 0x17D2, 0x1793, 0x17BC, 0x1784, 0x1785, 0x17B6, 0x1793, KHAN,
            ),
        },
        "saucer_dry": {
            "en": "Nice — keep it dry, or fill it with sand.",
            "km": k(
                0x179B, 0x17D2, 0x17A2, KHAN, SPACE,
                0x179A, 0x1780, 0x17D2, 0x179F, 0x17B6, 0x17B1, 0x1799, 0x17CB, SPACE,
                0x179F, 0x17D2, 0x1784, 0x17BD, 0x178F, SPACE,
                0x17AC, SPACE,
                0x178A, 0x17B6, 0x1780, 0x17CB, 0x1781, 0x17D2, 0x179F, 0x17B6, 0x1785, 0x17CB, KHAN,
            ),
        },
        "tire": {
            "en": "Tires are mosquito hotels. Recycle it, or drill drain holes.",
            "km": k(
                0x179F, 0x17C6, 0x1794, 0x1780, 0x1780, 0x1784, 0x17CB, SPACE,
                0x1787, 0x17B6, SPACE,
                0x1795, 0x17D2, 0x1791, 0x17C7, 0x1798, 0x17BC, 0x179F, KHAN, SPACE,
                0x1794, 0x17C4, 0x17C7, 0x1785, 0x17C4, 0x179B, SPACE,
                0x17AC, SPACE,
                0x1781, 0x17BD, 0x1784, 0x179A, 0x1793, 0x17D2, 0x1792, 0x179B, 0x17BC, KHAN,
            ),
        },
        "discard": {
            "en": "Bin it. Shells, cups and bottles are one-rain nurseries.",
            "km": k(
                0x1794, 0x17C4, 0x17C7, 0x1785, 0x17C4, 0x179B, KHAN, SPACE,
                0x179F, 0x17C6, 0x1794, 0x1780, 0x178A, 0x17BC, 0x1784, SPACE,
                0x1796, 0x17C2, 0x1784, SPACE,
                0x1793, 0x17B7, 0x1784, SPACE,
                0x178A, 0x1794, SPACE,
                0x1787, 0x17B6, 0x1780, 0x1793, 0x17D2, 0x179B, 0x17C2, 0x1784, 0x1796, 0x1784, 0x1798, 0x17BC, 0x179F, KHAN,
            ),
        },
        "jar_wet": {
            "en": "Lid or mosquito net. Scrub the rim once a week.",
            "km": k(
                0x1782, 0x17D2, 0x179A, 0x1794, 0x1782, 0x1798, 0x17D2, 0x179A, 0x1794, SPACE,
                0x17AC, SPACE,
                0x1798, 0x17BB, 0x17C6, KHAN, SPACE,
                0x1780, 0x1780, 0x17B7, 0x178F, SPACE,
                0x1798, 0x17B6, 0x178F, 0x17CB, 0x1796, 0x17B6, 0x1784, SPACE,
                0x179A, 0x17C0, 0x1784, 0x179A, 0x17B6, 0x179B, 0x17CB, SPACE,
                0x179F, 0x1794, 0x17D2, 0x178A, 0x17B6, 0x17A0, 0x17CD, KHAN,
            ),
        },
        "jar_dry": {
            "en": "Keep a lid on it even when it's low.",
            "km": k(
                0x1782, 0x17D2, 0x179A, 0x1794, 0x1782, 0x1798, 0x17D2, 0x179A, 0x1794, 0x1791, 0x17BB, 0x1780, SPACE,
                0x1791, 0x17C4, 0x17C7, 0x1791, 0x17B9, 0x1780, 0x178F, 0x17B7, 0x1785, SPACE,
                0x1780, 0x17CF, 0x178A, 0x17C4, 0x1799, KHAN,
            ),
        },
        "ant_trap": {
            "en": "Change this water every 3 days — classic kitchen detail.",
            "km": k(
                0x1794, 0x17D2, 0x178A, 0x17BC, 0x179A, 0x1791, 0x17B9, 0x1780, SPACE,
                0x179A, 0x17C0, 0x1784, 0x179A, 0x17B6, 0x179B, 0x17CB, SPACE,
                DIGIT3, SPACE,
                0x1790, 0x17D2, 0x1784, 0x17C3, KHAN,
            ),
        },
        "shrine": {
            "en": "Be respectful: change the water, don't toss the offerings.",
            "km": k(
                0x179F, 0x17BC, 0x1798, SPACE,
                0x1782, 0x17C4, 0x179A, 0x1797, COLON, SPACE,
                0x1794, 0x17D2, 0x178A, 0x17BC, 0x179A, 0x1791, 0x17B9, 0x1780, SPACE,
                0x1780, 0x17BB, 0x17C6, 0x1785, 0x17C4, 0x179B, SPACE,
                0x178F, 0x1784, 0x17D2, 0x179C, 0x17B6, 0x1799, KHAN,
            ),
        },
        "pet_bowl": {
            "en": "Change the water daily. Your dog will not mind.",
            "km": k(
                0x1794, 0x17D2, 0x178A, 0x17BC, 0x179A, 0x1791, 0x17B9, 0x1780, SPACE,
                0x179A, 0x17B6, 0x179B, 0x17CB, 0x1790, 0x17D2, 0x1784, 0x17C3, KHAN,
            ),
        },
        "gutter": {
            "en": "Clear the puddle. Gutters and tarps love a slow leak.",
            "km": k(
                0x179F, 0x1798, 0x17D2, 0x17A2, 0x17B6, 0x178F, SPACE,
                0x1791, 0x17B9, 0x1780, 0x1787, 0x17B6, 0x17C6, KHAN,
            ),
        },
        "drain": {
            "en": "Public water. Tell the sangkat if it sits. Low priority for Aedes.",
            "km": k(
                0x1791, 0x17B9, 0x1780, SPACE,
                0x179F, 0x17B6, 0x1792, 0x17B6, 0x179A, 0x178E, 0x17C8, KHAN, SPACE,
                0x1794, 0x17D2, 0x179A, 0x17B6, 0x1794, 0x17CB, SPACE,
                0x179F, 0x1784, 0x17D2, 0x1780, 0x17B6, 0x178F, 0x17CB, SPACE,
                0x1794, 0x17BE, SPACE, 0x179C, SPACE,
                0x1787, 0x17B6, 0x17C6, 0x1799, 0x17BC, 0x179A, KHAN,
            ),
        },
        "grass": {
            "en": "Nice. Touch that grass.",
            "km": k(
                0x179B, 0x17D2, 0x17A2, KHAN, SPACE,
                0x1794, 0x17C9, 0x17C7, SPACE,
                0x179F, 0x17D2, 0x1798, 0x17C5, SPACE,
                0x1791, 0x17C5, KHAN,
            ),
        },
    },
    "ui": {
        "appName": {"en": "MusPatrol", "km": k(0x1798, 0x17BC, 0x179F, SPACE) + "Patrol"},
        "tagline": {
            "en": "10 minutes after the rain. Flip the pots. Pocket the phone.",
            "km": k(
                0x17E1, 0x17E0, SPACE,
                0x1793, 0x17B6, 0x1791, 0x17B8, SPACE,
                0x1780, 0x17D2, 0x179A, 0x17C4, 0x1799, SPACE,
                0x1797, 0x17D2, 0x179B, 0x17C0, 0x1784, KHAN, SPACE,
                0x1785, 0x17B6, 0x1780, 0x17CB, 0x1792, 0x17BB, 0x1784, KHAN,
            ),
        },
        "startPatrol": {
            "en": "Start patrol",
            "km": k(
                0x1785, 0x17B6, 0x1794, 0x17CB, SPACE,
                0x1795, 0x17D2, 0x178A, 0x17BE, 0x1798, SPACE,
                0x179B, 0x17D2, 0x1794, 0x17B6, 0x178F,
            ),
        },
        "judgeMode": {
            "en": "Try with sample photos",
            "km": k(
                0x179F, 0x17B6, 0x1780, SPACE,
                0x179B, 0x17D2, 0x1794, 0x1784, SPACE,
                0x179A, 0x17BC, 0x1794, 0x1797, 0x17B6, 0x1796,
            ),
        },
        "waterQ": {
            "en": "Water inside?",
            "km": k(
                0x1798, 0x17B6, 0x1793, 0x1791, 0x17B9, 0x1780, SPACE,
                0x1780, 0x17D2, 0x1793, 0x17BC, 0x1784, SPACE, 0x1793, 0x17C1, 0x17C7, 0x003F,
            ),
        },
        "waterYes": {"en": "Yes, water", "km": k(0x1798, 0x17B6, 0x1793, SPACE, 0x1791, 0x17B9, 0x1780)},
        "waterNo": {"en": "No water", "km": k(0x1782, 0x17D2, 0x1798, 0x17B6, 0x1793, SPACE, 0x1791, 0x17B9, 0x1780)},
        "done": {"en": "Done", "km": k(0x179A, 0x17BD, 0x1785, 0x179A, 0x17B6, 0x179B, 0x17CB)},
        "finish": {
            "en": "Finish patrol",
            "km": k(
                0x1794, 0x1789, 0x17D2, 0x1785, 0x1794, 0x17CB, SPACE,
                0x179B, 0x17D2, 0x1794, 0x17B6, 0x178F,
            ),
        },
        "snap": {
            "en": "Snap a container",
            "km": k(0x1790, 0x178F, SPACE, 0x1792, 0x17BB, 0x1784),
        },
        "pickTop": {
            "en": "Which one is it?",
            "km": k(0x1798, 0x17BD, 0x1799, 0x178E, 0x17B6, 0x003F),
        },
        "patrolWindow": {
            "en": "Patrol window",
            "km": k(0x1796, 0x17C1, 0x179B, SPACE, 0x179B, 0x17D2, 0x1794, 0x17B6, 0x178F),
        },
        "about": {"en": "About", "km": k(0x17A2, 0x17C6, 0x1796, 0x17B8)},
        "neighbour": {
            "en": "Neighbour note",
            "km": k(
                0x179F, 0x17B6, 0x179A, SPACE,
                0x1794, 0x1784, SPACE,
                0x17A2, 0x17D2, 0x1793, 0x1780, 0x1787, 0x17B7, 0x178F,
            ),
        },
    },
}


def main() -> None:
    import json

    out = Path("/workspace/src/i18n/copy.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(COPY, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
