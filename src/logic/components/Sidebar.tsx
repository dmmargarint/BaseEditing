import EditorConfigPanel from '../../components/EditorConfigPanel.tsx';
import { GuidesView } from '../../components/GuidesView.tsx';
import { useBaseEditorDesigner } from '../../hooks/useBaseEditorDesigner.ts';


export function Sidebar({className}: { className: string }) {
  const designer = useBaseEditorDesigner();
  return (
    <>
      <aside className={`${className} w-1/3 min-w-[550px] border-r bg-white flex flex-col shadow-lg z-10`}>
        <div className="p-4 border-b overflow-y-auto max-h-[40%]">
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
        </div>
        <div className="flex-1 overflow-y-auto">
          <GuidesView guides={designer.guides} />
        </div>
      </aside>
    </>
  );
}