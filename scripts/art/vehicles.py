"""Vehicles: ground and atmospheric craft, drawn with the same hull-plate
treatment as the starships but set over terrain rather than space.
"""
import numpy as np

from common import (
    rng_for, finish, polygon_mask, composite, add_glow, screen, nebula,
    vertical_gradient, value_noise, hex_rgb, blur, gradient,
)
from ships import draw_ship, windows, W, H


def terrain(canvas, rng, horizon, near, far, haze_colour, haze_strength=0.45):
    """Ground below `horizon`, hazy where it meets the sky."""
    xx = np.arange(W, dtype=np.float32)
    line = horizon + 18 * np.sin(xx * 0.0031) + 9 * np.sin(xx * 0.0094 + 1.7)
    ground = (np.arange(H)[:, None] > line[None, :]).astype(np.float32)
    depth = np.clip((np.arange(H)[:, None] - horizon) / max(H - horizon, 1), 0, 1).repeat(W, 1)
    soil = gradient(depth, [(0, far), (1, near)])
    grit = value_noise(W, H, rng, octaves=5, base=14)
    soil = soil * (0.82 + 0.3 * grit[..., None])
    canvas = composite(canvas, blur(ground, 2.5), soil)
    # Haze sitting on the horizon line
    band = np.exp(-((np.arange(H)[:, None] - horizon) / 44.0) ** 2).repeat(W, 1)
    return screen(canvas, band[..., None] * hex_rgb(haze_colour) * haze_strength)


def dust_plume(canvas, rng, x, y, spread, colour, count=900):
    """Kicked-up dust, densest near the ground."""
    layer = np.zeros((H, W), dtype=np.float32)
    xs = np.clip(rng.normal(x, spread, count), 0, W - 1).astype(int)
    ys = np.clip(rng.normal(y, spread * 0.38, count), 0, H - 1).astype(int)
    layer[ys, xs] = rng.random(count) * 0.8
    return screen(canvas, blur(layer, 16)[..., None] * hex_rgb(colour) * 1.5)


def walker(seed=501):
    """Armoured walker striding over a frozen plain on four jointed legs."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#050a16'), (0.45, '#0e1c30'), (0.74, '#24415c'), (1, '#0a1420')])
    canvas = screen(canvas, nebula(W, H, rng, [(0, '#07203a'), (1, '#3f8fc0')], strength=0.4, mask_bias=0.52))
    canvas = terrain(canvas, rng, 620, '#2b4259', '#16293c', '#4f7ea8', 0.45)
    add_glow(canvas, 1280, 230, 90, '#cfe6ff', 0.55)
    canvas = dust_plume(canvas, rng, 760, 664, 190, '#9fc4e0', 900)
    plates = [
        ([(560, 300), (980, 280), (1030, 350), (1010, 430), (560, 440)], 0.88),   # hull
        ([(520, 318), (566, 300), (572, 420), (524, 406)], 0.98),                 # head / viewport block
        ([(612, 262), (820, 250), (826, 284), (608, 296)], 0.72),                 # dorsal spine
        ([(980, 318), (1062, 326), (1058, 400), (978, 394)], 0.5),                # rear block
    ]
    # Four legs: two forward-jointed, two back, with wide footpads
    for i, (hx, knee, foot, tone) in enumerate((
        (640, (574, 560), (548, 690), 0.62), (720, (778, 572), (806, 694), 0.44),
        (880, (838, 556), (812, 688), 0.56), (950, (1004, 568), (1030, 690), 0.38),
    )):
        kx, ky = knee
        fx, fy = foot
        plates.append(([(hx - 26, 418), (hx + 26, 418), (kx + 22, ky), (kx - 22, ky)], tone))
        plates.append(([(kx - 19, ky - 8), (kx + 19, ky - 8), (fx + 15, fy), (fx - 15, fy)], tone - 0.1))
        plates.append(([(fx - 40, fy), (fx + 40, fy), (fx + 32, fy + 26), (fx - 32, fy + 26)], tone + 0.12))
    details = [(600, 330, 975, 318, 1.4), (600, 392, 975, 382, 1.2),
               (620, 268, 820, 258, 1.0), (530, 330, 566, 326, 1.0)]
    lights = [(536, 340, 9, '#ffd36a'), (536, 382, 9, '#ffd36a'), (1050, 342, 6, '#ff5a4a')]
    lights += windows(rng, 620, 320, 960, 310, 12, '#ffe2a8')
    canvas = draw_ship(canvas, rng, plates, lights, (), rim='#eaf4ff', details=details)
    return finish(canvas, rng, vignette=0.42)


def speeder(seed=521):
    """Open-cockpit speeder banking low over red rock at speed."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#140a20'), (0.4, '#3e1824'), (0.64, '#8a3a1e'), (1, '#1c0c08')])
    canvas = terrain(canvas, rng, 660, '#3c1a0c', '#60301a', '#d98a4a', 0.4)
    add_glow(canvas, 1340, 620, 110, '#ffd9a0', 0.75)
    add_glow(canvas, 1340, 620, 380, '#ff7a3a', 0.3)
    # Motion streaks along the ground to read as speed
    streaks = polygon_mask(W, H, [], lines=[
        (0, 700 + i * 24, W, 706 + i * 30, 3 + i) for i in range(8)])
    canvas = screen(canvas, blur(streaks, 7)[..., None] * hex_rgb('#ffb072') * 0.4)
    plates = [
        ([(330, 470), (900, 430), (1120, 460), (1150, 500), (900, 524), (350, 520)], 0.9),   # hull
        ([(470, 436), (700, 408), (760, 440), (700, 470), (470, 466)], 1.0),                 # cockpit coaming
        ([(300, 486), (336, 462), (348, 524), (306, 516)], 0.66),                            # nose vane
        ([(840, 400), (1010, 388), (1022, 424), (846, 436)], 0.74),                          # upper intake
        ([(880, 520), (1080, 512), (1086, 556), (884, 562)], 0.46),                          # lower skirt
        ([(1120, 446), (1206, 452), (1200, 516), (1116, 510)], 0.4),                         # thruster housing
    ]
    details = [(380, 494, 1110, 478, 1.3), (500, 452, 700, 436, 1.0), (860, 410, 1010, 400, 1.0)]
    lights = [(360, 486, 10, '#9ff0ff'), (520, 444, 7, '#ffe2a8'), (1180, 460, 5, '#ff5a4a')]
    engines = [(1212, 470, 20, '#ff9a4a'), (1212, 502, 16, '#ff9a4a')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#ffc8a0', details=details)
    # Repulsor wash under the hull
    canvas = dust_plume(canvas, rng, 700, 610, 230, '#ffb072', 1300)
    add_glow(canvas, 700, 560, 180, '#ff8a4a', 0.3)
    return finish(canvas, rng, vignette=0.46)


def crawler(seed=541):
    """Mining crawler on continuous tracks, hauling ore under a dusty sky."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#120d04'), (0.45, '#2e2209'), (0.7, '#5c431a'), (1, '#140e05')])
    canvas = terrain(canvas, rng, 640, '#2a1e0a', '#483412', '#c49a52', 0.4)
    add_glow(canvas, 300, 250, 220, '#ffc86a', 0.25)
    plates = [
        ([(250, 430), (1180, 400), (1230, 450), (1225, 560), (255, 570)], 0.84),  # body
        ([(300, 330), (520, 316), (545, 430), (296, 436)], 0.95),                 # cab
        ([(600, 350), (1120, 330), (1130, 404), (598, 418)], 0.66),               # ore hopper
        ([(1180, 420), (1290, 432), (1284, 548), (1176, 540)], 0.48),             # rear plant
        ([(200, 470), (258, 452), (264, 552), (206, 544)], 0.6),                  # front bumper
    ]
    # Two track units with road wheels
    # Track units overlap the hull bottom (y is above the hull's lower edge) so
    # they read as attached, and the road wheels sit inside the track outline
    for x0, x1, y in ((270, 700, 548), (760, 1200, 548)):
        plates.append(([(x0, y), (x1, y - 6), (x1 + 34, y + 78), (x0 - 34, y + 84)], 0.42))
        for i in range(6):
            cx = x0 + 34 + i * (x1 - x0 - 68) / 5
            plates.append(([(cx - 22, y + 24), (cx + 22, y + 22), (cx + 22, y + 66), (cx - 22, y + 68)], 0.26))
    details = [(280, 470, 1170, 448, 1.4), (300, 526, 1170, 512, 1.2)]
    details += [(620 + i * 84, 336, 620 + i * 84, 410, 1.1) for i in range(7)]
    lights = [(214, 486, 10, '#ffd36a'), (214, 520, 10, '#ffd36a'), (1286, 450, 6, '#ff5a4a')]
    lights += windows(rng, 316, 350, 520, 342, 8, '#ffe2a8')
    canvas = draw_ship(canvas, rng, plates, lights, (), rim='#ffdfae', details=details)
    canvas = dust_plume(canvas, rng, 980, 650, 280, '#d8b070', 1500)
    canvas = dust_plume(canvas, rng, 420, 648, 180, '#d8b070', 800)
    return finish(canvas, rng, vignette=0.46)


def gunship(seed=563):
    """Atmospheric gunship in a banked turn above a cloud deck."""
    rng = rng_for(seed)
    canvas = vertical_gradient(W, H, [(0, '#050c1e'), (0.4, '#12304f'), (0.68, '#315d82'), (1, '#6f90a8')])
    # Cloud deck below
    clouds = value_noise(W, H, rng, octaves=7, base=4)
    deck = np.clip((np.arange(H)[:, None] - 600) / 180.0, 0, 1).repeat(W, 1)
    canvas = screen(canvas, (np.clip(clouds - 0.42, 0, 1) * deck)[..., None] * hex_rgb('#b9cfe2') * 1.1)
    canvas = screen(canvas, (deck ** 2)[..., None] * hex_rgb('#8ea8bd') * 0.5)
    add_glow(canvas, 1320, 180, 80, '#fff4d8', 0.9)
    add_glow(canvas, 1320, 180, 320, '#ffd08a', 0.3)
    plates = [
        ([(360, 440), (980, 400), (1130, 448), (980, 496), (370, 492)], 0.9),   # fuselage
        ([(430, 408), (640, 384), (700, 420), (640, 448), (430, 444)], 1.0),    # cockpit
        ([(640, 432), (560, 250), (650, 238), (860, 428)], 0.74),               # upper wing
        ([(660, 470), (590, 648), (680, 660), (880, 476)], 0.5),                # lower wing
        ([(860, 404), (1060, 392), (1070, 430), (864, 442)], 0.68),             # engine nacelle
        ([(880, 470), (1070, 464), (1076, 502), (884, 508)], 0.44),             # lower nacelle
        ([(1120, 430), (1210, 438), (1204, 496), (1114, 488)], 0.38),           # tail block
    ]
    details = [(420, 466, 1110, 452, 1.3), (600, 300, 850, 424, 1.1),
               (620, 620, 870, 480, 1.1), (880, 412, 1060, 402, 1.0)]
    lights = [(470, 420, 9, '#bff2ff'), (575, 258, 6, '#ff4a4a'), (604, 644, 6, '#4aff7a'),
              (398, 466, 7, '#ffe2a8')]
    engines = [(1216, 452, 18, '#9fd8ff'), (1216, 482, 18, '#9fd8ff'), (1078, 410, 12, '#9fd8ff')]
    canvas = draw_ship(canvas, rng, plates, lights, engines, rim='#dff0ff', details=details)
    return finish(canvas, rng, vignette=0.4)


VEHICLES = [walker, speeder, crawler, gunship]
