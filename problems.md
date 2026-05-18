<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/425a0720-3eb9-421d-93b6-56fdac57b758" />
Delete not working, Card Respawns.
Chat WIndow Looks Bad.
<img width="2560" height="1440" alt="image" src="https://github.com/user-attachments/assets/fa891329-f042-4713-b9fd-528400448242" />
How About Using This UI and Logic Keeo The Color anf theme as it is.
Location & Structure
The chat/preview layout has two main parts:

Desktop Preview (lines 660-700 in App.tsx)

Hidden on mobile (lg:hidden)
Sticky positioned on the right side
Directly shows the generated letter in a preview container
Modal Preview (components/PreviewModal.tsx)

Used on mobile and desktop (triggered by "Preview" button)
Full-screen modal with editing capabilities
Desktop Preview Logic (App.tsx lines 660-700)
TSX
<div className="hidden lg:flex lg:sticky lg:top-24 lg:self-start h-auto lg:h-[calc(100vh-8rem)] flex-col gap-4">
  {/* Toolbar with Print/PDF button */}
  <div className="flex items-center justify-between...">
    {/* Fit to Page toggle & Print button */}
  </div>

  {/* Preview Container */}
  <div className="flex-grow bg-slate-200 rounded-xl overflow-hidden shadow-inner">
    {/* Editable Textarea showing the letter */}
    {generatedLetter ? (
      <textarea value={generatedLetter} onChange={...} />
    ) : (
      <div>Fill the form to see preview</div>
    )}
  </div>
</div>
Key Features:

Sticky Positioning: Stays visible while scrolling the form
Fit to Page Toggle: Scales content (95% when active)
Live Editing: Users can edit the letter directly in the textarea
Print/PDF Button: Opens the modal for advanced export options
Modal Preview Logic (PreviewModal.tsx)
TSX
export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, letterContent }) => {
  const [editableContent, setEditableContent] = useState(letterContent);
  
  return (
    <div className="fixed inset-0 z-[9999] ... bg-slate-900/90 backdrop-blur-sm">
      {/* Header */}
      {/* Editable Textarea */}
      {/* Action Buttons */}
      - Copy (to clipboard)
      - Share (native share or copy fallback)
      - Print (new window print)
      - Download PDF (html2pdf library)
    </div>
  );
};
Key Features:

Full-screen modal with blur backdrop
Editable content separate from main form
Multiple export options:
Copy to clipboard
Native share API (fallback to copy)
Print preview
PDF download using html2pdf
How They Work Together
User generates letter → handleGenerate() creates generatedLetter state
Desktop → Shows in sticky preview panel
Mobile → PlatformDetect.isMobile() auto-opens modal
Modal triggers → Via preview button or print/PDF button
Editing → Changes in modal don't affect main form (separate state)
Export → Uses html2pdf library for PDF generation
Key State Variables
TSX
const [generatedLetter, setGeneratedLetter] = useState<string>(''); // Main letter content
const [showModal, setShowModal] = useState<boolean>(false); // Modal visibility
const [fitToPage, setFitToPage] = useState<boolean>(false); // Scale toggle
const [editableContent, setEditableContent] = useState(...); // Modal editing state
The layout uses a two-column responsive design with desktop-right preview and mobile-modal pattern! 🎯
