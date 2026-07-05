import TopNavBar from '../logic/components/TopNavBar.tsx';
import Footer from '../logic/components/Footer.tsx';

const ContactPage = () => {
  return (
    <>
      <TopNavBar />

      <div className="flex ninety-percent-screen-height w-full overflow-hidden">
        <p>
          *This App*
        </p>
      </div>

      <Footer />
    </>
  );
}

export default ContactPage;