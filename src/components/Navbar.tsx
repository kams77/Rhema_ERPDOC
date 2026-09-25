import React from 'react';
import { User, Organization, SecurityAlert } from '../types';
import { 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  ChevronDown, 
  PlusCircle, 
  Lock, 
  AlertTriangle,
  FileCheck2,
  HelpCircle,
  Sparkles,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  organizations?: Organization[];
  currentOrg?: Organization;
  onSelectOrg?: (org: Organization) => void;
  users?: User[];
  allUsers?: User[];
  currentUser?: User;
  onSelectUser?: (user: User) => void;
  securityAlerts?: SecurityAlert[];
  onOpenSecurity?: () => void;
  onOpenNewAccount?: () => void;
  onCreateOrgClick?: () => void;
  onOpenHelp?: () => void;
  onHelpClick?: () => void;
  onOpenOrgIdentity?: () => void;
  onOpenWorkspace?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  organizations = [],
  currentOrg,
  onSelectOrg = (_org: Organization) => {},
  users,
  allUsers,
  currentUser,
  onSelectUser = (_user: User) => {},
  securityAlerts = [],
  onOpenSecurity = () => {},
  onOpenNewAccount,
  onCreateOrgClick,
  onOpenHelp,
  onHelpClick,
  onOpenOrgIdentity = () => {},
  onOpenWorkspace = () => {},
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const userList = users || allUsers || [];
  const activeAlertCount = (securityAlerts || []).filter(a => a && a.status !== 'resolue').length;

  const handleOpenAccountModal = onOpenNewAccount || onCreateOrgClick || (() => {});
  const handleOpenHelpModal = onOpenHelp || onHelpClick || (() => {});

  const activeOrg = currentOrg || organizations[0] || {
    id: 'default',
    name: 'Organisation',
    type: 'entreprise' as const,
  };

  const activeUser = currentUser || userList[0] || {
    id: 'default-user',
    name: 'Administrateur',
    role: 'dg' as const,
    roleTitle: 'Directeur Général (DG)',
    status: 'actif' as const,
    failedAccessAttempts: 0,
    canCreateSubAgents: true,
    email: 'admin@org.com',
    organizationId: activeOrg.id,
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'dg':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'chef_departement':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'directeur':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'chef_division':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'chef_service':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'agent':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Organization Selector */}
        <div className="flex items-center gap-3">
          <button
            id="btn-nav-org-logo-preview"
            onClick={onOpenOrgIdentity}
            title={activeUser.role === 'dg' ? "Modifier le Logo & Nom de l'entreprise (DG)" : "Logo officiel scellé par le DG"}
            className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shadow-lg shadow-indigo-500/10 overflow-hidden shrink-0 hover:border-indigo-500/50 transition-colors p-1"
          >
            {activeOrg.logo ? (
              <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Plateforme Hiérarchique</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                Laravel Eloquent Ready
              </span>
            </div>
            
            {/* Organization Dropdown & Identity Badge */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  id="btn-org-selector"
                  onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-indigo-300 transition-colors py-0.5"
                >
                  <span className="truncate max-w-[170px] sm:max-w-xs">{activeOrg.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showOrgDropdown && (
                  <div 
                    id="dropdown-org-menu"
                    className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Sélectionner l’Organisation
                    </div>
                    <div className="space-y-1 my-1">
                      {organizations.map((org) => (
                        <button
                          key={org.id}
                          id={`btn-select-org-${org.id}`}
                          onClick={() => {
                            onSelectOrg(org);
                            setShowOrgDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            activeOrg.id === org.id
                              ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                              {org.logo ? (
                                <img src={org.logo} alt={org.name} className="w-full h-full object-contain" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">{org.name}</div>
                              <span className="text-[10px] text-slate-400 uppercase">
                                {org.type === 'entreprise' ? '🏢 Entreprise' : org.type === 'etablissement' ? '🎓 Établissement' : '🤝 ONG'}
                              </span>
                            </div>
                          </div>
                          {activeOrg.id === org.id && <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-800 pt-2 mt-1 space-y-1">
                      <button
                        id="btn-nav-open-identity"
                        onClick={() => {
                          setShowOrgDropdown(false);
                          onOpenOrgIdentity();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-500/10 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Gérer le Nom & Logo ({activeUser.role === 'dg' ? 'Droit DG' : 'Consultation'})
                      </button>

                      <button
                        id="btn-create-org-account"
                        onClick={() => {
                          setShowOrgDropdown(false);
                          handleOpenAccountModal();
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Créer une nouvelle organisation (Droit Responsable)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Badge: DG Exclusive Right vs Protected */}
              {activeUser.role === 'dg' ? (
                <button
                  id="btn-nav-edit-org-identity"
                  onClick={onOpenOrgIdentity}
                  title="Modifier le Nom et le Logo officiel de l'organisation (Réservé au DG)"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300 transition-colors shrink-0"
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                  <span className="hidden sm:inline">Logo & Nom (DG)</span>
                  <span className="sm:hidden">Logo</span>
                </button>
              ) : (
                <button
                  id="btn-nav-locked-org-identity"
                  onClick={onOpenOrgIdentity}
                  title="Nom et Logo protégés : Seul le Responsable (DG) a le droit de les définir"
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-[10px] font-medium text-slate-400 transition-colors shrink-0"
                >
                  <Lock className="w-2.5 h-2.5 text-slate-500" />
                  <span className="hidden sm:inline">Logo scellé par DG</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right: Quick Role Switcher (Crucial for reviewing scoping rules!) */}
        <div className="flex items-center gap-2.5">
          
          {/* Employee Portal Access Button */}
          <button
            id="btn-nav-employee-workspace"
            onClick={onOpenWorkspace}
            title="Accéder au Portail Employé : Connexion, Pointage et Espace de Travail"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/20 hover:from-sky-500/30 hover:to-blue-600/30 border border-sky-400/40 text-xs font-semibold text-sky-200 transition-all shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Espace Employé (Travail)</span>
            <span className="sm:hidden">Travail</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Security Alert Indicator */}
          <button
            id="btn-navbar-security-alerts"
            onClick={onOpenSecurity}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeAlertCount > 0
                ? 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="hidden md:inline">Centre Sécurité</span>
            {activeAlertCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* User / Role Switcher Drawer */}
          <div className="relative">
            <button
              id="btn-user-role-switcher"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 text-left transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {activeUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="truncate max-w-[130px]">{activeUser.name}</span>
                  {activeUser.status === 'verrouille' ? (
                    <span className="px-1 py-0.2 text-[9px] bg-red-600 text-white rounded font-bold uppercase">Verrouillé</span>
                  ) : activeUser.status === 'convoque' ? (
                    <span className="px-1 py-0.2 text-[9px] bg-amber-500 text-slate-950 rounded font-bold uppercase">Convoqué</span>
                  ) : null}
                </div>
                <div className={`text-[10px] font-medium px-1.5 py-0.2 rounded border inline-block ${getRoleBadgeColor(activeUser.role)}`}>
                  {activeUser.roleTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div 
                id="dropdown-user-menu"
                className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-2 pb-2 mb-2 border-b border-slate-800">
                  <div className="text-xs font-semibold text-slate-200">Testez les Privilèges Hiérarchiques</div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    Changez d’utilisateur pour tester le cloisonnement des documents, des tâches et les alertes d'accès.
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                  {userList.map((u) => (
                    <button
                      key={u.id}
                      id={`btn-impersonate-${u.id}`}
                      onClick={() => {
                        onSelectUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        activeUser.id === u.id
                          ? 'bg-indigo-600/25 border border-indigo-500/40 text-white'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate flex items-center gap-1.5">
                          {u.name}
                          {u.status === 'verrouille' && <Lock className="w-3 h-3 text-red-400" />}
                          {u.status === 'convoque' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{u.roleTitle}</div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono ${getRoleBadgeColor(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            id="btn-help-guide"
            onClick={handleOpenHelpModal}
            title="Guide des règles & logique hiérarchique"
            className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
