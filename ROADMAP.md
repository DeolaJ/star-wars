# Roadmap

A rough plan for the work ahead. Estimates are approximate.

## Dependency upgrades (about 8 hours)

- [x] Move from Create React App 3 to Vite
- [x] React 16 to React 18, React Router 5 to 6
- [x] Redux to Redux Toolkit (`configureStore`); React Query for server state can come later
- [x] Replace `node-sass` with `sass` and drop the unmaintained `react-reveal`
- [x] Only include `redux-logger` in development builds

## Data and performance (about 5 hours)

- [x] Move the hard-coded `swapi.dev` URLs into one config value, with a fallback mirror (`swapi.py4e.com`) when the API is down
- [x] Load pages on demand instead of fetching every page of results up front
- [x] Cache responses between visits (localStorage, 24-hour expiry)
- [x] Lazy-load images and serve them as WebP

## Features (about 6 hours)

- [x] Add films, species and vehicles
- [ ] Link related items on the detail page (a character's homeworld and starships, a planet's residents)
- [ ] Filters and sorting (for example by planet climate or starship class)
- [ ] Shareable URLs that keep the search query and page

## Quality (about 6 hours)

- [x] Replace the default CRA test, which still looks for "learn react", with tests for the reducers, action creators and main pages
- [ ] Accessibility pass on search, pagination and the slider (the `jsx-a11y` lint rules are already on)
- [ ] Error and empty states for failed or empty searches
- [ ] GitHub Actions workflow for lint, tests and build
