import TopNavBar from '../logic/components/TopNavBar.tsx';
import Footer from '../logic/components/Footer.tsx';

const aboutText = `
<h3>Introduction</h3>
This platform aims to help researchers and students find guide RNAs for CRISPR Base Editing (BE) applications and provide visual feedback on the 
edited DNA regions.

<h3>How it works:</h3>
The user provides DNA sequence and marks the position they want to edit by either selecting the mutation in the genome viewer or inserting the position number, along with the desired base change (e.g. A→G or C→T). The platform then searches a ±100 bp window around your target for all valid protospacer sites for each compatible editor, and returns only the guides that actually place your target base within the editing window.
For each guide, the platform distinguishes between the target edit (your intended change) and bystander edits — other bases of the same type that fall within the activity window and would also be converted. Bystander edits are shown alongside the intended change so you can assess whether a guide is suitable for your application.

<h3>DNA Input types:</h3>
<b>Paste</b> - Manually paste a raw DNA sequence into the provided text area for rapid analysis.
<b>Fetch from genome</b> - Retrieve a specific sequence directly from a database by providing the chromosome and genomic coordinates. You can define the size of the flanking region (± window size) around your target. 
<b>Upload Fasta</b> - Upload a standard .fasta or .fa file for processing.

<h3>Supported editors:</h3>
<b>ABE8e (SpCas9)</b> — converts A to G using an NGG PAM, with an activity window at positions 4–8.
<b>ABE8e (SaCas9)</b> — converts A to G using an NNGRRT PAM, with a broader activity window at positions 3–14.
<b>BE4max (SpCas9)</b> — converts C to T using an NGG PAM, with an activity window at positions 3–8.
<b>Auto-Select</b> - automatically picks the right editor(s) based on the base change requested.
<h3>Off-target analysis:</h3>
Unlike general-purpose CRISPR platforms, our off-target finder is tailored for BE applications. For each off-target alignment we calculate whether the guide can bind to the locus, and if it can bind, whether the editor can actually edit the off-target site. This gives rise to a binding score and an editing risk, which are multiplied together to produce the Final Risk. An off-target with a perfect binding score but no target base in the editing window gets a final risk of 0. Binding scores use CFD scoring (Doench et al. 2016) for SpCas9-based editors and MIT scoring (Hsu et al. 2013) for SaCas9. 
Guides are also assigned an efficiency score based on GC content, the probability of at least one edit occurring within the activity window given each position's activity weights, and a penalty for Pol III transcription termination motifs (TTTT).
The guides and scores provided by this platform must be further validated experimentally and cannot be solely relied upon.

Please <a href="mailto:dmmargarint@gmail.com" class="text-blue-600 underline">email the author</a> for queries, requests or feedback.
`;

const AboutPage = () => {
  return (
    <>
      <TopNavBar />

      <div className="max-w-5xl mx-auto px-8 py-10 text-[14px]">
        <div
          className="prose prose-sm whitespace-pre-wrap max-w-none"
          dangerouslySetInnerHTML={{ __html: aboutText }}
        />
        <div className="flex gap-4 mt-6">
          <a href="https://github.com/dmmargarint" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a href="https://linkedin.com/in/dmmargarint/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default AboutPage;