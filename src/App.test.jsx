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
import { mockFetch, fetchedUrls } from './test/fixtures';

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
});
