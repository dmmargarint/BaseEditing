import TopNavBar from '../logic/components/TopNavBar.tsx';
import Footer from '../logic/components/Footer.tsx';

const AboutPage = () => {
  return (
    <>
      <TopNavBar />

      <div className="flex ninety-percent-screen-height w-full bg-slate-50 overflow-hidden">
        <p>Welcome to the About Page!</p>
      </div>

      <Footer />
    </>
  );
}

export default AboutPage;