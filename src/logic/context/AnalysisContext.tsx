import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Guide } from '../guides.ts';

const socket: Socket = io('http://localhost:4000');

interface AnalysisContextType {
  jobId: string | null;
  progress: number;
  progressMessage: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  results: any;
  startAnalysis: (guides: Guide[]) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    setResults(null);
    setProgress(10);
    setProgressMessage('Beginning Analysis');
    setStatus('running');

    socket.emit('join-job', jobId);

    socket.on('status-update', (data) => {
      console.log('status-update', data);
      setProgress(data.progress);
      setProgressMessage(data.message);
      setStatus('running');
    });

    socket.on('analysis-finished', (finalResults) => {
      console.log('analysis-finished', finalResults);
      setResults(finalResults);
      setProgressMessage('Analysis Complete');
      setStatus('completed');
      setProgress(100);
    });

    socket.on('analysis-failed', () => setStatus('failed'));

    return () => {
      socket.off('status-update');
      socket.off('analysis-finished');
      socket.off('analysis-failed');
    };
  }, [jobId]);

  const startAnalysis = async (guides: Guide[]) => {
    setStatus('running');
    setProgress(10);

    const ApiPostData = guides.map(guide => ({
      guideSeq: guide.guideSeq,
      editorName: guide.editor.name,
      genome: 'hg38', // TODO make this dynamic
    }));

    // TODO make the url into a variable
    const res = await fetch('http://localhost:3000/analyse-guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ApiPostData }),
    });

    const data = await res.json();
    setJobId(data.jobId);
  };

  return (
    <AnalysisContext.Provider value={{ jobId, progress, status, results, startAnalysis, progressMessage }}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error("useAnalysis must be used within AnalysisProvider");
  return context;
};