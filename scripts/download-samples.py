#!/usr/bin/env python3
"""Download Wikimedia Commons thumbs for judge-mode samples."""

from __future__ import annotations

import json
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path("/workspace/public/samples")
UA = "MusPatrol/1.0 (DEV Hacktoberfest; educational reuse of Commons files)"

FILES = {
    "bucket.jpg": "File:Veronica Bucket.jpg",
    "basin.jpg": "File:Plastic washbasin bin.jpg",
    "pot.jpg": "File:Mayana plants in a recycled pot.jpg",
    "tire.jpg": "File:Plants grown using tyres as pot.jpg",
    "coconut.jpg": "File:Coconut shells.jpg",
    "bottle.jpg": "File:Empty Plastic Bottle.jpg",
    "jar.jpg": "File:Cambodian clay fermentation vessel.jpg",
    "barrel.jpg": "File:Rain Barrel (15455931038).jpg",
    "bowl.jpg": "File:Dog Water Bowl.jpg",
    "grass.jpg": "File:Grass.jpg",
}


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.loads(res.read().decode())


def download(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as res:
        dest.write_bytes(res.read())


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    titles = "|".join(FILES.values())
    query = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": titles,
            "prop": "imageinfo",
            "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": "800",
            "format": "json",
        }
    )
    data = fetch_json(f"https://commons.wikimedia.org/w/api.php?{query}")
    by_title = {
        page["title"]: page
        for page in data.get("query", {}).get("pages", {}).values()
    }
    credits = []
    for filename, title in FILES.items():
        page = by_title.get(title)
        if not page or "imageinfo" not in page:
            raise SystemExit(f"missing {title}")
        info = page["imageinfo"][0]
        meta = info.get("extmetadata", {})
        url = info.get("thumburl") or info.get("url")
        dest = OUT / filename
        print(f"GET {title} -> {dest.name}")
        download(url, dest)
        credits.append(
            {
                "file": filename,
                "title": title,
                "author": meta.get("Artist", {}).get("value", ""),
                "license": meta.get("LicenseShortName", {}).get("value", ""),
                "credit": meta.get("Credit", {}).get("value", ""),
                "source": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title)}",
                "bytes": dest.stat().st_size,
            }
        )
    (OUT / "credits.json").write_text(
        json.dumps(credits, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print("done", len(credits))


if __name__ == "__main__":
    main()
