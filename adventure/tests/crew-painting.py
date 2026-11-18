"""Check the production cast against its painted pixels using Pillow (no browser)."""
import hashlib
import json
from pathlib import Path

from PIL import Image

ADVENTURE = Path(__file__).resolve().parents[1]
ASSETS = ADVENTURE / "dist/assets"
MASTERS = ADVENTURE / "artwork/cast"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def check_source(path, fingerprint):
    assert hashlib.sha256(path.read_bytes()).hexdigest() == fingerprint, path


def visible(alpha, minimum):
    return alpha.point(lambda a: 255 if a >= minimum else 0).getbbox()


def check_walk(actor):
    record = read(ASSETS / "walk" / (actor + ".json"))
    path = ASSETS / "walk" / record["image"]
    check_source(path, record["sha256"])
    check_source(MASTERS / record["native_file"], record["native_sha256"])
    drawing = Image.open(path)
    assert drawing.size == (1536, 1024) and drawing.mode == "RGBA"
    left, top, width, height = record["common_crop"]
    phases = record["frames"]
    assert len(phases) == 6
    assert max(f["crownX"] for f in phases) - min(f["crownX"] for f in phases) <= 2
    signatures = set()
    for phase in phases:
        x, y, w, h = phase["cellXYWH"]
        cel = drawing.crop((x, y, x + w, y + h))
        signatures.add(hashlib.sha256(cel.tobytes()).digest())
        alpha = cel.getchannel("A")
        l, t, r, b = alpha.getbbox()
        assert [l, t, r, b] == phase["alpha_bbox_gt_0"]
        assert left < l < r < left + width and top < t < b < top + height
        assert abs(visible(alpha, 128)[3] - 1 - record["ground_anchor_in_cell"][1]) <= 1
        foot = phase["plantContactX"]
        assert abs(foot - phase["idealPlantX"]) <= 1
        assert alpha.crop((foot, 484, foot + 1, 499)).getextrema()[1] >= 128
    assert len(signatures) == 6
    for start in (0, 3):
        for step in (1, 2):
            # Body travel across successive held drawings cancels planted-sole travel.
            travel = 480 * .88 / 6 * step
            error = phases[start + step]["plantContactX"] + travel - phases[start]["plantContactX"]
            assert abs(error) < 1, (actor, start, step, error)


def check_work(actor, record):
    path = ADVENTURE / "dist" / record["atlas"]
    check_source(path, record["sha256"])
    atlas = Image.open(path)
    assert tuple(record["size"]) == atlas.size and atlas.mode == "RGBA"
    for name, pose in record["poses"].items():
        x, y, w, h = pose["crop"]
        alpha = atlas.crop((x, y, x + w, y + h)).getchannel("A")
        l, t, r, b = alpha.getbbox()
        assert 0 < l < r < w and 0 < t < b < h, (actor, name, "tight crop")
        gx, gy = pose["ground"]
        assert l <= gx - x <= r and abs(visible(alpha, 128)[3] - 1 - (gy - y)) <= 1
        if name in ("reach", "crouch"):
            hx, hy = pose["contact"]
            assert atlas.getpixel((hx, hy))[3] >= 180, (actor, name, "detached grip")
            assert hx > gx and hy < gy
    assert record["poses"]["reach"]["contact"][1] < record["poses"]["crouch"]["contact"][1]


def main():
    source = read(MASTERS / "manifest.json")
    work = read(ASSETS / "work-poses/manifest.json")["assets"]
    assert len(source["assets"]) == len(work) == 5
    for row in [*source["assets"], source["low_work"]]:
        check_source(MASTERS / row["file"], row["sha256"])
    for actor, sheet in work.items():
        check_walk(actor)
        check_work(actor, sheet)
    rest = read(ASSETS / "shore-rest/manifest.json")
    check_source(ASSETS / "shore-rest" / rest["file"], rest["sha256"])
    check_source(ADVENTURE / rest["native"], rest["nativeSHA256"])
    image = Image.open(ASSETS / "shore-rest" / rest["file"])
    assert tuple(rest["size"]) == image.size and image.mode == "RGBA"
    assert all(image.getpixel(p)[3] == 0 for p in ((0, 0), (image.width-1, 0),
                                                    (0, image.height-1), (image.width-1, image.height-1)))
    print("Verified 30 distinct gait drawings, 15 working poses, 5 source sheets, low-work strip and seated Raynal.")


if __name__ == "__main__":
    main()
