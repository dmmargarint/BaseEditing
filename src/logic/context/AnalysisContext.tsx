import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Guide } from '../guides.ts';
import type { GenomeConfig } from '../genomeConfigs.ts';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

interface AnalysisContextType {
  jobId: string | null;
  progress: number;
  progressMessage: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  results: any;
  startAnalysis: (guides: Guide[], genomeObject: GenomeConfig) => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [results, setResults] = useState(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => { socketRef.current?.disconnect(); };
  }, []);

  useEffect(() => {
    if (!jobId || !socketRef.current) return;

    const socket = socketRef.current;

    setResults(null);
    setProgress(10);
    setProgressMessage('Beginning Analysis');
    setStatus('running');

    socket.emit('join-job', jobId);

    socket.on('status-update', (data) => {
      setProgress(data.progress);
      setProgressMessage(data.message);
      setStatus('running');
    });

    socket.on('analysis-finished', (finalResults) => {
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

  const startAnalysis = async (guides: Guide[], genomeObject: GenomeConfig) => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { withCredentials: true });
    }
    setStatus('running');
    setProgress(10);

    const ApiPostData = guides.map(guide => ({
      guideSeq: guide.guideSeq,
      editorName: guide.editor.name,
      genome: genomeObject.code,
    }));

    const res = await fetch(`${API_URL}/analyse-guides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ApiPostData }),
    });

    if (!res.ok) {
      setStatus('failed');
      return;
    }

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
