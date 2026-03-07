import EditorConfigPanel from './EditorConfigPanel.tsx';
import { useDesigner } from '../context/GuideContext.tsx';
import { GuidesView } from './GuidesView.tsx';

export function Sidebar({className}: { className: string }) {
  const {designer} = useDesigner();

  return (
    <aside className={`${className} w-50/100  bg-white shadow-lg z-10  p-4 overflow-y-auto `}>
      {/*<div className="p-4 border-b overflow-y-auto">*/}
        <EditorConfigPanel
          textInput={designer.DNASequence}
          onSequenceChange={designer.setDNASequence}
          onAnalyse={designer.analyse}
          onFastaFileUpload={designer.onFastaFileUpload}
          selectedEditorName={designer.selectedEditorName}
          setSelectedEditorName={designer.setSelectedEditorName}
          desiredEdit={designer.desiredEdit}
          setDesiredEdit={designer.setDesiredEdit}
          targetStrand={designer.targetStrand}
          mutationPos={designer.mutationPos}
          setMutationPos={designer.setMutationPos}
          genome={designer.genome}
          setGenome={designer.setGenome}
          onReset={designer.reset}
        />

      <section className="overflow-y-auto mt-5 p-0">
        <GuidesView enrichedGuides={designer.enrichedGuides} />
      </section>

    </aside>
  );
}