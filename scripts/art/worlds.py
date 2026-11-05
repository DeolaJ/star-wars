"""Planets and the hero banner."""
import numpy as np

from common import (
    rng_for, starfield, nebula, finish, sphere, paste_sphere, surface_texture,
    add_glow, screen, vertical_gradient, hex_rgb,
)

SIZE = 1200


def space_backdrop(w, h, rng, stops, nebula_strength=0.7, density=0.0011):
    sky = vertical_gradient(w, h, [(0, '#03040b'), (1, '#070a18')])
    sky = screen(sky, nebula(w, h, rng, stops, strength=nebula_strength))
    return screen(sky, starfield(w, h, rng, density=density))


def desert_world(seed=11):
    """Arid world under twin suns: dunes, salt flats and a thin amber haze."""
    rng = rng_for(seed)
    canvas = space_backdrop(SIZE, SIZE, rng, [(0, '#1a0c06'), (0.5, '#5a2a12'), (1, '#c46a2a')], 0.55)
    add_glow(canvas, 140, 170, 46, '#fff2d6', 1.0)
    add_glow(canvas, 140, 170, 160, '#ffb36b', 0.45)
    add_glow(canvas, 235, 120, 26, '#ffe0b0', 0.95)
    add_glow(canvas, 235, 120, 110, '#ff9a55', 0.35)
    tex = surface_texture(rng, [(0, '#5c3416'), (0.35, '#9c6430'), (0.6, '#d3a066'), (0.8, '#e8c48d'), (1, '#f4dfb6')],
                          bands=0.35, band_freq=14, base=5)
    planet = sphere(900, rng, tex, light=(-0.75, -0.6, 0.45), atmosphere='#ffb978', atmo_strength=0.7, spin=0.6)
    paste_sphere(canvas, planet, 690, 690, atmosphere='#ffb978')
    moon_tex = surface_texture(rng, [(0, '#3d3a38'), (0.6, '#8a8580'), (1, '#c9c3bb')], base=8)
    paste_sphere(canvas, sphere(120, rng, moon_tex, light=(-0.8, -0.5, 0.4), atmosphere='#000000', atmo_strength=0),
                 250, 900, atmosphere='#000000')
    return finish(canvas, rng)


def ice_world(seed=23):
    """Frozen world with fractured ice sheets and a cold blue atmosphere."""
    rng = rng_for(seed)
    canvas = space_backdrop(SIZE, SIZE, rng, [(0, '#050b1c'), (0.5, '#123a66'), (1, '#4fa0d6')], 0.6)
    tex = surface_texture(rng, [(0, '#5d7f9e'), (0.35, '#a9c6dc'), (0.7, '#e3eef6'), (1, '#ffffff')],
                          ridged=True, base=7, clouds='#f4f8ff', cloud_cover=0.62)
    planet = sphere(880, rng, tex, light=(0.7, -0.55, 0.5), atmosphere='#a8dcff', atmo_strength=1.0, spin=2.1)
    paste_sphere(canvas, planet, 560, 640, atmosphere='#a8dcff')
    add_glow(canvas, 1060, 140, 60, '#e8f4ff', 0.9)
    add_glow(canvas, 1060, 140, 220, '#7fb8ff', 0.3)
    return finish(canvas, rng)


def ocean_world(seed=37):
    """Temperate ocean world with green continents and storm clouds."""
    rng = rng_for(seed)
    canvas = space_backdrop(SIZE, SIZE, rng, [(0, '#07051a'), (0.5, '#2c1a5c'), (1, '#7b4fc0')], 0.55)
    tex = surface_texture(rng, [(0, '#06204a'), (0.5, '#0d4a86'), (0.56, '#1f7a9a'), (0.6, '#3e7d3a'),
                                (0.75, '#5f8f3e'), (0.9, '#8a8a5a'), (1, '#d8d6c8')],
                          base=4, clouds='#f2f6ff', cloud_cover=0.5)
    planet = sphere(940, rng, tex, light=(-0.4, -0.7, 0.6), atmosphere='#7cc4ff', atmo_strength=1.1, spin=4.0)
    paste_sphere(canvas, planet, 620, 660, atmosphere='#7cc4ff')
    moon_tex = surface_texture(rng, [(0, '#4a4038'), (0.6, '#9b8e7e'), (1, '#d9cfbf')], base=8)
    paste_sphere(canvas, sphere(150, rng, moon_tex, light=(-0.4, -0.7, 0.6), atmosphere='#000000', atmo_strength=0),
                 190, 230, atmosphere='#000000')
    return finish(canvas, rng)


def hero_banner(seed=5, w=2880, h=1240):
    """Wide panorama: nebula, a ringed gas giant rising on the right, far suns."""
    rng = rng_for(seed)
    canvas = vertical_gradient(w, h, [(0, '#02030a'), (0.6, '#05071a'), (1, '#0b0d22')])
    canvas = screen(canvas, nebula(w, h, rng, [(0, '#0a0f3a'), (0.45, '#3a1f6e'), (0.75, '#b0457a'), (1, '#ffb27a')],
                                   strength=0.75, scale=3, mask_bias=0.4))
    canvas = screen(canvas, starfield(w, h, rng, density=0.0012))
    tex = surface_texture(rng, [(0, '#3a1e12'), (0.3, '#7a3f22'), (0.55, '#c47a43'), (0.75, '#e8b27a'), (1, '#f6dcb4')],
                          bands=0.75, band_freq=22, base=3)
    giant = sphere(1500, rng, tex, light=(-0.85, -0.35, 0.4), atmosphere='#ffc08a', atmo_strength=0.8, spin=1.2)
    cx, cy = 2350, 1020
    # A tilted ring system: the far half is drawn before the planet and the near
    # half after it, so the rings pass behind the top and across the face
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    angle = np.radians(-14)
    lx = (xx - cx) * np.cos(angle) - (yy - cy) * np.sin(angle)
    ly = (xx - cx) * np.sin(angle) + (yy - cy) * np.cos(angle)
    rd = np.sqrt((lx / 1250) ** 2 + (ly / 210) ** 2)
    ring = np.clip(1 - np.abs(rd - 1) / 0.16, 0, 1) ** 1.2
    ring *= 0.35 + 0.65 * (0.5 + 0.5 * np.sin(rd * 140)) * (0.6 + 0.4 * np.sin(rd * 37))
    ring_colour = hex_rgb('#f0cc9c')
    canvas = screen(canvas, (ring * (ly < 0))[..., None] * ring_colour * 0.6)
    paste_sphere(canvas, giant, cx, cy, atmosphere='#ffc08a')
    # The planet casts a shadow on the near rings behind it from the light
    on_disc = ((xx - cx) ** 2 + (yy - cy) ** 2) < 750 ** 2
    near = ring * (ly >= 0)
    near_shade = np.where(on_disc & (xx > cx + 150), 0.35, 1.0)
    canvas = screen(canvas, (near * near_shade)[..., None] * ring_colour * 0.75)
    add_glow(canvas, 420, 260, 30, '#fff6e8', 1.0)
    add_glow(canvas, 420, 260, 180, '#ff9f6b', 0.35)
    # Darken the left/centre a little so the logo and search text stay readable
    shade = np.clip(1 - xx / w * 1.2, 0, 1) ** 2 * 0.25
    canvas = canvas * (1 - shade[..., None])
    return finish(canvas, rng, vignette=0.45)
