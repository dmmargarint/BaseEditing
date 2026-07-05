import EditorConfigPanel from './EditorConfigPanel.tsx';
import { useDesigner } from '../context/GuideContext.tsx';

export function Sidebar({ width }: { width: number }) {
  const {designer} = useDesigner();

  return (
    <aside style={{ width }} className="shrink-0 bg-white shadow-lg z-10 p-4 overflow-y-auto border-l border-gray-200">
      <EditorConfigPanel
        textInput={designer.DNASequence}
        onSequenceChange={designer.setDNASequence}
        onAnalyse={designer.analyse}
        selectedEditorName={designer.selectedEditorName}
        setSelectedEditorName={designer.setSelectedEditorName}
        desiredEdit={designer.desiredEdit}
        setDesiredEdit={(v) => designer.setDesiredEdit(v as "A_TO_G" | "C_TO_T")}
        mutationPos={designer.mutationPos}
        setMutationPos={designer.setMutationPos}
        genome={designer.genome}
        setGenome={designer.setGenome}
        onReset={designer.reset}
      />
      {designer.error && (
        <div role="alert" className="alert alert-error mt-2 text-xs py-2">
          <span>{designer.error}</span>
        </div>
      )}
      {designer.analysedOnce && designer.enrichedGuides.length === 0 && (
        <div role="alert" className="alert alert-warning mt-2 text-xs py-2">
          <span>No guides found. Try adjusting the mutation position or selecting a different base editor.</span>
        </div>
      )}
    </aside>
  );
}
