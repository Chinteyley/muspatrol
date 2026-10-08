#!/usr/bin/env python3
"""Write simple lime PNG icons without Pillow."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

OUT = Path("/workspace/public/icons")


def png(path: Path, size: int) -> None:
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        for x in range(size):
            # lime tile + dark smile
            r, g, b = 214, 255, 74
            cx, cy = x / size - 0.5, y / size - 0.5
            if cx * cx + (cy + 0.05) * (cy + 0.05) > 0.18 and y > size * 0.55:
                r, g, b = 19, 33, 12
            if (x - size * 0.35) ** 2 + (y - size * 0.4) ** 2 < (size * 0.04) ** 2:
                r, g, b = 19, 33, 12
            if (x - size * 0.65) ** 2 + (y - size * 0.4) ** 2 < (size * 0.04) ** 2:
                r, g, b = 19, 33, 12
            raw.extend((r, g, b, 255))

    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    blob = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(
        b"IDAT", zlib.compress(bytes(raw), 9)
    ) + chunk(b"IEND", b"")
    path.write_bytes(blob)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    png(OUT / "icon-192.png", 192)
    png(OUT / "icon-512.png", 512)
    (OUT / "icon.svg").write_text(
        """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="16" fill="#d6ff4a"/>
<path d="M14 40c8-14 28-14 36 0" fill="none" stroke="#13210c" stroke-width="4" stroke-linecap="round"/>
<circle cx="24" cy="28" r="3.2" fill="#13210c"/>
<circle cx="40" cy="28" r="3.2" fill="#13210c"/>
</svg>
""",
        encoding="utf-8",
    )
    print("icons ok")


if __name__ == "__main__":
    main()
