# Star Wars Explorer

A fast, searchable guide to the Star Wars universe. Browse characters, planets, starships, films, species and vehicles, open any of them for details, and pick up where you left off with a recently viewed list. Data comes from the public [SWAPI](https://swapi.dev) API.

Live demo: https://starwars-deolaj.netlify.app

![Home page](screenshots/home.png)

## Who it's for

Star Wars fans who want a quick, good-looking way to look things up, and developers who want a small, readable example of React with Redux, routing and a paginated public API.

## Features

- Home page with featured items from every category
- Separate list pages for characters, planets, starships, films, species and vehicles, with pagination
- Search within each category or across everything at once
- Filter and sort each list, for example planets by climate or starships by class
- Shareable links: the search, page, filters and sorting all live in the URL, and the browser's back and forward buttons restore them
- Detail page for every item, with links to the items it relates to (a character's homeworld and starships, a film's cast)
- Recently viewed items, with next and previous to step through them
- Responses cached for a day, so a return visit loads without waiting
- Clear messages when a search finds nothing or cannot run, with a way to try again

| Planets                                    | Starships                                    | Detail page                                      |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| ![Planet list](screenshots/planet%20list.png) | ![Starships](screenshots/starships.png) | ![Star Destroyer](screenshots/star%20destroyer.png) |

## Built with

- [React 18](https://react.dev) with [Vite](https://vitejs.dev)
- [Redux Toolkit](https://redux-toolkit.js.org) with thunks for data fetching
- [React Router 6](https://reactrouter.com)
- [Sass](https://sass-lang.com) for styles
- [SWAPI](https://swapi.dev) for data, with [swapi.py4e.com](https://swapi.py4e.com) as a fallback mirror
- [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com) for the tests
- Hosted on [Netlify](https://www.netlify.com)

## Getting started

You need Node.js 18 or newer.

    git clone https://github.com/DeolaJ/star-wars.git
    cd star-wars
    npm install

No API keys or environment variables are needed.

### Development

    npm start

### Tests

    npm test          # watch mode
    npm run test:run  # single run

### Linting

    npm run lint

### Production build

    npm run build

### Artwork

The images in `src/assets/images` are original artwork drawn by `scripts/generate-art.py` (Python 3 with numpy and Pillow). Each image is rendered from a fixed seed, so running the script again reproduces the same files:

    python scripts/generate-art.py            # all artwork
    python scripts/generate-art.py starships  # one group: hero, characters, planets,
                                              # starships, films, species or vehicles

## Roadmap

Planned work lives in [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)
