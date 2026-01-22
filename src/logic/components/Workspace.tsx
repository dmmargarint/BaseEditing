import { useDesigner } from '../context/GuideContext.tsx';
import { SeqvizOverview } from './SeqvizOverview.tsx';

export function Workspace({className}: { className: string }) {
  const { designer} = useDesigner();

  return (
    <>
      <main className={`${className} flex-1 flex flex-col`}>
        <section className="h-full w-full w-bg-white overflow-hidden">
            {designer.DNASequence && (
              <SeqvizOverview />
            )}
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