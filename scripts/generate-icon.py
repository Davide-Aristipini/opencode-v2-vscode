"""Generate the Marketplace icon without external design files."""

from pathlib import Path

from PIL import Image, ImageDraw


SCALE = 4
SIZE = 512
BACKGROUND = "#131010"
WHITE = "#ffffff"
GRAY = "#5a5858"


def points(values: list[tuple[int, int]]) -> list[tuple[int, int]]:
    return [(x * SCALE, y * SCALE) for x, y in values]


image = Image.new("RGB", (SIZE * SCALE, SIZE * SCALE), BACKGROUND)
draw = ImageDraw.Draw(image)

# Original OpenCode mark.
draw.rectangle((128 * SCALE, 96 * SCALE, 384 * SCALE, 416 * SCALE), fill=WHITE)
draw.rectangle((192 * SCALE, 160 * SCALE, 320 * SCALE, 352 * SCALE), fill=BACKGROUND)
draw.rectangle((192 * SCALE, 224 * SCALE, 320 * SCALE, 352 * SCALE), fill=GRAY)

# Block-style “V2” signature. Gray V preserves the original palette, while the
# white 2 makes the version recognizable at Marketplace thumbnail sizes.
draw.polygon(
    points([(312, 432), (329, 432), (344, 473), (359, 432), (376, 432), (354, 488), (334, 488)]),
    fill=GRAY,
)
draw.polygon(
    points(
        [
            (388, 432),
            (472, 432),
            (472, 454),
            (414, 474),
            (472, 474),
            (472, 488),
            (388, 488),
            (388, 466),
            (446, 446),
            (388, 446),
        ]
    ),
    fill=WHITE,
)

output = Path(__file__).resolve().parents[1] / "images" / "icon.png"
output.parent.mkdir(parents=True, exist_ok=True)
image.resize((SIZE, SIZE), Image.Resampling.LANCZOS).save(output, optimize=True)
print(output)
