import TopNavBar from '../logic/components/TopNavBar.tsx';
import Footer from '../logic/components/Footer.tsx';

const ContactPage = () => {
  return (
    <>
      <TopNavBar />

      <div className="flex ninety-percent-screen-height w-full bg-slate-50 overflow-hidden">
        <p>Welcome to the Contact Page!</p>
      </div>

      <Footer />
    </>
  );
}

export default ContactPage;