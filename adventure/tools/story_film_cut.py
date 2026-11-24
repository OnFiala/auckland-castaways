"""Picture edit in seconds, relative to the beginning of each spoken passage.

A new entry is a cut to a different view. These times also locate the four
sound-synchronised close-ups in the recording session. The reel script owns
the running time and language independently of the number of pictures.
"""

from bisect import bisect_right


PICTURE_EDIT = {
    "film-title": ((0, "film-title"),),
    "film-foreword": ((0, "film-foreword"),),
    "outfit": ((0, "sydney-lift"), (5.2, "outfit"), (10.6, "passage/outward")),
    "schooner": ((0, "schooner"), (4.7, "sea/sounding"), (7.0, "cast-lead")),
    "wreck": ((0, "sea/chain"), (3.25, "wreck"), (7.35, "passage/impact")),
    "cabin-table": ((0, "sea/pump"), (3.95, "swing-lantern"), (7.65, "cabin-table")),
    "shore-dawn": ((0, "sea/shoreline"), (4.15, "shore-dawn")),
    "beach": ((0, "beach"), (4.6, "camp-shelter")),
    "camp-shelter": ((0, "land/rafters"), (5.1, "detail/thatch")),
    "cabin": ((0, "cabin"), (4.25, "land/chess"), (8.15, "table-detail")),
    "forge-cold": ((0, "forge-cold"), (3.5, "land/ballast"), (6.65, "land/bellows")),
    "forge-lit": ((0, "strike-iron"), (4.7, "forge-lit"), (7.95, "land/auger")),
    "slipway": ((0, "land/auger"), (3.65, "hull-detail"), (6.45, "slipway")),
    "slipway-ready": (
        (0, "drive-fastening"),
        (3.5, "land/gunwale"),
        (6.9, "slipway-ready"),
    ),
    "crossing-wet": (
        (0, "sea/departure"),
        (5.0, "passage/squall"),
        (8.35, "rig-detail"),
    ),
    "crossing-bailed": (
        (0, "sea/helm"),
        (3.0, "detail/hand-pump"),
        (7.9, "passage/storm"),
    ),
    "harbour": (
        (0, "passage/stewart"),
        (4.35, "passage/cross-house"),
        (8.15, "hull-detail"),
    ),
    "chartroom": ((0, "chartroom"), (4.05, "land/collection"), (8.2, "collections")),
    "landing": ((0, "sea/approach"), (4.4, "landing"), (7.25, "sea/signal")),
    "return-camp": ((0, "return-camp"), (4.05, "reunion")),
    "ending": ((0, "land/table"), (5.35, "ending")),
    "invercauld-wreck": (
        (0, "chart-north"),
        (3.9, "invercauld-wreck"),
        (8.05, "dalgarno-letter"),
    ),
    "skin-boat": ((0, "chart-both"), (3.85, "skin-boat"), (7.05, "passage/skin")),
    "julian": ((0, "julian"), (5.25, "julian-record")),
    "hearth-remains": (
        (0, "photo-wreck"),
        (4.55, "photo-hearth"),
        (9.3, "hearth-remains"),
    ),
    "film-home": ((0, "film-home"),),
    "film-witnesses": ((0, "film-witnesses"),),
    "film-credits": ((0, "film-credits"),),
}


def cut_at(plate, elapsed, duration):
    """Return the picture key, seconds on that camera and its [0,1] phase."""
    edit = PICTURE_EDIT[plate]
    index = max(0, bisect_right(edit, elapsed, key=lambda shot: shot[0]) - 1)
    start, picture = edit[index]
    end = edit[index + 1][0] if index + 1 < len(edit) else duration
    local = max(0.0, min(end - start, elapsed - start))
    return picture, local, local / (end - start)
