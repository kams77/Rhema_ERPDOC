import React, { useState } from 'react';
import { 
  HierarchicalEntity, 
  User, 
  Organization, 
  EntityLevel, 
  UserRole 
} from '../types';
import { isEntityInUserScope } from '../utils/rbac';
import { 
  Network, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Building, 
  Layers, 
  FolderTree, 
  CheckCircle2, 
  ShieldAlert, 
  Lock, 
  ShieldCheck, 
  Users, 
  Settings2,
  Info,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface HierarchyViewProps {
  organization: Organization;
  entities: HierarchicalEntity[];
  currentUser: User;
  onAddEntity: (newEntity: Omit<HierarchicalEntity, 'id'>) => void;
  onUpdateOrgHierarchySettings: (settings: {
    hasDepartements: boolean;
    hasDirections: boolean;
    hasDivisions: boolean;
    hasServices: boolean;
  }) => void;
  onTriggerIntrusionAttempt: (targetEntity: HierarchicalEntity) => void;
  onOpenOrgIdentity?: () => void;
}

export const HierarchyView: React.FC<HierarchyViewProps> = ({
  organization,
  entities = [],
  currentUser,
  onAddEntity = (_newEntity: Omit<HierarchicalEntity, 'id'>) => {},
  onUpdateOrgHierarchySettings = (_settings: {
    hasDepartements: boolean;
    hasDirections: boolean;
    hasDivisions: boolean;
    hasServices: boolean;
  }) => {},
  onTriggerIntrusionAttempt = (_targetEntity: HierarchicalEntity) => {},
  onOpenOrgIdentity = () => {},
}) => {
  const currentOrg = organization || {
    id: 'default-org',
    name: 'Organisation',
    type: 'entreprise' as const,
    hasDepartements: true,
    hasDirections: true,
    hasDivisions: true,
    hasServices: true,
    registrationNumber: 'REG-001',
    headquarters: 'Siège Social',
    email: 'contact@org.com',
    phone: '+237 000000000',
    description: '',
    createdAt: '2026-01-01',
  };

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [newEntityLevel, setNewEntityLevel] = useState<EntityLevel>('departement');
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityCode, setNewEntityCode] = useState('');
  const [newEntityManagerName, setNewEntityManagerName] = useState('');
  const [newEntityManagerEmail, setNewEntityManagerEmail] = useState('');
  const [newEntityDesc, setNewEntityDesc] = useState('');

  // Local state for hierarchy config
  const [hasDept, setHasDept] = useState(currentOrg.hasDepartements ?? true);
  const [hasDir, setHasDir] = useState(currentOrg.hasDirections ?? true);
  const [hasDiv, setHasDiv] = useState(currentOrg.hasDivisions ?? true);
  const [hasServ, setHasServ] = useState(currentOrg.hasServices ?? true);

  const entityList = entities || [];

  // Filter entities by level
  const departements = entityList.filter(e => e.level === 'departement');
  const getDirectionsForDept = (deptId: string) => entityList.filter(e => e.level === 'direction' && e.parentId === deptId);
  const getDivisionsForDir = (dirId: string) => entityList.filter(e => e.level === 'division' && e.parentId === dirId);
  const getServicesForDiv = (divId: string) => entityList.filter(e => e.level === 'service' && e.parentId === divId);

  // If hierarchy has no divisions, services might be directly attached to directions or departments
  const getDirectServicesForDir = (dirId: string) => entityList.filter(e => e.level === 'service' && e.parentId === dirId);
  const getDirectServicesForDept = (deptId: string) => entityList.filter(e => e.level === 'service' && e.parentId === deptId);

  const handleSaveOrgConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrgHierarchySettings({
      hasDepartements: hasDept,
      hasDirections: hasDir,
      hasDivisions: hasDiv,
      hasServices: hasServ,
    });
    setShowConfigModal(false);
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntityName.trim()) return;

    let managerRole: UserRole = 'chef_departement';
    if (newEntityLevel === 'direction') managerRole = 'directeur';
    if (newEntityLevel === 'division') managerRole = 'chef_division';
    if (newEntityLevel === 'service') managerRole = 'chef_service';

    onAddEntity({
      name: newEntityName,
      code: newEntityCode || `${newEntityLevel.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`,
      level: newEntityLevel,
      parentId: selectedParentId || undefined,
      organizationId: currentOrg.id,
      managerName: newEntityManagerName || 'Non assigné',
      managerEmail: newEntityManagerEmail || 'manager@org.com',
      managerRole,
      description: newEntityDesc,
      agentCount: 1,
    });

    setNewEntityName('');
    setNewEntityCode('');
    setNewEntityManagerName('');
    setNewEntityManagerEmail('');
    setNewEntityDesc('');
    setShowAddEntityModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center p-1.5 shadow-md overflow-hidden shrink-0">
            {currentOrg.logo ? (
              <img src={currentOrg.logo} alt={currentOrg.name} className="w-full h-full object-contain rounded-xl" />
            ) : (
              <Building className="w-7 h-7 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                {currentOrg.type === 'entreprise' ? '🏢 Entreprise' : currentOrg.type === 'etablissement' ? '🎓 Établissement' : '🤝 ONG'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentOrg.registrationNumber}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {currentOrg.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Identité et logo officiels définis par le Responsable ({currentOrg.managerName || 'Le Directeur Général'}). 
              Supervision globale par le DG et administration déconcentrée par les chefs d'entités.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-open-identity-modal-hierarchy"
            onClick={onOpenOrgIdentity}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
              currentUser.role === 'dg'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200 hover:bg-indigo-600/30'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
          >
            {currentUser.role === 'dg' ? (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Identité & Logo (DG)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Logo & Nom Protégés</span>
              </>
            )}
          </button>

          {currentUser.role === 'dg' && (
            <button
              id="btn-open-hierarchy-config"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              Politique Structurelle
            </button>
          )}

          {['dg', 'chef_departement', 'directeur', 'chef_division'].includes(currentUser.role) && (
            <button
              id="btn-add-new-entity"
              onClick={() => {
                setShowAddEntityModal(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Entité
            </button>
          )}
        </div>
      </div>

      {/* Structure Status Pill Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-xl border ${organization.hasDepartements ? 'bg-purple-950/20 border-purple-800/40 text-purple-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'}`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Niveau 1</div>
          <div className="text-sm font-bold flex items-center justify-between mt-1">
            <span>Départements</span>
            {organization.hasDepartements ? <CheckCircle2 className="w-4 h-4 text-purple-400" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{departements.length} configurés</div>
        </div>

        <div className={`p-3 rounded-xl border ${organization.hasDirections ? 'bg-blue-950/20 border-blue-800/40 text-blue-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'}`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Niveau 2</div>
          <div className="text-sm font-bold flex items-center justify-between mt-1">
            <span>Directions</span>
            {organization.hasDirections ? <CheckCircle2 className="w-4 h-4 text-blue-400" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{entities.filter(e => e.level === 'direction').length} configurées</div>
        </div>

        <div className={`p-3 rounded-xl border ${organization.hasDivisions ? 'bg-cyan-950/20 border-cyan-800/40 text-cyan-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'}`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Niveau 3</div>
          <div className="text-sm font-bold flex items-center justify-between mt-1">
            <span>Divisions</span>
            {organization.hasDivisions ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{entities.filter(e => e.level === 'division').length} configurées</div>
        </div>

        <div className={`p-3 rounded-xl border ${organization.hasServices ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'}`}>
          <div className="text-[10px] uppercase font-bold tracking-wider">Niveau 4</div>
          <div className="text-sm font-bold flex items-center justify-between mt-1">
            <span>Services & Agents</span>
            {organization.hasServices ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{entities.filter(e => e.level === 'service').length} configurés</div>
        </div>
      </div>

      {/* Organizational Hierarchy Interactive Tree */}
      <div className="space-y-4">
        {/* High Direction Card (PDG / DG / DGA) */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              DG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Haute Hiérarchie (Super Utilisateur Global)
                </span>
                <span className="text-xs text-slate-400">Dr. Amadou Diallo & Mme Clarisse Nguema</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Présidence & Direction Générale (PDG / DG / DGA)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Autorité suprême : voit TOUTES les publications du plus bas au plus haut niveau et dispose du pouvoir exclusif de création et révocation de tout agent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Accès universel débloqué
            </span>
          </div>
        </div>

        {/* Departments Loop */}
        <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-indigo-500/30">
          {departements.map((dept) => {
            const hasAccessToDept = isEntityInUserScope(currentUser, dept.id, entities);
            const deptDirections = getDirectionsForDept(dept.id);
            const directServices = getDirectServicesForDept(dept.id);

            return (
              <div key={dept.id} className="space-y-3">
                {/* Department Box */}
                <div className={`p-4 rounded-xl border transition-all ${
                  hasAccessToDept 
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-md' 
                    : 'bg-slate-900/40 border-slate-800/80 opacity-90'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold shrink-0">
                        DEP
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Département ({dept.code})
                          </span>
                          <span className="text-xs font-semibold text-slate-300">Responsable : {dept.managerName}</span>
                          {hasAccessToDept ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                              ✓ Dans votre périmètre
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
                              ✕ Hors périmètre
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{dept.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{dept.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!hasAccessToDept && (
                        <button
                          id={`btn-simulate-intrusion-${dept.id}`}
                          onClick={() => onTriggerIntrusionAttempt(dept)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-medium transition-colors"
                          title="Tester le déclencheur d'alerte intrusion"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Tester Intrusion
                        </button>
                      )}
                      <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {dept.agentCount} Agents
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Directions */}
                {deptDirections.length > 0 && (
                  <div className="pl-4 sm:pl-8 space-y-3 border-l-2 border-purple-500/20">
                    {deptDirections.map((dir) => {
                      const hasAccessToDir = isEntityInUserScope(currentUser, dir.id, entities);
                      const dirDivisions = getDivisionsForDir(dir.id);
                      const directDirServices = getDirectServicesForDir(dir.id);

                      return (
                        <div key={dir.id} className="space-y-2">
                          {/* Direction Card */}
                          <div className={`p-3.5 rounded-xl border transition-all ${
                            hasAccessToDir 
                              ? 'bg-slate-900/80 border-blue-500/40' 
                              : 'bg-slate-900/30 border-slate-800 opacity-85'
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 text-xs font-bold">
                                  DIR
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      Direction ({dir.code})
                                    </span>
                                    <span className="text-xs font-medium text-slate-300">Directeur : {dir.managerName}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white mt-0.5">{dir.name}</h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                {!hasAccessToDir && (
                                  <button
                                    id={`btn-simulate-intrusion-${dir.id}`}
                                    onClick={() => onTriggerIntrusionAttempt(dir)}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-[11px] font-medium"
                                  >
                                    <ShieldAlert className="w-3 h-3" />
                                    Accès non autorisé ?
                                  </button>
                                )}
                                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                                  {dir.agentCount} collaborateurs
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sub-Divisions */}
                          {dirDivisions.length > 0 && (
                            <div className="pl-4 sm:pl-6 space-y-2 border-l-2 border-blue-500/20">
                              {dirDivisions.map((div) => {
                                const hasAccessToDiv = isEntityInUserScope(currentUser, div.id, entities);
                                const divServices = getServicesForDiv(div.id);

                                return (
                                  <div key={div.id} className="space-y-2">
                                    {/* Division Card */}
                                    <div className={`p-3 rounded-lg border transition-all ${
                                      hasAccessToDiv 
                                        ? 'bg-slate-900/70 border-cyan-500/40' 
                                        : 'bg-slate-900/25 border-slate-800/80 opacity-80'
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                                            DIV
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-semibold text-cyan-300">Division : {div.name}</span>
                                            <span className="text-[11px] text-slate-400 ml-2">Chef : {div.managerName}</span>
                                          </div>
                                        </div>
                                        {!hasAccessToDiv && (
                                          <button
                                            id={`btn-simulate-intrusion-${div.id}`}
                                            onClick={() => onTriggerIntrusionAttempt(div)}
                                            className="text-[10px] text-red-400 hover:text-red-300 underline"
                                          >
                                            Tester accès
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sub-Services */}
                                    {divServices.length > 0 && (
                                      <div className="pl-4 sm:pl-6 space-y-1.5 border-l-2 border-cyan-500/20">
                                        {divServices.map((srv) => {
                                          const hasAccessToSrv = isEntityInUserScope(currentUser, srv.id, entities);

                                          return (
                                            <div
                                              key={srv.id}
                                              className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                                                hasAccessToSrv
                                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                                                  : 'bg-slate-900/20 border-slate-800 text-slate-400'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">
                                                  SRV
                                                </div>
                                                <div>
                                                  <span className="font-semibold text-white">{srv.name}</span>
                                                  <span className="text-[10px] text-slate-400 ml-2">
                                                    Chef de Service : {srv.managerName}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2">
                                                {hasAccessToSrv ? (
                                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                    Accès Autorisé
                                                  </span>
                                                ) : (
                                                  <button
                                                    id={`btn-simulate-intrusion-${srv.id}`}
                                                    onClick={() => onTriggerIntrusionAttempt(srv)}
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-[10px]"
                                                  >
                                                    <Lock className="w-2.5 h-2.5" /> Tenter accès
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Direct Services for Direction if no divisions */}
                          {directDirServices.length > 0 && (
                            <div className="pl-4 sm:pl-6 space-y-1.5 border-l-2 border-blue-500/20">
                              {directDirServices.map((srv) => (
                                <div key={srv.id} className="p-2.5 rounded-lg border bg-slate-900/50 border-slate-800 text-xs flex items-center justify-between">
                                  <span className="font-semibold text-white">{srv.name}</span>
                                  <span className="text-slate-400">{srv.managerName}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hierarchy Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Politique & Niveaux Hiérarchiques</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveOrgConfig} className="space-y-4 mt-4">
              <p className="text-xs text-slate-300">
                Selon la politique de l'Organisation, activez ou désactivez les échelons hiérarchiques applicables :
              </p>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">1. Départements</div>
                    <div className="text-[11px] text-slate-400">Grandes entités transversales (ex: DAF, DOP)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDept}
                    onChange={(e) => setHasDept(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">2. Directions</div>
                    <div className="text-[11px] text-slate-400">Pôles opérationnels (ex: DRH, Direction Financière)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDir}
                    onChange={(e) => setHasDir(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">3. Divisions</div>
                    <div className="text-[11px] text-slate-400">Sous-branches de spécialité (ex: Division Paie)</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDiv}
                    onChange={(e) => setHasDiv(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-white">4. Services</div>
                    <div className="text-[11px] text-slate-400">Unités de production et d’exécution des tâches</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasServ}
                    onChange={(e) => setHasServ(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                >
                  Enregistrer la Politique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Entity Modal */}
      {showAddEntityModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Créer une Entité Hiérarchique</h3>
              </div>
              <button onClick={() => setShowAddEntityModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEntity} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Niveau Hiérarchique</label>
                <select
                  value={newEntityLevel}
                  onChange={(e) => {
                    const lvl = e.target.value as EntityLevel;
                    setNewEntityLevel(lvl);
                    setSelectedParentId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="departement">Département (Supervisé directement par DG)</option>
                  <option value="direction">Direction (Rattaché à un Département)</option>
                  <option value="division">Division (Rattaché à une Direction)</option>
                  <option value="service">Service (Rattaché à une Division ou Direction)</option>
                </select>
              </div>

              {newEntityLevel !== 'departement' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Entité Parente Directe</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Sélectionner l'entité parente --</option>
                    {newEntityLevel === 'direction' &&
                      entities.filter(e => e.level === 'departement').map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                      ))
                    }
                    {newEntityLevel === 'division' &&
                      entities.filter(e => e.level === 'direction').map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                      ))
                    }
                    {newEntityLevel === 'service' &&
                      entities.filter(e => e.level === 'division' || e.level === 'direction').map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom de l'Entité</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Direction Audit Interne"
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code / Trigrame</label>
                  <input
                    type="text"
                    placeholder="ex: DIR-AUDIT"
                    value={newEntityCode}
                    onChange={(e) => setNewEntityCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsable Désigné</label>
                  <input
                    type="text"
                    placeholder="Nom du responsable"
                    value={newEntityManagerName}
                    onChange={(e) => setNewEntityManagerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    placeholder="email@organisation.com"
                    value={newEntityManagerEmail}
                    onChange={(e) => setNewEntityManagerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Missions & Attribution</label>
                <textarea
                  rows={2}
                  placeholder="Périmètre de responsabilité et délégation opérationnelle"
                  value={newEntityDesc}
                  onChange={(e) => setNewEntityDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEntityModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Créer l'Entité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
