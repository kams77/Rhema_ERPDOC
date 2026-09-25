import React, { useState } from 'react';
import { User, HierarchicalEntity, UserRole } from '../types';
import { getAgentCreationPermissions, isEntityInUserScope } from '../utils/rbac';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  Mail, 
  Phone,
  Building,
  UserX,
  AlertCircle
} from 'lucide-react';

interface AgentCrudViewProps {
  users: User[];
  currentUser: User;
  entities: HierarchicalEntity[];
  onCreateUser: (newUser: Omit<User, 'id' | 'failedAccessAttempts'>) => void;
  onRevokeUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const AgentCrudView: React.FC<AgentCrudViewProps> = ({
  users,
  currentUser,
  entities,
  onCreateUser,
  onRevokeUser,
  onToggleUserStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('agent');
  const [newRoleTitle, setNewRoleTitle] = useState('Agent Exécutant');
  const [newPhone, setNewPhone] = useState('+237 ');
  const [newDepartementId, setNewDepartementId] = useState('');
  const [newDirectionId, setNewDirectionId] = useState('');
  const [newDivisionId, setNewDivisionId] = useState('');
  const [newServiceId, setNewServiceId] = useState('');

  const permissions = getAgentCreationPermissions(currentUser);

  // Filter users that current user is authorized to see or manage
  const filteredUsers = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.roleTitle.toLowerCase().includes(q)) {
        return false;
      }
    }
    // DG sees all
    if (currentUser.role === 'dg') return true;

    // Others see users in their hierarchy scope
    if (currentUser.role === 'chef_departement') {
      return u.departementId === currentUser.departementId;
    }
    if (currentUser.role === 'directeur') {
      return u.directionId === currentUser.directionId;
    }
    if (currentUser.role === 'chef_division') {
      return u.divisionId === currentUser.divisionId;
    }
    if (currentUser.role === 'chef_service') {
      return u.serviceId === currentUser.serviceId;
    }
    return u.id === currentUser.id;
  });

  const canManageThisUser = (target: User): boolean => {
    if (currentUser.role === 'dg') return true; // DG can revoke anyone
    if (target.role === 'dg') return false; // Nobody can revoke DG
    if (currentUser.role === 'chef_departement') {
      return target.departementId === currentUser.departementId && target.role !== 'chef_departement';
    }
    if (currentUser.role === 'directeur') {
      return target.directionId === currentUser.directionId && target.role !== 'directeur' && target.role !== 'chef_departement';
    }
    if (currentUser.role === 'chef_division') {
      return target.divisionId === currentUser.divisionId && target.role === 'agent' || target.role === 'chef_service';
    }
    if (currentUser.role === 'chef_service') {
      return target.serviceId === currentUser.serviceId && target.role === 'agent';
    }
    return false;
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    onCreateUser({
      name: newName,
      email: newEmail,
      role: newRole,
      roleTitle: newRoleTitle,
      organizationId: currentUser.organizationId,
      departementId: newDepartementId || currentUser.departementId,
      directionId: newDirectionId || currentUser.directionId,
      divisionId: newDivisionId || currentUser.divisionId,
      serviceId: newServiceId || currentUser.serviceId,
      status: 'actif',
      phone: newPhone,
      canCreateSubAgents: newRole !== 'agent',
    });

    setNewName('');
    setNewEmail('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
              Gestion du Personnel & CRUD Hiérarchique
            </span>
            <span className="text-xs text-slate-400">Périmètre de recrutement</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Création, Habilitation & Révocation des Agents
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {currentUser.role === 'dg' 
              ? 'En tant que DG / Haute Direction, vous avez le pouvoir de créer tout type d’agent dans l’entreprise et révoquer qui que ce soit.'
              : `En tant que ${currentUser.roleTitle}, vos prérogatives de création d'agents sont strictement limitées à vos sous-entités hiérarchiques.`}
          </p>
        </div>

        <div>
          {permissions.canCreate && (
            <button
              id="btn-open-create-agent-modal"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Créer un Collaborateur
            </button>
          )}
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filtrer par nom, rôle ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
          <strong className="text-white">{filteredUsers.length}</strong> collaborateurs sous juridiction
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Collaborateur</th>
                <th className="p-3.5">Rôle & Rang</th>
                <th className="p-3.5">Rattachement Structurel</th>
                <th className="p-3.5">Statut Compte</th>
                <th className="p-3.5 text-right">Actions Hiérarchiques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.map((u) => {
                const canManage = canManageThisUser(u);

                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-200">{u.roleTitle}</span>
                      <div className="text-[10px] text-indigo-400 uppercase font-mono mt-0.5">
                        {u.role.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-[11px] text-slate-300">
                        {u.departementId && <span className="block text-slate-400">Dépt: {u.departementId}</span>}
                        {u.directionId && <span className="block text-slate-400">Dir: {u.directionId}</span>}
                        {u.serviceId && <span className="block text-emerald-400 font-medium">Service: {u.serviceId}</span>}
                        {u.role === 'dg' && <span className="text-amber-400 font-bold">Direction Générale</span>}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.status === 'actif' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Actif
                        </span>
                      ) : u.status === 'verrouille' ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px] inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 text-red-400" /> Verrouillé (Intrusion)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px] inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" /> Convoqué
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-toggle-status-${u.id}`}
                            onClick={() => onToggleUserStatus(u.id)}
                            title={u.status === 'actif' ? 'Verrouiller le compte' : 'Déverrouiller le compte'}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            {u.status === 'actif' ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>

                          <button
                            id={`btn-revoke-agent-${u.id}`}
                            onClick={() => onRevokeUser(u.id)}
                            title="Révoquer le collaborateur"
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/40 transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Hors prérogatives</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Créer / Habiliter un Collaborateur</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean-Marc Kamga"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Professionnel</label>
                  <input
                    type="email"
                    required
                    placeholder="email@organisation.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rang Hiérarchique</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setNewRole(r);
                      if (r === 'agent') setNewRoleTitle('Agent Exécutant');
                      if (r === 'chef_service') setNewRoleTitle('Chef de Service');
                      if (r === 'chef_division') setNewRoleTitle('Chef de Division');
                      if (r === 'directeur') setNewRoleTitle('Directeur de Pôle');
                      if (r === 'chef_departement') setNewRoleTitle('Chef de Département');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="agent">Agent (Exécutant)</option>
                    {permissions.allowedTargetLevels.includes('service') && <option value="chef_service">Chef de Service</option>}
                    {permissions.allowedTargetLevels.includes('division') && <option value="chef_division">Chef de Division</option>}
                    {permissions.allowedTargetLevels.includes('direction') && <option value="directeur">Directeur</option>}
                    {permissions.allowedTargetLevels.includes('departement') && <option value="chef_departement">Chef de Département</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Titre de Poste Officiel</label>
                  <input
                    type="text"
                    required
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Entité d'Affectation</label>
                <select
                  value={newServiceId}
                  onChange={(e) => {
                    setNewServiceId(e.target.value);
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Sélectionner l'entité hiérarchique --</option>
                  {entities.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name} ({ent.level})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Téléphone de Contact</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                >
                  Valider la Création
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
