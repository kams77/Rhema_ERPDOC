import React from 'react';
import { 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Stamp, 
  Printer, 
  Share2, 
  Download, 
  X,
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { DocumentItem, User } from '../types';

/**
 * En-tête officiel RHEMA BUSINESS (RHEMA.PNG)
 */
export const RhemaDocumentHeader: React.FC<{
  className?: string;
  documentTitle?: string;
  referenceNumber?: string;
  date?: string;
}> = ({ className = '', documentTitle, referenceNumber, date }) => {
  return (
    <header className={`bg-white border-b-2 border-slate-100 pb-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Logo & Slogan RHEMA BUSINESS */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3">
            {/* SVG Logo VSAT Satellite */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-sm">
                {/* Ondes radioélectriques satellites */}
                <path d="M 38 32 A 30 30 0 0 1 54 22" fill="none" stroke="#0F4C81" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
                <path d="M 32 25 A 40 40 0 0 1 58 14" fill="none" stroke="#0F4C81" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
                <path d="M 82 32 A 30 30 0 0 0 66 22" fill="none" stroke="#0F4C81" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 2" />
                <path d="M 88 25 A 40 40 0 0 0 62 14" fill="none" stroke="#0F4C81" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3" />
                
                {/* Arche / Support Parabole Rouge */}
                <path d="M 30 68 C 24 45 42 22 60 22 C 78 22 96 45 90 68" fill="none" stroke="#E11D2A" strokeWidth="4" strokeLinecap="round" />
                <path d="M 44 80 L 76 80" stroke="#E11D2A" strokeWidth="5" strokeLinecap="round" />
                <path d="M 60 68 L 60 80" stroke="#E11D2A" strokeWidth="5" />
                
                {/* Globe Terrestre Bleu avec méridiens */}
                <circle cx="60" cy="46" r="22" fill="#0F4C81" />
                {/* Méridiens et Parallèles blancs */}
                <ellipse cx="60" cy="46" rx="12" ry="21" fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
                <line x1="60" y1="25" x2="60" y2="67" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
                <line x1="39" y1="46" x2="81" y2="46" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />
                <line x1="43" y1="36" x2="77" y2="36" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />
                <line x1="43" y1="56" x2="77" y2="56" stroke="#ffffff" strokeWidth="1.2" opacity="0.75" />
                
                {/* Émetteur satellite central */}
                <circle cx="60" cy="30" r="3.5" fill="#ffffff" />
                <line x1="60" y1="30" x2="60" y2="40" stroke="#E11D2A" strokeWidth="2" />
              </svg>
            </div>

            {/* Marque Textuelle */}
            <div>
              <div className="flex items-baseline tracking-tight">
                <span className="text-2xl font-black text-[#D32027] tracking-wider italic font-sans">
                  RHEMA
                </span>
                <span className="mx-1 text-[#D32027] font-black text-xl">📡</span>
                <span className="text-2xl font-extrabold text-[#0F4C81] italic tracking-wide font-sans">
                  BUSINESS
                </span>
              </div>

              {/* Slogan officiel bandeau rouge */}
              <div className="bg-[#E11D2A] text-white text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm inline-block shadow-sm">
                Your Vsat Technology Partner
              </div>
            </div>
          </div>

          {/* Mentions Légales & Fiscales du prestataire */}
          <div className="mt-2.5 text-[11px] text-slate-800 space-y-0.5 font-medium leading-tight">
            <div className="font-bold text-slate-900">
              Prestataire : <span className="text-[#0F4C81] font-extrabold">RHEMA BUSINESS</span>
            </div>
            <div>Adresse : 1B, Av . Bangala</div>
            <div className="font-mono text-[10.5px] text-slate-700">RCCM/20-A-01120</div>
            <div className="font-mono text-[10.5px] text-slate-700">Id. Nat : 01-H5300-N65775Q</div>
            <div className="font-mono text-[10.5px] text-slate-700">Numéro Impôt : A2166190U</div>
            <div className="font-semibold text-slate-800">Kinshasa-Kintambo</div>
          </div>
        </div>

        {/* Bloc Droite : Identification du document et date */}
        {(documentTitle || referenceNumber || date) && (
          <div className="text-right sm:max-w-xs flex flex-col items-start sm:items-end justify-between self-stretch pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right w-full">
              <div className="text-[10px] font-bold text-[#0F4C81] uppercase tracking-wider">
                Document Officiel d'Entreprise
              </div>
              {referenceNumber && (
                <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                  RÉF : {referenceNumber}
                </div>
              )}
              {date && (
                <div className="text-[10px] text-slate-500 mt-1">
                  Émis le : <span className="font-medium text-slate-700">{date}</span>
                </div>
              )}
              <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-semibold text-emerald-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Enregistrement Certifié RDC</span>
              </div>
            </div>

            {documentTitle && (
              <div className="mt-2 text-right">
                <span className="text-xs font-extrabold text-slate-900 uppercase">
                  {documentTitle}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Pied de page officiel RHEMA BUSINESS (RHEMA footer.PNG)
 */
export const RhemaDocumentFooter: React.FC<{
  className?: string;
  verificationCode?: string;
}> = ({ className = '', verificationCode = 'RHEMA-DOC-VERIFIED' }) => {
  return (
    <footer className={`bg-white pt-4 mt-auto select-none print:mt-auto ${className}`}>
      {/* Ligne de séparation supérieure */}
      <div className="border-t border-slate-200 mb-3" />

      {/* 3 Colonnes : Coordonnées | Identification légale | QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-1 pb-3 text-[11px] text-slate-800">
        {/* Colonne 1 : Coordonnées (6 colonnes) */}
        <div className="md:col-span-6 space-y-1">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#E11D2A] shrink-0 mt-0.5" />
            <span className="leading-tight text-[10.5px]">
              N°1B, Avenue Bangala, Q/Salongo C/Kintambo, Ville de Kinshasa-RDCONGO
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
            <a 
              href="https://www.rhemabusiness.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#0F4C81] hover:underline font-medium text-[10.5px]"
            >
              www.rhemabusiness.com
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <a 
              href="mailto:contact@rhemabusiness.com"
              className="text-slate-700 hover:underline text-[10.5px]"
            >
              contact@rhemabusiness.com
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-800 shrink-0" />
            <span className="font-semibold text-slate-900 text-[10.5px]">
              +243812791 228
            </span>
          </div>
        </div>

        {/* Colonne 2 : Identification Fiscale & Enregistrement (3 colonnes) */}
        <div className="md:col-span-3 border-l-0 md:border-l border-slate-200 md:pl-4 space-y-0.5 font-mono text-[10.5px]">
          <div className="font-bold text-slate-900">RCCM/20-A-01120</div>
          <div className="text-slate-700">Id.Nat.: 01-H5300-N65775Q</div>
          <div className="text-slate-700">N°Impôt : A2166190U</div>
        </div>

        {/* Colonne 3 : QR Code officiel d'authentification (3 colonnes) */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end">
          <div className="relative p-1 bg-white rounded border border-slate-200 shadow-sm flex items-center gap-2">
            {/* 4 coins de visée verts comme sur RHEMA footer.PNG */}
            <div className="relative w-16 h-16 p-1">
              <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500" />
              <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500" />

              {/* QR Code SVG réaliste vectoriel */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Coin Haut Gauche Finder Pattern */}
                <rect x="5" y="5" width="26" height="26" fill="#0F4C81" />
                <rect x="9" y="9" width="18" height="18" fill="#ffffff" />
                <rect x="13" y="13" width="10" height="10" fill="#0F4C81" />

                {/* Coin Haut Droit Finder Pattern */}
                <rect x="69" y="5" width="26" height="26" fill="#0F4C81" />
                <rect x="73" y="9" width="18" height="18" fill="#ffffff" />
                <rect x="77" y="13" width="10" height="10" fill="#0F4C81" />

                {/* Coin Bas Gauche Finder Pattern */}
                <rect x="5" y="69" width="26" height="26" fill="#0F4C81" />
                <rect x="9" y="73" width="18" height="18" fill="#ffffff" />
                <rect x="13" y="77" width="10" height="10" fill="#0F4C81" />

                {/* Petits modules de synchronisation et données */}
                <rect x="36" y="14" width="6" height="6" fill="#0F4C81" />
                <rect x="46" y="14" width="6" height="6" fill="#0F4C81" />
                <rect x="56" y="14" width="6" height="6" fill="#0F4C81" />
                <rect x="14" y="36" width="6" height="6" fill="#0F4C81" />
                <rect x="14" y="46" width="6" height="6" fill="#0F4C81" />
                <rect x="14" y="56" width="6" height="6" fill="#0F4C81" />

                {/* Motifs de données */}
                <rect x="36" y="36" width="10" height="10" fill="#0F4C81" />
                <rect x="52" y="36" width="8" height="8" fill="#0F4C81" />
                <rect x="66" y="36" width="8" height="8" fill="#0F4C81" />
                <rect x="80" y="36" width="8" height="8" fill="#0F4C81" />
                <rect x="36" y="52" width="8" height="8" fill="#0F4C81" />
                <rect x="48" y="48" width="12" height="12" fill="#E11D2A" />
                <rect x="66" y="52" width="10" height="10" fill="#0F4C81" />
                <rect x="82" y="52" width="6" height="6" fill="#0F4C81" />
                <rect x="36" y="68" width="8" height="8" fill="#0F4C81" />
                <rect x="50" y="68" width="8" height="8" fill="#0F4C81" />
                <rect x="64" y="68" width="14" height="14" fill="#0F4C81" />
                <rect x="84" y="68" width="8" height="8" fill="#0F4C81" />
                <rect x="36" y="82" width="10" height="10" fill="#0F4C81" />
                <rect x="52" y="82" width="6" height="6" fill="#0F4C81" />
                <rect x="82" y="82" width="10" height="10" fill="#0F4C81" />
              </svg>
            </div>
            <div className="hidden sm:block text-[9px] text-slate-500 leading-tight">
              <span className="font-bold text-slate-700 block">QR Sécurisé</span>
              <span>Audit RHEMA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau Graphique Inférieur Bicolore RHEMA BUSINESS (Bleu & Rouge) */}
      <div className="relative w-full h-3 sm:h-4 overflow-hidden flex">
        {/* Partie Bleue à gauche (environ 72% avec découpe diagonale) */}
        <div 
          className="h-full bg-[#0F4C81] flex-1"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%)'
          }}
        />
        {/* Espace blanc oblique */}
        <div className="w-2 sm:w-3 bg-white -ml-1 z-10 transform skew-x-[-24deg]" />
        {/* Partie Rouge à droite (environ 28%) */}
        <div 
          className="h-full bg-[#E11D2A] w-28 sm:w-44 -ml-2"
        />
      </div>
    </footer>
  );
};

/**
 * Conteneur complet d'une feuille officielle RHEMA BUSINESS (format A4 print-ready)
 */
export const RhemaDocumentPaper: React.FC<{
  title?: string;
  referenceNumber?: string;
  date?: string;
  children: React.ReactNode;
  className?: string;
  showSignatures?: boolean;
  electronicSignature?: DocumentItem['electronicSignature'];
  authorName?: string;
  authorEntity?: string;
}> = ({
  title,
  referenceNumber,
  date = new Date().toLocaleDateString('fr-FR'),
  children,
  className = '',
  showSignatures = true,
  electronicSignature,
  authorName,
  authorEntity
}) => {
  return (
    <div 
      className={`bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200 min-h-[700px] flex flex-col justify-between relative overflow-hidden print:p-0 print:shadow-none print:border-none ${className}`}
      id="rhema-printable-document"
    >
      {/* Filigrane discret officiel d'authenticité */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] select-none">
        <span className="text-7xl font-black rotate-[-25deg] tracking-widest text-[#0F4C81]">
          RHEMA BUSINESS
        </span>
      </div>

      {/* EN-TÊTE OFFICIEL */}
      <RhemaDocumentHeader 
        documentTitle={title} 
        referenceNumber={referenceNumber} 
        date={date} 
      />

      {/* CORPS PRINCIPAL DU DOCUMENT */}
      <main className="my-6 flex-1 space-y-4 text-xs text-slate-800 relative z-10">
        {children}

        {/* Section Visas & Signatures officielles si demandée */}
        {showSignatures && (
          <div className="mt-8 pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-[11px]">
            {/* Visa Émetteur */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                Émetteur / Service Rédacteur
              </div>
              <div className="font-bold text-slate-800">{authorName || 'RHEMA BUSINESS RH / DAF'}</div>
              <div className="text-slate-500 text-[10px]">{authorEntity || 'Direction Générale'}</div>
              <div className="mt-4 pt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400 italic">
                Visa pour transmission et exécution
              </div>
            </div>

            {/* Visa & Signature Électronique Certifiée RHEMA */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 relative">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center justify-between">
                <span>Certification Direction Générale</span>
                {electronicSignature && (
                  <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Certifié
                  </span>
                )}
              </div>

              {electronicSignature ? (
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{electronicSignature.signedBy}</div>
                  <div className="text-slate-500 text-[10px]">{electronicSignature.role}</div>
                  <div className="text-[9px] text-slate-400 font-mono">Date : {electronicSignature.signedAt}</div>
                  <div className="text-[8px] font-mono text-[#0F4C81] truncate bg-white p-1 rounded border border-slate-200 mt-1">
                    HASH: {electronicSignature.certificateHash}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-slate-400 italic text-[10px]">
                  En attente de signature certifiée de la direction
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PIED DE PAGE OFFICIEL */}
      <RhemaDocumentFooter />
    </div>
  );
};

/**
 * Modal Pop-up complet pour visualiser, exporter et imprimer tout document avec l'en-tête et pied de page RHEMA
 */
export const RhemaDocumentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  currentUser: User;
  onSign?: (docId: string, signer: User) => void;
  onShare?: (doc: DocumentItem) => void;
}> = ({
  isOpen,
  onClose,
  document,
  currentUser,
  onSign,
  onShare
}) => {
  const [shareSuccess, setShareSuccess] = React.useState(false);

  if (!isOpen || !document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare(document);
    }
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        {/* Barre d'actions supérieure */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>RHEMA BUSINESS — Document Officiel Partagé</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {document.referenceNumber}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Conforme aux chartes légales RDC (RCCM / Id.Nat / N°Impôt)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Partager */}
            <button
              onClick={handleShareClick}
              id="btn-share-document"
              className="px-3 py-1.5 rounded-lg bg-[#0F4C81] hover:bg-[#13406D] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Diffuser à tous les collaborateurs de l'entreprise"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Partager à l'Entreprise</span>
            </button>

            {/* Bouton Imprimer / PDF */}
            <button
              onClick={handlePrint}
              id="btn-print-rhema-document"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Imprimer ou Enregistrer en PDF avec l'En-tête et le Pied de Page RHEMA"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>

            {/* Fermer */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message de partage temporaire */}
        {shareSuccess && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Document partagé avec succès sur les terminaux et espaces collaborateurs de RHEMA BUSINESS.
              </span>
            </div>
          </div>
        )}

        {/* Zone de contenu de la feuille A4 avec ascenseur */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-800/60 flex-1 flex justify-center">
          <div className="w-full max-w-3xl">
            <RhemaDocumentPaper
              title={document.title}
              referenceNumber={document.referenceNumber}
              date={document.createdAt}
              authorName={document.authorName}
              authorEntity={document.authorEntity}
              electronicSignature={document.electronicSignature}
            >
              {/* Contenu spécifique du document */}
              <div className="space-y-4">
                {/* Bandeau Catégorie & Statut */}
                <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Nature du Document</span>
                    <span className="font-bold text-[#0F4C81]">{document.category.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-slate-600 ml-1">({document.subtype.replace(/_/g, ' ')})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Statut de validation</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      document.status === 'signe' ? 'bg-emerald-100 text-emerald-800' :
                      document.status === 'approuve' ? 'bg-blue-100 text-blue-800' :
                      document.status === 'en_revue' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {document.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Objet & Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-600 mb-1">
                    Objet / Contexte Opérationnel :
                  </h4>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed">
                    {document.description || "Document officiel interne de l'entreprise RHEMA BUSINESS, validé et archivé selon la procédure qualité ISO/Télécoms."}
                  </div>
                </div>

                {/* Montant ou valeur financière si applicable */}
                {document.amount !== undefined && (
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Montant Engagé / Total Facturé :
                    </span>
                    <span className="text-base font-extrabold font-mono text-[#0F4C81]">
                      {document.amount.toLocaleString('fr-FR')} {document.currency || 'USD'}
                    </span>
                  </div>
                )}

                {/* Clause de confidentialité pour bulletin de paie */}
                {document.isConfidentialPayslip && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Notice Confidentielle RH
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Ce document contient des données salariales et personnelles strictement confidentielles protégées par le secret professionnel et le code du travail. Toute diffusion non autorisée est interdite.
                    </p>
                  </div>
                )}
              </div>
            </RhemaDocumentPaper>
          </div>
        </div>

        {/* Pied de la modal avec signature rapide si éligible */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="text-[11px]">
            Ce document intègre obligatoirement l'en-tête et le pied de page RHEMA BUSINESS pour toute diffusion officielle.
          </div>

          <div className="flex items-center gap-2">
            {!document.electronicSignature && onSign && (
              <button
                onClick={() => onSign(document.id, currentUser)}
                id="btn-modal-sign-doc"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Stamp className="w-3.5 h-3.5" />
                Signer & Sceller pour RHEMA BUSINESS
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
