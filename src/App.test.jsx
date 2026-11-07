import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './connect-App';
import configureAppStore from './modules/store';
import { defaultState } from './app/reducers';
import { API_ENDPOINTS } from './config';
import { mockFetch, fetchedUrls, mirrorUrl } from './test/fixtures';

const renderApp = (route = '/') => {
  const store = configureAppStore({ app: { ...defaultState } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Provider>
  );
  return store;
};

const page = (resource, n) => `${API_ENDPOINTS[resource]}?page=${n}`;
const firstPages = [page('characters', 1), page('planets', 1), page('starships', 1)];

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
    expect(urls).toHaveLength(4);
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
