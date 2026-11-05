"""Starships: original designs in 16:9, lit from the upper left with engine glows.

Each ship is a list of hull plates (polygon, tone). Tone 0 is the darkest
metal and 1 the brightest, so plates facing the light read as lighter.
"""
import numpy as np

from common import (
    rng_for, blur, starfield, nebula, finish, polygon_mask, composite, rim_light,
    add_glow, screen, vertical_gradient, value_noise, hex_rgb, sphere,
    paste_sphere, surface_texture,
)

W, H = 1600, 900
DARK = hex_rgb('#0d1016')
LIGHT = hex_rgb('#9aa3b0')


def backdrop(rng, stops, planet=None):
    canvas = vertical_gradient(W, H, [(0, '#03040b'), (1, '#080b1a')])
    canvas = screen(canvas, nebula(W, H, rng, stops, strength=0.6, scale=3, mask_bias=0.42))
    canvas = screen(canvas, starfield(W, H, rng, density=0.0010))
    if planet:
        tex_stops, atmo, size, cx, cy, light = planet
        tex = surface_texture(rng, tex_stops, base=5, bands=0.3)
        paste_sphere(canvas, sphere(size, rng, tex, light=light, atmosphere=atmo, atmo_strength=0.9), cx, cy, atmo)
    return canvas


def draw_ship(canvas, rng, plates, lights=(), engines=(), rim='#bcd4ff', details=None):
    """Paints the hull plates, panel texture, rim light, windows and engines."""
    union = np.zeros((H, W), dtype=np.float32)
    panel = value_noise(W, H, rng, octaves=3, base=60, persistence=0.6)
    grime = value_noise(W, H, rng, octaves=5, base=12)
    yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, W, dtype=np.float32)[None, :]
    # The hull picks up a little colour from its surroundings
    environment = blur(canvas, 60) * 2.5
    for poly, tone in plates:
        mask = polygon_mask(W, H, [poly])
        xs = [x for x, _ in poly]
        left, right = min(xs) / W, max(xs) / W
        # Light comes from the upper left: each plate falls off to the right and down
        across = np.clip((xx - left) / max(right - left, 1e-3), 0, 1)
        shade = tone ** 1.4 * (1.1 - 0.45 * across) * (1.05 - 0.4 * yy)
        shade = np.clip(shade * (0.8 + 0.35 * panel) * (0.75 + 0.35 * grime), 0, 1)
        metal = DARK + (LIGHT - DARK) * shade[..., None]
        metal = screen(metal, environment * 0.35)
        canvas = composite(canvas, mask, metal)
        union = np.maximum(union, mask)
    # Greebles: small raised and recessed panels scattered over the hull
    ys, xs = np.nonzero(union > 0.99)
    if len(xs):
        picks = rng.integers(0, len(xs), 120)
        raised, recessed = [], []
        for i in picks:
            x, y = xs[i], ys[i]
            w, h = rng.integers(5, 22), rng.integers(2, 8)
            rect = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
            (raised if rng.random() < 0.5 else recessed).append(rect)
        canvas = composite(canvas, polygon_mask(W, H, recessed) * union * 0.32, DARK * 0.6)
        canvas = screen(canvas, (polygon_mask(W, H, raised) * union * 0.18)[..., None] * LIGHT)
    if details:
        # Thin panel lines and greebles, drawn as dark strokes
        lines = polygon_mask(W, H, [], lines=details)
        canvas = composite(canvas, lines * 0.55 * union, DARK * 0.6)
    canvas = screen(canvas, rim_light(union, -0.7, -0.7, rim, width=5, strength=0.9))
    for x, y, r, colour in lights:
        add_glow(canvas, x, y, r, colour, 0.9)
    for x, y, r, colour in engines:
        add_glow(canvas, x, y, r * 0.45, '#ffffff', 1.0)
        add_glow(canvas, x, y, r, colour, 0.9)
        add_glow(canvas, x, y, r * 3.2, colour, 0.35)
    return canvas


def windows(rng, x0, y0, x1, y1, count, colour='#ffe2a8'):
    """Rows of tiny lit windows along a line."""
    t = np.sort(rng.random(count))
    return [(x0 + (x1 - x0) * v, y0 + (y1 - y0) * v, 1.6, colour) for v in t]


def wedge_destroyer(seed=101):
    """Capital ship: a long wedge with a stepped command tower."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#060b1f'), (0.5, '#1b2f5e'), (1, '#6c8fd0')],
                      planet=([(0, '#20304a'), (0.5, '#4f6f90'), (1, '#c8d8e6')], '#8fc0ff', 1700, 1300, 1750, (-0.3, -0.9, 0.3)))
    plates = [
        ([(140, 560), (1420, 330), (1460, 420), (1440, 470)], 0.85),   # upper deck
        ([(140, 560), (1440, 470), (1430, 540), (300, 600)], 0.45),    # lower hull
        ([(980, 395), (1180, 360), (1200, 300), (1010, 330)], 0.75),   # tower base
        ([(1040, 330), (1170, 300), (1185, 250), (1060, 270)], 0.95),  # bridge
        ([(1085, 262), (1150, 250), (1155, 232), (1095, 240)], 0.7),   # bridge cap
        ([(1430, 400), (1500, 395), (1500, 520), (1430, 530)], 0.35),  # engine block
    ]
    details = [(300 + i * 110, 540 - i * 19, 330 + i * 110, 588 - i * 13, 1.4) for i in range(10)]
    details += [(250, 552, 1430, 455, 1.2)]
    lights = windows(rng, 260, 553, 1420, 455, 60) + windows(rng, 1050, 322, 1170, 300, 14, '#cfe6ff')
    engines = [(1505, 425, 22, '#7fb6ff'), (1505, 470, 26, '#7fb6ff'), (1505, 510, 20, '#7fb6ff')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, details=details)
    return finish(canvas, rng)


def twin_engine_fighter(seed=113):
    """Single-seat fighter: slim fuselage, canopy and two wing-mounted engines."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#1a0608'), (0.5, '#5e1b22'), (1, '#e0604a')])
    plates = [
        ([(250, 470), (930, 420), (1010, 450), (930, 490), (250, 500)], 0.85),  # fuselage
        ([(560, 440), (760, 300), (840, 300), (760, 440)], 0.7),                 # upper wing
        ([(560, 480), (760, 620), (840, 620), (760, 480)], 0.45),                # lower wing
        ([(740, 285), (1040, 285), (1060, 312), (740, 318)], 0.8),               # upper engine
        ([(740, 600), (1040, 600), (1060, 628), (740, 634)], 0.55),              # lower engine
        ([(360, 455), (470, 432), (540, 440), (500, 462)], 1.0),                 # canopy frame
    ]
    details = [(600, 455, 900, 452, 1.2), (780, 300, 1040, 300, 1.0), (780, 616, 1040, 616, 1.0)]
    lights = [(450, 447, 10, '#8ff0ff'), (300, 482, 4, '#ff5a4a')]
    engines = [(1066, 300, 20, '#ff8a4a'), (1066, 617, 20, '#ff8a4a'), (1012, 452, 14, '#ff8a4a')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#ffc2a8', details=details)
    return finish(canvas, rng)


def bulk_freighter(seed=127):
    """Workhorse hauler: cockpit pod, cargo modules on a spine, engine bank."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#120c04'), (0.5, '#4a3412'), (1, '#c99a4a')],
                      planet=([(0, '#3a2210'), (0.5, '#8a5a2a'), (1, '#e6c08a')], '#ffcf8f', 520, 1340, 200, (-0.8, 0.2, 0.5)))
    plates = [([(220, 430), (300, 395), (380, 395), (380, 520), (300, 520), (220, 480)], 0.9)]  # cockpit pod
    plates.append(([(380, 445), (1260, 445), (1260, 470), (380, 470)], 0.4))                    # spine
    for i in range(6):
        x = 400 + i * 140
        plates.append(([(x, 370), (x + 125, 370), (x + 125, 445), (x, 445)], 0.75 - (i % 2) * 0.15))  # upper cargo
        plates.append(([(x, 470), (x + 125, 470), (x + 125, 548), (x, 548)], 0.5 - (i % 2) * 0.1))    # lower cargo
    plates.append(([(1260, 380), (1380, 360), (1380, 560), (1260, 540)], 0.6))                  # engine bank
    details = [(400 + i * 140, 378, 400 + i * 140 + 125, 378, 1.0) for i in range(6)]
    lights = [(255, 450, 8, '#ffe2a8'), (275, 438, 6, '#ffe2a8')] + windows(rng, 400, 458, 1250, 458, 26, '#ffb35a')
    engines = [(1386, 400, 18, '#9fc8ff'), (1386, 460, 22, '#9fc8ff'), (1386, 520, 18, '#9fc8ff')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#ffd9a0', details=details)
    return finish(canvas, rng)


def swept_wing_interceptor(seed=131):
    """Fast interceptor seen from above: arrowhead body with forward-swept wings."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#03100c'), (0.5, '#0e4a3a'), (1, '#4fd0a0')])
    plates = [
        ([(380, 450), (900, 410), (1060, 450), (900, 490)], 0.9),          # body
        ([(700, 420), (560, 200), (640, 190), (920, 420)], 0.75),           # upper wing
        ([(700, 480), (560, 700), (640, 710), (920, 480)], 0.5),            # lower wing
        ([(470, 440), (600, 425), (640, 450), (600, 475), (470, 460)], 1.0),  # canopy
        ([(1000, 432), (1100, 425), (1100, 475), (1000, 468)], 0.4),        # engine housing
    ]
    details = [(620, 300, 900, 425, 1.2), (620, 600, 900, 475, 1.2), (700, 450, 1000, 450, 1.0)]
    lights = [(560, 448, 9, '#a8fff0'), (585, 205, 5, '#ff4a4a'), (585, 695, 5, '#4aff7a')]
    engines = [(1105, 438, 16, '#6affd0'), (1105, 462, 16, '#6affd0')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#b8ffe8', details=details)
    return finish(canvas, rng)


def escort_corvette(seed=149):
    """Escort corvette: hammerhead bow, long neck and a wide bank of engines."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#0d0618'), (0.5, '#3a1a5e'), (1, '#b07ae0')],
                      planet=([(0, '#2a1a40'), (0.5, '#6a4a9a'), (1, '#d8c8f0')], '#c8a8ff', 900, 260, 980, (0.6, -0.8, 0.4)))
    plates = [
        ([(180, 380), (360, 360), (380, 560), (200, 540)], 0.85),    # bow
        ([(360, 430), (820, 420), (820, 490), (370, 480)], 0.6),     # neck
        ([(820, 360), (1240, 340), (1240, 580), (820, 560)], 0.8),   # main hull
        ([(900, 330), (1100, 320), (1100, 345), (900, 355)], 0.95),  # dorsal deck
        ([(1240, 330), (1360, 320), (1360, 600), (1240, 590)], 0.45),  # engine bank
    ]
    details = [(830, 400 + i * 30, 1235, 395 + i * 30, 1.0) for i in range(6)] + [(370, 455, 820, 452, 1.0)]
    lights = windows(rng, 830, 380, 1230, 370, 30) + windows(rng, 200, 400, 360, 390, 10, '#ff9a9a')
    engines = [(1366, 345 + i * 46, 17, '#ff6a8a') for i in range(6)]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#e0c8ff', details=details)
    return finish(canvas, rng)


def wing_shuttle(seed=163):
    """Passenger shuttle with two tall angled wings, coming in to land."""
    rng = rng_for(seed)
    canvas = backdrop(rng, [(0, '#06121c'), (0.5, '#16405e'), (1, '#5ab0d8')])
    plates = [
        ([(520, 500), (720, 440), (1080, 440), (1120, 520), (1080, 600), (600, 600)], 0.85),  # cabin
        ([(560, 520), (650, 470), (720, 470), (700, 520)], 1.0),                              # cockpit glass frame
        ([(780, 440), (700, 120), (780, 110), (940, 440)], 0.7),                               # left wing
        ([(940, 440), (1060, 130), (1130, 140), (1040, 440)], 0.5),                            # right wing
        ([(1080, 470), (1180, 480), (1180, 580), (1080, 590)], 0.4),                           # engines
    ]
    details = [(760, 520, 1070, 520, 1.2), (720, 300, 780, 440, 1.0), (1080, 300, 1000, 440, 1.0)]
    lights = [(640, 500, 9, '#bff6ff'), (690, 495, 7, '#bff6ff'), (745, 125, 6, '#ff4a4a'), (1098, 145, 6, '#ff4a4a')]
    lights += windows(rng, 760, 555, 1060, 555, 10, '#ffe7b8')
    engines = [(1186, 505, 18, '#8fd8ff'), (1186, 555, 18, '#8fd8ff')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#cfefff', details=details)
    return finish(canvas, rng)


SHIPS = [wedge_destroyer, twin_engine_fighter, bulk_freighter, swept_wing_interceptor, escort_corvette, wing_shuttle]
