"""Films: wide cinematic scenes, one per era of the saga.

Each is a 16:9 establishing shot rather than a portrait, so a film card reads
as a still from the picture.
"""
import numpy as np

from common import (
    rng_for, starfield, nebula, finish, polygon_mask, composite, rim_light,
    add_glow, screen, vertical_gradient, value_noise, hex_rgb, blur, gradient,
    sphere, paste_sphere, surface_texture,
)

W, H = 1600, 900


def blade(canvas, x0, y0, x1, y1, colour, core=9):
    """A glowing energy blade, drawn as a bright core inside two soft halos."""
    line = polygon_mask(W, H, [], lines=[(x0, y0, x1, y1, core)])
    canvas = screen(canvas, blur(line, 26)[..., None] * hex_rgb(colour) * 1.5)
    canvas = screen(canvas, blur(line, 8)[..., None] * hex_rgb(colour) * 1.3)
    return screen(canvas, line[..., None] * hex_rgb('#ffffff'))


def haze(canvas, rng, colour, count=420, y_min=0.3):
    """Motes of dust hanging in the light."""
    layer = np.zeros((H, W), dtype=np.float32)
    xs = rng.integers(0, W, count)
    ys = rng.integers(int(H * y_min), H, count)
    layer[ys, xs] = rng.random(count) * 0.85
    return screen(canvas, blur(layer, 1.6)[..., None] * hex_rgb(colour) * 2.6)


def senate_dome(seed=301):
    """Prequel era: a domed assembly hall, tiers of boxes lit from a high oculus."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#1a1206'), (0.45, '#2a1c0a'), (1, '#0c0803')])
    # Light pouring from an oculus at the top of the dome
    add_glow(canvas, 800, 40, 150, '#fff2cc', 1.0)
    add_glow(canvas, 800, 60, 520, '#ffc266', 0.42)
    shaft = polygon_mask(W, H, [[(700, 0), (900, 0), (1180, 900), (420, 900)]])
    canvas = screen(canvas, blur(shaft, 70)[..., None] * hex_rgb('#ffd27a') * 0.30)
    # The dome: concentric ribs curving away from the oculus
    for i in range(14):
        t = i / 13
        rx, ry = 180 + t * 1500, 90 + t * 760
        ring = polygon_mask(W, H, [], ellipses=[(800 - rx / 2, 60 - ry / 2, 800 + rx / 2, 60 + ry / 2)])
        edge = np.clip(ring - polygon_mask(W, H, [], ellipses=[
            (800 - rx / 2 + 7, 60 - ry / 2 + 5, 800 + rx / 2 - 7, 60 + ry / 2 - 5)]), 0, 1)
        canvas = composite(canvas, edge * 0.55, hex_rgb('#120c05'))
    # Tiers of delegates' boxes stacked up both walls
    boxes, lights = [], []
    for row in range(5):
        y = 360 + row * 108
        depth = 1 - row * 0.12
        for col in range(11):
            x = 70 + col * 140 + (row % 2) * 34
            if 560 < x < 1000 and row < 2:
                continue
            boxes.append([(x, y), (x + 108, y - 10), (x + 108, y + 66), (x, y + 76)])
            lights.append((x + 54, y + 30, 13 * depth, '#ffbe6a'))
    canvas = composite(canvas, polygon_mask(W, H, boxes), hex_rgb('#160f07'))
    canvas = screen(canvas, rim_light(polygon_mask(W, H, boxes), 0, -1, '#ffcf8a', width=4, strength=0.9))
    for x, y, r, colour in lights:
        add_glow(canvas, x, y, r, colour, 0.75)
    # The speaker's pod rising in the centre
    pod = polygon_mask(W, H, [[(726, 470), (874, 470), (892, 620), (708, 620)]])
    canvas = composite(canvas, pod, hex_rgb('#241708'))
    canvas = screen(canvas, rim_light(pod, -0.5, -0.9, '#ffe0a8', width=6, strength=1.2))
    add_glow(canvas, 800, 500, 60, '#ffd98f', 0.65)
    canvas = haze(canvas, rng, '#ffd9a0', count=520, y_min=0.1)
    return finish(canvas, rng, vignette=0.6)


def duel_corridor(seed=317):
    """Original era: two blades crossed in a dark reactor corridor."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#04060c'), (0.5, '#070c16'), (1, '#020306')])
    # Corridor walls converging on a bright doorway
    for i in range(9):
        t = i / 8
        x = 160 + t * 480
        wall = polygon_mask(W, H, [[(x, 90 + t * 150), (x + 42, 110 + t * 150),
                                    (x + 42, 790 - t * 150), (x, 810 - t * 150)]])
        canvas = composite(canvas, wall, hex_rgb('#0a0f1a') * (1 - t * 0.4))
        mirror = polygon_mask(W, H, [[(W - x, 90 + t * 150), (W - x - 42, 110 + t * 150),
                                      (W - x - 42, 790 - t * 150), (W - x, 810 - t * 150)]])
        canvas = composite(canvas, mirror, hex_rgb('#0a0f1a') * (1 - t * 0.4))
    door = polygon_mask(W, H, [[(690, 300), (910, 300), (910, 640), (690, 640)]])
    canvas = composite(canvas, door, hex_rgb('#1a2740'))
    add_glow(canvas, 800, 470, 190, '#5a9fe0', 0.55)
    # Floor catching the light
    floor = gradient(np.linspace(0, 1, H)[:, None].repeat(W, 1),
                     [(0, '#000000'), (0.78, '#000000'), (0.8, '#0e1726'), (1, '#05080e')])
    canvas = screen(canvas, floor * 0.9)
    # Two duellists in silhouette, blades raised and crossed above them
    left = [(430, 430), (500, 410), (545, 470), (560, 690), (585, 880), (400, 880), (420, 640)]
    left_arm = [(520, 455), (575, 440), (690, 330), (660, 305), (545, 420)]
    right = [(1170, 420), (1100, 400), (1055, 462), (1040, 690), (1015, 880), (1200, 880), (1180, 635)]
    right_arm = [(1080, 445), (1025, 430), (910, 325), (940, 300), (1055, 410)]
    mask = polygon_mask(W, H, [left, left_arm, right, right_arm])
    canvas = composite(canvas, mask, hex_rgb('#04060a'))
    canvas = screen(canvas, rim_light(mask, 0.0, -1.0, '#7fc4ff', width=6, strength=1.0))
    canvas = blade(canvas, 688, 332, 905, 196, '#4aa8ff', core=10)
    canvas = blade(canvas, 912, 327, 700, 182, '#ff4a3a', core=10)
    add_glow(canvas, 800, 250, 150, '#9a6aff', 0.42)
    canvas = screen(canvas, rim_light(mask, 0.0, -1.0, '#c0a0ff', width=14, strength=0.35))
    canvas = haze(canvas, rng, '#9fc4ff', count=380, y_min=0.2)
    return finish(canvas, rng, vignette=0.62)


def desert_wreck(seed=331):
    """Later era: the hull of a fallen capital ship half-buried in dunes."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#2a1230'), (0.34, '#8a3a46'), (0.52, '#e07a4a'),
                                      (0.58, '#f6b268'), (0.64, '#b85e32'), (1, '#2e1408')])
    canvas = screen(canvas, starfield(W, H, rng, density=0.0005, bright=0.5)
                    * np.clip(np.linspace(1.4, -0.2, H), 0, 1)[:, None, None] ** 2)
    add_glow(canvas, 1180, 520, 70, '#fff0cc', 1.0)
    add_glow(canvas, 1180, 520, 300, '#ff9a4a', 0.5)
    # A second, smaller sun
    add_glow(canvas, 1320, 470, 30, '#ffe0b0', 0.85)
    # Distant ridge, then the wreck, then the near dune
    ridge = np.zeros((H, W), dtype=np.float32)
    xx = np.arange(W, dtype=np.float32)
    line = 560 + 26 * np.sin(xx * 0.0032) + 14 * np.sin(xx * 0.011 + 1.2)
    ridge = (np.arange(H)[:, None] > line[None, :]).astype(np.float32)
    canvas = composite(canvas, blur(ridge, 2), hex_rgb('#4a2212'))
    # The wreck: a broken wedge tilted into the sand with exposed ribs
    hull = [(250, 600), (980, 405), (1065, 455), (1050, 520), (330, 690)]
    stern = [(205, 596), (262, 560), (300, 640), (238, 672)]
    rib_lines = [(360 + i * 92, 596 - i * 22, 395 + i * 92, 668 - i * 17, 5) for i in range(8)]
    mask = polygon_mask(W, H, [hull, stern])
    canvas = composite(canvas, mask, hex_rgb('#140d09'))
    canvas = composite(canvas, polygon_mask(W, H, [], lines=rib_lines) * mask * 0.75, hex_rgb('#060404'))
    canvas = screen(canvas, rim_light(mask, 0.85, -0.45, '#ffb070', width=7, strength=1.25))
    # Tiny figure for scale, dwarfed by the hull
    figure = polygon_mask(W, H, [[(1218, 690), (1232, 690), (1238, 742), (1212, 742)]],
                          ellipses=[(1218, 672, 1232, 688)])
    canvas = composite(canvas, figure, hex_rgb('#0a0604'))
    canvas = screen(canvas, rim_light(figure, 0.9, -0.3, '#ffcf9a', width=2, strength=1.1))
    # Near dune sweeping across the bottom
    near = 700 + 48 * np.sin(xx * 0.0024 + 2.1)
    dune = (np.arange(H)[:, None] > near[None, :]).astype(np.float32)
    canvas = composite(canvas, blur(dune, 3), hex_rgb('#3a1a0c') * 1.35)
    canvas = screen(canvas, rim_light(dune, 0.6, -0.8, '#ffb070', width=10, strength=0.5))
    canvas = haze(canvas, rng, '#ffcf9a', count=300, y_min=0.45)
    return finish(canvas, rng, vignette=0.5)


FILMS = [senate_dome, duel_corridor, desert_wreck]
