import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';
import { PlaylistsPages } from './pages/PlaylistsPages.tsx';
import { LoggedInLayout } from './layouts/LoggedInLayout.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>
    ),
  },
  {
    path: '/playlists',
    element: (
      <AuthProvider>
        <LoggedInLayout>
          <PlaylistsPages />
        </LoggedInLayout>
      </AuthProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
