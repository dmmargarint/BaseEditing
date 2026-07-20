import { createBrowserRouter } from "react-router";
import App from './App.tsx';
import AboutPage from './pages/About.tsx';

const Routes = createBrowserRouter([
  {
    path: "/",
    Component: App
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);

export default Routes;