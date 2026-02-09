import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import dataReducer from '@/features/data/dataSlice';

/**
 * Store Redux pour l'application
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer les avertissements pour certaines actions si nécessaire
        ignoredActions: ['your/action/type'],
        ignoredPaths: ['items.dates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


