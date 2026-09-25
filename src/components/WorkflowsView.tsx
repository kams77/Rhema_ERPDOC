import React, { useState } from 'react';
import { 
  TaskItem, 
  TaskType, 
  User, 
  HierarchicalEntity, 
  DocumentItem,
  UserRole,
  TaskIntervenant
} from '../types';
import { canUserManageTask, isEntityInUserScope } from '../utils/rbac';
import { 
  Workflow, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  User as UserIcon, 
  Stamp, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X, 
  Lock,
  Layers,
  ArrowRight,
  Users,
  UserCheck,
  UserPlus,
  Search,
  Shield,
  Eye,
  FileText
} from 'lucide-react';
import { RhemaDocumentModal } from './RhemaOfficialDocument';

interface WorkflowsViewProps {
  tasks: TaskItem[];
  currentUser: User;
  entities: HierarchicalEntity[];
  users: User[];
  documents: DocumentItem[];
  onCreateTask: (task: Omit<TaskItem, 'id'>) => void;
  onUpdateTaskStep: (taskId: string, stepId: string, completed: boolean) => void;
  onValidateTask: (taskId: string, signer: User) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({
  tasks,
  currentUser,
  entities,
  users,
  documents,
  onCreateTask,
  onUpdateTaskStep,
  onValidateTask,
}) => {
  const [selectedType, setSelectedType] = useState<TaskType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflowDoc, setSelectedWorkflowDoc] = useState<DocumentItem | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TaskType>('approbation');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignedEntityId, setNewAssignedEntityId] = useState('');
  const [newPriority, setNewPriority] = useState<'basse' | 'normale' | 'haute' | 'critique'>('haute');
  const [newDueDate, setNewDueDate] = useState('2026-09-20');
  const [newRequiresSignature, setNewRequiresSignature] = useState(true);
  const [newAssociatedDocId, setNewAssociatedDocId] = useState('');

  // Obligatory intervenants assignment state
  const [selectedIntervenants, setSelectedIntervenants] = useState<TaskIntervenant[]>([]);
  const [intervenantFilterScope, setIntervenantFilterScope] = useState<'entity' | 'all'>('entity');
  const [intervenantSearchTerm, setIntervenantSearchTerm] = useState('');
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Default steps for the task type
  const [stepsInput, setStepsInput] = useState<string[]>([
    'Vérification de la conformité des pièces',
    'Contrôle hiérarchique et budgétaire',
    'Validation formelle & E-signature',
  ]);

  const filteredTasks = tasks.filter((task) => {
    if (selectedType !== 'all' && task.type !== selectedType) return false;
    
    // Scoping: If DG sees all. Otherwise check if user is in scope of assignedEntity or creator
    if (currentUser.role === 'dg') return true;
    if (task.creatorId === currentUser.id) return true;
    if (currentUser.role === 'agent') {
      return (
        task.assignedAgentId === currentUser.id || 
        task.assignedIntervenants?.some(i => i.userId === currentUser.id) ||
        task.assignedEntityId === currentUser.serviceId
      );
    }
    return (
      isEntityInUserScope(currentUser, task.assignedEntityId, entities) ||
      task.assignedIntervenants?.some(i => i.userId === currentUser.id)
    );
  });

  const toggleIntervenant = (targetUser: User) => {
    setAssignmentError(null);
    setSelectedIntervenants(prev => {
      const exists = prev.find(i => i.userId === targetUser.id);
      if (exists) {
        return prev.filter(i => i.userId !== targetUser.id);
      } else {
        const userEntity = entities.find(e => 
          e.id === targetUser.serviceId || 
          e.id === targetUser.departementId || 
          e.id === targetUser.directionId
        );
        const roleType: TaskIntervenant['roleType'] = prev.length === 0 ? 'responsable' : 'executant';
        return [
          ...prev,
          {
            userId: targetUser.id,
            userName: targetUser.name,
            userRole: targetUser.role,
            userRoleTitle: targetUser.roleTitle,
            entityName: userEntity?.name || 'Entité Organisationnelle',
            roleType,
          }
        ];
      }
    });
  };

  const updateIntervenantRoleType = (userId: string, roleType: TaskIntervenant['roleType']) => {
    setSelectedIntervenants(prev => prev.map(i => i.userId === userId ? { ...i, roleType } : i));
  };

  const removeIntervenant = (userId: string) => {
    setSelectedIntervenants(prev => prev.filter(i => i.userId !== userId));
  };

  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case 'approbation':
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 text-[10px]">Tâche d'Approbation</span>;
      case 'production':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 text-[10px]">Ordre de Production</span>;
      case 'suivi_client':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30 text-[10px]">Suivi Client / Relance</span>;
      case 'projet':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 text-[10px]">Jalon Projet</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critique':
        return <span className="text-[10px] font-bold text-red-400 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800/40">Critique</span>;
      case 'haute':
        return <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">Haute</span>;
      case 'normale':
        return <span className="text-[10px] text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-800/40">Normale</span>;
      case 'basse':
      default:
        return <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Basse</span>;
    }
  };

  const getInterventionRoleBadge = (roleType: TaskIntervenant['roleType']) => {
    switch (roleType) {
      case 'responsable':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">👑 Responsable</span>;
      case 'executant':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">⚙️ Exécutant</span>;
      case 'contributeur':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">🤝 Contributeur</span>;
      case 'validateur':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🛡️ Validateur</span>;
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAssignedEntityId) return;

    // Obligation check: assignment to people who must intervene is required!
    if (selectedIntervenants.length === 0) {
      setAssignmentError("L'assignation aux personnes qui doivent intervenir est obligatoire. Veuillez sélectionner au moins un collaborateur.");
      return;
    }

    const assignedEntity = entities.find(e => e.id === newAssignedEntityId);
    const primaryIntervenant = selectedIntervenants[0];
    const associatedDoc = documents.find(d => d.id === newAssociatedDocId);

    onCreateTask({
      title: newTitle,
      type: newType,
      description: newDescription,
      organizationId: currentUser.organizationId,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorRole: currentUser.role,
      assignedEntityId: newAssignedEntityId,
      assignedEntityName: assignedEntity?.name || 'Entité non définie',
      assignedAgentId: primaryIntervenant?.userId,
      assignedAgentName: selectedIntervenants.map(i => i.userName).join(', '),
      assignedIntervenants: selectedIntervenants,
      priority: newPriority,
      status: 'en_cours',
      dueDate: newDueDate,
      createdAt: new Date().toISOString().slice(0, 10),
      associatedDocumentId: newAssociatedDocId || undefined,
      associatedDocumentTitle: associatedDoc?.title || undefined,
      signatureRequired: newRequiresSignature,
      steps: stepsInput.filter(s => s.trim().length > 0).map((s, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        label: s,
        completed: false,
        assignedToUserId: selectedIntervenants[idx % selectedIntervenants.length]?.userId,
        assignedToUserName: selectedIntervenants[idx % selectedIntervenants.length]?.userName,
      })),
    });

    setNewTitle('');
    setNewDescription('');
    setSelectedIntervenants([]);
    setAssignmentError(null);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
              Workflows & Habilitations
            </span>
            <span className="text-xs text-slate-400">Délégation & Signature Électronique</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Attribution & Suivi des Tâches en Workflow
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Flux de travail hiérarchisés : Approbations, Ordres de fabrication, Suivis clients et Jalons projets. Le DG, chefs de départements et directeurs désignent les exécutants et valident les opérations avec horodatage certifié.
          </p>
        </div>

        <div>
          {currentUser.role !== 'agent' && (
            <button
              id="btn-create-workflow-task"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Créer une Tâche Workflow
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedType === 'all'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Toutes ({tasks.length})
        </button>
        <button
          onClick={() => setSelectedType('approbation')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedType === 'approbation'
              ? 'bg-purple-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Approbations (Achats, Notes de frais, Congés)
        </button>
        <button
          onClick={() => setSelectedType('production')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedType === 'production'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Production & Maintenance
        </button>
        <button
          onClick={() => setSelectedType('suivi_client')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedType === 'suivi_client'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Suivi Client & Relances
        </button>
        <button
          onClick={() => setSelectedType('projet')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedType === 'projet'
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Jalons Projets
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <Workflow className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">Aucune tâche dans ce périmètre</div>
            <p className="text-xs text-slate-500 mt-1">
              Connectez-vous en tant que DG, Chef de Département ou responsable de l'entité concernée pour visualiser ou créer des tâches.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const mgmt = canUserManageTask(currentUser, task, entities);
            const allStepsCompleted = task.steps.every(s => s.completed);

            return (
              <div
                key={task.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getTaskTypeBadge(task.type)}
                    {getPriorityBadge(task.priority)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Échéance : {task.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'validee_terminee' ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Opération Validée & E-Signée
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/40 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> En cours d’exécution
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-white">{task.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{task.description}</p>
                  
                  {task.associatedDocumentTitle && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <div className="text-xs text-slate-300 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700/60 inline-flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#0F4C81]" />
                        <span>Document d'entreprise associé :</span>
                        <strong className="text-white">{task.associatedDocumentTitle}</strong>
                      </div>
                      {(() => {
                        const matchedDoc = documents.find(d => 
                          (task.associatedDocumentId && d.id === task.associatedDocumentId) || 
                          d.title.toLowerCase() === task.associatedDocumentTitle?.toLowerCase() ||
                          (task.associatedDocumentTitle && d.title.toLowerCase().includes(task.associatedDocumentTitle.toLowerCase()))
                        );
                        if (matchedDoc) {
                          return (
                            <button
                              onClick={() => setSelectedWorkflowDoc(matchedDoc)}
                              className="px-2.5 py-1.5 bg-[#0F4C81] hover:bg-[#13406D] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                              title="Afficher avec l'en-tête RHEMA et le pied de page officiel"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Consulter le Document RHEMA</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Assignments bar & Intervenants List */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Initiateur Hiérarchique</span>
                      <span className="text-white font-medium">{task.creatorName}</span>
                      <span className="text-slate-400 text-[10px] block">({task.creatorRole.replace('_', ' ')})</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entité Affectée</span>
                      <span className="text-white font-medium">{task.assignedEntityName}</span>
                    </div>
                  </div>

                  {/* Intervenants section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-200 font-semibold flex items-center gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Personnes assignées pour intervenir ({task.assignedIntervenants?.length || 1})
                      </span>
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-indigo-400" />
                        Assignation Obligatoire
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.assignedIntervenants && task.assignedIntervenants.length > 0 ? (
                        task.assignedIntervenants.map((intervenant) => (
                          <div 
                            key={intervenant.userId}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                                {intervenant.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-white truncate text-xs">{intervenant.userName}</div>
                                <div className="text-[10px] text-slate-400 truncate">{intervenant.userRoleTitle}</div>
                              </div>
                            </div>
                            <div className="shrink-0 pl-2">
                              {getInterventionRoleBadge(intervenant.roleType)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                              {task.assignedAgentName ? task.assignedAgentName[0] : 'E'}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{task.assignedAgentName || 'Équipe Service'}</div>
                              <div className="text-[10px] text-slate-400">Agent Référent</div>
                            </div>
                          </div>
                          {getInterventionRoleBadge('executant')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step progress list */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Étapes du Workflow Opérationnel</span>
                    <span>
                      {task.steps.filter(s => s.completed).length} / {task.steps.length} complétées
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {task.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          step.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-950/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            id={`btn-step-${step.id}`}
                            disabled={!mgmt.canEdit || task.status === 'validee_terminee'}
                            onClick={() => onUpdateTaskStep(task.id, step.id, !step.completed)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              step.completed
                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                : mgmt.canEdit
                                ? 'border-slate-600 hover:border-indigo-400 cursor-pointer'
                                : 'border-slate-800 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {step.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span className={step.completed ? 'line-through text-slate-400 font-medium' : 'font-medium'}>
                            {step.label}
                          </span>
                        </div>

                        {step.completed && (
                          <div className="text-[10px] text-slate-400">
                            Validé par {step.completedBy} ({step.completedAt})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final E-Signature / Validation Footer */}
                {task.status === 'validee_terminee' && task.signature ? (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <Stamp className="w-4 h-4 text-amber-400" />
                      E-Signature & Validation Hiérarchique
                    </div>
                    <div className="text-white">
                      Validé & signé par <strong>{task.signature.signedBy}</strong> ({task.signature.role}) le {task.signature.timestamp}
                    </div>
                    <div className="text-[10px] font-mono text-amber-400 break-all bg-black/40 p-1.5 rounded mt-1">
                      Scellé cryptographique : {task.signature.hash}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="text-[11px] text-slate-400">
                      {mgmt.canValidate
                        ? 'Vous disposez des droits hiérarchiques pour valider et apposer la signature finale.'
                        : 'Validation réservée aux Chefs de Service, Directeurs, Chefs de Département et DG.'}
                    </div>

                    {mgmt.canValidate && (
                      <button
                        id={`btn-validate-task-${task.id}`}
                        onClick={() => onValidateTask(task.id, currentUser)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Stamp className="w-4 h-4" />
                        Valider l’Opération & Signer
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Créer une Tâche en Workflow</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type de Tâche</label>
                <select
                  value={newType}
                  onChange={(e) => {
                    const t = e.target.value as TaskType;
                    setNewType(t);
                    if (t === 'approbation') {
                      setStepsInput(['Contrôle budgétaire', 'Examen justificatif', 'Validation & E-signature']);
                    } else if (t === 'production') {
                      setStepsInput(['Sortie des matières premières', 'Usinage / Assemblage', 'Contrôle qualité & Recette']);
                    } else if (t === 'suivi_client') {
                      setStepsInput(['Émission de la relance', 'Appel de confirmation', 'Enregistrement de l’accord']);
                    } else if (t === 'projet') {
                      setStepsInput(['Affectation des ressources', 'Réalisation des livrables', 'Validation du jalon']);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="approbation">Tâche d'Approbation (Demande d'achat, note de frais, congé)</option>
                  <option value="production">Tâche de Production (Ordre de fabrication, maintenance)</option>
                  <option value="suivi_client">Tâche de Suivi Client (Relance impayé, réclamation)</option>
                  <option value="projet">Tâche de Projet (Assigner jalons, relevé d'heures)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intitulé de la Tâche</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Validation Demande d’Achat Fournisseur..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Entité Destinataire (Service / Direction) <span className="text-red-400">*</span>
                </label>
                <select
                  value={newAssignedEntityId}
                  onChange={(e) => {
                    setNewAssignedEntityId(e.target.value);
                    setAssignmentError(null);
                  }}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Sélectionner l'entité destinataire --</option>
                  {entities.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name} ({ent.level})</option>
                  ))}
                </select>
              </div>

              {/* Obligatory Intervenants Assignment Section */}
              <div className={`p-4 rounded-xl border transition-all ${
                assignmentError 
                  ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/40' 
                  : selectedIntervenants.length > 0
                  ? 'bg-slate-950/60 border-indigo-500/40'
                  : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Personnes qui doivent intervenir</span>
                      <span className="text-red-400 font-bold">*</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      L'assignation des personnes qui doivent intervenir est obligatoire pour la création de la tâche.
                    </p>
                  </div>

                  <div>
                    {selectedIntervenants.length === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        <AlertCircle className="w-3.5 h-3.5" />
                        0 personne désignée (Obligatoire)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedIntervenants.length} intervenant(s) désigné(s)
                      </span>
                    )}
                  </div>
                </div>

                {assignmentError && (
                  <div className="mb-3 p-2.5 bg-rose-950/50 border border-rose-500/50 rounded-lg text-xs text-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{assignmentError}</span>
                  </div>
                )}

                {/* Selected Intervenants Pills / Chips */}
                {selectedIntervenants.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Collaborateurs assignés à intervenir :
                    </div>
                    <div className="space-y-2">
                      {selectedIntervenants.map((intervenant) => (
                        <div
                          key={intervenant.userId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {intervenant.userName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white block truncate">{intervenant.userName}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{intervenant.userRoleTitle}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <label className="text-[10px] text-slate-400">Rôle d'intervention :</label>
                            <select
                              value={intervenant.roleType}
                              onChange={(e) => updateIntervenantRoleType(intervenant.userId, e.target.value as any)}
                              className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-400"
                            >
                              <option value="responsable">👑 Responsable Principal</option>
                              <option value="executant">⚙️ Exécutant</option>
                              <option value="contributeur">🤝 Contributeur</option>
                              <option value="validateur">🛡️ Validateur</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => removeIntervenant(intervenant.userId)}
                              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Retirer cet intervenant"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter and Search Bar for Choosing Intervenants */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Sélectionner les personnes parmi l'organisation :
                    </span>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setIntervenantFilterScope('entity')}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${
                          intervenantFilterScope === 'entity'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Entité ciblée
                      </button>
                      <button
                        type="button"
                        onClick={() => setIntervenantFilterScope('all')}
                        className={`px-2.5 py-1 rounded font-medium transition-all ${
                          intervenantFilterScope === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Toute l'entreprise
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Rechercher un collaborateur par nom ou titre..."
                      value={intervenantSearchTerm}
                      onChange={(e) => setIntervenantSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Users list with checkboxes */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {users
                      .filter(u => {
                        if (intervenantFilterScope === 'entity' && newAssignedEntityId) {
                          const match = u.serviceId === newAssignedEntityId || 
                                        u.departementId === newAssignedEntityId || 
                                        u.directionId === newAssignedEntityId;
                          if (!match) return false;
                        }
                        if (intervenantSearchTerm.trim()) {
                          const q = intervenantSearchTerm.toLowerCase();
                          return u.name.toLowerCase().includes(q) || u.roleTitle.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map(u => {
                        const isSelected = selectedIntervenants.some(i => i.userId === u.id);
                        return (
                          <div
                            key={u.id}
                            onClick={() => toggleIntervenant(u)}
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-indigo-950/30 border-indigo-500/50 text-white'
                                : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by parent div
                                className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 pointer-events-none"
                              />
                              <div className="w-6 h-6 rounded bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              </div>
                              <div className="truncate">
                                <span className="font-semibold text-white block truncate">{u.name}</span>
                                <span className="text-[10px] text-slate-400 block truncate">{u.roleTitle}</span>
                              </div>
                            </div>

                            <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                              {isSelected ? '✓ Assigné' : '+ Assigner'}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau de Priorité</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="critique">Critique (Bloquant)</option>
                    <option value="haute">Haute</option>
                    <option value="normale">Normale</option>
                    <option value="basse">Basse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date d’Échéance</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Rattaché (Optionnel)</label>
                <select
                  value={newAssociatedDocId}
                  onChange={(e) => setNewAssociatedDocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Aucun document lié --</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.referenceNumber} - {d.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Détails des opérations à réaliser par l’agent..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  className="px-4 py-2 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                >
                  Créer et Assigner la Tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Document Officiel RHEMA pour Workflow */}
      <RhemaDocumentModal
        isOpen={!!selectedWorkflowDoc}
        onClose={() => setSelectedWorkflowDoc(null)}
        document={selectedWorkflowDoc}
        currentUser={currentUser}
      />
    </div>
  );
};
