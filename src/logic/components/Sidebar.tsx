import EditorConfigPanel from '../../components/EditorConfigPanel.tsx';
import { GuidesView } from '../../components/GuidesView.tsx';
import { useBaseEditorDesigner } from '../../hooks/useBaseEditorDesigner.ts';
import { useDesigner } from '../context/GuideContext.tsx';


export function Sidebar({className}: { className: string }) {
  const {designer} = useDesigner();

  return (
    <aside className={`${className} w-1/4 min-w-[500px] bg-white shadow-lg z-10 text-sm p-4 overflow-y-auto `}>
      {/*<div className="p-4 border-b overflow-y-auto">*/}
        <EditorConfigPanel
          textInput={designer.DNASequence}
          onSequenceChange={designer.setDNASequence}
          onAnalyse={designer.analyse}
          selectedEditorName={designer.selectedEditorName}
          setSelectedEditorName={designer.setSelectedEditorName}
          desiredEdit={designer.desiredEdit}
          setDesiredEdit={designer.setDesiredEdit}
          targetStrand={designer.targetStrand}
          setTargetStrand={designer.setTargetStrand}
          mutationPos={designer.mutationPos}
          setMutationPos={designer.setMutationPos}
        />

      {/*<div className="flex-1 overflow-y-auto">*/}
      {/*  <GuidesView guides={designer.guides} />*/}
      {/*</div>*/}

      {/*</div>*/}
      {/*<div className="flex-1 overflow-y-auto">*/}

      {/*</div>*/}
    </aside>
  );
}