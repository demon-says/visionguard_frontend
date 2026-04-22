import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import DriverDetail from './pages/DriverDetail';
import Violations from './pages/Violations';
import Routes from './pages/Routes';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'drivers', Component: Drivers },
      { path: 'drivers/:id', Component: DriverDetail },
      { path: 'violations', Component: Violations },
      { path: 'routes', Component: Routes },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
    ],
  },
]);