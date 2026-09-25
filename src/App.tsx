import React, { useState } from 'react';
import { 
  Organization, 
  HierarchicalEntity, 
  User, 
  DocumentItem, 
  TaskItem, 
  SecurityAlert, 
  AuditLog,
  NavigationTab,
  PayrollSystemConfig
} from './types';
import { 
  initialOrganizations, 
  initialEntities, 
  initialUsers, 
  initialDocuments, 
  initialTasks, 
  initialSecurityAlerts, 
  initialAuditLogs 
} from './data/initialData';
import { 
  initialPayrollConfigs, 
  createStandardPayrollSystem 
} from './data/standardPayroll';
import { isEntityInUserScope, getScopeDescription } from './utils/rbac';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HierarchyView } from './components/HierarchyView';
import { DocumentsView } from './components/DocumentsView';
import { WorkflowsView } from './components/WorkflowsView';
import { PayrollSystemView } from './components/PayrollSystemView';
import { SecurityView } from './components/SecurityView';
import { AgentCrudView } from './components/AgentCrudView';
import { AuditView } from './components/AuditView';
import { LaravelCodeView } from './components/LaravelCodeView';
import { AccountCreateModal } from './components/AccountCreateModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { OrgIdentityModal } from './components/OrgIdentityModal';
import { EmployeeWorkspaceView } from './components/EmployeeWorkspaceView';
import { ShieldAlert, AlertTriangle, X, Lock } from 'lucide-react';

export default function App() {
  // Global State
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [currentOrg, setCurrentOrg] = useState<Organization>(initialOrganizations[0]);
  const [entities, setEntities] = useState<HierarchicalEntity[]>(initialEntities);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // Default: DG
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(initialSecurityAlerts);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [payrollConfigs, setPayrollConfigs] = useState<Record<string, PayrollSystemConfig>>(initialPayrollConfigs);

  // UI state - Default to employee workspace as requested by user
  const [currentTab, setCurrentTab] = useState<NavigationTab>('workspace');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(initialEntities[0].id);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showOrgIdentityModal, setShowOrgIdentityModal] = useState(false);
  const [securityBanner, setSecurityBanner] = useState<{ message: string; alertId?: string } | null>(null);

  // Helper to append audit logs
  const logAction = (
    action: string, 
    details: string, 
    category: 'auth' | 'document' | 'task' | 'security' | 'admin'
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.roleTitle,
      action,
      details,
      ip: '192.168.1.104',
      category,
      hash: `sha256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Switch organization
  const handleSelectOrg = (orgOrId: Organization | string) => {
    const orgId = typeof orgOrId === 'string' ? orgOrId : orgOrId.id;
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      logAction(
        'Changement d\'organisation active',
        `Bascule vers l'organisation : ${org.name} (${org.type})`,
        'admin'
      );
    }
  };

  // Switch user role (Impersonation)
  const handleSelectUser = (userOrId: User | string) => {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      logAction(
        'Connexion / Changement de profil',
        `Session ouverte par ${user.name} en tant que ${user.roleTitle} (${user.role})`,
        'auth'
      );
    }
  };

  // Check entity access & trigger intrusion alert if out of scope
  const handleSelectEntity = (entityId: string) => {
    const targetEntity = entities.find(e => e.id === entityId);
    if (!targetEntity) return;

    const hasAccess = isEntityInUserScope(currentUser, entityId, entities);

    if (hasAccess) {
      setSelectedEntityId(entityId);
    } else {
      // INTRUSION DETECTED! Trigger alert & potential lock
      triggerIntrusionAlert(currentUser, targetEntity);
    }
  };

  // Core Intrusion and Alert Dispatch Engine
  const triggerIntrusionAlert = (agent: User, targetEntity: HierarchicalEntity) => {
    const newAttemptCount = agent.failedAccessAttempts + 1;
    const shouldLock = newAttemptCount >= 2;

    const dgUser = users.find(u => u.role === 'dg');
    const entityManagerName = targetEntity.managerName || 'Responsable Non Désigné';

    const alertId = `alt-${Date.now()}`;
    const newAlert: SecurityAlert = {
      id: alertId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      userId: agent.id,
      userName: agent.name,
      userRole: agent.role,
      userEntityName: agent.serviceId || agent.departementId || 'Non spécifiée',
      targetEntityId: targetEntity.id,
      targetEntityName: `${targetEntity.name} (${targetEntity.level})`,
      severity: shouldLock ? 'critique' : 'haute',
      attemptCount: newAttemptCount,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      reason: `Tentative d'accès non autorisée par ${agent.name} (${agent.roleTitle}) à l'entité ${targetEntity.name} hors de sa hiérarchie d'affectation.`,
      notifiedDgName: dgUser?.name || 'M. Jean-Paul Ndongo (DG)',
      notifiedManagerName: entityManagerName,
      status: shouldLock ? 'convocation_programmee' : 'alerte_emise',
      convocationNotice: shouldLock ? {
        summonDate: '2026-09-18 à 09h30 GMT+1',
        location: 'Salle du Conseil de Direction - Siège Social',
        panelMembers: [
          `${dgUser?.name || 'DG'} (Direction Générale)`,
          `${entityManagerName} (Responsable ${targetEntity.name})`,
          'Mme Claire Mbarga (Directrice des Ressources Humaines)',
          'Chef de la Sécurité des Systèmes d’Information (RSSI)',
        ],
        charges: [
          `Intrusion illégitime réitérée dans les bases de l'entité ${targetEntity.name}.`,
          `Violation du règlement intérieur et de la politique de sécurité des systèmes d'information.`,
          `Non-respect de l'étanchéité hiérarchique d'entreprise.`
        ]
      } : undefined,
    };

    // Update user state (attempts + lock status)
    setUsers(prev => prev.map(u => {
      if (u.id === agent.id) {
        return {
          ...u,
          failedAccessAttempts: newAttemptCount,
          status: shouldLock ? 'verrouille' : u.status,
        };
      }
      return u;
    }));

    // If current user was the agent who got locked, update currentUser too
    if (currentUser.id === agent.id) {
      setCurrentUser(prev => ({
        ...prev,
        failedAccessAttempts: newAttemptCount,
        status: shouldLock ? 'verrouille' : prev.status,
      }));
    }

    setAlerts(prev => [newAlert, ...prev]);

    // Log to Audit Trail
    logAction(
      shouldLock ? 'INTRUSION CRITIQUE - COMPTE VERROUILLÉ' : 'ALERTE D\'INTRUSION INTER-ENTITÉ',
      `L'agent ${agent.name} a forcé l'accès à ${targetEntity.name}. Tentative n°${newAttemptCount}. Notification transmise au DG et au responsable d'entité.`,
      'security'
    );

    // Set banner
    setSecurityBanner({
      message: shouldLock 
        ? `⚠️ INTRUSION CRITIQUE : Le compte de ${agent.name} a été VERROUILLÉ suite à ${newAttemptCount} tentatives. Une convocation disciplinaire a été dressée devant le DG et la Sécurité.`
        : `🚨 ALERTE DE SÉCURITÉ : Accès non autorisé bloqué vers ${targetEntity.name}. Un message d'alerte a été immédiatement télétransmis au DG et au responsable ${entityManagerName}.`,
      alertId,
    });
  };

  // Simulate intrusion for any user & target
  const handleSimulateIntrusion = (agentId: string, targetEntityId: string) => {
    const agent = users.find(u => u.id === agentId);
    const target = entities.find(e => e.id === targetEntityId);
    if (!agent || !target) return;
    triggerIntrusionAlert(agent, target);
  };

  // Unlock account (DG prerogative)
  const handleUnlockAccount = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: 'actif', failedAccessAttempts: 0 };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, status: 'actif', failedAccessAttempts: 0 }));
    }

    logAction(
      'Réhabilitation de compte',
      `Compte utilisateur ${userId} réhabilité et déverrouillé par le DG.`,
      'admin'
    );
  };

  // Mark alert resolved
  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolue' } : a));
    logAction(
      'Clôture d\'incident',
      `Alerte de sécurité ${alertId} marquée résolue après examen.`,
      'security'
    );
  };

  // Document management
  const handleCreateDocument = (newDocData: Omit<DocumentItem, 'id' | 'createdAt'>) => {
    const newDoc: DocumentItem = {
      ...newDocData,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setDocuments(prev => [newDoc, ...prev]);
    logAction(
      'Publication de Document',
      `Création de la pièce ${newDoc.referenceNumber} - ${newDoc.title} dans la catégorie ${newDoc.category}.`,
      'document'
    );
  };

  const handleSignDocument = (docId: string, signer: User) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const hash = `sha256-${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;

    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'signe',
          signature: {
            signedBy: signer.name,
            role: signer.roleTitle,
            timestamp: now,
            hash,
          },
        };
      }
      return doc;
    }));

    logAction(
      'E-Signature de Document',
      `Document ${docId} visé et scellé électroniquement par ${signer.name} (${signer.roleTitle}). Hash: ${hash}`,
      'document'
    );
  };

  // Task management
  const handleCreateTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: `task-${Date.now()}`,
    };
    setTasks(prev => [newTask, ...prev]);
    logAction(
      'Attribution de Tâche Workflow',
      `Nouvelle tâche ${newTask.type} assignée à ${newTask.assignedEntityName} par ${newTask.creatorName}.`,
      'task'
    );
  };

  const handleUpdateTaskStep = (taskId: string, stepId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSteps = t.steps.map(s => {
          if (s.id === stepId) {
            return {
              ...s,
              completed,
              completedBy: completed ? currentUser.name : undefined,
              completedAt: completed ? new Date().toISOString().slice(0, 16).replace('T', ' ') : undefined,
            };
          }
          return s;
        });
        return { ...t, steps: updatedSteps };
      }
      return t;
    }));
  };

  const handleValidateTask = (taskId: string, signer: User) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const hash = `sha256-${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'validee_terminee',
          signature: {
            signedBy: signer.name,
            role: signer.roleTitle,
            timestamp: now,
            hash,
          },
        };
      }
      return t;
    }));

    logAction(
      'Validation & E-Signature de Workflow',
      `Tâche ${taskId} validée formellement par ${signer.name} (${signer.roleTitle}).`,
      'task'
    );
  };

  // Agent CRUD
  const handleCreateUser = (newUserData: Omit<User, 'id' | 'failedAccessAttempts'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr-${Date.now()}`,
      failedAccessAttempts: 0,
    };
    setUsers(prev => [...prev, newUser]);
    logAction(
      'Création Collaborateur',
      `Création du compte ${newUser.name} (${newUser.roleTitle}) par ${currentUser.name}.`,
      'admin'
    );
  };

  const handleRevokeUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    logAction(
      'Révocation Collaborateur',
      `Révocation définitive du collaborateur ${target?.name || userId} exécutée par ${currentUser.name}.`,
      'admin'
    );
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'actif' ? 'verrouille' : 'actif';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Create new organization (Entreprise, Etablissement, ONG)
  const handleCreateOrg = (newOrg: Organization, newManagerUser?: User) => {
    setOrganizations(prev => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    if (newManagerUser) {
      setUsers(prev => [newManagerUser, ...prev]);
      setCurrentUser(newManagerUser);
    }

    // Propose default standard payroll system for the newly created organization
    const standardPayroll = createStandardPayrollSystem(newOrg.id, newOrg.name);
    setPayrollConfigs(prev => ({
      ...prev,
      [newOrg.id]: standardPayroll,
    }));

    logAction(
      'Création d\'Organisation & Dépôt d\'Identité',
      `Organisation "${newOrg.name}" (${newOrg.type}) créée. Seul le Responsable légal (${newOrg.managerName || 'DG'}) a défini le nom de l'entreprise et configuré son logo officiel.`,
      'admin'
    );
    logAction(
      'Modèle Standard de Paie Initialisé',
      `L'application a automatiquement proposé le modèle standard de paie légal pour "${newOrg.name}". Le département des Ressources Humaines (DRH) dispose de la pleine latitude pour définir son propre système.`,
      'admin'
    );
  };

  // Payroll Config Handlers (DRH & DG governance)
  const handleUpdatePayrollConfig = (updatedConfig: PayrollSystemConfig, auditNote?: string) => {
    setPayrollConfigs(prev => ({
      ...prev,
      [currentOrg.id]: updatedConfig,
    }));
    logAction(
      'Mise à jour Système de Paie RH',
      auditNote || `Le département RH (${currentUser.name}) a défini et enregistré le système de paie sur-mesure pour "${currentOrg.name}".`,
      'admin'
    );
  };

  const handleResetPayrollToStandard = () => {
    const standard = createStandardPayrollSystem(currentOrg.id, currentOrg.name);
    setPayrollConfigs(prev => ({
      ...prev,
      [currentOrg.id]: standard,
    }));
    logAction(
      'Réinitialisation Modèle Standard de Paie',
      `Rétablissement du modèle standard de paie proposé par l'application pour "${currentOrg.name}".`,
      'admin'
    );
  };

  // Update organization name and logo (Privilège exclusif du Responsable légal / DG)
  const handleUpdateOrgIdentity = (updatedName: string, updatedLogo: string, updatedDescription?: string) => {
    if (currentUser.role !== 'dg') {
      const targetEntity = entities[0] || {
        id: 'ent-org',
        name: currentOrg.name,
        code: 'ORG',
        level: 'departement' as const,
        organizationId: currentOrg.id,
        agentCount: 1,
      };
      triggerIntrusionAlert(currentUser, targetEntity);
      setSecurityBanner({
        message: `Alerte Sécurité : Tentative de modification non autorisée du Nom et Logo de l'entreprise par ${currentUser.name} (${currentUser.roleTitle}). Interception immédiate.`,
      });
      return;
    }

    const updatedOrg: Organization = {
      ...currentOrg,
      name: updatedName,
      logo: updatedLogo,
      description: updatedDescription !== undefined ? updatedDescription : currentOrg.description,
    };

    setCurrentOrg(updatedOrg);
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
    logAction(
      'Mise à jour Identité de l\'Entreprise',
      `Le Responsable (${currentUser.name}) a mis à jour le nom officiel ("${updatedName}") et le logo officiel de l'organisation.`,
      'admin'
    );
  };

  // Add entity
  const handleAddEntity = (newEntityData: Omit<HierarchicalEntity, 'id'>) => {
    const newEntity: HierarchicalEntity = {
      ...newEntityData,
      id: `ent-${Date.now()}`,
    };
    setEntities(prev => [...prev, newEntity]);
    logAction(
      'Création d\'Entité Hiérarchique',
      `Ajout de l'entité ${newEntity.name} (${newEntity.level}) dans l'organisation.`,
      'admin'
    );
  };

  // Update organization hierarchy config
  const handleUpdateOrgHierarchySettings = (settings: {
    hasDepartements: boolean;
    hasDirections: boolean;
    hasDivisions: boolean;
    hasServices: boolean;
  }) => {
    const updatedOrg = { ...currentOrg, ...settings };
    setCurrentOrg(updatedOrg);
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
    logAction(
      'Modification Architecture Organisation',
      `Mise à jour des échelons hiérarchiques actifs pour ${currentOrg.name}.`,
      'admin'
    );
  };

  const activeAlertCount = (alerts || []).filter(a => a && a.status !== 'resolue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f2fc] via-[#f0f6fd] to-[#e4effb] text-slate-800 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Security alert notification bar */}
      {securityBanner && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-lg sticky top-0 z-50 animate-in slide-in-from-top">
          <div className="flex items-center gap-2 max-w-5xl">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span>{securityBanner.message}</span>
          </div>
          <button
            onClick={() => setSecurityBanner(null)}
            className="p-1 rounded-lg hover:bg-black/20 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Account locked warning banner if current user was locked */}
      {currentUser.status === 'verrouille' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow sticky top-0 z-40">
          <Lock className="w-4 h-4" />
          <span>ATTENTION : Votre compte est actuellement VERROUILLÉ pour tentative d'intrusion. Seul le DG peut vous réhabiliter (utilisez le sélecteur de rôle en haut pour basculer sur le DG).</span>
        </div>
      )}

      {/* Primary Top Navigation Bar */}
      <Navbar
        currentOrg={currentOrg}
        organizations={organizations}
        currentUser={currentUser}
        users={users}
        allUsers={users}
        securityAlerts={alerts}
        onSelectOrg={handleSelectOrg}
        onSelectUser={handleSelectUser}
        onOpenSecurity={() => setCurrentTab('security')}
        onOpenNewAccount={() => setShowAccountModal(true)}
        onCreateOrgClick={() => setShowAccountModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onHelpClick={() => setShowHelpModal(true)}
        onOpenOrgIdentity={() => setShowOrgIdentityModal(true)}
        onOpenWorkspace={() => setCurrentTab('workspace')}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={currentTab}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onSelectTab={setCurrentTab}
          currentUser={currentUser}
          currentOrg={currentOrg}
          unreadAlertsCount={activeAlertCount}
          activeAlertCount={activeAlertCount}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {/* Employee Workspace View : Connexion & Travail Collaboratif */}
          {currentTab === 'workspace' && (
            <EmployeeWorkspaceView
              currentUser={currentUser}
              currentOrg={currentOrg}
              entities={entities}
              users={users}
              tasks={tasks}
              documents={documents}
              onSelectUser={handleSelectUser}
              onUpdateTaskStep={handleUpdateTaskStep}
              onCreateTask={handleCreateTask}
              onCreateDocument={handleCreateDocument}
              onLogAction={logAction}
            />
          )}

          {currentTab === 'hierarchy' && (
            <HierarchyView
              organization={currentOrg}
              entities={entities}
              currentUser={currentUser}
              onAddEntity={handleAddEntity}
              onUpdateOrgHierarchySettings={handleUpdateOrgHierarchySettings}
              onTriggerIntrusionAttempt={(target) => triggerIntrusionAlert(currentUser, target)}
              onOpenOrgIdentity={() => setShowOrgIdentityModal(true)}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsView
              documents={documents}
              currentUser={currentUser}
              entities={entities}
              users={users}
              onPublishDocument={handleCreateDocument}
              onCreateDocument={handleCreateDocument}
              onSignDocument={handleSignDocument}
              onTriggerIntrusionAttempt={(target) => triggerIntrusionAlert(currentUser, target)}
            />
          )}

          {currentTab === 'workflows' && (
            <WorkflowsView
              tasks={tasks}
              currentUser={currentUser}
              entities={entities}
              users={users}
              documents={documents}
              onCreateTask={handleCreateTask}
              onUpdateTaskStep={handleUpdateTaskStep}
              onValidateTask={handleValidateTask}
            />
          )}

          {currentTab === 'payroll' && (
            <PayrollSystemView
              currentOrg={currentOrg}
              currentUser={currentUser}
              users={users.filter(u => u.organizationId === currentOrg.id || !u.organizationId)}
              payrollConfig={payrollConfigs[currentOrg.id] || createStandardPayrollSystem(currentOrg.id, currentOrg.name)}
              onUpdatePayrollConfig={handleUpdatePayrollConfig}
              onResetToStandard={handleResetPayrollToStandard}
              onLogAction={logAction}
            />
          )}

          {currentTab === 'security' && (
            <SecurityView
              alerts={alerts}
              users={users}
              entities={entities}
              currentUser={currentUser}
              onSimulateIntrusion={handleSimulateIntrusion}
              onUnlockAccount={handleUnlockAccount}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {currentTab === 'agents' && (
            <AgentCrudView
              users={users}
              currentUser={currentUser}
              entities={entities}
              onCreateUser={handleCreateUser}
              onRevokeUser={handleRevokeUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView logs={auditLogs} />
          )}

          {currentTab === 'laravel' && (
            <LaravelCodeView />
          )}
        </main>
      </div>

      {/* Account Creation Modal (Entreprise, Etablissement, ONG) */}
      {showAccountModal && (
        <AccountCreateModal
          onClose={() => setShowAccountModal(false)}
          onCreateOrg={handleCreateOrg}
        />
      )}

      {/* Organization Identity & Logo Modal (Droit Exclusif Responsable DG) */}
      {showOrgIdentityModal && (
        <OrgIdentityModal
          organization={currentOrg}
          currentUser={currentUser}
          onClose={() => setShowOrgIdentityModal(false)}
          onUpdateIdentity={handleUpdateOrgIdentity}
          onTriggerUnauthorizedAttempt={(reason) => {
            const target = entities[0] || {
              id: 'ent-org',
              name: currentOrg.name,
              code: 'ORG',
              level: 'departement' as const,
              organizationId: currentOrg.id,
              agentCount: 1,
            };
            triggerIntrusionAlert(currentUser, target);
            setSecurityBanner({
              message: `Sécurité Sentinelle : ${reason}. Tentative bloquée et alerte émise au DG.`,
            });
          }}
        />
      )}

      {/* Full Help & Specification Guide Modal */}
      {showHelpModal && (
        <HelpGuideModal onClose={() => setShowHelpModal(false)} />
      )}
    </div>
  );
}
