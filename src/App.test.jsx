import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './connect-App';
import configureAppStore from './modules/store';
import { defaultState } from './app/reducers';
import { API_ENDPOINTS } from './config';
import { mockFetch } from './test/fixtures';

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

const waitForAllPages = (store) => waitFor(() => {
  const { characters, planets, starships } = store.getState().app;
  expect([characters.length, planets.length, starships.length]).toEqual([15, 13, 12]);
});

describe('App', () => {
  it('fetches every resource on load and renders the home route', async () => {
    const fetchSpy = mockFetch();
    const store = renderApp('/');

    expect(await screen.findByText('Popular Characters')).toBeInTheDocument();
    expect(screen.getByText('Popular Planets')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith(API_ENDPOINTS.characters);
    expect(fetchSpy).toHaveBeenCalledWith(API_ENDPOINTS.planets);
    expect(fetchSpy).toHaveBeenCalledWith(API_ENDPOINTS.starships);
    await waitForAllPages(store);
    expect(store.getState().app.loadingCharactersError).toEqual({});
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

  it('paginates the characters list', async () => {
    mockFetch();
    const store = renderApp('/characters');
    await screen.findByText('Starwars Characters');
    await waitForAllPages(store);

    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.queryByText('Luke Skywalker')).not.toBeInTheDocument();
    expect(screen.getByText('Extra Person 1')).toBeInTheDocument();
  });

  it('shows the API error on the list page when fetching fails', async () => {
    mockFetch({ [API_ENDPOINTS.planets]: new Error('Network down') });
    renderApp('/planets');
    expect(await screen.findByText(/There was an error while loading Star Wars Planets: Network down/)).toBeInTheDocument();
  });

  it('searches from the home hero', async () => {
    mockFetch();
    const store = renderApp('/');
    await screen.findByText('Popular Characters');
    await waitForAllPages(store);

    await userEvent.type(screen.getByPlaceholderText('Enter a search item'), 'tatoo');
    await waitFor(() => expect(store.getState().app.isFilteringAll).toBe(true), { timeout: 4000 });
    expect(store.getState().app.allFilteredPlanets.map(p => p.name)).toEqual(['Tatooine']);
  }, 10000);

  it('opens the description page from the home slider and moves with the slider', async () => {
    mockFetch();
    const store = renderApp('/');
    await screen.findByText('Popular Characters');
    await waitForAllPages(store);

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
});
