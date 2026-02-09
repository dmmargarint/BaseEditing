import { createBrowserRouter } from "react-router";
import App from './App.tsx';
import ContactPage from './pages/Contact.tsx';
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
    path: "/contact",
    Component: ContactPage,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  },
]);

export default Routes;