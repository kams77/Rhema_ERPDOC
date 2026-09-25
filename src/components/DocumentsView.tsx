import React, { useState } from 'react';
import { 
  DocumentItem, 
  DocumentCategory, 
  DocumentSubtype, 
  User, 
  HierarchicalEntity, 
  UserRole 
} from '../types';
import { canUserViewDocument } from '../utils/rbac';
import { RhemaDocumentModal } from './RhemaOfficialDocument';
import { 
  Files, 
  Plus, 
  Filter, 
  Search, 
  Lock, 
  FileText, 
  DollarSign, 
  Truck, 
  Users, 
  CheckCircle2, 
  Stamp, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Download, 
  Clock, 
  AlertTriangle,
  Fingerprint,
  FileBadge
} from 'lucide-react';

interface DocumentsViewProps {
  documents?: DocumentItem[];
  currentUser?: User;
  entities?: HierarchicalEntity[];
  users?: User[];
  onPublishDocument?: (newDoc: Omit<DocumentItem, 'id'>) => void;
  onCreateDocument?: (newDoc: Omit<DocumentItem, 'id'>) => void;
  onSignDocument?: (docId: string, signer: User) => void;
  onTriggerIntrusionAttempt?: (targetEntity: HierarchicalEntity) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents = [],
  currentUser,
  entities = [],
  users = [],
  onPublishDocument,
  onCreateDocument,
  onSignDocument = (_docId: string, _signer: User) => {},
  onTriggerIntrusionAttempt = (_targetEntity: HierarchicalEntity) => {},
}) => {
  const activeUser = currentUser || {
    id: 'default-user',
    name: 'Administrateur',
    role: 'dg' as const,
    roleTitle: 'Directeur Général (DG)',
    status: 'actif' as const,
    failedAccessAttempts: 0,
    canCreateSubAgents: true,
    email: 'admin@org.com',
    organizationId: 'default',
  };

  const publishDocumentHandler = onPublishDocument || onCreateDocument || (() => {});
  const docList = documents || [];
  const entityList = entities || [];
  const userList = users || [];

  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Form state for publishing
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('financier_comptable');
  const [newSubtype, setNewSubtype] = useState<DocumentSubtype>('facture_client');
  const [newTargetEntityId, setNewTargetEntityId] = useState('');
  const [newTargetUserId, setNewTargetUserId] = useState('');
  const [newAmount, setNewAmount] = useState<number | undefined>(undefined);
  const [newCurrency, setNewCurrency] = useState('FCFA');
  const [newDescription, setNewDescription] = useState('');
  const [isConfidentialPayslip, setIsConfidentialPayslip] = useState(false);

  // Permission matrix settings
  const [allowedViewRoles, setAllowedViewRoles] = useState<UserRole[]>([
    'dg', 'chef_departement', 'directeur', 'chef_division', 'chef_service', 'agent'
  ]);
  const [allowedSignRoles, setAllowedSignRoles] = useState<UserRole[]>(['dg', 'directeur']);

  // Filter documents
  const filteredDocs = docList.filter((doc) => {
    if (!doc) return false;
    if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (doc.title || '').toLowerCase().includes(q) ||
        (doc.referenceNumber || '').toLowerCase().includes(q) ||
        (doc.authorName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSubtypeLabel = (subtype: DocumentSubtype): string => {
    switch (subtype) {
      case 'facture_client': return 'Facture Client';
      case 'facture_fournisseur': return 'Facture Fournisseur';
      case 'avoir': return 'Avoir Comptable';
      case 'bilan_comptable': return 'Bilan Comptable';
      case 'compte_resultat': return 'Compte de Résultat';
      case 'budget': return 'Budget Prévisionnel';
      case 'recu_fiscal': return 'Reçu Fiscal';
      case 'note_de_frais': return 'Note de Frais';
      case 'releve_bancaire': return 'Relevé Bancaire';
      case 'devis': return 'Devis Commercial';
      case 'bon_commande_client': return 'Bon de Commande Client';
      case 'contrat_commercial': return 'Contrat Commercial';
      case 'bon_livraison': return 'Bon de Livraison';
      case 'bon_reception': return 'Bon de Réception';
      case 'ordre_preparation': return 'Ordre de Préparation';
      case 'fiche_article': return 'Fiche Article';
      case 'inventaire_physique': return 'Inventaire Physique';
      case 'alerte_rupture_stock': return 'Alerte Rupture Stock';
      case 'demande_achat': return 'Demande d’Achat';
      case 'bon_commande_fournisseur': return 'Bon de Commande Fournisseur';
      case 'contrat_travail': return 'Contrat de Travail';
      case 'avenant': return 'Avenant Contrat';
      case 'fiche_poste': return 'Fiche de Poste';
      case 'bulletin_de_paie': return 'Bulletin de Paie (Confidentiel)';
      case 'feuille_de_temps': return 'Feuille de Temps';
      case 'solde_conges': return 'Solde de Congés';
      case 'compte_rendu_entretien': return 'Compte Rendu Entretien';
      case 'plan_formation': return 'Plan de Formation';
      default: return subtype;
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const isPayslip = newSubtype === 'bulletin_de_paie' || isConfidentialPayslip;

    publishDocumentHandler({
      title: newTitle,
      referenceNumber: `DOC-${Date.now().toString().slice(-6)}`,
      category: newCategory,
      subtype: newSubtype,
      organizationId: activeUser.organizationId,
      authorId: activeUser.id,
      authorName: activeUser.name,
      authorRole: activeUser.role,
      authorEntity: activeUser.roleTitle,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'en_revue',
      size: '1.4 MB',
      fileType: 'PDF/A Securisé',
      targetEntityId: newTargetEntityId || undefined,
      targetUserId: isPayslip ? newTargetUserId : undefined,
      isConfidentialPayslip: isPayslip,
      amount: newAmount,
      currency: newCurrency,
      allowedRoles: allowedViewRoles,
      permissions: {
        viewRoles: isPayslip ? ['dg', 'directeur', 'chef_service', 'agent'] : allowedViewRoles,
        editRoles: ['dg', 'chef_departement', 'directeur'],
        validateRoles: ['dg', 'chef_departement', 'directeur'],
        signRoles: allowedSignRoles,
      },
      description: newDescription,
    });

    setNewTitle('');
    setNewDescription('');
    setShowPublishModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
              Module 1 : Publication & Workflows
            </span>
            <span className="text-xs text-slate-400">Contrôle d'accès & Signatures</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Gestion Électronique des Documents & Habilitations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Publication sécurisée des documents financiers, logistiques et RH. Les droits d’accès (voir, éditer, signer) sont régis par l’échelle hiérarchique avec cloisonnement strict des bulletins de paie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role !== 'agent' && (
            <button
              id="btn-publish-document"
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Publier un Document
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tous les Documents ({documents.length})
          </button>
          <button
            onClick={() => setSelectedCategory('financier_comptable')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              selectedCategory === 'financier_comptable'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Financier & Comptable
          </button>
          <button
            onClick={() => setSelectedCategory('chaine_logistique_commerciale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              selectedCategory === 'chaine_logistique_commerciale'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Logistique & Commercial
          </button>
          <button
            onClick={() => setSelectedCategory('ressources_humaines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              selectedCategory === 'ressources_humaines'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Ressources Humaines (RH)
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par titre, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Special Notice for Payslip Confidentiality Rule */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-300">Règle Stricte de Confidentialité RH : </span>
          Conformément à la directive d'authentification, lorsqu'un <strong>Bulletin de Paie</strong> est publié, seuls <em>l'agent titulaire</em>, le <em>Directeur des Ressources Humaines (DRH)</em> et le <em>Service Traitement de la Paie</em> peuvent l'ouvrir et en examiner les montants. Les autres collaborateurs et directeurs d'autres branches en sont rigoureusement exclus.
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const access = canUserViewDocument(currentUser, doc, entities);
          const isPayslip = doc.subtype === 'bulletin_de_paie' || doc.isConfidentialPayslip;

          return (
            <div
              key={doc.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                access.allowed
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
                  : 'bg-slate-950/80 border-red-900/30 opacity-75'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    {doc.referenceNumber}
                  </span>
                  
                  {isPayslip ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Paie Sécurisée
                    </span>
                  ) : doc.status === 'signe' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                      <Stamp className="w-3 h-3 text-amber-400" />
                      E-Signé
                    </span>
                  ) : doc.status === 'approuve' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                      Approuvé
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      En revue
                    </span>
                  )}
                </div>

                {/* Title & Subtype */}
                <div className="text-[11px] font-semibold text-indigo-400 mb-1">
                  {getSubtypeLabel(doc.subtype)}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {doc.title}
                </h3>
                
                {doc.description && (
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                {/* Amount if present */}
                {doc.amount !== undefined && (
                  <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Montant :</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {access.allowed ? `${doc.amount.toLocaleString('fr-FR')} ${doc.currency || 'FCFA'}` : '•••••••• FCFA (Masqué)'}
                    </span>
                  </div>
                )}

                {/* E-Signature Stamp Display */}
                {doc.electronicSignature && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300/90 flex items-start gap-2">
                    <Stamp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-semibold text-amber-200 truncate">
                        Signé par {doc.electronicSignature.signedBy}
                      </div>
                      <div className="text-[10px] text-amber-400/80 font-mono truncate">
                        Hash : {doc.electronicSignature.certificateHash.slice(0, 24)}...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer with Access Status */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  Par <span className="text-slate-300 font-medium">{doc.authorName}</span>
                </div>

                <div>
                  {access.allowed ? (
                    <button
                      id={`btn-open-doc-${doc.id}`}
                      onClick={() => setPreviewDoc(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Consulter
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-red-400 font-medium bg-red-950/40 px-2 py-1 rounded border border-red-800/50">
                      <Lock className="w-3 h-3 text-red-400" />
                      Accès Restreint
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Detail / Preview Modal Officiel RHEMA BUSINESS */}
      <RhemaDocumentModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        currentUser={activeUser}
        onSign={(docId, signer) => {
          onSignDocument(docId, signer);
          setPreviewDoc(null);
        }}
      />

      {/* Publish Document Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Publier un Nouveau Document</h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catégorie Principale</label>
                <select
                  value={newCategory}
                  onChange={(e) => {
                    const cat = e.target.value as DocumentCategory;
                    setNewCategory(cat);
                    if (cat === 'financier_comptable') setNewSubtype('facture_client');
                    if (cat === 'chaine_logistique_commerciale') setNewSubtype('bon_commande_fournisseur');
                    if (cat === 'ressources_humaines') setNewSubtype('contrat_travail');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="financier_comptable">Documents et fichiers financiers et comptables</option>
                  <option value="chaine_logistique_commerciale">Chaîne logistique et commerciale</option>
                  <option value="ressources_humaines">Documents des Ressources Humaines (RH)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type Spécifique de Document</label>
                <select
                  value={newSubtype}
                  onChange={(e) => {
                    const sub = e.target.value as DocumentSubtype;
                    setNewSubtype(sub);
                    if (sub === 'bulletin_de_paie') {
                      setIsConfidentialPayslip(true);
                    } else {
                      setIsConfidentialPayslip(false);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {newCategory === 'financier_comptable' && (
                    <>
                      <option value="facture_client">Facture Client</option>
                      <option value="facture_fournisseur">Facture Fournisseur</option>
                      <option value="avoir">Avoir Comptable</option>
                      <option value="bilan_comptable">Bilan Comptable</option>
                      <option value="compte_resultat">Compte de Résultat</option>
                      <option value="budget">Budget Prévisionnel</option>
                      <option value="recu_fiscal">Reçu Fiscal</option>
                      <option value="note_de_frais">Note de Frais</option>
                      <option value="releve_bancaire">Relevé Bancaire</option>
                    </>
                  )}
                  {newCategory === 'chaine_logistique_commerciale' && (
                    <>
                      <option value="devis">Devis Commercial</option>
                      <option value="bon_commande_client">Bon de Commande Client</option>
                      <option value="contrat_commercial">Contrat Commercial</option>
                      <option value="bon_livraison">Bon de Livraison</option>
                      <option value="bon_reception">Bon de Réception</option>
                      <option value="ordre_preparation">Ordre de Préparation</option>
                      <option value="fiche_article">Fiche Article</option>
                      <option value="inventaire_physique">Inventaire Physique</option>
                      <option value="alerte_rupture_stock">Alerte Rupture Stock</option>
                      <option value="demande_achat">Demande d’Achat</option>
                      <option value="bon_commande_fournisseur">Bon de Commande Fournisseur</option>
                    </>
                  )}
                  {newCategory === 'ressources_humaines' && (
                    <>
                      <option value="contrat_travail">Contrat de Travail</option>
                      <option value="avenant">Avenant Contrat</option>
                      <option value="fiche_poste">Fiche de Poste</option>
                      <option value="bulletin_de_paie">Bulletin de Paie (Cloisonné & Sécurisé)</option>
                      <option value="feuille_de_temps">Feuille de Temps (Timesheet)</option>
                      <option value="solde_conges">Solde de Congés</option>
                      <option value="compte_rendu_entretien">Compte Rendu d'Entretien Annuel</option>
                      <option value="plan_formation">Plan de Formation</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titre du Document</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Facture N° FC-2026-104 ou Bulletin Paie Septembre"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Specific target agent if payslip */}
              {(newSubtype === 'bulletin_de_paie' || isConfidentialPayslip) && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-xl space-y-2">
                  <label className="block text-emerald-300 font-semibold">
                    Agent Titulaire du Bulletin (Seul habilité avec DRH et Service Paie)
                  </label>
                  <select
                    value={newTargetUserId}
                    onChange={(e) => setNewTargetUserId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Sélectionner l'agent destinataire --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entité Rattachée</label>
                  <select
                    value={newTargetEntityId}
                    onChange={(e) => setNewTargetEntityId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Entité Concernée --</option>
                    {entities.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.name} ({ent.level})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Montant / Valeur (optionnel)</label>
                  <input
                    type="number"
                    placeholder="Montant en FCFA"
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Contexte</label>
                <textarea
                  rows={2}
                  placeholder="Objet, justification financière ou légale..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Publier en Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
