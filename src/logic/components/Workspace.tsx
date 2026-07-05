import { useDesigner } from '../context/GuideContext.tsx';
import { SeqvizOverview } from './SeqvizOverview.tsx';

export function Workspace() {
  const { designer } = useDesigner();

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <section className="h-full w-full overflow-hidden">
        {designer.DNASequence && <SeqvizOverview />}
      </section>
    </main>
  );
}