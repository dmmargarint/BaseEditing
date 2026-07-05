import TopNavBar from '../logic/components/TopNavBar.tsx';
import Footer from '../logic/components/Footer.tsx';

const AboutPage = () => {
  return (
    <>
      <TopNavBar />

      <div className="bg-slate-50 overflow-hidden">
        <p>
          *This App* was created to help students and researchers find guide RNAs for CRISPR base editing (BE) applications
          in a visually intuitive manner.

          **The guides and alignment information provided by *the app* must be further validated and cannot be solely relied upon.**
        </p>
        <p>
          Specifically,
        </p>
      </div>

      <Footer />
    </>
  );
}

export default AboutPage;