"""Normalized painted landmarks and blocking, measured on each 16:9 film plate.

Camera tuple is (focus x, focus y, magnification). Optional alternate angle is a
cut within the same voice cue. All positions are fractions of the uncut plate.
"""

CAMERA = {
    "outfit": ((0.50, 0.50, 1.008), (0.548, 0.52, 1.075)),
    "hearth-remains": ((0.46, 0.51, 1.09), (0.50, 0.50, 1.007)),
    "schooner": ((0.50, 0.50, 1.002), (0.555, 0.455, 1.085)),
    "wreck": ((0.318, 0.515, 1.60), (0.326, 0.52, 1.72)),
    "cabin-table": ((0.51, 0.56, 1.025), (0.54, 0.61, 1.16)),
    "shore-dawn": ((0.46, 0.60, 1.30), (0.535, 0.57, 1.125)),
    "beach": ((0.49, 0.61, 1.13), (0.40, 0.61, 1.05)),
    "camp-shelter": ((0.58, 0.52, 1.13), (0.64, 0.55, 1.23)),
    "cabin": ((0.33, 0.43, 1.23), (0.38, 0.48, 1.14)),
    "forge-cold": ((0.59, 0.51, 1.34), (0.54, 0.52, 1.16)),
    "forge-lit": ((0.39, 0.46, 1.27), (0.31, 0.43, 1.42)),
    "slipway": ((0.57, 0.57, 1.16), (0.65, 0.57, 1.24)),
    "slipway-ready": ((0.62, 0.49, 1.14), (0.58, 0.48, 1.05)),
    "crossing-wet": ((0.50, 0.53, 1.13), (0.55, 0.52, 1.18)),
    "crossing-bailed": ((0.53, 0.57, 1.21), (0.48, 0.54, 1.105)),
    "harbour": ((0.42, 0.54, 1.17), (0.38, 0.55, 1.08)),
    "chartroom": ((0.33, 0.47, 1.11), (0.41, 0.49, 1.23)),
    "landing": ((0.24, 0.42, 1.48), (0.40, 0.475, 1.19)),
    "reunion": ((0.54, 0.57, 1.29), (0.50, 0.55, 1.17)),
    "collections": ((0.445, 0.484, 1.64), (0.49, 0.485, 1.78)),
    "return-camp": ((0.34, 0.49, 1.20), (0.43, 0.53, 1.07)),
    "ending": ((0.53, 0.50, 1.08), (0.61, 0.47, 1.23)),
    "invercauld-wreck": ((0.44, 0.55, 1.12), (0.53, 0.47, 1.23)),
    "skin-boat": ((0.53, 0.54, 1.23), (0.48, 0.54, 1.11)),
    "julian": ((0.53, 0.53, 1.16), (0.49, 0.48, 1.07)),
    "rig-detail": ((0.49, 0.55, 1.05), (0.55, 0.57, 1.20)),
    "hull-detail": ((0.64, 0.50, 1.10), (0.48, 0.58, 1.22)),
    "workshop-detail": ((0.42, 0.43, 1.83), (0.47, 0.44, 1.74)),
    "table-detail": ((0.39, 0.43, 1.75), (0.38, 0.47, 1.83)),
}

# Individual masks spare the mast, ropes,
# gunwales, articles of furniture, huts and rocks lying in front of the water.
# Coordinates are in hundredths; each list names the responding material.
CROSSING_WATER = [
    ("sea", "0,44 28,42 25,57 20,57 18,53 9,51 0,51"),
    ("sea", "1,55 8,53 16,54 16,57 8,58 0,62"),
    ("sea", "32,43 40,43 39,58 29,57"),
    ("sea", "45,43 89,41 91,51 76,56 45,58"),
    ("sea", "91,42 100,41 100,44 94,50"),
    ("sail", "49,0 99,0 94,12 80,17 67,23 54,27 47,31"),
]
CAMP_WATER = [
    ("quiet", "22,35 38,34 32,37 23,43"),
    ("quiet", "51,34 63,34 62,38 56,37"),
]
SLIPWAY_WATER = [("shore", "0,38 37,39 32,44 22,49 17,54 4,55 0,52")]
FORGE_WATER = [("shore", "3,45 12,44 12,49 3,52")]
CABIN_WATER = [
    ("quiet", "15,32 21,32 21,36 15,36"),
    ("quiet", "23,32 28,31 28,36 23,36"),
]
FIRE = [("fire", "7,62 8,57 10,54 12,57 13,54 14,59 16,63 14,65 8,65")]
FORGE_FIRE = [("fire", "35,45 36,40 38,42 40,35 41,41 43,38 45,42 47,44 47,46 35,46")]
SURFACES = {
    "outfit": [("quiet", "7,39 13,39 13,45 15,47 15,51 8,55")],
    "hearth-remains": [
        ("quiet", "77,32 88,31 87,35 81,35"),
        ("grass", "68,50 73,45 76,42 78,46 72,55 68,64"),
        ("grass", "81,76 86,68 91,63 90,68 84,79"),
    ],
    "schooner": [
        ("sea", "0,59 39,59 42,64 52,67 71,68 88,65 91,59 100,59 100,100 0,100"),
        ("sail", "77,23 87,18 89,46 90,50 77,51 74,52"),
        ("sail", "59,34 66,29 67,47 66,51 59,51"),
    ],
    "wreck": [
        ("shore", "0,50 5,50 7,61 11,72 15,73 5,79 0,79"),
        ("quiet", "69,46 76,44 76,47 70,50"),
    ],
    "cabin-table": [
        (
            "wash",
            "0,70 10,69 13,74 21,64 26,64 25,70 36,75 37,81 41,81 43,76 53,74 64,71 72,67 80,66 90,70 100,74 100,100 0,100",
        ),
        ("shore", "5,26 11,27 11,31 4,30"),
    ],
    "shore-dawn": [
        (
            "shore",
            "0,45 78,45 77,49 68,54 66,53 64,53 63,57 60,58 58,55 56,56 55,59 53,59 53,51 51,51 51,59 46,61 45,56 42,57 42,61 40,58 39,59 37,63 27,68 0,81",
        )
    ],
    "beach": [("shore", "0,60 14,60 24,61 42,62 38,65 24,65 16,67 0,71")],
    "camp-shelter": CAMP_WATER + [("sail", "63,39 81,37 79,56 60,53")],
    "cabin": CABIN_WATER + FIRE,
    "table-detail": CABIN_WATER + FIRE,
    "forge-cold": FORGE_WATER,
    "forge-lit": FORGE_WATER + FORGE_FIRE,
    "workshop-detail": FORGE_WATER + FORGE_FIRE,
    "slipway": SLIPWAY_WATER,
    "slipway-ready": SLIPWAY_WATER + [("sail", "44,42 63,14 65,13 65,42")],
    "crossing-wet": CROSSING_WATER + [("quiet", "55,79 77,77 76,81 69,84 58,84")],
    "crossing-bailed": CROSSING_WATER,
    "harbour": [
        ("quiet", "0,47 25,47 25,50 11,54 13,60 8,61 4,59 0,59"),
        ("quiet", "56,57 63,55 65,53 66,61 61,66 57,66"),
    ],
    "chartroom": [("quiet", "4,34 10,34 10,38 4,38")],
    "landing": [
        (
            "quiet",
            "0,34 5,34 6,36 12,36 14,34 74,34 74,48 62,54 54,57 55,47 53,44 35,48 20,47 19,54 9,55 0,54",
        )
    ],
    "return-camp": CABIN_WATER + FIRE,
    "ending": [("quiet", "51,42 72,42 78,42 78,58 64,55 52,48")],
    "rig-detail": [
        ("sea", "0,60 18,58 32,52 48,50 51,70 48,76 32,72 20,75 0,80"),
        ("sea", "56,44 100,42 100,64 82,68 71,72 58,76"),
    ],
}

# performer, pose, soles (x,y), height when upright, facing, performance.
CAST = {
    "camp-shelter": [
        ("george", "reach", 0.844, 0.72, 0.305, "left", "canvas"),
        ("henry", "stand", 0.46, 0.68, 0.275, "right", "watch"),
    ],
    "cabin": [("raynal", "reach", 0.489, 0.73, 0.417, "left", "carve")],
    "table-detail": [("raynal", "reach", 0.489, 0.73, 0.417, "left", "carve")],
    "forge-cold": [("raynal", "reach", 0.724, 0.68, 0.463, "left", "file")],
    "forge-lit": [("raynal", "reach", 0.045, 0.643, 0.49, "right", "pump")],
    "workshop-detail": [("raynal", "reach", 0.045, 0.643, 0.49, "right", "pump")],
    "slipway": [("musgrave", "reach", 0.626, 0.74, 0.395, "left", "file")],
    "slipway-ready": [("musgrave", "stand", 0.361, 0.673, 0.322, "right", "watch")],
    "crossing-wet": [
        ("raynal", "reach", 0.262, 0.817, 0.44, "left", "helm"),
        ("musgrave", "crouch", 0.746, 0.833, 0.49, "left", "pump"),
        ("player", "stand", 0.497, 0.814, 0.414, "left", "helm"),
    ],
    "crossing-bailed": [
        ("raynal", "reach", 0.262, 0.817, 0.44, "left", "helm"),
        ("musgrave", "reach", 0.746, 0.833, 0.49, "left", "pump"),
        ("player", "stand", 0.497, 0.814, 0.414, "left", "helm"),
    ],
    "harbour": [
        ("raynal", "stand", 0.310, 0.73, 0.32, "right", "watch"),
        ("musgrave", "stand", 0.371, 0.74, 0.341, "left", "watch"),
    ],
    "reunion": [
        ("henry", "stand", 0.340, 0.672, 0.297, "right", "watch"),
        ("george", "stand", 0.422, 0.687, 0.312, "right", "watch"),
    ],
}

FIRELIGHT = {
    "cabin": (0.116, 0.605, 0.205, 0.24),
    "table-detail": (0.116, 0.605, 0.205, 0.24),
    "return-camp": (0.116, 0.605, 0.205, 0.24),
    "forge-lit": (0.413, 0.422, 0.17, 0.19),
    "workshop-detail": (0.413, 0.422, 0.17, 0.19),
    "cabin-table": (0.617, 0.323, 0.19, 0.28),
}

SURFACES["reunion"] = SURFACES["landing"]
SURFACES["collections"] = SURFACES["chartroom"]
