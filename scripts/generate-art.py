"""Renders the app's artwork into src/assets/images as WebP.

Every image is drawn procedurally from a fixed seed, so running this again
produces the same files. Needs Python 3 with numpy and Pillow (built with WebP).

    python scripts/generate-art.py            # everything
    python scripts/generate-art.py planets    # one group: hero, characters, planets, starships
"""
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'art'))

from common import save_webp, to_image  # noqa: E402
import characters  # noqa: E402
import ships  # noqa: E402
import worlds  # noqa: E402

OUT = os.path.join(HERE, '..', 'src', 'assets', 'images')

# Widths are chosen for where each image is shown:
# - cards are at most 300px (characters, planets) or 200px tall (starships),
#   so the small size covers 2x screens and the large one the description page
# - the hero is full width
GROUPS = {
    'hero': [('hero', worlds.hero_banner, (1280, 1920, 2880), 72)],
    'characters': [(f'character-{i + 1}', f, (600, 1200), 78) for i, f in enumerate(characters.CHARACTERS)],
    'planets': [(f'planet-{i + 1}', f, (600, 1200), 78)
                for i, f in enumerate([worlds.desert_world, worlds.ice_world, worlds.ocean_world])],
    'starships': [(f'starship-{i + 1}', f, (720, 1600), 78) for i, f in enumerate(ships.SHIPS)],
}


def main(selected):
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for group in selected:
        for name, render, widths, quality in GROUPS[group]:
            started = time.time()
            image = to_image(render())
            written = save_webp(image, os.path.join(OUT, name), widths, quality=quality)
            sizes = ', '.join(f'{w}px {os.path.getsize(p) // 1024} kB' for p, (w, _) in written.items())
            total += sum(os.path.getsize(p) for p in written)
            print(f'{name:<12} {sizes}  ({time.time() - started:.1f}s)')
    print(f'total {total // 1024} kB')


if __name__ == '__main__':
    main(sys.argv[1:] or list(GROUPS))
