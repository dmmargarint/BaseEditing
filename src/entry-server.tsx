import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import AboutPage from './pages/About';

const pages: Record<string, React.ComponentType> = {
  '/about': AboutPage,
};

export function render(url: string): string {
  const Component = pages[url];
  if (!Component) return '';
  return renderToString(
    <StaticRouter location={url}>
      <Component />
    </StaticRouter>
  );
}
