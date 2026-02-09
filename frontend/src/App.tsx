import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppRouter } from './routes/AppRouter';
import './index.css';

/**
 * Composant racine de l'application
 */
function App() {
  useEffect(() => {
    // Initialisation de l'application
    console.log('OGSL Data Portal - Application démarrée');
    console.log('Environment:', import.meta.env.MODE);
  }, []);

  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;


