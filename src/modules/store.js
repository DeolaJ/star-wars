import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import app from '../app/reducers';

export default function configureAppStore(preloadedState) {
  return configureStore({
    reducer: { app },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      import.meta.env.DEV
        ? getDefaultMiddleware({ serializableCheck: false }).concat(logger)
        : getDefaultMiddleware({ serializableCheck: false }),
  });
}
