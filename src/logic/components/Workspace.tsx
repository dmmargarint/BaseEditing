import { GuideDetails } from '../../components/GuideDetails.tsx';
import { useDesigner } from '../context/GuideContext.tsx';
import { SeqvizOverview } from './SeqvizOverview.tsx';
import { GuidesView } from '../../components/GuidesView.tsx';


export function Workspace({className}: { className: string }) {
  const { designer, selectedGuide } = useDesigner();

  return (
    <>
      <main className={`${className} flex-1 flex flex-col`}>
        {/* Top half: Global View (SeqViz) */}
        <section className="h-1/2 bg-white overflow-hidden">
            {/*{designer.DNASequence && <h2 className="text-center">Sequence Visualiser</h2>}*/}
            {designer.DNASequence && (
              <SeqvizOverview />
            )}
        </section>

        <section className="h-1/2 overflow-y-auto p-8">
          <GuidesView guides={designer.guides} />
        </section>

        {/*<section className="h-1/2 overflow-y-auto p-8">*/}
        {/*  <div className="">*/}
        {/*    {selectedGuide ? (*/}
        {/*      <GuideDetails key={selectedGuide.guideSeq} guide={selectedGuide} />*/}
        {/*    ) : (*/}
        {/*      <div className="h-full flex items-center justify-center text-slate-400 italic">*/}
        {/*        Select a guide from the sidebar to view detailed base-editing analysis.*/}
        {/*      </div>*/}
        {/*    )}*/}
        {/*  </div>*/}
        {/*</section>*/}
      </main>
    </>
  );
}