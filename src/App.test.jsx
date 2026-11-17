import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './connect-App';
import configureAppStore from './modules/store';
import { defaultState } from './app/reducers';
import { API_ENDPOINTS } from './config';
import { mockFetch, fetchedUrls, mirrorUrl } from './test/fixtures';

// The current path, so a test can check the URL moved with the content
// Shows where the router is, and steps through its history the way the
// browser's back and forward buttons do
const LocationProbe = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <span data-testid="location">{pathname}</span>
      <span data-testid="search">{search}</span>
      <button type="button" data-testid="go-back" onClick={() => navigate(-1)}>back</button>
      <button type="button" data-testid="go-forward" onClick={() => navigate(1)}>forward</button>
    </>
  );
};

const renderApp = (route = '/') => {
  const store = configureAppStore({ app: { ...defaultState } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
        <LocationProbe />
      </MemoryRouter>
    </Provider>
  );
  return store;
};

const page = (resource, n) => `${API_ENDPOINTS[resource]}?page=${n}`;
const firstPages = ['characters', 'planets', 'starships', 'films', 'species', 'vehicles'].map(r => page(r, 1));

describe('App', () => {
  it('fetches only the first page of each resource on load and renders the home route', async () => {
    const fetchSpy = mockFetch();
    const store = renderApp('/');

    expect(await screen.findByText('Popular Characters')).toBeInTheDocument();
    expect(screen.getByText('Popular Planets')).toBeInTheDocument();
    expect(screen.getByText('X-wing')).toBeInTheDocument();
    expect(fetchedUrls(fetchSpy).sort()).toEqual([...firstPages].sort());
    expect(store.getState().app.loadingCharactersError).toEqual({});
  });

  it('shows the loader until the first pages arrive', async () => {
    mockFetch();
    renderApp('/');
    expect(screen.getByRole('heading', { name: 'Star Wars' })).toBeInTheDocument();
    expect(await screen.findByText('Popular Characters')).toBeInTheDocument();
  });

  it.each([
    ['/characters', 'Starwars Characters', 'Luke Skywalker'],
    ['/planets', 'Starwars Planets', 'Tatooine'],
    ['/starships', 'Starwars Starships', 'X-wing'],
  ])('renders the %s route', async (route, title, firstItem) => {
    mockFetch();
    renderApp(route);
    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByText(firstItem)).toBeInTheDocument();
  });

  it('navigates from home to a list page through "View All"', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Characters');
    const links = screen.getAllByRole('link', { name: /view all/i });
    await userEvent.click(links.find(link => link.getAttribute('href') === '/characters'));
    expect(await screen.findByText('Starwars Characters')).toBeInTheDocument();
  });

  it('shows page numbers for every page using the API count', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    // 13 planets at 10 per page, even though only the first page is loaded
    expect(screen.getAllByRole('button', { name: /^\d+$/ }).map(b => b.textContent)).toEqual(['1', '2']);
  });

  it('fetches a page only when it is opened, and only once', async () => {
    const fetchSpy = mockFetch();
    renderApp('/characters');
    await screen.findByText('Starwars Characters');
    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    expect(fetchedUrls(fetchSpy)).not.toContain(page('characters', 2));

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Extra Person 1')).toBeInTheDocument();
    expect(screen.queryByText('Luke Skywalker')).not.toBeInTheDocument();

    // Going back and forth uses the pages already loaded
    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    expect(await screen.findByText('Extra Person 1')).toBeInTheDocument();

    const urls = fetchedUrls(fetchSpy);
    expect(urls.filter(url => url === page('characters', 1))).toHaveLength(1);
    expect(urls.filter(url => url === page('characters', 2))).toHaveLength(1);
    // The first page of every resource, plus the one extra page opened here
    expect(urls).toHaveLength(firstPages.length + 1);
  });

  it('shows a loading message while a page is on its way', async () => {
    let release;
    const fetchSpy = mockFetch();
    const passThrough = fetchSpy.getMockImplementation();
    fetchSpy.mockImplementation((url) => (
      url === page('starships', 2)
        ? new Promise(resolve => { release = () => resolve(passThrough(url)); })
        : passThrough(url)
    ));
    renderApp('/starships');
    await screen.findByText('Starwars Starships');

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Loading page 2...')).toBeInTheDocument();
    release();
    expect(await screen.findByText('Extra Starship 1')).toBeInTheDocument();
    expect(screen.queryByText('Loading page 2...')).not.toBeInTheDocument();
  });

  it('shows an error for a page that fails and retries when it is opened again', async () => {
    const fetchSpy = mockFetch({ [page('planets', 2)]: new Error('Timeout') });
    renderApp('/planets');
    await screen.findByText('Starwars Planets');

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('There was an error while loading page 2: Timeout')).toBeInTheDocument();

    fetchSpy.mockRestore();
    mockFetch();
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Extra Planet 1')).toBeInTheDocument();
  });

  it('searches every page from a list page without loading the pages', async () => {
    const fetchSpy = mockFetch();
    const store = renderApp('/characters');
    await screen.findByText('Starwars Characters');

    // The second search box belongs to the list; the first is the site-wide one in the hero
    await userEvent.type(screen.getAllByPlaceholderText('Enter a search item')[1], 'extra');
    expect(await screen.findByText('CHARACTERS Results', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Extra Person 5')).toBeInTheDocument();
    expect(fetchedUrls(fetchSpy)).not.toContain(page('characters', 2));
    expect(store.getState().app.isFilteringCharacters).toBe(true);
  }, 10000);

  it('shows the API error on the list page when fetching fails', async () => {
    const fetchSpy = mockFetch({ [page('planets', 1)]: new Error('Network down') });
    renderApp('/planets');
    expect(await screen.findByText(/There was an error while loading Star Wars Planets: Network down/)).toBeInTheDocument();
    // The failed first page is not retried in a loop
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(fetchedUrls(fetchSpy).filter(url => url === page('planets', 1))).toHaveLength(1);
  });

  it('searches from the home hero', async () => {
    mockFetch();
    const store = renderApp('/');
    await screen.findByText('Popular Characters');

    await userEvent.type(screen.getByPlaceholderText('Enter a search item'), 'tatoo');
    await waitFor(() => expect(store.getState().app.isFilteringAll).toBe(true), { timeout: 4000 });
    expect(store.getState().app.allFilteredPlanets.map(p => p.name)).toEqual(['Tatooine']);
  }, 10000);

  it('opens the description page from the home slider and moves with the slider', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Characters');

    const link = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/description/starships/x-wing');
    await userEvent.click(link);

    expect(await screen.findByRole('heading', { level: 1, name: 'X-wing' })).toBeInTheDocument();
    expect(document.querySelector('.description__content')).toHaveTextContent(/X-wing is of the T-65 model/);

    // Previous moves to the item before the current one in recently viewed
    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 8' })).toBeInTheDocument();
  });

  it.each([
    ['/description/planets/tatooine', 'Tatooine', /Tatooine has a rotation period of 23/],
    ['/description/characters/luke_skywalker', 'Luke Skywalker', /Luke Skywalker is male, and is 172 tall/],
  ])('loads %s directly', async (route, name, text) => {
    mockFetch();
    renderApp(route);
    expect(await screen.findByRole('heading', { level: 1, name })).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('loads a description URL for an item on a page that has not been loaded', async () => {
    const fetchSpy = mockFetch();
    renderApp('/description/planets/extra_planet_2');
    expect(await screen.findByRole('heading', { level: 1, name: 'Extra Planet 2' })).toBeInTheDocument();
    expect(fetchedUrls(fetchSpy)).not.toContain(page('planets', 2));
  });

  describe('revisiting the app', () => {
    it('renders from the cache without any requests', async () => {
      const fetchSpy = mockFetch();
      renderApp('/characters');
      await screen.findByText('Starwars Characters');
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      await screen.findByText('Extra Person 1');
      cleanup();
      fetchSpy.mockClear();

      // A new visit: fresh store, same browser storage
      renderApp('/characters');
      expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      expect(await screen.findByText('Extra Person 1')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /^\d+$/ })).toHaveLength(2);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('shows the error again rather than a cached failure', async () => {
      const fetchSpy = mockFetch({ [page('planets', 1)]: new Error('Network down') });
      renderApp('/planets');
      await screen.findByText(/There was an error while loading Star Wars Planets/);
      cleanup();
      fetchSpy.mockRestore();
      mockFetch();

      renderApp('/planets');
      expect(await screen.findByText('Tatooine')).toBeInTheDocument();
    });
  });

  describe('when swapi.dev is down', () => {
    it('loads the app, pages and search from the mirror', async () => {
      const fetchSpy = mockFetch({}, { down: ['primary'] });
      renderApp('/characters');
      expect(await screen.findByText('Luke Skywalker')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: '2' }));
      expect(await screen.findByText('Extra Person 1')).toBeInTheDocument();
      expect(fetchedUrls(fetchSpy)).toContain(mirrorUrl(page('characters', 2)));

      await userEvent.type(screen.getAllByPlaceholderText('Enter a search item')[1], 'leia');
      expect(await screen.findByText('CHARACTERS Results', {}, { timeout: 4000 })).toBeInTheDocument();
      expect(screen.getByText('Leia Organa')).toBeInTheDocument();
    }, 10000);

    it('opens a description URL through the mirror', async () => {
      mockFetch({}, { down: ['primary'] });
      renderApp('/description/starships/extra_starship_2');
      expect(await screen.findByRole('heading', { level: 1, name: 'Extra Starship 2' })).toBeInTheDocument();
    });
  });

  describe('when both servers are down', () => {
    it('shows the existing error message', async () => {
      mockFetch({}, { down: ['primary', 'mirror'] });
      renderApp('/planets');
      expect(await screen.findByText('There was an error while loading Star Wars Planets: Failed to fetch')).toBeInTheDocument();
    });

    it('shows the page error and loads the page when it is opened again after recovery', async () => {
      const healthy = mockFetch();
      renderApp('/starships');
      await screen.findByText('Starwars Starships');
      healthy.mockRestore();

      const offline = mockFetch({}, { down: ['primary', 'mirror'] });
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      expect(await screen.findByText('There was an error while loading page 2: Failed to fetch')).toBeInTheDocument();

      offline.mockRestore();
      mockFetch({}, { down: ['primary'] });
      await userEvent.click(screen.getByRole('button', { name: '1' }));
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      expect(await screen.findByText('Extra Starship 1')).toBeInTheDocument();
    });
  });

  describe('artwork', () => {
    it('lazy-loads card images with responsive sizes and the same picture on every render', async () => {
      mockFetch();
      renderApp('/characters');
      const luke = await screen.findByAltText('characters Luke Skywalker');
      expect(luke).toHaveAttribute('loading', 'lazy');
      expect(luke).toHaveAttribute('decoding', 'async');
      expect(luke.getAttribute('srcset')).toMatch(/600w, .*1200w$/);
      expect(luke).toHaveAttribute('width', '600');
      const first = luke.getAttribute('src');

      // Re-rendering (here by paging away and back) keeps each card's picture
      await userEvent.click(screen.getByRole('button', { name: '2' }));
      await screen.findByText('Extra Person 1');
      await userEvent.click(screen.getByRole('button', { name: '1' }));
      expect((await screen.findByAltText('characters Luke Skywalker')).getAttribute('src')).toBe(first);
    });

    it('loads the hero banner eagerly with every width', async () => {
      mockFetch();
      renderApp('/');
      await screen.findByText('Popular Characters');
      const banner = document.querySelector('.hero__banner');
      expect(banner).not.toHaveAttribute('loading');
      expect(banner).toHaveAttribute('fetchpriority', 'high');
      expect(banner.getAttribute('srcset')).toMatch(/1280w, .*1920w, .*2880w$/);
      expect(screen.getByAltText('Star Wars Directory emblem').getAttribute('src')).toMatch(/emblem\.svg/);
    });

    it('shows the picture that belongs to the item on the description page', async () => {
      mockFetch();
      renderApp('/description/planets/tatooine');
      await screen.findByRole('heading', { level: 1, name: 'Tatooine' });
      const image = screen.getByAltText('planets description');
      expect(image.getAttribute('srcset')).toMatch(/planet-\d-600\.webp 600w, .*planet-\d-1200\.webp 1200w/);
      expect(image).toHaveAttribute('sizes', '(max-width: 800px) 65vw, 520px');
    });
  });
});

describe('resource pages', () => {
  it('summarises each card from the item and links it to the detail page', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    expect(screen.getByText(/Tatooine has a climate of arid, and a population of 200000/)).toBeInTheDocument();
    const [firstLink] = screen.getAllByRole('link', { name: 'Read more' });
    expect(firstLink).toHaveAttribute('href', '/description/planets/tatooine');
  });

  it('shows the gender on a character card wherever it appears', async () => {
    mockFetch();
    renderApp('/characters');
    await screen.findByText('Starwars Characters');
    expect(screen.getByText(/Leia was born in the year 19BBY, and is female/)).toBeInTheDocument();
  });

  it('names the resource in its own error message', async () => {
    mockFetch({ [page('starships', 1)]: new Error('Network down') });
    renderApp('/starships');
    expect(await screen.findByText('There was an error while loading Star Wars Starships: Network down')).toBeInTheDocument();
  });
});

describe('films, species and vehicles', () => {
  it.each([
    ['/films', 'Starwars Films', 'A New Hope'],
    ['/species', 'Starwars Species', 'Wookiee'],
    ['/vehicles', 'Starwars Vehicles', 'Sand Crawler'],
  ])('renders the %s list page', async (route, title, firstItem) => {
    mockFetch();
    renderApp(route);
    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByText(firstItem)).toBeInTheDocument();
  });

  it('shows a film by its title, on a card and in its link', async () => {
    mockFetch();
    renderApp('/films');
    await screen.findByText('Starwars Films');
    expect(screen.getByText('A New Hope')).toBeInTheDocument();
    expect(screen.getByText(/Episode 4, directed by George Lucas/)).toBeInTheDocument();
    const link = screen.getAllByRole('link')
      .find(l => l.getAttribute('href') === '/description/films/a_new_hope');
    expect(link).toBeDefined();
    expect(link).toHaveTextContent('Read more');
  });

  it('gives films a single page, since they all fit on one', async () => {
    mockFetch();
    renderApp('/films');
    await screen.findByText('Starwars Films');
    expect(screen.getAllByRole('button', { name: /^\d+$/ }).map(b => b.textContent)).toEqual(['1']);
  });

  it('opens a film detail page straight from its URL', async () => {
    mockFetch();
    renderApp('/description/films/the_empire_strikes_back');
    expect(await screen.findByRole('heading', { level: 1, name: 'The Empire Strikes Back' })).toBeInTheDocument();
    expect(document.querySelector('.description__content'))
      .toHaveTextContent(/is episode 5 of the saga, directed by George Lucas/);
  });

  it('searches films by title from the films page', async () => {
    mockFetch();
    const store = renderApp('/films');
    await screen.findByText('Starwars Films');

    await userEvent.type(screen.getAllByPlaceholderText('Enter a search item')[1], 'jedi');
    expect(await screen.findByText('FILMS Results', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Return of the Jedi')).toBeInTheDocument();
    expect(store.getState().app.allFilteredFilms.map(f => f.name)).toEqual(['Return of the Jedi']);
  }, 10000);

  it('includes every resource in a site-wide search', async () => {
    mockFetch();
    const store = renderApp('/');
    await screen.findByText('Popular Characters');

    await userEvent.type(screen.getByPlaceholderText('Enter a search item'), 'crawler');
    await waitFor(() => expect(store.getState().app.isFilteringAll).toBe(true), { timeout: 4000 });
    expect(store.getState().app.allFilteredVehicles.map(v => v.name)).toEqual(['Sand Crawler']);
    expect(await screen.findByText('Vehicles')).toBeInTheDocument();
  }, 10000);

  it('shows a Popular section for every resource on the home page', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Characters');
    ['Characters', 'Planets', 'Starships', 'Films', 'Species', 'Vehicles'].forEach(label => {
      expect(screen.getByText(`Popular ${label}`)).toBeInTheDocument();
    });
  });

  it('paginates species like any other resource', async () => {
    mockFetch();
    renderApp('/species');
    await screen.findByText('Starwars Species');
    expect(screen.getByText('Wookiee')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Extra Species 1')).toBeInTheDocument();
  });
});

describe('related items on the detail page', () => {
  it('links a character to its homeworld, films, species, starships and vehicles without extra requests', async () => {
    const fetchSpy = mockFetch();
    renderApp('/description/characters/luke_skywalker');
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' });

    expect(await screen.findByRole('link', { name: 'Tatooine' })).toHaveAttribute('href', '/description/planets/tatooine');
    expect(screen.getByRole('link', { name: 'A New Hope' })).toHaveAttribute('href', '/description/films/a_new_hope');
    expect(screen.getByRole('link', { name: 'The Empire Strikes Back' })).toHaveAttribute('href', '/description/films/the_empire_strikes_back');
    expect(screen.getByRole('link', { name: 'Wookiee' })).toHaveAttribute('href', '/description/species/wookiee');
    expect(screen.getByRole('link', { name: 'X-wing' })).toHaveAttribute('href', '/description/starships/x-wing');
    expect(screen.getByRole('link', { name: 'Sand Crawler' })).toHaveAttribute('href', '/description/vehicles/sand_crawler');
    ['Homeworld', 'Films', 'Species', 'Starships', 'Vehicles'].forEach(label => {
      expect(screen.getByRole('heading', { level: 3, name: label })).toBeInTheDocument();
    });
    // Everything linked arrived with the first pages, so nothing else was requested
    expect(fetchedUrls(fetchSpy).sort()).toEqual([...firstPages].sort());
  });

  it('follows related links back and forth, with the URL moving each time', async () => {
    mockFetch();
    renderApp('/description/characters/luke_skywalker');
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' });

    await userEvent.click(await screen.findByRole('link', { name: 'Tatooine' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Tatooine' })).toBeInTheDocument();
    expect(screen.getByText(/Tatooine has a rotation period of 23/)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/planets/tatooine');
    expect(screen.getByAltText('planets description')).toBeInTheDocument();

    // A planet lists its residents
    await userEvent.click(await screen.findByRole('link', { name: 'Leia Organa' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Leia Organa' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/characters/leia_organa');
    expect(screen.getByRole('link', { name: 'Planet 1' })).toHaveAttribute('href', '/description/planets/planet_1');
  });

  it('fetches a linked item that is not loaded, holding its place until it arrives', async () => {
    let release;
    const extra = `${API_ENDPOINTS.characters}11/`;
    const fetchSpy = mockFetch();
    const passThrough = fetchSpy.getMockImplementation();
    fetchSpy.mockImplementation((url) => (
      url === extra ? new Promise(resolve => { release = () => resolve(passThrough(url)); }) : passThrough(url)
    ));
    renderApp('/description/films/a_new_hope');
    await screen.findByRole('heading', { level: 1, name: 'A New Hope' });

    // The cast that was already loaded shows at once; the one on page 2 is on its way
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leia Organa' })).toBeInTheDocument();
    release();
    expect(await screen.findByRole('link', { name: 'Extra Person 1' })).toHaveAttribute('href', '/description/characters/extra_person_1');
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
    expect(fetchedUrls(fetchSpy)).toContain(extra);
    expect(fetchedUrls(fetchSpy)).not.toContain(page('characters', 2));

    // Opening it uses the item just fetched rather than searching for it
    await userEvent.click(screen.getByRole('link', { name: 'Extra Person 1' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Extra Person 1' })).toBeInTheDocument();
    expect(fetchedUrls(fetchSpy).some(url => url.includes('?search='))).toBe(false);
  });

  it('marks a link that cannot be fetched instead of hiding or breaking the page', async () => {
    mockFetch({ [`${API_ENDPOINTS.characters}11/`]: new Error('Down') });
    renderApp('/description/films/a_new_hope');
    await screen.findByRole('heading', { level: 1, name: 'A New Hope' });
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Luke Skywalker' })).toBeInTheDocument();
  });

  it('shows no related section for an item that links to nothing', async () => {
    mockFetch();
    renderApp('/description/planets/extra_planet_2');
    await screen.findByRole('heading', { level: 1, name: 'Extra Planet 2' });
    expect(screen.queryByRole('heading', { level: 2, name: 'Related' })).not.toBeInTheDocument();
  });
});

describe('detail page navigation', () => {
  it('keeps the URL and the item in step through next and previous', async () => {
    mockFetch();
    renderApp('/description/starships/x-wing');
    await screen.findByRole('heading', { level: 1, name: 'X-wing' });

    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 1' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/starships/starship_1');
    expect(screen.getByText(/Starship 1 is of the T-65 model/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 2' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/starships/starship_2');

    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 1' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/starships/starship_1');
  });

  it('wraps around at either end of the recently viewed list', async () => {
    mockFetch();
    renderApp('/description/starships/x-wing');
    await screen.findByRole('heading', { level: 1, name: 'X-wing' });

    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 8' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/starships/starship_8');

    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'X-wing' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/description/starships/x-wing');
  });

  it('opens a recently viewed item from the detail page', async () => {
    mockFetch();
    renderApp('/description/starships/x-wing');
    await screen.findByRole('heading', { level: 1, name: 'X-wing' });

    const card = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/description/starships/starship_2');
    await userEvent.click(card);
    expect(await screen.findByRole('heading', { level: 1, name: 'Starship 2' })).toBeInTheDocument();
    expect(screen.getByText(/Starship 2 is of the T-65 model/)).toBeInTheDocument();
    expect(screen.getByAltText('starships description')).toBeInTheDocument();
  });

  it('lists an item in recently viewed once however often it is shown', async () => {
    mockFetch();
    renderApp('/description/starships/x-wing');
    await screen.findByRole('heading', { level: 1, name: 'X-wing' });
    await userEvent.click(screen.getByRole('button', { name: 'next icon' }));
    await screen.findByRole('heading', { level: 1, name: 'Starship 1' });
    await userEvent.click(screen.getByRole('button', { name: 'previous icon' }));
    await screen.findByRole('heading', { level: 1, name: 'X-wing' });
    const names = [...document.querySelectorAll('.recently-viewed .list-item h3')].map(h => h.textContent);
    expect(names.filter(name => name === 'X-wing')).toHaveLength(1);
  });
});

describe('the address bar holds the list state', () => {
  const url = () => screen.getByTestId('search').textContent;
  const names = () => [...document.querySelectorAll('.list-item h3')].map(h => h.textContent.trim());

  it('puts the page in the URL, and leaves it out for the first page', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    expect(url()).toBe('');

    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(await screen.findByText('Extra Planet 1')).toBeInTheDocument();
    expect(url()).toBe('?page=2');

    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(await screen.findByText('Tatooine')).toBeInTheDocument();
    expect(url()).toBe('');
  });

  it('opens a shared link straight onto the page it names', async () => {
    mockFetch();
    renderApp('/planets?page=2');
    expect(await screen.findByText('Extra Planet 1')).toBeInTheDocument();
    expect(screen.queryByText('Tatooine')).not.toBeInTheDocument();
  });

  it('puts the sort in the URL and reorders the list', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    expect(names()[0]).toBe('Tatooine');

    // Ascending, because descending still starts with Tatooine
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'name');
    await waitFor(() => expect(url()).toBe('?sort=name'));
    await waitFor(() => expect(names()[0]).toBe('Extra Planet 1'));
  });

  it('puts the filter in the URL and narrows the list', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Climate' }), 'frozen');
    await waitFor(() => expect(url()).toBe('?climate=frozen'));
    // Every planet whose climate is frozen, from both pages
    await waitFor(() => expect(names().sort()).toEqual(['Extra Planet 2', 'Planet 2', 'Planet 6']));
  });

  it('matches one value of a field holding several', async () => {
    mockFetch();
    renderApp('/planets?climate=tropical');
    await screen.findByText('Starwars Planets');
    await waitFor(() => expect(names().sort()).toEqual(['Extra Planet 3', 'Planet 3', 'Planet 7']));
  });

  it('opens a shared link carrying a filter and a sort, with the menus set', async () => {
    mockFetch();
    renderApp('/planets?climate=frozen&sort=-name');
    await screen.findByText('Starwars Planets');
    await waitFor(() => expect(names()).toEqual(['Planet 6', 'Planet 2', 'Extra Planet 2']));
    expect(screen.getByRole('combobox', { name: 'Climate' })).toHaveValue('frozen');
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveValue('-name');
  });

  it('pages a sorted list rather than the pages the API gave', async () => {
    mockFetch();
    renderApp('/planets?sort=name&page=2');
    await screen.findByText('Starwars Planets');
    // Thirteen planets by name: the last three fall on the second page
    await waitFor(() => expect(names()).toEqual(['Planet 8', 'Planet 9', 'Tatooine']));
  });

  it('goes back to the first page when the filter changes', async () => {
    mockFetch();
    renderApp('/planets?page=2');
    await screen.findByText('Extra Planet 1');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Climate' }), 'frozen');
    await waitFor(() => expect(url()).toBe('?climate=frozen'));
  });

  it('puts the search in the URL, and the dropdowns follow it', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');

    await userEvent.type(screen.getAllByPlaceholderText('Enter a search item')[1], 'tatoo');
    await waitFor(() => expect(url()).toBe('?q=tatoo'), { timeout: 4000 });
    expect(await screen.findByText('PLANETS Results')).toBeInTheDocument();
  }, 10000);

  it('runs the search named by a shared link', async () => {
    mockFetch();
    const store = renderApp('/planets?q=tatoo');
    await waitFor(() => expect(store.getState().app.isFilteringPlanets).toBe(true), { timeout: 4000 });
    expect(await screen.findByText('PLANETS Results')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Enter a search item')[1]).toHaveValue('tatoo');
  }, 10000);
});

describe('back and forward restore the list state', () => {
  const url = () => screen.getByTestId('search').textContent;
  const names = () => [...document.querySelectorAll('.list-item h3')].map(h => h.textContent.trim());

  it('steps back through the pages that were opened', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await screen.findByText('Extra Planet 1');

    await userEvent.click(screen.getByTestId('go-back'));
    await waitFor(() => expect(url()).toBe(''));
    expect(await screen.findByText('Tatooine')).toBeInTheDocument();

    await userEvent.click(screen.getByTestId('go-forward'));
    await waitFor(() => expect(url()).toBe('?page=2'));
    expect(await screen.findByText('Extra Planet 1')).toBeInTheDocument();
  });

  it('leaves a sort behind on the way back, and the list with it', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Sort' }), 'name');
    await waitFor(() => expect(names()[0]).toBe('Extra Planet 1'));

    await userEvent.click(screen.getByTestId('go-back'));
    await waitFor(() => expect(url()).toBe(''));
    await waitFor(() => expect(names()[0]).toBe('Tatooine'));
    expect(screen.getByRole('combobox', { name: 'Sort' })).toHaveValue('');
  });

  it('replaces rather than stacking a history entry per letter typed', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');

    // Opening a page is a step worth going back to
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await screen.findByText('Extra Planet 1');
    expect(url()).toBe('?page=2');

    await userEvent.type(screen.getAllByPlaceholderText('Enter a search item')[1], 'tatoo');
    await waitFor(() => expect(url()).toBe('?q=tatoo'), { timeout: 4000 });

    // Typing replaced that step, so one move back passes the search and the
    // page together instead of undoing a letter at a time
    await userEvent.click(screen.getByTestId('go-back'));
    await waitFor(() => expect(url()).toBe(''));
    expect(await screen.findByText('Tatooine')).toBeInTheDocument();
  }, 10000);
});

describe('the home search is shareable too', () => {
  it('puts the site-wide search in the URL', async () => {
    mockFetch();
    const store = renderApp('/');
    await screen.findByText('Popular Characters');

    await userEvent.type(screen.getByPlaceholderText('Enter a search item'), 'tatoo');
    await waitFor(() => expect(store.getState().app.isFilteringAll).toBe(true), { timeout: 4000 });
    expect(screen.getByTestId('search')).toHaveTextContent('?q=tatoo');
  }, 10000);

  it('runs a shared site-wide search on arrival', async () => {
    mockFetch();
    const store = renderApp('/?q=tatoo');
    await waitFor(() => expect(store.getState().app.isFilteringAll).toBe(true), { timeout: 4000 });
    expect(await screen.findByText('All Results')).toBeInTheDocument();
    expect(store.getState().app.allFilteredPlanets.map(p => p.name)).toEqual(['Tatooine']);
  }, 10000);
});

describe('search outcomes', () => {
  const searchUrl = (resource, term) => `${API_ENDPOINTS[resource]}?search=${term}`;

  it('says when nothing matches rather than showing an empty page', async () => {
    mockFetch();
    renderApp('/planets?q=zzz');
    expect(await screen.findByText('No planets match “zzz”.')).toBeInTheDocument();
    expect(screen.getByText('No planets match “zzz”.')).toHaveAttribute('role', 'status');
    expect(screen.queryByText('Tatooine')).not.toBeInTheDocument();
  });

  it('tells a failed search apart from an empty one, and runs it again on request', async () => {
    const fetchSpy = mockFetch({ [searchUrl('planets', 'tatoo')]: new Error('Down') });
    const store = renderApp('/planets?q=tatoo');

    expect(await screen.findByText('The search for “tatoo” could not be completed.')).toBeInTheDocument();
    expect(screen.queryByText(/No planets match/)).not.toBeInTheDocument();
    expect(store.getState().app.planetsSearchError).toEqual({ message: 'Down' });
    // A failure is not remembered, so it can be retried
    expect(store.getState().app.planetsSearch).not.toHaveProperty('tatoo');

    fetchSpy.mockRestore();
    mockFetch();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Tatooine')).toBeInTheDocument();
    expect(screen.queryByText(/could not be completed/)).not.toBeInTheDocument();
    expect(store.getState().app.planetsSearchError).toBeNull();
    expect(store.getState().app.planetsSearch.tatoo).toHaveLength(1);
  });

  it('shows that a search is under way until its results arrive', async () => {
    let release;
    const fetchSpy = mockFetch();
    const passThrough = fetchSpy.getMockImplementation();
    fetchSpy.mockImplementation((url) => (
      url === searchUrl('planets', 'tatoo')
        ? new Promise(resolve => { release = () => resolve(passThrough(url)); })
        : passThrough(url)
    ));
    renderApp('/planets?q=tatoo');
    expect(await screen.findByText('Searching planets for “tatoo”...')).toBeInTheDocument();
    release();
    expect(await screen.findByText('PLANETS Results')).toBeInTheDocument();
    expect(screen.queryByText(/Searching planets/)).not.toBeInTheDocument();
  });

  it('on the home page, reports the resources that failed and keeps the ones that worked', async () => {
    const fetchSpy = mockFetch({ [searchUrl('characters', 'tatoo')]: new Error('Down') });
    const store = renderApp('/?q=tatoo');

    expect(await screen.findByText('The search for “tatoo” could not be completed.')).toBeInTheDocument();
    expect(screen.getByText('Tatooine')).toBeInTheDocument();
    expect(screen.getByText('No starships match “tatoo”.')).toBeInTheDocument();
    expect(store.getState().app.charactersSearchError).toEqual({ message: 'Down' });
    expect(store.getState().app.planetsSearchError).toBeNull();

    // Trying again only asks for what failed; the rest is already in memory
    fetchSpy.mockRestore();
    const healthy = mockFetch();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(store.getState().app.charactersSearchError).toBeNull());
    expect(screen.queryByText(/could not be completed/)).not.toBeInTheDocument();
    expect(fetchedUrls(healthy).filter(url => url.includes('?search='))).toEqual([searchUrl('characters', 'tatoo')]);
  });

  it('clears a failure when the search is cleared', async () => {
    mockFetch({ [searchUrl('planets', 'tatoo')]: new Error('Down') });
    const store = renderApp('/planets?q=tatoo');
    await screen.findByText(/could not be completed/);

    await userEvent.clear(screen.getAllByPlaceholderText('Enter a search item')[1]);
    await waitFor(() => expect(store.getState().app.planetsSearchError).toBeNull(), { timeout: 4000 });
    expect(await screen.findByText('Tatooine')).toBeInTheDocument();
  }, 10000);

  it('says when no item satisfies the filters, and offers no pages to turn', async () => {
    mockFetch();
    renderApp('/planets?climate=volcanic');
    expect(await screen.findByText('No planets match these filters.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading all planets/)).not.toBeInTheDocument();
  });
});

describe('detail page text', () => {
  it('lays the description out in paragraphs, with no stray slash-n', async () => {
    mockFetch();
    renderApp('/description/characters/luke_skywalker');
    await screen.findByRole('heading', { level: 1, name: 'Luke Skywalker' });

    const content = document.querySelector('.description__content');
    const parts = [...content.querySelectorAll('p')].map(p => p.textContent);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toBe('Luke Skywalker is male, and is 172 tall.');
    expect(parts[1]).toMatch(/^He has a mass of 77,/);
    expect(content.textContent).not.toMatch(/\/n/);
  });

  it.each([
    ['/description/planets/tatooine', 'Tatooine'],
    ['/description/starships/x-wing', 'X-wing'],
    ['/description/films/a_new_hope', 'A New Hope'],
  ])('breaks %s into paragraphs too', async (route, name) => {
    mockFetch();
    renderApp(route);
    await screen.findByRole('heading', { level: 1, name });
    const content = document.querySelector('.description__content');
    expect(content.querySelectorAll('p').length).toBeGreaterThan(1);
    expect(content.textContent).not.toMatch(/\/n/);
  });
});

describe('accessibility', () => {
  it('gives every page one level-one heading', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Characters');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Directory' })).toBeInTheDocument();
  });

  it('keeps the detail page to its own single level-one heading', async () => {
    mockFetch();
    renderApp('/description/planets/tatooine');
    await screen.findByRole('heading', { level: 1, name: 'Tatooine' });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('steps heading levels one at a time on a list page', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    const levels = screen.getAllByRole('heading').map(h => Number(h.tagName.slice(1)));
    levels.forEach((level, index) => {
      if (index > 0) expect(level - levels[index - 1]).toBeLessThanOrEqual(1);
    });
    expect(screen.getByRole('heading', { level: 3, name: 'Tatooine' })).toBeInTheDocument();
  });

  it('marks pagination as navigation with the current page identified', async () => {
    mockFetch();
    renderApp('/planets?page=2');
    await screen.findByText('Extra Planet 1');
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('names the slider dots and lists them properly', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Planets');
    const dots = screen.getAllByRole('button', { name: /^Go to slide \d of \d$/ });
    expect(dots.length).toBeGreaterThan(0);
    dots.forEach(dot => expect(dot.closest('ul')).not.toBeNull());
    expect(dots.filter(dot => dot.getAttribute('aria-current') === 'true')).toHaveLength(2);
    expect(document.querySelectorAll('[id]').length).toBe(document.querySelectorAll('#root').length);
  });

  it('never writes "null" into a class name', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Planets');
    const withNull = [...document.querySelectorAll('[class]')].filter(el => el.className.split(/\s+/).includes('null'));
    expect(withNull).toHaveLength(0);
  });

  it('does not nest a button inside a link anywhere on the home page', async () => {
    mockFetch();
    renderApp('/');
    await screen.findByText('Popular Characters');
    expect(document.querySelectorAll('a button')).toHaveLength(0);
    expect(screen.getAllByRole('link', { name: 'View All' })).toHaveLength(6);
  });

  it('does not nest a button inside a link on the cards', async () => {
    mockFetch();
    renderApp('/starships');
    await screen.findByText('Starwars Starships');
    expect(document.querySelectorAll('a button')).toHaveLength(0);
    const link = screen.getAllByRole('link').find(l => l.getAttribute('href') === '/description/starships/x-wing');
    expect(link).toHaveClass('list-item__button');
    expect(link).toHaveTextContent('Read more');
  });

  it('labels every search box with what it searches', async () => {
    mockFetch();
    renderApp('/planets');
    await screen.findByText('Starwars Planets');
    expect(screen.getByRole('textbox', { name: 'Search the whole directory' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search planets' })).toBeInTheDocument();
  });
});
