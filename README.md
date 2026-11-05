# Star Wars Explorer

A fast, searchable guide to the Star Wars universe. Browse characters, planets and starships, open any of them for details, and pick up where you left off with a recently viewed list. Data comes from the public [SWAPI](https://swapi.dev) API.

Live demo: https://starwars-deolaj.netlify.app

![Home page](screenshots/home.png)

## Who it's for

Star Wars fans who want a quick, good-looking way to look things up, and developers who want a small, readable example of React with Redux, routing and a paginated public API.

## Features

- Home page with featured characters, planets and starships
- Separate list pages for characters, planets and starships, with pagination
- Search within each category or across everything at once
- Detail page for every item
- Recently viewed items, kept between visits

| Planets                                    | Starships                                    | Detail page                                      |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------ |
| ![Planet list](screenshots/planet%20list.png) | ![Starships](screenshots/starships.png) | ![Star Destroyer](screenshots/star%20destroyer.png) |

## Built with

- [React 18](https://react.dev) with [Vite](https://vitejs.dev)
- [Redux Toolkit](https://redux-toolkit.js.org) with thunks for data fetching
- [React Router 6](https://reactrouter.com)
- [Sass](https://sass-lang.com) for styles
- [SWAPI](https://swapi.dev) for data, with [swapi.py4e.com](https://swapi.py4e.com) as a fallback mirror
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

## Roadmap

Planned work lives in [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)
