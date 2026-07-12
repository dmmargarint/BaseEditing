import { ALL_EDITORS } from '../editorConfigs.ts';
import { ALL_GENOMES } from '../genomeConfigs.ts';
import { useState, useRef, useEffect } from 'react';
import { fasta } from 'bioinformatics-parser';

const API_URL = import.meta.env.VITE_API_URL;


type InputMode = 'paste' | 'fetch' | 'file';

interface Props {
  textInput: string;
  onSequenceChange: (sequence: string) => void;
  onAnalyse: () => void;
  selectedEditorName: string;
  setSelectedEditorName: (name: string) => void;
  desiredEdit: string;
  setDesiredEdit: (edit: string) => void;
  mutationPos: number;
  setMutationPos: (pos: number) => void;
  genome: string;
  setGenome: (genome: string) => void;
  onReset: () => void;
}

function EditorConfigPanel({
  textInput,
  onSequenceChange,
  onAnalyse,
  selectedEditorName,
  setSelectedEditorName,
  desiredEdit,
  setDesiredEdit,
  mutationPos,
  setMutationPos,
  genome,
  setGenome,
  onReset,
}: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [draftSequence, setDraftSequence] = useState('');
  const [position, setPosition] = useState('');
  const [windowSize, setWindowSize] = useState(150);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchedMutationPos, setFetchedMutationPos] = useState<number | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);

  const selectedGenomeConfig = ALL_GENOMES.find(g => g.code === genome) ?? ALL_GENOMES[0];
  const [chrom, setChrom] = useState(selectedGenomeConfig.chroms[0]);

  const handleGenomeChange = (code: string) => {
    setGenome(code);
    const config = ALL_GENOMES.find(g => g.code === code) ?? ALL_GENOMES[0];
    setChrom(config.chroms[0]);
  };

  useEffect(() => {
    if (!textInput && window.innerWidth >= 768) modalRef.current?.showModal();
  }, []);

  const openModal = () => {
    setDraftSequence(textInput);
    setFetchError('');
    modalRef.current?.showModal();
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    setDraftSequence('');
    setFetchError('');
    setFetchedMutationPos(null);
  };

  const handleLoad = () => {
    onSequenceChange(draftSequence);
    if (fetchedMutationPos !== null) setMutationPos(fetchedMutationPos);
    modalRef.current?.close();
  };

  const handleFetch = async () => {
    if (!position) return;
    setFetchLoading(true);
    setFetchError('');
    setFetchedMutationPos(null);
    try {
      const res = await fetch(
        `${API_URL}/sequence?chrom=${chrom}&pos=${position}&window=${windowSize}&genome=${genome}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDraftSequence(data.sequence);
      setFetchedMutationPos(windowSize + 1);
    } catch {
      setFetchError('Could not fetch sequence. Please try again or contact the author.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { error, result } = fasta.parse(text);
      if (!error && result?.[0]?.data) setDraftSequence(result[0].data);
    };
    reader.readAsText(file);
  };

  const seqLabel = textInput
    ? textInput.length > 36
      ? `${textInput.slice(0, 16)}…${textInput.slice(-16)}`
      : textInput
    : null;

  return (
    <>
      {/* Sequence indicator */}
      <fieldset className="fieldset mb-1">
        <legend className="fieldset-legend text-xs">DNA Sequence</legend>
        <div className="flex items-center gap-2 min-w-0">
          {seqLabel
            ? <span className="font-mono text-xs text-slate-500 truncate flex-1">{seqLabel}</span>
            : <span className="text-xs text-slate-400 italic flex-1">No sequence loaded</span>
          }
          <button
            type="button"
            className="btn btn-outline btn-primary btn-xs shrink-0"
            onClick={openModal}
          >
            {textInput ? 'Change' : 'Load'}
          </button>
        </div>
      </fieldset>

      {/* Load sequence modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box w-11/12 max-w-xl">
          <h3 className="font-semibold text-sm mb-3">
            Load sequence
          </h3>
          <div role="tablist" className="tabs tabs-border mb-4">
            {(['paste', 'fetch', 'file'] as InputMode[]).map((mode) => (
              <button
                key={mode}
                role="tab"
                className={`tab text-xs ${inputMode === mode ? 'tab-active' : ''}`}
                onClick={() => switchMode(mode)}
              >
                {mode === 'paste' ? 'Paste' : mode === 'fetch' ? 'Fetch from genome' : 'Upload FASTA'}
              </button>
            ))}
          </div>

          {inputMode === 'paste' && (
            <textarea
              className="textarea textarea-sm w-full font-mono"
              placeholder="Paste DNA sequence (ACGT…)"
              rows={5}
              value={draftSequence}
              onChange={(e) => setDraftSequence(e.target.value)}
            />
          )}

          {inputMode === 'fetch' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">
                Fetches a sequence window from the reference genome around a genomic coordinate.
              </p>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2 flex flex-col gap-1 min-w-0">
                  <label className="text-xs font-medium">Genome</label>
                  <select
                    className="select select-sm w-full"
                    value={genome}
                    onChange={(e) => handleGenomeChange(e.target.value)}
                  >
                    {ALL_GENOMES.map((g) => <option key={g.code} value={g.code}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Chromosome</label>
                  <select
                    className="select select-sm w-full"
                    value={chrom}
                    onChange={(e) => setChrom(e.target.value)}
                  >
                    {selectedGenomeConfig.chroms.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Genomic position</label>
                  <input
                    type="number"
                    className="input input-sm w-full"
                    placeholder="e.g. 32315086"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium">Window size (±bp)</label>
                  <input
                    type="number"
                    className="input input-sm w-full"
                    placeholder="150"
                    value={windowSize}
                    onChange={(e) => setWindowSize(Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                className="btn btn-sm btn-primary self-start"
                onClick={handleFetch}
                disabled={!position || fetchLoading}
              >
                {fetchLoading
                  ? <span className="loading loading-spinner loading-xs" />
                  : 'Fetch sequence'
                }
              </button>
              {fetchError && <p className="text-xs text-error">{fetchError}</p>}
              {fetchedMutationPos !== null && (
                <p className="text-xs text-info">
                  Position {position} ({chrom}) is at base {fetchedMutationPos} of this sequence. Mutation position will be set automatically on load.
                </p>
              )}
              {draftSequence && (
                <textarea
                  className="textarea textarea-sm w-full font-mono text-xs"
                  rows={3}
                  readOnly
                  value={draftSequence}
                />
              )}
            </div>
          )}

          {inputMode === 'file' && (
            <div className="flex flex-col gap-2">
              <input
                type="file"
                className="file-input file-input-ghost file-input-sm w-full"
                accept=".fasta,.fa"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-slate-400">Accepted: .fasta .fa</p>
              {draftSequence && (
                <textarea
                  className="textarea textarea-sm w-full font-mono text-xs"
                  rows={3}
                  readOnly
                  value={draftSequence}
                />
              )}
            </div>
          )}

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-link btn-sm mr-auto"
              onClick={() => setDraftSequence('TACCAGGCGTTCCTGGAGAACATGGAGCGATCAGACCCCCTGGGCTTCAGGGGATCAGAGG')}
            >
              Load Example
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleLoad}
              disabled={!draftSequence}
            >
              Load
            </button>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm">Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Config form */}
      <div className="w-full">
        <fieldset>
          <legend className="fieldset-legend text-xs">Genome</legend>
          <select
            className="select input-sm w-full h-8"
            name="genome"
            value={genome}
            onChange={(e) => setGenome(e.target.value)}
          >
            {ALL_GENOMES.map((ed, index) => (
              <option key={index} value={ed.code}>{ed.name}</option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend className="fieldset-legend text-xs">
            Base Editor
            <div
              className="tooltip tooltip-content"
              onClick={() => (document.getElementById('base_editor_type_info') as HTMLDialogElement)?.showModal()}
              style={{ cursor: 'pointer' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5"
                stroke="currentColor" className="size-[1.2em]">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
            </div>
          </legend>

          <dialog id="base_editor_type_info" className="modal">
            <div className="modal-box">
              <p className="py-4">
                Choose between a list of base editors or select Auto-Discover for an automatic discovery of suitable editors
              </p>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          <select
            className="select input-sm w-full"
            value={selectedEditorName}
            onChange={(e) => setSelectedEditorName(e.target.value)}
          >
            <option value="auto">Auto-Discover</option>
            {ALL_EDITORS.map((ed, index) => (
              <option key={index} value={ed.name}>{ed.name}</option>
            ))}
          </select>
        </fieldset>

        <legend className="fieldset-legend text-xs">Desired Edit</legend>
        <select
          className="select input-sm w-full"
          value={desiredEdit}
          onChange={(e) => setDesiredEdit(e.target.value)}
        >
          <option value="A_TO_G">A &rarr; G</option>
          <option value="C_TO_T">C &rarr; T</option>
        </select>

        <legend className="fieldset-legend text-xs">
          Mutation Position (or highlight the mutation in the visualiser)
        </legend>
        <input
          type="text"
          className="input input-sm w-full"
          value={mutationPos ?? ''}
          placeholder="Position number or HGVS i.e. c.4375C>T"
          onChange={(e) => setMutationPos(parseInt(e.target.value) || 0)}
        />

        <button
          className="btn btn-primary input-sm mt-4"
          onClick={onAnalyse}
        >
          Find Guides
        </button>
        <button
          className="btn btn-outline btn-default input-sm mt-4 ml-4"
          onClick={onReset}
        >
          Reset
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
    </>
  );
}

export default EditorConfigPanel;
