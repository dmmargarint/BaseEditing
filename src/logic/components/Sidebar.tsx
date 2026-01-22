import EditorConfigPanel from '../../components/EditorConfigPanel.tsx';
import { useDesigner } from '../context/GuideContext.tsx';
import { GuidesView } from '../../components/GuidesView.tsx';

export function Sidebar({className}: { className: string }) {
  const {designer} = useDesigner();

  return (
    <aside className={`${className} w-50/100  bg-white shadow-lg z-10 text-sm p-4 overflow-y-auto `}>
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
        />

      <section className="overflow-y-auto mt-5 p-0">
        <GuidesView guides={designer.guides} />
      </section>

      {/*<div className="flex-1 overflow-y-auto">*/}
      {/*  <GuidesView guides={designer.guides} />*/}
      {/*</div>*/}

      {/*</div>*/}
      {/*<div className="flex-1 overflow-y-auto">*/}

      {/*</div>*/}
    </aside>
  );
}