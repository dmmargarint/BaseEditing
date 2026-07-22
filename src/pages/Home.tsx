import TopNavBar from '../logic/components/TopNavBar.tsx';

const HomePage = () => (
  <>
    <TopNavBar />
    <section className="border-b border-gray-100 bg-white px-8 py-2.5 text-center">
      <h1 className="text-base font-semibold text-gray-800">Base Editing Guide RNA Design Tool</h1>
      <p className="text-xs text-gray-500 mt-0.5">Design guide RNAs for CRISPR base editing (BE) applications. Supports ABE8e and BE4max with SpCas9 and SaCas9, with bystander edit detection and off-target risk scoring.</p>
    </section>
  </>
);

export default HomePage;
