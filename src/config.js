// Base URL for the Star Wars API.
// A fallback mirror for when swapi.dev is down is on the roadmap.
export const API_BASE_URL = 'https://swapi.dev/api';

// Endpoints for the first page of each resource. Further pages are followed
// through the `next` link the API returns, so they are not listed here.
export const API_ENDPOINTS = {
  characters: `${API_BASE_URL}/people/`,
  planets: `${API_BASE_URL}/planets/`,
  starships: `${API_BASE_URL}/starships/`,
};
