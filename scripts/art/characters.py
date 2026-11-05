"""Characters: original archetypes as rim-lit silhouettes in square scenes.

Figures are built from simple shapes so they read clearly at card size, and
the cards' square crop always keeps the head and shoulders in frame.
"""
import numpy as np

from common import (
    rng_for, starfield, nebula, finish, polygon_mask, composite, rim_light,
    add_glow, screen, vertical_gradient, value_noise, hex_rgb, blur, gradient,
)

S = 1200
INK = hex_rgb('#06070b')


def figure(canvas, mask, rim_colour, rim_dir=(-0.8, -0.4), fill='#0b0d14', rim_width=9, second_rim=None):
    """Fills the silhouette, then adds rim light from one or two sides."""
    body = value_noise(S, S, rng_for(7), octaves=4, base=10)
    xx = np.linspace(-1, 1, S, dtype=np.float32)[None, :]
    yy = np.linspace(-1, 1, S, dtype=np.float32)[:, None]
    toward_light = np.clip(0.5 - 0.5 * (xx * rim_dir[0] + yy * rim_dir[1]), 0, 1)
    fill_colour = hex_rgb(fill) * (0.7 + 0.35 * body[..., None]) * (0.75 + 0.6 * toward_light[..., None])
    canvas = composite(canvas, mask, fill_colour)
    # Soft bounce light just inside the lit edge
    inner = blur(rim_light(mask, *rim_dir, rim_colour, width=rim_width * 4, strength=1.0), rim_width * 2) * mask[..., None]
    canvas = screen(canvas, inner * 0.35)
    canvas = screen(canvas, rim_light(mask, *rim_dir, rim_colour, width=rim_width, strength=1.2))
    if second_rim:
        colour, direction = second_rim
        canvas = screen(canvas, rim_light(mask, *direction, colour, width=rim_width * 0.7, strength=0.7))
    return canvas


def energy_blade(canvas, x0, y0, x1, y1, colour, core_width=10):
    blade = polygon_mask(S, S, [], lines=[(x0, y0, x1, y1, core_width)])
    canvas = screen(canvas, blur(blade, 28)[..., None] * hex_rgb(colour) * 1.6)
    canvas = screen(canvas, blur(blade, 9)[..., None] * hex_rgb(colour) * 1.4)
    return screen(canvas, blade[..., None] * hex_rgb('#ffffff'))


def dust(canvas, rng, colour, count=500, y_min=0.45):
    """Floating motes catching the light."""
    layer = np.zeros((S, S), dtype=np.float32)
    xs = rng.integers(0, S, count)
    ys = rng.integers(int(S * y_min), S, count)
    layer[ys, xs] = rng.random(count) * 0.9
    return screen(canvas, blur(layer, 1.5)[..., None] * hex_rgb(colour) * 3)


def hooded_wanderer(seed=201):
    """A cloaked wanderer at dusk on a desert world, energy blade lowered."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#120a1e'), (0.45, '#5a2a3a'), (0.68, '#e0784a'), (0.72, '#f3b06a'), (1, '#2a1408')])
    canvas = screen(canvas, starfield(S, S, rng, density=0.0006, bright=0.6) * np.linspace(1, 0, S)[:, None, None] ** 2)
    add_glow(canvas, 300, 790, 70, '#fff1d0', 1.0)
    add_glow(canvas, 300, 790, 260, '#ff9a5a', 0.5)
    add_glow(canvas, 420, 830, 40, '#ffe2b0', 0.9)
    # Dunes
    dunes = np.zeros((S, S), dtype=np.float32)
    xx = np.arange(S, dtype=np.float32)
    for base, amp, freq, phase, tone in ((860, 40, 0.004, 0.5, 0.35), (930, 55, 0.003, 2.0, 0.2)):
        ridge = base + amp * np.sin(xx * freq * np.pi + phase)
        dunes_layer = (np.arange(S)[:, None] > ridge[None, :]).astype(np.float32)
        canvas = composite(canvas, blur(dunes_layer, 2), hex_rgb('#3a1c0c') * (1 + tone))
    # Figure: hood, shoulders, flowing cloak
    canvas = dust(canvas, rng, '#ffcf9a')
    hood = [(600, 250), (690, 290), (720, 400), (700, 470), (500, 470), (480, 400), (510, 290)]
    cloak = [(470, 450), (730, 450), (820, 700), (860, 1200), (340, 1200), (380, 700)]
    arm = [(700, 520), (760, 560), (800, 760), (770, 780), (720, 600)]
    mask = polygon_mask(S, S, [hood, cloak, arm])
    canvas = figure(canvas, mask, '#ffb070', rim_dir=(-0.9, -0.3), second_rim=('#8fb8ff', (0.9, -0.2)))
    # Shadowed face opening inside the hood
    face = polygon_mask(S, S, [], ellipses=[(545, 330, 655, 455)])
    canvas = composite(canvas, face * 0.9, INK)
    canvas = energy_blade(canvas, 790, 770, 990, 1150, '#5ab8ff', core_width=13)
    # The blade lights the cloak beside it
    add_glow(canvas, 860, 900, 160, '#3a8fff', 0.35)
    return finish(canvas, rng)


def armoured_sentinel(seed=223):
    """An armoured sentinel with a visor, backlit by a red-lit city at night."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#05050c'), (0.55, '#1a0a14'), (1, '#3a0c10')])
    # City skyline with lit windows
    skyline = np.zeros((S, S), dtype=np.float32)
    lights = np.zeros((S, S), dtype=np.float32)
    x = 0
    while x < S:
        w = int(rng.integers(40, 120))
        top = int(rng.integers(560, 900))
        skyline[top:, x:x + w] = 1
        for _ in range(int(w * (S - top) / 600)):
            lx, ly = x + int(rng.integers(4, max(5, w - 4))), int(rng.integers(top + 6, S))
            lights[ly:ly + 3, lx:lx + 2] = rng.random() * 0.9
        x += w + int(rng.integers(0, 12))
    canvas = composite(canvas, skyline * 0.95, hex_rgb('#120609'))
    canvas = screen(canvas, blur(lights, 1)[..., None] * hex_rgb('#ff8a5a') * 2)
    canvas = screen(canvas, blur(skyline, 60)[..., None] * hex_rgb('#ff2a3a') * 0.25)
    add_glow(canvas, 600, 520, 420, '#ff3a4a', 0.45)
    canvas = screen(canvas, nebula(S, S, rng, [(0, '#200810'), (1, '#80202a')], strength=0.35, mask_bias=0.5))
    # Helmet with brow and cheek guards, layered armour and separate arms
    helmet = [(540, 240), (660, 240), (705, 290), (712, 390), (690, 450), (640, 490), (560, 490), (510, 450), (488, 390), (495, 290)]
    neck = [(555, 480), (645, 480), (655, 540), (545, 540)]
    chest = [(430, 560), (560, 530), (640, 530), (770, 560), (790, 700), (720, 840), (480, 840), (410, 700)]
    waist = [(490, 830), (710, 830), (700, 960), (500, 960)]
    hips = [(470, 950), (730, 950), (760, 1200), (440, 1200)]
    pauldron_l = [(330, 560), (450, 520), (500, 560), (470, 680), (340, 690)]
    pauldron_r = [(870, 560), (750, 520), (700, 560), (730, 680), (860, 690)]
    arm_l = [(345, 680), (450, 680), (430, 900), (440, 1040), (360, 1040), (330, 900)]
    arm_r = [(750, 680), (855, 680), (870, 900), (860, 1040), (780, 1040), (770, 900)]
    mask = polygon_mask(S, S, [helmet, neck, chest, waist, hips, pauldron_l, pauldron_r, arm_l, arm_r])
    canvas = figure(canvas, mask, '#ff5a5a', rim_dir=(0, -1), fill='#1a1c26', second_rim=('#ff8a5a', (-0.9, 0)))
    seams = polygon_mask(S, S, [], lines=[
        (600, 545, 600, 830, 3), (445, 690, 755, 690, 3), (490, 960, 710, 960, 10),
        (455, 700, 470, 900, 3), (745, 700, 730, 900, 3), (520, 300, 680, 300, 3),
    ])
    canvas = composite(canvas, seams * mask * 0.8, INK)
    belt_light = polygon_mask(S, S, [], ellipses=[(585, 945, 615, 975)])
    canvas = screen(canvas, blur(belt_light, 6)[..., None] * hex_rgb('#ff6a4a') * 1.4)
    visor = polygon_mask(S, S, [[(515, 360), (685, 360), (672, 395), (600, 405), (528, 395)]])
    canvas = screen(canvas, blur(visor, 14)[..., None] * hex_rgb('#ff4a3a') * 1.5)
    canvas = screen(canvas, visor[..., None] * hex_rgb('#ffd0b0'))
    return finish(canvas, rng)


def starfighter_pilot(seed=239):
    """A pilot in flight helmet and suit in a hangar, ships' lights behind."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#0a0d14'), (0.6, '#141a26'), (1, '#0a0c12')])
    # Hangar opening onto space, with a ringed bay frame
    bay = polygon_mask(S, S, [[(80, 120), (1120, 120), (1120, 640), (80, 640)]])
    space = screen(vertical_gradient(S, S, [(0, '#02030a'), (1, '#0a1230')]), starfield(S, S, rng, density=0.0012))
    space = screen(space, nebula(S, S, rng, [(0, '#0a1a40'), (1, '#3a7ad0')], strength=0.6))
    canvas = composite(canvas, bay, space)
    frame = polygon_mask(S, S, [], lines=[(80, 120, 1120, 120, 26), (80, 640, 1120, 640, 26), (80, 120, 80, 640, 26), (1120, 120, 1120, 640, 26)])
    canvas = composite(canvas, frame, hex_rgb('#1c2230'))
    for i in range(9):
        add_glow(canvas, 120 + i * 120, 120, 14, '#ffb35a', 0.9)
    floor = gradient(np.linspace(0, 1, S)[:, None].repeat(S, 1), [(0, '#000000'), (0.55, '#000000'), (0.56, '#1a2030'), (1, '#0a0c12')])
    canvas = screen(canvas, floor * 0.8)
    # Flight helmet, neck ring, broad shoulders and arms in an orange flight suit
    helmet = polygon_mask(S, S, [[(530, 330), (560, 270), (640, 270), (670, 330), (672, 420), (650, 470), (550, 470), (528, 420)]],
                          ellipses=[(525, 250, 675, 390)])
    neck_ring = [(535, 465), (665, 465), (680, 520), (520, 520)]
    torso = [(400, 560), (520, 515), (680, 515), (800, 560), (830, 700), (790, 1200), (410, 1200), (370, 700)]
    arm_l = [(365, 575), (420, 560), (450, 760), (430, 1000), (360, 1000), (345, 760)]
    arm_r = [(835, 575), (780, 560), (750, 760), (770, 1000), (840, 1000), (855, 760)]
    mask = np.maximum(helmet, polygon_mask(S, S, [neck_ring, torso, arm_l, arm_r]))
    canvas = figure(canvas, mask, '#ffb35a', rim_dir=(0.6, -0.8), fill='#5a2c12', second_rim=('#7fb0ff', (-0.9, -0.2)))
    # Wraparound visor with a reflection of the hangar lights
    visor = polygon_mask(S, S, [[(533, 335), (667, 335), (670, 385), (630, 405), (570, 405), (530, 385)]])
    visor_reflection = vertical_gradient(S, S, [(0, '#0a1830'), (0.29, '#3f7fc0'), (0.31, '#ffd09a'), (0.34, '#0a1428'), (1, '#05070e')])
    canvas = composite(canvas, visor * 0.95, visor_reflection)
    stripe = polygon_mask(S, S, [], lines=[(600, 255, 600, 330, 16)])
    canvas = composite(canvas, stripe * helmet * 0.8, hex_rgb('#d8d2c8'))
    ring = polygon_mask(S, S, [], lines=[(530, 492, 670, 492, 14)])
    canvas = composite(canvas, ring * 0.9, hex_rgb('#2a2f3a'))
    harness = polygon_mask(S, S, [], lines=[(480, 560, 640, 1200, 24), (720, 560, 560, 1200, 24), (420, 900, 780, 900, 20)])
    canvas = composite(canvas, harness * mask * 0.85, hex_rgb('#1c1812'))
    chest_box = polygon_mask(S, S, [[(560, 820), (640, 820), (640, 880), (560, 880)]])
    canvas = composite(canvas, chest_box * 0.9, hex_rgb('#2a2f3a'))
    for i, colour in enumerate(['#ff5a4a', '#5aff8a', '#5ab8ff']):
        add_glow(canvas, 575 + i * 25, 850, 6, colour, 0.9)
    badge = polygon_mask(S, S, [], ellipses=[(715, 640, 765, 690)])
    canvas = composite(canvas, badge, hex_rgb('#d0503a'))
    return finish(canvas, rng)


def utility_droid(seed=251):
    """A tall, slender utility droid in a teal-lit workshop."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#020a0c'), (0.6, '#06222a'), (1, '#031014')])
    add_glow(canvas, 900, 300, 380, '#2ad0c0', 0.35)
    # Workshop shelving and hanging cables in the background
    shelves = [(80 + i * 140, 200, 80 + i * 140 + 110, 1000) for i in range(3)]
    for x0, y0, x1, y1 in shelves:
        canvas = composite(canvas, polygon_mask(S, S, [[(x0, y0), (x1, y0), (x1, y1), (x0, y1)]]) * 0.6, hex_rgb('#041418'))
        for y in range(y0 + 40, y1, 90):
            add_glow(canvas, (x0 + x1) / 2, y, 6, '#4affe0' if rng.random() < 0.5 else '#ffb35a', 0.8)
    cables = polygon_mask(S, S, [], lines=[(860 + i * 50, 0, 880 + i * 45, 420 + i * 60, 5) for i in range(5)])
    canvas = composite(canvas, cables * 0.8, hex_rgb('#020608'))
    canvas = dust(canvas, rng, '#7affe8', count=350, y_min=0.0)
    # Droid: angular head, thin neck, ribbed torso, jointed arms
    head = [(560, 240), (700, 240), (730, 300), (700, 380), (560, 380), (530, 300)]
    neck = [(605, 380), (655, 380), (650, 450), (610, 450)]
    torso = [(500, 450), (760, 450), (790, 560), (740, 780), (520, 780), (470, 560)]
    hips = [(540, 780), (720, 780), (700, 860), (560, 860)]
    legs = [(560, 860), (610, 860), (600, 1200), (540, 1200)], [(650, 860), (700, 860), (720, 1200), (660, 1200)]
    arms = [(470, 470), (500, 470), (440, 720), (460, 900), (430, 905), (405, 720)], \
           [(760, 470), (790, 470), (855, 700), (900, 840), (875, 850), (825, 705)]
    mask = polygon_mask(S, S, [head, neck, torso, hips, *legs, *arms])
    canvas = figure(canvas, mask, '#4affe0', rim_dir=(0.8, -0.5), fill='#1a2a2e', second_rim=('#ffb35a', (-0.9, 0.1)))
    ribs = polygon_mask(S, S, [], lines=[(520, 500 + i * 45, 740, 500 + i * 45, 4) for i in range(6)])
    canvas = composite(canvas, ribs * mask * 0.7, INK)
    eye = polygon_mask(S, S, [], ellipses=[(605, 285, 655, 335)])
    canvas = screen(canvas, blur(eye, 18)[..., None] * hex_rgb('#4affe0') * 1.6)
    canvas = screen(canvas, eye[..., None] * hex_rgb('#e8fffa'))
    return finish(canvas, rng)


CHARACTERS = [hooded_wanderer, armoured_sentinel, starfighter_pilot, utility_droid]
