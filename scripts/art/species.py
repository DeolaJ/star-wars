"""Species: four body plans as rim-lit portraits, in the same square format
as the character art so the two sit together on a card.
"""
import numpy as np

from common import (
    rng_for, starfield, nebula, finish, polygon_mask, composite, rim_light,
    add_glow, screen, vertical_gradient, value_noise, hex_rgb, blur,
)
from characters import figure, dust, S, INK


def humanoid(seed=401):
    """A tall humanoid in travelling robes against a misty green valley."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#07140f'), (0.42, '#16402e'), (0.66, '#4f8a5a'), (1, '#0b1a12')])
    add_glow(canvas, 880, 330, 120, '#e8ffd8', 0.85)
    add_glow(canvas, 880, 330, 420, '#7fd08a', 0.35)
    # Layered hills receding into haze
    xx = np.arange(S, dtype=np.float32)
    for base, amp, freq, tone in ((640, 48, 0.0035, 0.30), (730, 36, 0.0052, 0.50), (830, 28, 0.0074, 0.72)):
        line = base + amp * np.sin(xx * freq * np.pi + base)
        hill = (np.arange(S)[:, None] > line[None, :]).astype(np.float32)
        canvas = composite(canvas, blur(hill, 3), hex_rgb('#0d2418') * (1 + tone))
    canvas = dust(canvas, rng, '#cfffd8', count=420, y_min=0.25)
    head = [(566, 262), (646, 262), (676, 318), (666, 392), (600, 424), (540, 392), (532, 318)]
    neck = [(578, 412), (634, 412), (642, 462), (570, 462)]
    robe = [(452, 476), (560, 440), (652, 440), (762, 476), (806, 700), (836, 1200), (372, 1200), (404, 700)]
    arm_l = [(400, 492), (452, 476), (424, 720), (438, 930), (370, 938), (352, 724)]
    arm_r = [(812, 492), (760, 476), (788, 720), (774, 930), (842, 938), (860, 724)]
    mask = polygon_mask(S, S, [head, neck, robe, arm_l, arm_r])
    canvas = figure(canvas, mask, '#b8ffb0', rim_dir=(0.8, -0.5), fill='#16241c',
                    second_rim=('#ffd79a', (-0.9, -0.2)))
    folds = polygon_mask(S, S, [], lines=[
        (560, 470, 520, 1200, 5), (640, 470, 690, 1200, 5), (600, 460, 600, 1200, 4),
        (470, 560, 760, 548, 4),
    ])
    canvas = composite(canvas, folds * mask * 0.7, INK)
    for dx in (-26, 26):
        eye = polygon_mask(S, S, [], ellipses=[(600 + dx - 15, 330, 600 + dx + 15, 352)])
        canvas = screen(canvas, blur(eye, 10)[..., None] * hex_rgb('#d8ffb0') * 1.5)
        canvas = screen(canvas, eye[..., None] * hex_rgb('#f2ffe8'))
    return finish(canvas, rng)


def reptilian(seed=419):
    """A crested reptilian in a humid swamp, lit from below by water."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#0a1004'), (0.5, '#1e3208'), (0.78, '#3f5a12'), (1, '#07140a')])
    canvas = screen(canvas, nebula(S, S, rng, [(0, '#0a1a06'), (1, '#6a9a2a')], strength=0.3, mask_bias=0.55))
    add_glow(canvas, 600, 1010, 300, '#8ad04a', 0.45)
    # Reeds in front of a low mist band
    reeds = polygon_mask(S, S, [], lines=[
        (90 + i * 63, int(1200), 70 + i * 63 + int(rng.integers(-28, 28)), int(rng.integers(560, 830)), 7)
        for i in range(19)])
    canvas = composite(canvas, reeds * 0.85, hex_rgb('#09170a'))
    canvas = dust(canvas, rng, '#b0ff8a', count=360, y_min=0.4)
    # Long snout, swept cranial crest, heavy shoulders
    snout = [(470, 356), (396, 392), (392, 428), (476, 434)]
    head = [(470, 300), (628, 288), (672, 338), (660, 418), (560, 452), (470, 434)]
    crest = [(628, 292), (820, 196), (872, 240), (808, 300), (672, 344)]
    neck = [(600, 436), (676, 428), (700, 512), (588, 520)]
    torso = [(452, 530), (616, 500), (720, 512), (812, 568), (842, 744), (800, 1200), (398, 1200), (378, 718)]
    arm_l = [(392, 560), (452, 534), (418, 760), (438, 940), (364, 948), (338, 762)]
    arm_r = [(830, 584), (766, 548), (800, 772), (782, 946), (856, 952), (880, 778)]
    tail = [(398, 1040), (300, 1104), (196, 1200), (386, 1200)]
    mask = polygon_mask(S, S, [snout, head, crest, neck, torso, arm_l, arm_r, tail])
    canvas = figure(canvas, mask, '#aaff5a', rim_dir=(-0.3, 0.95), fill='#1b2a12',
                    second_rim=('#7fd0ff', (0.6, -0.8)))
    scales = polygon_mask(S, S, [], lines=[(452 + i * 14, 520, 430 + i * 14, 1180, 3) for i in range(26)])
    canvas = composite(canvas, scales * mask * 0.35, INK)
    ridge = polygon_mask(S, S, [], lines=[(640, 300, 824, 212, 7), (628, 330, 806, 262, 5)])
    canvas = composite(canvas, ridge * mask * 0.8, INK)
    eye = polygon_mask(S, S, [], ellipses=[(506, 348, 552, 380)])
    canvas = screen(canvas, blur(eye, 12)[..., None] * hex_rgb('#ffd24a') * 1.6)
    canvas = screen(canvas, eye[..., None] * hex_rgb('#fff4c8'))
    nostril = polygon_mask(S, S, [], ellipses=[(404, 396, 422, 410)])
    canvas = composite(canvas, nostril * 0.8, INK)
    return finish(canvas, rng)


def insectoid(seed=433):
    """A chitinous insectoid with compound eyes in a violet hive."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#0a0418'), (0.5, '#1e0a38'), (1, '#080212')])
    add_glow(canvas, 300, 260, 220, '#b06aff', 0.4)
    add_glow(canvas, 920, 760, 260, '#ff6ad0', 0.3)
    # Hexagonal hive cells behind the figure
    def hexagon(cx, cy, r):
        angles = np.linspace(0, 2 * np.pi, 7)[:-1] + np.pi / 6
        return [(cx + r * np.cos(a), cy + r * np.sin(a)) for a in angles]

    centres = [(90 + col * 150 + (row % 2) * 75, 80 + row * 136)
               for row in range(9) for col in range(8)]
    # The wall of each cell is the hexagon minus a smaller one sharing its centre
    hive = polygon_mask(S, S, [hexagon(cx, cy, 62) for cx, cy in centres])
    inner = polygon_mask(S, S, [hexagon(cx, cy, 52) for cx, cy in centres])
    walls = np.clip(hive - inner, 0, 1)
    canvas = composite(canvas, walls * 0.6, hex_rgb('#2a0f4a'))
    canvas = screen(canvas, blur(walls, 8)[..., None] * hex_rgb('#8a3aff') * 0.5)
    canvas = dust(canvas, rng, '#e0a0ff', count=420, y_min=0.0)
    # Narrow head, antennae, segmented thorax and four arms
    head = [(548, 282), (652, 282), (684, 342), (656, 430), (600, 456), (544, 430), (516, 342)]
    ant_l = [(556, 288), (470, 150), (444, 118), (462, 104), (496, 142), (584, 276)]
    ant_r = [(644, 288), (730, 150), (756, 118), (738, 104), (704, 142), (616, 276)]
    thorax = [(498, 470), (702, 470), (742, 600), (712, 790), (488, 790), (458, 600)]
    abdomen = [(500, 782), (700, 782), (742, 1000), (600, 1200), (458, 1000)]
    arm_ul = [(470, 512), (512, 496), (396, 700), (330, 836), (296, 818), (386, 668)]
    arm_ur = [(730, 512), (688, 496), (804, 700), (870, 836), (904, 818), (814, 668)]
    arm_ll = [(474, 640), (508, 628), (424, 820), (398, 962), (364, 956), (414, 804)]
    arm_lr = [(726, 640), (692, 628), (776, 820), (802, 962), (836, 956), (786, 804)]
    mask = polygon_mask(S, S, [head, ant_l, ant_r, thorax, abdomen, arm_ul, arm_ur, arm_ll, arm_lr])
    canvas = figure(canvas, mask, '#d08aff', rim_dir=(-0.75, -0.6), fill='#1e1030',
                    second_rim=('#ff8ad0', (0.85, 0.3)))
    segments = polygon_mask(S, S, [], lines=[(470, 820 + i * 52, 730, 820 + i * 52, 6) for i in range(5)]
                            + [(466, 540 + i * 62, 734, 540 + i * 62, 5) for i in range(4)])
    canvas = composite(canvas, segments * mask * 0.75, INK)
    for dx in (-40, 40):
        eye = polygon_mask(S, S, [], ellipses=[(600 + dx - 34, 316, 600 + dx + 34, 386)])
        canvas = screen(canvas, blur(eye, 14)[..., None] * hex_rgb('#ff4ad0') * 1.5)
        canvas = screen(canvas, eye[..., None] * hex_rgb('#ffd8f4') * 0.95)
        facets = polygon_mask(S, S, [], lines=[(600 + dx - 34, 330 + i * 14, 600 + dx + 34, 330 + i * 14, 2)
                                               for i in range(5)])
        canvas = composite(canvas, facets * eye * 0.6, INK)
    return finish(canvas, rng)


def artificial(seed=449):
    """A constructed being: plated panels over a lit internal frame."""
    rng = rng_for(seed)
    canvas = vertical_gradient(S, S, [(0, '#060a10'), (0.55, '#0c1620'), (1, '#04070c')])
    add_glow(canvas, 600, 420, 420, '#4a9aff', 0.28)
    # Foundry gantries and hanging chains behind
    gantry = polygon_mask(S, S, [], lines=[
        (0, 220, 1200, 190, 16), (0, 470, 1200, 440, 12),
        (150, 0, 150, 1200, 10), (1050, 0, 1050, 1200, 10),
    ])
    canvas = composite(canvas, gantry * 0.7, hex_rgb('#070d14'))
    chains = polygon_mask(S, S, [], lines=[(220 + i * 128, 190, 232 + i * 128, 430 + i * 30, 4) for i in range(8)])
    canvas = composite(canvas, chains * 0.8, hex_rgb('#050a10'))
    for i in range(6):
        add_glow(canvas, 180 + i * 190, 196, 10, '#ffa54a', 0.8)
    canvas = dust(canvas, rng, '#8ac4ff', count=380, y_min=0.0)
    # Faceted head, exposed spine, plated chest and jointed limbs
    head = [(548, 268), (652, 268), (680, 320), (672, 392), (600, 428), (528, 392), (520, 320)]
    jaw = [(556, 400), (644, 400), (632, 452), (568, 452)]
    chest = [(466, 486), (560, 456), (640, 456), (734, 486), (772, 636), (724, 800), (476, 800), (428, 636)]
    pelvis = [(498, 792), (702, 792), (684, 898), (516, 898)]
    leg_l = [(516, 890), (596, 890), (584, 1200), (498, 1200)]
    leg_r = [(604, 890), (684, 890), (702, 1200), (616, 1200)]
    arm_l = [(430, 506), (478, 492), (414, 718), (436, 904), (368, 912), (342, 722)]
    arm_r = [(770, 506), (722, 492), (786, 718), (764, 904), (832, 912), (858, 722)]
    mask = polygon_mask(S, S, [head, jaw, chest, pelvis, leg_l, leg_r, arm_l, arm_r])
    canvas = figure(canvas, mask, '#6ab8ff', rim_dir=(-0.6, -0.8), fill='#222a34',
                    second_rim=('#ffb04a', (0.9, 0.1)))
    # Panel seams, then a lit core showing through the gaps
    seams = polygon_mask(S, S, [], lines=[
        (600, 466, 600, 792, 5), (440, 636, 760, 636, 5), (500, 540, 700, 540, 4),
        (486, 726, 714, 726, 4), (540, 290, 660, 290, 4), (600, 268, 600, 400, 3),
        (430, 720, 450, 900, 4), (770, 720, 750, 900, 4),
    ])
    canvas = composite(canvas, seams * mask * 0.85, INK)
    core = polygon_mask(S, S, [], ellipses=[(556, 576, 644, 664)])
    canvas = screen(canvas, blur(core, 24)[..., None] * hex_rgb('#4a9aff') * 1.7)
    canvas = screen(canvas, core[..., None] * hex_rgb('#d8ecff'))
    ribs = polygon_mask(S, S, [], lines=[(528, 820 + i * 22, 672, 820 + i * 22, 6) for i in range(4)])
    canvas = screen(canvas, blur(ribs * mask, 5)[..., None] * hex_rgb('#4a9aff') * 0.8)
    visor = polygon_mask(S, S, [[(534, 320), (666, 320), (656, 362), (544, 362)]])
    canvas = screen(canvas, blur(visor, 16)[..., None] * hex_rgb('#5aa8ff') * 1.6)
    canvas = screen(canvas, visor[..., None] * hex_rgb('#e8f4ff'))
    return finish(canvas, rng)


SPECIES = [humanoid, reptilian, insectoid, artificial]
