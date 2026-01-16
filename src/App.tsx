import { GuideProvider } from './logic/context/GuideContext.tsx';
import { Sidebar } from './logic/components/Sidebar.tsx';
import { Workspace } from './logic/components/Workspace.tsx';
import TopNavBar from './logic/components/TopNavBar.tsx';

function App() {

  // const validateSequence = (sequence: string): boolean => {
  //     const cleanSeq = sequence.replace(/\s/g, '').toUpperCase();
  //     const validPattern = /^[ATCG]+$/;
  //     return validPattern.test(cleanSeq);
  // };

  return (
    <>
      <TopNavBar />
      <GuideProvider>
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

          <Workspace className="flex-1" />

          {/* RIGHT SIDEBAR: Config */}
          <Sidebar className="bg-white" />

        </div>
      </GuideProvider>
    </>
  );
}

export default App;