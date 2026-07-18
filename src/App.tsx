import { GuideProvider, useDesigner } from './logic/context/GuideContext.tsx';
import { Sidebar } from './logic/components/Sidebar.tsx';
import { Workspace } from './logic/components/Workspace.tsx';
import TopNavBar from './logic/components/TopNavBar.tsx';
import { AnalysisProvider } from './logic/context/AnalysisContext.tsx';
import { GuidesView } from './logic/components/GuidesView.tsx';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageMeta } from './hooks/usePageMeta.ts';

const MIN_SIDEBAR = 280;
const MAX_SIDEBAR = 900;

function AppLayout() {
  const { designer } = useDesigner();
  const hasGuides = designer.enrichedGuides.length > 0;
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(600);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Auto-expand whenever new guides arrive
  useEffect(() => {
    if (hasGuides) setCollapsed(false);
  }, [hasGuides]);

  const panelOpen = hasGuides && !collapsed;

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    e.preventDefault();
  }, [sidebarWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = startWidth.current - (e.clientX - startX.current);
      setSidebarWidth(Math.min(Math.max(newWidth, MIN_SIDEBAR), MAX_SIDEBAR));
    };
    const onMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-[90vh] w-full overflow-hidden">

      {/* SeqViz and Config */}
      <div
        className={`flex flex-row w-full overflow-hidden transition-all duration-300 ${
          panelOpen ? 'h-[45%]' : 'h-full'
        }`}
      >
        <Workspace />
        <div
          onMouseDown={handleDragStart}
          className="w-1 shrink-0 cursor-col-resize bg-slate-200 hover:bg-blue-400 active:bg-blue-500 transition-colors"
        />
        <Sidebar width={sidebarWidth} />
      </div>

      {/* Bottom panel: Guide table */}
      <div
        className={`w-full border-t border-gray-200 bg-white flex flex-col transition-all duration-300 ${
          panelOpen ? 'flex-1 overflow-hidden' : 'h-0 overflow-hidden'
        }`}
      >
        {/* Panel header with collapse button */}
        {hasGuides && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
            <span className="text-xs font-semibold ">
              Guides
              <span className="ml-2 font-normal">
                {designer.enrichedGuides.length} found
              </span>
            </span>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="flex items-center gap-1.5 text-xs hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-200"
              title={collapsed ? 'Expand guide table' : 'Collapse guide table'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`size-3.5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              {collapsed ? 'Show guides' : 'Hide'}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <GuidesView enrichedGuides={designer.enrichedGuides} />
        </div>
      </div>

      {/* Collapsed tab — visible when panel is hidden but guides exist */}
      {hasGuides && collapsed && (
        <div className="border-t border-gray-200 px-4 py-1.5 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center gap-1.5 text-xs hover:text-slate-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-3.5 rotate-180"
              fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <span className="font-semibold">Guides</span>
            <span className="">{designer.enrichedGuides.length} found</span>
          </button>
        </div>
      )}

    </div>
  );
}

function App() {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  usePageMeta(
    'Create Guide RNAs for Base Editing Applications',
    'Design guide RNAs for CRISPR base editing. Supports ABE8e and BE4max with SpCas9 and SaCas9, bystander edit detection, and off-target risk scoring.'
  );
  return (
    <>
      {!bannerDismissed && (
        <div className="md:hidden flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800">
          <span>This tool is designed for desktop use. Some features may not work on small screens.</span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="shrink-0 text-amber-500 hover:text-amber-800 transition-colors"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <TopNavBar />
      <AnalysisProvider>
        <GuideProvider>
          <AppLayout />
        </GuideProvider>
      </AnalysisProvider>
    </>
  );
}

export default App;
