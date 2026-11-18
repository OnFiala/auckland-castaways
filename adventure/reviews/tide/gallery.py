"""Contact sheet of the registered scene paintings, in campaign order."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PLATES = [
    ('I', 'The Shore', 'beach'), ('I', 'The Wreck', 'wreck'),
    ('I', 'Under the Trees', 'camp-shelter'), ('II', 'Inside Epigwaitt', 'cabin'),
    ('II', 'The Winter Stream', 'forest'), ('III', 'The Forge', 'forge-lit'),
    ('III', 'Charcoal and Salvage', 'charcoal'), ('IV', 'The Boat on the Shore', 'slipway-ready'),
    ('IV', 'The Last Useful Pieces', 'salvage'), ('V', 'An Open Boat', 'crossing-bailed'),
    ('VI', 'Stewart Island Harbour', 'harbour'), ('VI', 'Invercargill Chart Room', 'chartroom'),
    ('VII', 'Back in Carnley Harbour', 'landing'), ('VII', 'The Two Who Waited', 'return-camp'),
]


def font(name, size):
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def render():
    width, height, gap, margin, caption = 560, 315, 24, 30, 50
    paper = Image.new('RGB', (margin * 2 + width * 2 + gap, 103 + (height + caption) * 7 + margin), '#ece6d7')
    ink = ImageDraw.Draw(paper)
    title = font('DejaVuSerif.ttf', 33)
    text = font('DejaVuSerif.ttf', 20)
    small = font('DejaVuSans.ttf', 15)
    ink.text((margin, 19), 'Until We Return', font=title, fill='#2e3438')
    ink.text((margin, 66), 'Fourteen places in the voyage of the Grafton, 1864–1865', font=small, fill='#535147')
    for i, (chapter, name, plate) in enumerate(PLATES):
        x = margin + (i % 2) * (width + gap)
        y = 103 + (i // 2) * (height + caption)
        with Image.open(ROOT / 'dist/assets/tidepaint' / (plate + '.webp')) as source:
            paper.paste(source.resize((width, height), Image.Resampling.LANCZOS), (x, y))
        ink.text((x, y + height + 10), chapter + '   ' + name, font=text, fill='#343a3c')
    paper.save(Path(__file__).with_name('ostrov.webp'), 'WEBP', quality=90, method=6)


if __name__ == '__main__':
    render()
