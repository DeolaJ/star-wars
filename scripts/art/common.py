"""Shared helpers for the procedural artwork: noise, starfields, nebulae,
planets, glows and the finishing pass (grain, vignette).

Everything works on float32 RGB arrays in the 0..1 range, shaped (h, w, 3).
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def rng_for(seed):
    return np.random.default_rng(seed)


def to_image(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')


def from_image(img):
    return np.asarray(img.convert('RGB'), dtype=np.float32) / 255


def hex_rgb(value):
    value = value.lstrip('#')
    return np.array([int(value[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


def blur(arr, radius):
    """Gaussian blur of a 2-D mask or an RGB array."""
    if arr.ndim == 2:
        img = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8), 'L')
        return np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255
    return from_image(to_image(arr).filter(ImageFilter.GaussianBlur(radius)))


def value_noise(w, h, rng, octaves=6, base=4, persistence=0.55):
    """Fractal noise made by upscaling random grids; returns (h, w) in 0..1."""
    total = np.zeros((h, w), dtype=np.float32)
    amplitude, norm = 1.0, 0.0
    for octave in range(octaves):
        cells = base * (2 ** octave)
        grid = rng.random((max(2, int(cells * h / w)) + 1, cells + 1)).astype(np.float32)
        layer = Image.fromarray((grid * 255).astype(np.uint8), 'L').resize((w, h), Image.BICUBIC)
        total += np.asarray(layer, dtype=np.float32) / 255 * amplitude
        norm += amplitude
        amplitude *= persistence
    total /= norm
    total -= total.min()
    return total / max(total.max(), 1e-6)


def gradient(values, stops):
    """Maps a 0..1 array through colour stops [(position, '#rrggbb'), ...]."""
    positions = np.array([p for p, _ in stops], dtype=np.float32)
    colours = np.stack([hex_rgb(c) for _, c in stops])
    out = np.empty(values.shape + (3,), dtype=np.float32)
    for channel in range(3):
        out[..., channel] = np.interp(values, positions, colours[:, channel])
    return out


def vertical_gradient(w, h, stops):
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None].repeat(w, axis=1)
    return gradient(t, stops)


def screen(base, layer):
    return 1 - (1 - base) * (1 - np.clip(layer, 0, 1))


def add_glow(canvas, x, y, radius, colour, strength=1.0, falloff=2.2):
    """Soft additive radial glow centred on (x, y)."""
    h, w, _ = canvas.shape
    x0, x1 = max(0, int(x - radius * 3)), min(w, int(x + radius * 3))
    y0, y1 = max(0, int(y - radius * 3)), min(h, int(y + radius * 3))
    if x0 >= x1 or y0 >= y1:
        return canvas
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    d = np.sqrt((xx - x) ** 2 + (yy - y) ** 2) / radius
    glow = np.exp(-d ** falloff) * strength
    canvas[y0:y1, x0:x1] = screen(canvas[y0:y1, x0:x1], glow[..., None] * hex_rgb(colour))
    return canvas


def starfield(w, h, rng, density=0.0009, bright=1.0, tint=True):
    """Stars of varying size and colour on a black (h, w, 3) layer."""
    layer = np.zeros((h, w, 3), dtype=np.float32)
    count = int(w * h * density)
    xs = rng.integers(0, w, count)
    ys = rng.integers(0, h, count)
    mags = rng.random(count) ** 3.5
    palette = [hex_rgb('#ffffff'), hex_rgb('#cfe0ff'), hex_rgb('#ffe7c4'), hex_rgb('#bcd2ff')]
    colours = np.stack([palette[i] for i in rng.integers(0, len(palette) if tint else 1, count)])
    layer[ys, xs] = colours * (0.25 + 0.75 * mags[:, None]) * bright
    # A few brighter stars get a halo and a faint cross flare
    halo = blur(layer, 1.2) * 2.2
    layer = screen(layer, halo)
    for i in np.argsort(mags)[-max(3, count // 400):]:
        add_glow(layer, xs[i], ys[i], 2.5 + mags[i] * 5, '#dfe8ff', 0.9)
        length = int(10 + mags[i] * 40)
        for dx, dy in ((1, 0), (0, 1)):
            for t in range(-length, length + 1):
                px, py = xs[i] + t * dx, ys[i] + t * dy
                if 0 <= px < w and 0 <= py < h:
                    layer[py, px] = screen(layer[py, px], 0.45 * (1 - abs(t) / length) ** 2)
    return layer


def nebula(w, h, rng, stops, strength=0.85, scale=3, mask_bias=0.45):
    """Wispy coloured cloud layer, transparent where the mask is low."""
    shape = value_noise(w, h, rng, octaves=7, base=scale)
    detail = value_noise(w, h, rng, octaves=6, base=scale * 2)
    density = np.clip((shape * 0.7 + detail * 0.3 - mask_bias) / (1 - mask_bias), 0, 1) ** 1.6
    colour = gradient(np.clip(detail * 0.6 + shape * 0.4, 0, 1), stops)
    return colour * density[..., None] * strength


def finish(arr, rng, grain=0.012, vignette=0.55):
    """Film grain and a vignette, shared by every image for a consistent look."""
    h, w, _ = arr.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / math.sqrt(2)
    arr = arr * (1 - vignette * d[..., None] ** 2.2)
    # Slightly softened monochrome grain: enough texture to avoid banding in the
    # dark gradients, without the per-pixel noise that WebP compresses badly
    noise = rng.normal(0, 1, (h, w)).astype(np.float32)
    noise = blur(np.clip(noise * 0.15 + 0.5, 0, 1), 0.6) - 0.5
    arr = arr + (noise * grain / 0.15)[..., None]
    return np.clip(arr, 0, 1)


def sphere(size, rng, texture, light=(-0.55, -0.45, 0.7), atmosphere='#9fd0ff',
           atmo_strength=0.9, ambient=0.04, spin=0.0):
    """Lit planet of diameter `size`, returned with its alpha mask.

    `texture(lon, lat)` returns (h, w, 3) surface colours for longitude/latitude
    arrays in radians.
    """
    r = size / 2
    full = int(size * 1.3)
    c = full / 2
    yy, xx = np.mgrid[0:full, 0:full].astype(np.float32)
    nx, ny = (xx - c + 0.5) / r, (yy - c + 0.5) / r
    d2 = nx ** 2 + ny ** 2
    inside = d2 <= 1
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    # Only the visible hemisphere is textured (longitude -90..90 degrees), so a
    # non-tiling texture never shows a wrap-around seam. `spin` shifts which
    # part of the texture faces the viewer.
    lon = np.arctan2(nx, np.maximum(nz, 1e-6))
    lat = np.arcsin(np.clip(ny, -1, 1))
    surface = texture(lon, lat, spin)
    lx, ly, lz = light
    norm = math.sqrt(lx * lx + ly * ly + lz * lz)
    diffuse = np.clip((nx * lx + ny * ly + nz * lz) / norm, 0, 1)
    shade = ambient + (1 - ambient) * diffuse ** 0.9
    colour = surface * shade[..., None]
    # Atmosphere: brighter towards the limb on the lit side
    rim = np.clip((np.sqrt(d2) - 0.55) / 0.45, 0, 1) ** 2.5
    lit = np.clip((nx * lx + ny * ly) / math.sqrt(lx * lx + ly * ly) * 0.5 + 0.6, 0, 1)
    colour = screen(colour, rim[..., None] * lit[..., None] * hex_rgb(atmosphere) * atmo_strength)
    alpha = np.clip((1 - np.sqrt(d2)) * r / 1.5, 0, 1)
    # Outer glow beyond the disc
    halo = np.clip(1 - (np.sqrt(d2) - 1) / 0.08, 0, 1) * (np.sqrt(d2) > 1) * lit * 0.6
    return colour * inside[..., None], alpha, halo


def paste_sphere(canvas, sphere_parts, cx, cy, atmosphere='#9fd0ff'):
    colour, alpha, halo = sphere_parts
    size = colour.shape[0]
    h, w, _ = canvas.shape
    x0, y0 = int(cx - size / 2), int(cy - size / 2)
    sx0, sy0 = max(0, -x0), max(0, -y0)
    sx1, sy1 = min(size, w - x0), min(size, h - y0)
    if sx0 >= sx1 or sy0 >= sy1:
        return canvas
    region = canvas[y0 + sy0:y0 + sy1, x0 + sx0:x0 + sx1]
    a = alpha[sy0:sy1, sx0:sx1, None]
    region[:] = region * (1 - a) + colour[sy0:sy1, sx0:sx1] * a
    glow = blur(halo, max(2, size / 90))[sy0:sy1, sx0:sx1, None] * hex_rgb(atmosphere)
    region[:] = screen(region, glow)
    return canvas


def surface_texture(rng, stops, w=1024, h=512, octaves=7, base=6, bands=0.0, band_freq=9,
                    clouds=None, cloud_cover=0.55, ridged=False):
    """Returns a texture(lon, lat) function built from fractal noise."""
    n = value_noise(w, h, rng, octaves=octaves, base=base)
    if ridged:
        n = 1 - np.abs(n * 2 - 1)
    if bands:
        lat_axis = np.linspace(-1, 1, h, dtype=np.float32)[:, None]
        n = np.clip(n * (1 - bands) + bands * (0.5 + 0.5 * np.sin(lat_axis * band_freq + n * 3)), 0, 1)
    tex = gradient(n, stops)
    if clouds:
        c = value_noise(w, h, rng, octaves=7, base=5)
        cover = np.clip((c - cloud_cover) / (1 - cloud_cover), 0, 1) ** 0.8
        tex = tex * (1 - cover[..., None]) + hex_rgb(clouds) * cover[..., None]

    def texture(lon, lat, spin=0.0):
        # Half of the texture spans the visible hemisphere; spin picks the offset
        offset = (spin % 1) * (w / 2 - 1)
        u = (lon / math.pi + 0.5) * (w / 2 - 1) + offset
        v = (lat / math.pi + 0.5) * (h - 1)
        return tex[v.astype(int).clip(0, h - 1), u.astype(int).clip(0, w - 1)]

    return texture


def polygon_mask(w, h, polygons, ss=3, ellipses=(), lines=()):
    """Anti-aliased mask from polygons, ellipses and thick lines (in pixels)."""
    img = Image.new('L', (w * ss, h * ss), 0)
    draw = ImageDraw.Draw(img)
    for poly in polygons:
        draw.polygon([(x * ss, y * ss) for x, y in poly], fill=255)
    for x0, y0, x1, y1 in ellipses:
        draw.ellipse([x0 * ss, y0 * ss, x1 * ss, y1 * ss], fill=255)
    for (x0, y0, x1, y1, width) in lines:
        draw.line([x0 * ss, y0 * ss, x1 * ss, y1 * ss], fill=255, width=int(width * ss))
    img = img.resize((w, h), Image.LANCZOS)
    return np.asarray(img, dtype=np.float32) / 255


def composite(canvas, mask, colour):
    """Paints `colour` (RGB vector or (h, w, 3) array) through `mask`."""
    m = mask[..., None]
    return canvas * (1 - m) + colour * m


def rim_light(mask, dx, dy, colour, width=6, strength=1.0):
    """Glowing edge on the side of a silhouette facing (dx, dy)."""
    h, w = mask.shape
    shifted = np.zeros_like(mask)
    sx, sy = int(round(dx * width)), int(round(dy * width))
    ys = slice(max(0, sy), h + min(0, sy))
    yd = slice(max(0, -sy), h + min(0, -sy))
    xs = slice(max(0, sx), w + min(0, sx))
    xd = slice(max(0, -sx), w + min(0, -sx))
    shifted[yd, xd] = mask[ys, xs]
    edge = np.clip(mask - shifted, 0, 1)
    edge = blur(edge, width * 0.35) * 1.6
    return np.clip(edge * mask, 0, 1)[..., None] * hex_rgb(colour) * strength


def save_webp(arr_or_img, path, widths, quality=80):
    """Writes one WebP per width (keeping the aspect ratio); returns file sizes."""
    img = arr_or_img if isinstance(arr_or_img, Image.Image) else to_image(arr_or_img)
    sizes = {}
    for width in widths:
        height = round(img.height * width / img.width)
        out = img.resize((width, height), Image.LANCZOS) if width != img.width else img
        target = f'{path}-{width}.webp'
        out.save(target, 'WEBP', quality=quality, method=6)
        sizes[target] = out.size
    return sizes
