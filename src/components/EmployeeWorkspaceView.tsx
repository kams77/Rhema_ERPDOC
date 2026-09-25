import React, { useState, useEffect } from 'react';
import { 
  User, 
  Organization, 
  HierarchicalEntity, 
  TaskItem, 
  DocumentItem,
  TaskIntervenant
} from '../types';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Play, 
  Pause, 
  LogOut, 
  LogIn, 
  UserCheck, 
  Building2, 
  Send, 
  FileText, 
  Shield, 
  AlertCircle, 
  Calendar, 
  Coffee, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  FileCheck, 
  ArrowRight,
  Sparkles,
  Lock,
  User as UserIcon,
  Search,
  Filter,
  Users,
  X,
  Eye,
  Printer
} from 'lucide-react';
import { RhemaDocumentModal } from './RhemaOfficialDocument';

interface EmployeeWorkspaceViewProps {
  currentUser: User;
  currentOrg: Organization;
  entities: HierarchicalEntity[];
  users: User[];
  tasks: TaskItem[];
  documents: DocumentItem[];
  onSelectUser: (user: User) => void;
  onUpdateTaskStep: (taskId: string, stepId: string) => void;
  onCreateTask: (newTask: Partial<TaskItem>) => void;
  onCreateDocument: (doc: Partial<DocumentItem>) => void;
  onLogAction?: (action: string, details: string, category: 'auth' | 'document' | 'task' | 'security' | 'admin') => void;
}

export const EmployeeWorkspaceView: React.FC<EmployeeWorkspaceViewProps> = ({
  currentUser,
  currentOrg,
  entities,
  users,
  tasks,
  documents,
  onSelectUser,
  onUpdateTaskStep,
  onCreateTask,
  onCreateDocument,
  onLogAction = (_action: string, _details: string, _cat: 'auth' | 'document' | 'task' | 'security' | 'admin') => {},
}) => {
  // Authentication & Session Simulation State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>(currentUser.email || '');
  const [loginPassword, setLoginPassword] = useState<string>('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginFilterRole, setLoginFilterRole] = useState<string>('all');

  // Work session states
  const [workStatus, setWorkStatus] = useState<'working' | 'coffee_break' | 'stopped'>('working');
  const [sessionSeconds, setSessionSeconds] = useState<number>(3840); // Initial 1h04m
  const [coffeeBreakSeconds, setCoffeeBreakSeconds] = useState<number>(0);
  const [currentBreakStartTime, setCurrentBreakStartTime] = useState<string | null>(null);
  const [clockInTime, setClockInTime] = useState<string>('08:15:00');
  const [clockInDate] = useState<string>(() => 
    new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );
  const [pointageNotification, setPointageNotification] = useState<string | null>(
    `Pointage d'arrivée prélevé et certifié automatiquement à 08:15:00 pour l'agent ${currentUser.name}. Compteur de travail initialisé.`
  );
  const [coffeeBreaksList, setCoffeeBreaksList] = useState<Array<{
    id: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    reason: string;
  }>>([
    {
      id: 'cb-1',
      startTime: '10:00:00',
      endTime: '10:12:00',
      durationSeconds: 720,
      reason: 'Pause Café & Récupération'
    }
  ]);
  const [activeWorkTab, setActiveWorkTab] = useState<'tasks' | 'attendance' | 'documents' | 'transmissions' | 'profile'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<'faible' | 'normale' | 'haute' | 'urgente'>('normale');
  const [newTaskTargetEntityId, setNewTaskTargetEntityId] = useState<string>('');
  const [taskIntervenants, setTaskIntervenants] = useState<TaskIntervenant[]>([]);
  const [taskIntervenantSearch, setTaskIntervenantSearch] = useState<string>('');
  const [taskIntervenantError, setTaskIntervenantError] = useState<string | null>(null);
  const [intervenantFilterScope, setIntervenantFilterScope] = useState<'entity' | 'all'>('entity');

  // Transmissions internal message
  const [transmissionText, setTransmissionText] = useState<string>('');
  const [transmissionsList, setTransmissionsList] = useState<Array<{
    id: string;
    sender: string;
    recipient: string;
    message: string;
    time: string;
    type: 'note' | 'rapport' | 'alerte';
  }>>([
    {
      id: 'tx-1',
      sender: 'Directeur Général',
      recipient: 'Tout le personnel',
      message: 'Rappel : Clôture impérative des fiches d’activité et vérification des bons de commandes avant 17h00.',
      time: '09:00',
      type: 'note',
    },
    {
      id: 'tx-2',
      sender: 'Chef de Service',
      recipient: currentUser.name,
      message: 'Merci de valider en priorité les dossiers en attente avant le passage de l’audit de conformité.',
      time: '10:15',
      type: 'note',
    }
  ]);

  // Real-time clock counter: increments work seconds when working, increments break seconds when in coffee break
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive) {
      if (workStatus === 'working') {
        interval = setInterval(() => {
          setSessionSeconds(prev => prev + 1);
        }, 1000);
      } else if (workStatus === 'coffee_break') {
        interval = setInterval(() => {
          setCoffeeBreakSeconds(prev => prev + 1);
        }, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, workStatus]);

  // Coffee break interruption handler
  const handleStartCoffeeBreak = () => {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setWorkStatus('coffee_break');
    setCurrentBreakStartTime(nowTime);
    setCoffeeBreakSeconds(0);
    setPointageNotification(`Interruption du compteur de travail : Pause Café enclenchée à ${nowTime}. Le chronomètre est suspendu.`);
    onLogAction(
      'Interruption Compteur - Pause Café',
      `L'agent ${currentUser.name} (${currentUser.roleTitle}) a suspendu son compteur de temps de travail pour prendre une pause café à ${nowTime}.`,
      'auth'
    );
  };

  // Resume work from coffee break handler
  const handleResumeFromCoffeeBreak = () => {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const duration = coffeeBreakSeconds;
    const newBreakEntry = {
      id: `cb-${Date.now()}`,
      startTime: currentBreakStartTime || nowTime,
      endTime: nowTime,
      durationSeconds: duration,
      reason: 'Pause Café & Récupération'
    };
    setCoffeeBreaksList(prev => [newBreakEntry, ...prev]);
    setWorkStatus('working');
    setCurrentBreakStartTime(null);
    setCoffeeBreakSeconds(0);
    setPointageNotification(`Reprise de poste : Le compteur de travail est relancé (Fin pause café à ${nowTime}, durée : ${formatTime(duration)}).`);
    onLogAction(
      'Reprise Temps de Travail - Fin Pause Café',
      `L'agent ${currentUser.name} a repris son poste de travail à ${nowTime}. Durée de la pause café : ${formatTime(duration)}. Le compteur de travail est réactivé.`,
      'auth'
    );
  };

  // Format seconds to hh:mm:ss
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Find user's attached entity
  const userEntity = entities.find(e => 
    e.id === currentUser.serviceId || 
    e.id === currentUser.divisionId || 
    e.id === currentUser.directionId || 
    e.id === currentUser.departementId
  );

  // Find user's superior (N+1)
  const superior = users.find(u => {
    if (currentUser.role === 'agent') {
      return u.role === 'chef_service' && u.serviceId === currentUser.serviceId;
    }
    if (currentUser.role === 'chef_service') {
      return u.role === 'chef_division' && u.divisionId === currentUser.divisionId;
    }
    if (currentUser.role === 'chef_division') {
      return u.role === 'directeur' && u.directionId === currentUser.directionId;
    }
    if (currentUser.role === 'directeur') {
      return u.role === 'chef_departement' && u.departementId === currentUser.departementId;
    }
    return u.role === 'dg';
  }) || users.find(u => u.role === 'dg');

  // Filter tasks for current user or user entity
  const myTasks = tasks.filter(task => {
    const isDirectlyAssigned = task.assigneeId === currentUser.id;
    const isEntityTask = userEntity && (task.entityId === userEntity.id || task.authorEntity === userEntity.name);
    return isDirectlyAssigned || isEntityTask || currentUser.role === 'dg';
  });

  const displayedTasks = myTasks.filter(t => {
    if (taskFilter === 'pending') return t.status !== 'termine';
    if (taskFilter === 'completed') return t.status === 'termine';
    return true;
  });

  // Filter documents accessible to current user
  const myDocuments = documents.filter(doc => {
    if (currentUser.role === 'dg') return true;
    if (doc.targetUserId === currentUser.id || doc.authorId === currentUser.id) return true;
    if (userEntity && (doc.targetEntityId === userEntity.id || doc.authorEntity === userEntity.name)) return true;
    return true;
  });

  // Handle employee login with automatic pointage collection
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = users.find(u => 
      u.email.toLowerCase() === loginEmail.trim().toLowerCase() ||
      u.name.toLowerCase().includes(loginEmail.trim().toLowerCase())
    );

    if (matchedUser) {
      if (matchedUser.status === 'verrouille') {
        setLoginError('Ce compte employé est VERROUILLÉ suite à un incident de sécurité. Veuillez contacter la Direction.');
        return;
      }
      const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setClockInTime(nowTime);
      setSessionSeconds(0);
      setCoffeeBreakSeconds(0);
      onSelectUser(matchedUser);
      setIsSessionActive(true);
      setWorkStatus('working');
      setLoginError(null);
      setPointageNotification(`Pointage d'arrivée prélevé et certifié automatiquement à ${nowTime} pour ${matchedUser.name}. Compteur de travail initialisé.`);
      onLogAction(
        'Pointage d’Arrivée Automatique & Prise de Poste',
        `Pointage d'arrivée prélevé automatiquement pour l'employé ${matchedUser.name} (${matchedUser.roleTitle}) à ${nowTime}. Décompte du temps de travail lancé.`,
        'auth'
      );
    } else {
      setLoginError('Identifiant ou mot de passe non reconnu dans l’annuaire de l’entreprise.');
    }
  };

  // Quick switch employee with automatic pointage collection
  const handleQuickSelectEmployee = (user: User) => {
    if (user.status === 'verrouille') {
      setLoginError(`Le compte de ${user.name} est verrouillé pour sécurité.`);
      return;
    }
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLoginEmail(user.email);
    setClockInTime(nowTime);
    setSessionSeconds(0);
    setCoffeeBreakSeconds(0);
    onSelectUser(user);
    setIsSessionActive(true);
    setWorkStatus('working');
    setLoginError(null);
    setPointageNotification(`Pointage d'arrivée prélevé et certifié automatiquement à ${nowTime} pour ${user.name}. Compteur de travail initialisé.`);
    onLogAction(
      'Pointage d’Arrivée Automatique (Sélection Rapide)',
      `Pointage d'arrivée prélevé automatiquement pour ${user.name} (${user.roleTitle}) à ${nowTime} au sein de ${currentOrg.name}.`,
      'auth'
    );
  };

  // Helper to open task modal with default intervenants
  const handleOpenNewTaskModal = () => {
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('normale');
    setNewTaskTargetEntityId(userEntity?.id || (entities[0]?.id || ''));
    
    // Default assignment includes current user as primary responsable or executant
    setTaskIntervenants([
      {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userRoleTitle: currentUser.roleTitle,
        entityName: userEntity?.name || 'Service Opérationnel',
        roleType: currentUser.role.includes('chef') || currentUser.role.includes('directeur') ? 'responsable' : 'executant'
      }
    ]);
    setTaskIntervenantSearch('');
    setTaskIntervenantError(null);
    setShowNewTaskModal(true);
  };

  const toggleTaskIntervenant = (user: User) => {
    setTaskIntervenants(prev => {
      const exists = prev.find(i => i.userId === user.id);
      if (exists) {
        return prev.filter(i => i.userId !== user.id);
      } else {
        const entName = entities.find(e => e.id === user.serviceId || e.id === user.departementId || e.id === user.directionId)?.name || 'Service Opérationnel';
        return [
          ...prev,
          {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            userRoleTitle: user.roleTitle,
            entityName: entName,
            roleType: prev.length === 0 ? 'responsable' : 'executant'
          }
        ];
      }
    });
    setTaskIntervenantError(null);
  };

  const updateTaskIntervenantRole = (userId: string, roleType: 'responsable' | 'executant' | 'contributeur' | 'validateur') => {
    setTaskIntervenants(prev => prev.map(i => i.userId === userId ? { ...i, roleType } : i));
  };

  const removeTaskIntervenant = (userId: string) => {
    setTaskIntervenants(prev => prev.filter(i => i.userId !== userId));
  };

  // Handle task creation
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (taskIntervenants.length === 0) {
      setTaskIntervenantError("L'assignation aux personnes qui doivent intervenir est obligatoire. Veuillez sélectionner au moins un intervenant.");
      return;
    }

    const mappedPriority: 'basse' | 'normale' | 'haute' | 'critique' = 
      newTaskPriority === 'urgente' ? 'critique' :
      newTaskPriority === 'faible' ? 'basse' :
      newTaskPriority === 'haute' ? 'haute' : 'normale';

    const targetEntity = entities.find(e => e.id === newTaskTargetEntityId) || userEntity;
    const primaryIntervenant = taskIntervenants[0];

    const newTask: Partial<TaskItem> = {
      title: newTaskTitle.trim(),
      type: 'production',
      description: newTaskDesc.trim() || 'Tâche opérationnelle enregistrée par l’employé.',
      priority: mappedPriority,
      status: 'en_cours',
      assignedAgentId: primaryIntervenant.userId,
      assignedAgentName: taskIntervenants.map(i => i.userName).join(', '),
      assignedIntervenants: taskIntervenants,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      assignedEntityId: targetEntity?.id || userEntity?.id || 'dept-daf',
      assignedEntityName: targetEntity?.name || userEntity?.name || 'Département Opérationnel',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      organizationId: currentOrg.id,
      steps: [
        { 
          id: `st-1-${Date.now()}`, 
          label: 'Prise en charge et analyse du dossier', 
          completed: true,
          completedBy: currentUser.name,
          completedAt: new Date().toLocaleDateString('fr-FR'),
          assignedToUserId: primaryIntervenant.userId,
          assignedToUserName: primaryIntervenant.userName
        },
        { 
          id: `st-2-${Date.now()}`, 
          label: 'Traitement opérationnel et saisie des données', 
          completed: false,
          assignedToUserId: taskIntervenants[1]?.userId || primaryIntervenant.userId,
          assignedToUserName: taskIntervenants[1]?.userName || primaryIntervenant.userName
        },
        { 
          id: `st-3-${Date.now()}`, 
          label: 'Contrôle de conformité et visa du validateur', 
          completed: false,
          assignedToUserId: taskIntervenants.find(i => i.roleType === 'validateur')?.userId || primaryIntervenant.userId,
          assignedToUserName: taskIntervenants.find(i => i.roleType === 'validateur')?.userName || primaryIntervenant.userName
        },
      ]
    };

    onCreateTask(newTask);
    setShowNewTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setTaskIntervenants([]);
    setTaskIntervenantError(null);
    onLogAction(
      'Nouvelle Tâche Créée avec Assignation',
      `L'employé ${currentUser.name} a ouvert la tâche "${newTask.title}" en assignant ${taskIntervenants.length} intervenant(s) : ${taskIntervenants.map(i => `${i.userName} (${i.roleType})`).join(', ')}.`,
      'task'
    );
  };

  // Handle transmission sending
  const handleSendTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transmissionText.trim()) return;

    const newTx = {
      id: `tx-${Date.now()}`,
      sender: `${currentUser.name} (${currentUser.roleTitle})`,
      recipient: superior ? superior.name : 'Direction Générale',
      message: transmissionText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'rapport' as const,
    };

    setTransmissionsList(prev => [newTx, ...prev]);
    setTransmissionText('');
    onLogAction(
      'Transmission Hiérarchique',
      `Transmission interne envoyée par ${currentUser.name} à ${newTx.recipient} : "${newTx.message.substring(0, 40)}..."`,
      'task'
    );
  };

  // Filter users for the login selector
  const selectableStaff = users.filter(u => {
    if (loginFilterRole === 'agents') return u.role === 'agent';
    if (loginFilterRole === 'chefs') return u.role === 'chef_service' || u.role === 'chef_division';
    if (loginFilterRole === 'directeurs') return u.role === 'directeur' || u.role === 'chef_departement';
    if (loginFilterRole === 'dg') return u.role === 'dg';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. ÉCRAN DE CONNEXION / PORTAIL D'ACCÈS EMPLOYÉ (si non connecté ou si déconnexion) */}
      {!isSessionActive ? (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
          {/* Card Authentification Principale */}
          <div className="bg-white/95 rounded-3xl border border-sky-200/80 shadow-xl shadow-sky-950/5 p-6 sm:p-10 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-sky-100">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-1 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                  {currentOrg.logo ? (
                    <img src={currentOrg.logo} alt={currentOrg.name} className="w-full h-full object-contain rounded-xl bg-white p-1" />
                  ) : (
                    <Building2 className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200 mb-1">
                    <Shield className="w-3 h-3" />
                    Portail Numérique du Personnel
                  </span>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {currentOrg.name}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plateforme officielle de travail, de pointage et de traitement hiérarchique.
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Immatriculation</span>
                <span className="text-xs font-mono font-medium text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 inline-block mt-0.5">
                  {currentOrg.registrationNumber}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {loginError && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <form onSubmit={handleLoginSubmit} className="lg:col-span-6 space-y-4">
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <LogIn className="w-4 h-4 text-sky-600" />
                  <span>Connexion avec vos identifiants d'employé</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email professionnel ou Matricule Employé
                  </label>
                  <div className="relative">
                    <input
                      id="input-employee-login-email"
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ex: m.diop@techafrik-holdings.com ou EMP-PAIE-01"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
                      required
                    />
                    <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mot de passe / Code PIN Sécurisé
                  </label>
                  <div className="relative">
                    <input
                      id="input-employee-login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                    <span>Pointer automatiquement mon arrivée</span>
                  </label>
                  <span className="text-sky-600 hover:underline cursor-pointer">Aide connexion ?</span>
                </div>

                <button
                  id="btn-employee-submit-login"
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter & Démarrer ma session de travail</span>
                </button>
              </form>

              {/* Quick Select Employee (Fast switch in 1-click for demonstration) */}
              <div className="lg:col-span-6 bg-sky-50/70 border border-sky-100 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800">Accès Rapide Démo (1-Clic)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Choisir un collaborateur</span>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'agents', label: 'Agents' },
                    { id: 'chefs', label: 'Chefs Service' },
                    { id: 'directeurs', label: 'Directeurs' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setLoginFilterRole(f.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                        loginFilterRole === f.id
                          ? 'bg-sky-600 text-white font-semibold shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-sky-100/70'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Staff list */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectableStaff.slice(0, 8).map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleQuickSelectEmployee(u)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        currentUser.id === u.id
                          ? 'bg-white border-sky-400 shadow-sm ring-2 ring-sky-200'
                          : 'bg-white/80 border-sky-200/60 hover:bg-white hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{u.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{u.roleTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          u.role === 'agent' ? 'bg-slate-100 text-slate-700' :
                          u.role === 'chef_service' ? 'bg-emerald-100 text-emerald-700' :
                          u.role === 'directeur' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. ESPACE DE TRAVAIL OPÉRATIONNEL DE L'EMPLOYÉ CONNECTÉ */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Toast / Notification de Pointage Automatique Prélevé */}
          {pointageNotification && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-sky-500/15 to-teal-500/15 border border-emerald-300/80 text-emerald-950 flex items-center justify-between gap-3 text-xs shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-2 flex-wrap">
                    <span>Pointage Automatique Conforme</span>
                    <span className="px-1.5 py-0.5 bg-emerald-200/80 text-emerald-800 text-[10px] rounded uppercase font-semibold">
                      Horodatage Inviolable
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-900 truncate">
                    {pointageNotification}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPointageNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 text-xs shrink-0"
                title="Fermer la notification"
              >
                ✕
              </button>
            </div>
          )}

          {/* Bandeau d'Interruption Actif : Pause Café en Cours */}
          {workStatus === 'coffee_break' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-md text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <Coffee className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-amber-950">Pause Café en cours</span>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                      Compteur de travail interrompu
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1">
                    Votre temps de travail effectif est suspendu à <strong className="font-mono text-slate-900 font-bold">{formatTime(sessionSeconds)}</strong>. 
                    Pause débutée à <strong className="font-mono">{currentBreakStartTime}</strong> • Temps de pause écoulé : <strong className="font-mono text-amber-950 font-bold text-sm bg-amber-200/70 px-2 py-0.5 rounded">{formatTime(coffeeBreakSeconds)}</strong>.
                  </p>
                </div>
              </div>

              <button
                id="btn-employee-resume-from-coffee-banner"
                onClick={handleResumeFromCoffeeBreak}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Reprendre le travail (Relancer le compteur)</span>
              </button>
            </div>
          )}

          {/* Top Banner : Profil Employé, Horloge de Travail & Pointage */}
          <div className="bg-white/95 rounded-3xl border border-sky-200/80 shadow-md shadow-sky-950/5 p-6 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Informations Employé & Rattachement */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-500/20 shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      {currentUser.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                      {currentUser.roleTitle}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Matricule: EMP-{currentUser.id.substring(currentUser.id.length - 4).toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-700">Service :</span> 
                    <span className="text-sky-700 font-medium">{userEntity?.name || 'Direction Opérationnelle'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">Pointage Arrivée :</span>
                    <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{clockInTime}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">N+1 :</span>
                    <span className="text-slate-600">{superior?.name || 'Directeur Général'}</span>
                  </p>
                </div>
              </div>

              {/* Module de Pointage & Horloge Temps Réel */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-sky-50 to-blue-50/80 border border-sky-200/80 p-3.5 rounded-2xl flex-wrap">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-sky-600" />
                    <span>Temps de travail actif</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-sky-900 tracking-tight flex items-center gap-2">
                    <span>{formatTime(sessionSeconds)}</span>
                    {workStatus === 'coffee_break' && (
                      <span className="text-[10px] font-sans font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase tracking-wider">
                        Interrompu
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${
                      workStatus === 'working' ? 'bg-emerald-500 animate-pulse' :
                      workStatus === 'coffee_break' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}></span>
                    <span className="font-semibold text-slate-700">
                      {workStatus === 'working' ? 'En poste (Pointage prélevé)' :
                       workStatus === 'coffee_break' ? `En pause café (${formatTime(coffeeBreakSeconds)})` : 'Session suspendue'}
                    </span>
                  </div>
                </div>

                <div className="h-10 w-px bg-sky-200 mx-1 hidden sm:block"></div>

                {/* Pointage Controls & Pause Café */}
                <div className="flex items-center gap-2 flex-wrap">
                  {workStatus === 'working' ? (
                    <button
                      id="btn-employee-coffee-break"
                      onClick={handleStartCoffeeBreak}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                      title="Interrompre le compteur de temps de travail pour aller à la pause café"
                    >
                      <Coffee className="w-4 h-4 text-amber-100 animate-pulse" />
                      <span>Pause Café (Interrompre le compteur)</span>
                    </button>
                  ) : (
                    <button
                      id="btn-employee-resume"
                      onClick={handleResumeFromCoffeeBreak}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                      title="Reprendre le travail et relancer le compteur"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Reprendre le travail (Relancer compteur)</span>
                    </button>
                  )}

                  <button
                    id="btn-employee-logout"
                    onClick={() => {
                      setIsSessionActive(false);
                      setWorkStatus('stopped');
                      onLogAction(
                        'Déconnexion & Clôture de Poste',
                        `${currentUser.name} a clôturé sa session de travail. Temps total travaillé : ${formatTime(sessionSeconds)}.`,
                        'auth'
                      );
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>Changer de Compte</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Navigation interne de l'espace de travail */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-sky-100 overflow-x-auto">
              {[
                { id: 'tasks', label: `Mes Tâches Opérationnelles (${myTasks.length})`, icon: <CheckCircle2 className="w-4 h-4" /> },
                { id: 'attendance', label: `Pointage & Présences (${coffeeBreaksList.length + 1})`, icon: <Clock className="w-4 h-4" /> },
                { id: 'documents', label: `Mes Documents & Fiches (${myDocuments.length})`, icon: <FileText className="w-4 h-4" /> },
                { id: 'transmissions', label: 'Transmissions Hiérarchiques & Consignes', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'profile', label: 'Fiche de Poste & Habilitations', icon: <Shield className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveWorkTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeWorkTab === tab.id
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-sky-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. CONTENU DE L'ONGLET DE TRAVAIL ACTIF */}

          {/* TAB 1: MES TÂCHES DU JOUR */}
          {activeWorkTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 p-4 rounded-2xl border border-sky-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Feuille de Route & Tâches à Traiter</h3>
                    <p className="text-[11px] text-slate-500">Mettez à jour vos avancements et transmettez vos fiches finalisées.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setTaskFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        taskFilter === 'all' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600'
                      }`}
                    >
                      Toutes ({myTasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        taskFilter === 'pending' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600'
                      }`}
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => setTaskFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        taskFilter === 'completed' ? 'bg-white text-slate-800 shadow-sm font-bold' : 'text-slate-600'
                      }`}
                    >
                      Terminées
                    </button>
                  </div>

                  <button
                    id="btn-open-new-task-modal"
                    onClick={handleOpenNewTaskModal}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle Tâche</span>
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedTasks.map(task => (
                  <div 
                    key={task.id}
                    className="bg-white/95 rounded-2xl border border-sky-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          task.priority === 'urgente' ? 'bg-red-100 text-red-700 border border-red-200' :
                          task.priority === 'haute' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          Priorité {task.priority}
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          task.status === 'termine' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.status === 'termine' ? '✓ Validé / Terminé' : 'En cours de traitement'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 mb-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 mb-3">{task.description}</p>

                      {/* Intervenants assignés */}
                      <div className="mb-3 pt-2.5 pb-2 border-t border-b border-sky-100/80">
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-sky-600" />
                            <span>Personnes assignées pour intervenir ({task.assignedIntervenants?.length || 1})</span>
                          </span>
                          <span className="text-[9px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">
                            Assignation certifiée
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {task.assignedIntervenants && task.assignedIntervenants.length > 0 ? (
                            task.assignedIntervenants.map((intervenant) => (
                              <div
                                key={intervenant.userId}
                                className="inline-flex items-center gap-1.5 bg-sky-50/90 border border-sky-200/80 px-2 py-1 rounded-lg text-xs"
                              >
                                <div className="w-5 h-5 rounded bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center">
                                  {intervenant.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                </div>
                                <span className="font-semibold text-slate-800 text-[11px]">{intervenant.userName}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  intervenant.roleType === 'responsable' ? 'bg-indigo-100 text-indigo-700' :
                                  intervenant.roleType === 'validateur' ? 'bg-emerald-100 text-emerald-700' :
                                  intervenant.roleType === 'contributeur' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {intervenant.roleType === 'responsable' ? '👑 Resp.' :
                                   intervenant.roleType === 'validateur' ? '🛡️ Valid.' :
                                   intervenant.roleType === 'contributeur' ? '🤝 Contrib.' : '⚙️ Exéc.'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-sky-50/90 border border-sky-200/80 px-2 py-1 rounded-lg text-xs">
                              <span className="font-semibold text-slate-800 text-[11px]">{task.assignedAgentName || currentUser.name}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">⚙️ Exéc.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Steps checklist */}
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70 mb-3">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Étapes opérationnelles</div>
                        {task.steps?.map(step => (
                          <div 
                            key={step.id} 
                            onClick={() => onUpdateTaskStep(task.id, step.id)}
                            className="flex items-center gap-2 text-xs cursor-pointer group hover:text-sky-700"
                          >
                            <input 
                              type="checkbox" 
                              checked={step.completed} 
                              onChange={() => {}} 
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 pointer-events-none"
                            />
                            <span className={step.completed ? 'line-through text-slate-400' : 'text-slate-700'}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Rattaché à : <strong className="text-slate-700">{task.authorEntity || task.assignedEntityName}</strong></span>
                      <span className="font-semibold text-sky-700">Avancement : {task.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB POINTAGE & PRÉSENCES DU JOUR */}
          {activeWorkTab === 'attendance' && (
            <div className="space-y-6">
              {/* Header Card Pointage & Émargement */}
              <div className="bg-white/95 rounded-2xl border border-sky-200/80 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sky-100">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          Feuille d'Émargement & Pointage Officiel
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Prélèvement Automatique Actif</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Le pointage d'arrivée est prélevé dès l'ouverture du compte agent. L'interruption pour pause café suspend le compteur en toute conformité.
                      </p>
                    </div>
                  </div>

                  {/* Bouton Action Rapide Pause Café / Reprise */}
                  <div className="flex items-center gap-2">
                    {workStatus === 'working' ? (
                      <button
                        id="btn-attendance-tab-coffee-break"
                        onClick={handleStartCoffeeBreak}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>Prendre la Pause Café (Interrompre le compteur)</span>
                      </button>
                    ) : (
                      <button
                        id="btn-attendance-tab-resume"
                        onClick={handleResumeFromCoffeeBreak}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Fin de Pause Café (Relancer le compteur)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Indicateurs Clés de Présence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200/80">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Arrivée Automatique</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-emerald-950 mt-1">
                      {clockInTime}
                    </div>
                    <div className="text-[11px] text-emerald-700 mt-1">
                      Prélevé dès connexion • {clockInDate}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50/60 border border-sky-200/80">
                    <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>Temps Travail Effectif</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-sky-950 mt-1">
                      {formatTime(sessionSeconds)}
                    </div>
                    <div className="text-[11px] text-sky-700 mt-1 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${workStatus === 'working' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                      <span>{workStatus === 'working' ? 'Compteur actif' : 'Compteur suspendu'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" />
                      <span>Total Pause Café</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-amber-950 mt-1">
                      {formatTime(
                        coffeeBreaksList.reduce((acc, curr) => acc + curr.durationSeconds, 0) + 
                        (workStatus === 'coffee_break' ? coffeeBreakSeconds : 0)
                      )}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1">
                      {coffeeBreaksList.length + (workStatus === 'coffee_break' ? 1 : 0)} pause(s) aujourd'hui
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-50/60 border border-indigo-200/80">
                    <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Statut de Conformité</span>
                    </div>
                    <div className="text-sm font-bold text-indigo-950 mt-2">
                      {workStatus === 'working' ? 'En Poste Actif' :
                       workStatus === 'coffee_break' ? 'En Pause Café' : 'Poste Clôturé'}
                    </div>
                    <div className="text-[11px] text-indigo-700 mt-1">
                      Conforme protocole RH
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau Chronologique des Pointages & Interruptions de la Journée */}
              <div className="bg-white/95 rounded-2xl border border-sky-200/80 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-sky-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Journal des Événements de Pointage (Aujourd'hui)
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Agent : {currentUser.name} • Matricule : EMP-{currentUser.id.substring(currentUser.id.length - 4).toUpperCase()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sky-50/70 border-b border-sky-100 text-[11px] font-semibold text-slate-600 uppercase">
                      <tr>
                        <th className="p-3">Événement de Pointage</th>
                        <th className="p-3">Heure Enregistrée</th>
                        <th className="p-3">Impact sur le Compteur</th>
                        <th className="p-3">Durée / Observation</th>
                        <th className="p-3">Validation & Visa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {/* 1. Pointage d'arrivée automatique */}
                      <tr className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>Prise de poste / Arrivée</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Prélèvement automatique à l'ouverture du compte agent
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-800">
                          {clockInTime}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Initialisation Compteur de Travail
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          Session démarrée pour {userEntity?.name || 'Service'}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Certifié Automatique</span>
                          </span>
                        </td>
                      </tr>

                      {/* 2. Pauses café prises */}
                      {coffeeBreaksList.map((cb, idx) => (
                        <tr key={cb.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pause Café #{idx + 1}</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Interruption déclenchée par bouton agent
                            </div>
                          </td>
                          <td className="p-3 font-mono text-slate-800">
                            {cb.startTime} → {cb.endTime}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Compteur de Travail Interrompu
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {formatTime(cb.durationSeconds)} ({cb.reason})
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              ✓ Enregistré au registre RH
                            </span>
                          </td>
                        </tr>
                      ))}

                      {/* 3. Pause café en cours si active */}
                      {workStatus === 'coffee_break' && (
                        <tr className="bg-amber-50/80 border-2 border-amber-300">
                          <td className="p-3">
                            <div className="font-bold text-amber-950 flex items-center gap-2">
                              <Coffee className="w-4 h-4 text-amber-600 animate-bounce" />
                              <span>Pause Café en cours...</span>
                            </div>
                            <div className="text-[10px] text-amber-800">
                              Interruption active de session
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-900">
                            {currentBreakStartTime} → En cours
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                              Compteur de Travail Suspendu
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-900">
                            {formatTime(coffeeBreakSeconds)}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={handleResumeFromCoffeeBreak}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Reprendre le travail</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Pointage certifié sous l'autorité de la Direction Générale ({currentOrg.name}).</span>
                  </div>
                  <button
                    onClick={() => {
                      onLogAction(
                        'Téléchargement Fiche de Présence',
                        `L'agent ${currentUser.name} a téléchargé son attestation de présence et pointage du ${clockInDate}.`,
                        'document'
                      );
                      alert(`Attestation d'émargement générée pour ${currentUser.name} (Pointage d'arrivée : ${clockInTime}, Temps travaillé : ${formatTime(sessionSeconds)}).`);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-sky-300 bg-white hover:bg-sky-50 text-sky-800 font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Télécharger / Imprimer la Fiche d'Émargement</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MES DOCUMENTS & FICHES */}
          {activeWorkTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/90 p-4 rounded-2xl border border-sky-200/80">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dossiers & Documents Opérationnels</h3>
                  <p className="text-[11px] text-slate-500">Consultez les pièces de votre service ou soumettez un nouveau document.</p>
                </div>

                <button
                  onClick={() => {
                    const sampleDoc: Partial<DocumentItem> = {
                      title: `Bordereau Opérationnel - ${currentUser.name}`,
                      referenceNumber: `DOC-SRV-${Math.floor(1000 + Math.random() * 9000)}`,
                      category: 'ressources_humaines',
                      subtype: 'note_de_frais',
                      authorId: currentUser.id,
                      authorName: currentUser.name,
                      authorRole: currentUser.role,
                      authorEntity: userEntity?.name || 'Service Actif',
                      status: 'en_revue',
                      size: '1.4 MB',
                      fileType: 'PDF',
                      organizationId: currentOrg.id,
                      createdAt: new Date().toISOString(),
                      allowedRoles: ['agent', 'chef_service', 'chef_division', 'directeur', 'dg'],
                      permissions: {
                        viewRoles: ['agent', 'chef_service', 'chef_division', 'directeur', 'dg'],
                        editRoles: [currentUser.role],
                        validateRoles: ['chef_service', 'chef_division', 'directeur', 'dg'],
                        signRoles: ['chef_division', 'directeur', 'dg'],
                      }
                    };
                    onCreateDocument(sampleDoc);
                    onLogAction(
                      'Création Document Employé',
                      `L'employé ${currentUser.name} a soumis le document "${sampleDoc.title}" pour visa hiérarchique.`,
                      'document'
                    );
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Soumettre une Fiche / Rapport</span>
                </button>
              </div>

              <div className="bg-white/95 rounded-2xl border border-sky-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sky-50/70 border-b border-sky-100 text-[11px] font-semibold text-slate-600 uppercase">
                      <tr>
                        <th className="p-3">Référence & Titre</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Auteur / Service</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3">Visa Supérieur</th>
                        <th className="p-3 text-right">Document Officiel RHEMA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-sky-50/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{doc.title}</div>
                            <div className="text-[10px] font-mono text-slate-400">{doc.referenceNumber}</div>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                              {doc.fileType} • {doc.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-700 font-medium">{doc.authorName}</div>
                            <div className="text-[10px] text-slate-400">{doc.authorEntity}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.status === 'signe' ? 'bg-emerald-100 text-emerald-700' :
                              doc.status === 'approuve' ? 'bg-blue-100 text-blue-700' :
                              doc.status === 'en_revue' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {doc.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3">
                            {doc.electronicSignature ? (
                              <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Signé par {doc.electronicSignature.signedBy}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">En attente de visa</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedDocForPreview(doc)}
                              className="px-2.5 py-1 bg-[#0F4C81] hover:bg-[#13406D] text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm transition-colors"
                              title="Afficher avec l'en-tête RHEMA et le pied de page officiel"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Consulter & Imprimer</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Document Officiel RHEMA pour l'employé */}
              <RhemaDocumentModal
                isOpen={!!selectedDocForPreview}
                onClose={() => setSelectedDocForPreview(null)}
                document={selectedDocForPreview}
                currentUser={currentUser}
              />
            </div>
          )}

          {/* TAB 3: TRANSMISSIONS HIÉRARCHIQUES & CONSIGNES */}
          {activeWorkTab === 'transmissions' && (
            <div className="space-y-4">
              <div className="bg-white/95 rounded-2xl border border-sky-200/80 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-sky-100">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Transmettre un compte-rendu ou une note à votre responsable ({superior?.name || 'Direction'})
                  </h3>
                </div>

                <form onSubmit={handleSendTransmission} className="space-y-3">
                  <textarea
                    id="textarea-employee-transmission"
                    value={transmissionText}
                    onChange={(e) => setTransmissionText(e.target.value)}
                    rows={3}
                    placeholder="Saisissez votre compte-rendu journalier, demande d'instruction ou alerte technique..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all placeholder:text-slate-400"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Destinataire automatique : <strong className="text-slate-700">{superior?.name || 'Directeur Général'}</strong> (N+1)
                    </span>
                    <button
                      id="btn-submit-employee-transmission"
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer au Responsable</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed des consignes et transmissions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Historique des transmissions du service</h4>
                {transmissionsList.map(tx => (
                  <div key={tx.id} className="bg-white/90 rounded-2xl border border-sky-200/70 p-4 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {tx.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{tx.sender}</span>
                        <span className="text-[10px] text-slate-400">{tx.time}</span>
                      </div>
                      <div className="text-[11px] text-sky-700 font-medium mb-1">Pour : {tx.recipient}</div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{tx.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: FICHE DE POSTE & HABILITATIONS */}
          {activeWorkTab === 'profile' && (
            <div className="bg-white/95 rounded-2xl border border-sky-200/80 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Fiche de Poste Numérique & Habilitations RBAC</h3>
                <p className="text-xs text-slate-500">Périmètre de sécurité et règles de gouvernance applicables à votre fonction.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Échelon Hiérarchique</div>
                  <div className="text-sm font-bold text-sky-900 mt-1">{currentUser.roleTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Niveau : {currentUser.role}</div>
                </div>

                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Juridiction Exclusive</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">{userEntity?.name || 'Toute l’Organisation'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Code : {userEntity?.code || 'ORG'}</div>
                </div>

                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Supérieur Hiérarchique Direct</div>
                  <div className="text-sm font-bold text-slate-800 mt-1">{superior?.name || 'Directeur Général'}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Email : {superior?.email || 'direction@org.com'}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Droits & Habilitations Accordés sur la Plateforme</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                  <li>Consultation et traitement exclusif des dossiers appartenant au <strong>{userEntity?.name || 'service'}</strong>.</li>
                  <li>Saisie et avancement des tâches assignées par le supérieur direct.</li>
                  <li>Interdiction stricte de pénétrer ou consulter les entités extérieures (sous peine de blocage Sentinelle et alerte DG).</li>
                  <li>Les signatures officielles et validations définitives sont réservées au chef d'entité et au DG.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL CRÉATION DE TÂCHE AVEC ASSIGNATION OBLIGATOIRE DES INTERVENANTS */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-sky-200 max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Ouvrir une nouvelle tâche avec assignation</span>
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intitulé de la tâche <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="ex: Traitement des pointages mensuels et congés"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entité Destinataire</label>
                  <select
                    value={newTaskTargetEntityId}
                    onChange={(e) => setNewTaskTargetEntityId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {entities.map(ent => (
                      <option key={ent.id} value={ent.id}>{ent.name} ({ent.level})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Niveau de Priorité</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="normale">Normale</option>
                    <option value="faible">Faible</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* MODULE D'ASSIGNATION OBLIGATOIRE DES INTERVENANTS */}
              <div className={`p-4 rounded-xl border transition-all ${
                taskIntervenantError 
                  ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-400' 
                  : taskIntervenants.length > 0
                  ? 'bg-sky-50/50 border-sky-300'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-600" />
                      <span>Assignation des Personnes qui doivent intervenir</span>
                      <span className="text-red-500 font-bold">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      L'assignation des personnes qui doivent intervenir est obligatoire.
                    </p>
                  </div>

                  <div>
                    {taskIntervenants.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" />
                        0 personne désignée
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {taskIntervenants.length} intervenant(s) assigné(s)
                      </span>
                    )}
                  </div>
                </div>

                {taskIntervenantError && (
                  <div className="mb-3 p-2.5 bg-rose-100 border border-rose-300 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{taskIntervenantError}</span>
                  </div>
                )}

                {/* Liste des intervenants sélectionnés avec rôle */}
                {taskIntervenants.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Collaborateurs désignés pour intervenir :
                    </div>
                    <div className="space-y-1.5">
                      {taskIntervenants.map((intervenant) => (
                        <div
                          key={intervenant.userId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {intervenant.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 block truncate">{intervenant.userName}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{intervenant.userRoleTitle}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <label className="text-[10px] text-slate-500">Rôle :</label>
                            <select
                              value={intervenant.roleType}
                              onChange={(e) => updateTaskIntervenantRole(intervenant.userId, e.target.value as any)}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            >
                              <option value="responsable">👑 Responsable Principal</option>
                              <option value="executant">⚙️ Exécutant</option>
                              <option value="contributeur">🤝 Contributeur</option>
                              <option value="validateur">🛡️ Validateur</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeTaskIntervenant(intervenant.userId)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                              title="Retirer cet intervenant"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recherche et sélection d'intervenants additionnels */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Ajouter d'autres collaborateurs :
                    </span>
                    <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-lg text-[10px]">
                      <button
                        type="button"
                        onClick={() => setIntervenantFilterScope('entity')}
                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                          intervenantFilterScope === 'entity'
                            ? 'bg-white text-slate-800 shadow-sm font-bold'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Mon entité
                      </button>
                      <button
                        type="button"
                        onClick={() => setIntervenantFilterScope('all')}
                        className={`px-2 py-0.5 rounded font-medium transition-all ${
                          intervenantFilterScope === 'all'
                            ? 'bg-white text-slate-800 shadow-sm font-bold'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Tous
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou fonction..."
                      value={taskIntervenantSearch}
                      onChange={(e) => setTaskIntervenantSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {users
                      .filter(u => {
                        if (intervenantFilterScope === 'entity' && userEntity) {
                          const match = u.serviceId === userEntity.id || 
                                        u.departementId === userEntity.id || 
                                        u.directionId === userEntity.id;
                          if (!match) return false;
                        }
                        if (taskIntervenantSearch.trim()) {
                          const q = taskIntervenantSearch.toLowerCase();
                          return u.name.toLowerCase().includes(q) || u.roleTitle.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map(u => {
                        const isSelected = taskIntervenants.some(i => i.userId === u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleTaskIntervenant(u)}
                            className={`flex items-center justify-between p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-sky-100/70 border-sky-300 text-sky-900 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 pointer-events-none"
                              />
                              <div className="w-5 h-5 rounded bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-slate-800 block truncate text-[11px]">{u.name}</span>
                                <span className="text-[10px] text-slate-500 block truncate">{u.roleTitle}</span>
                              </div>
                            </div>

                            <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-1">
                              {isSelected ? '✓ Assigné' : '+ Assigner'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Objectif</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={2}
                  placeholder="Détails du travail à effectuer..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm"
                >
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
