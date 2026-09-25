import { User, HierarchicalEntity, DocumentItem, TaskItem, UserRole } from '../types';

/**
 * Checks if targetEntity is within the user's hierarchy or jurisdiction
 */
export function isEntityInUserScope(
  user: User,
  targetEntityId: string,
  entities: HierarchicalEntity[]
): boolean {
  // DG / PDG / DGA has universal scope
  if (user.role === 'dg') {
    return true;
  }

  const target = entities.find(e => e.id === targetEntityId);
  if (!target) return false;

  // Exact match
  if (
    user.departementId === targetEntityId ||
    user.directionId === targetEntityId ||
    user.divisionId === targetEntityId ||
    user.serviceId === targetEntityId
  ) {
    return true;
  }

  // Check child hierarchy downward
  // If user is Chef de Département, check if target has user's departement in ancestors
  if (user.role === 'chef_departement' && user.departementId) {
    return isEntityDescendantOf(targetEntityId, user.departementId, entities);
  }

  // If user is Directeur, check if target is in user's direction
  if (user.role === 'directeur' && user.directionId) {
    return isEntityDescendantOf(targetEntityId, user.directionId, entities);
  }

  // If user is Chef de Division, check if target is in user's division
  if (user.role === 'chef_division' && user.divisionId) {
    return isEntityDescendantOf(targetEntityId, user.divisionId, entities);
  }

  // If user is Chef de Service or Agent, must match service
  if (user.serviceId === targetEntityId) {
    return true;
  }

  return false;
}

/**
 * Checks whether entityId is a child/grandchild of ancestorId
 */
export function isEntityDescendantOf(
  entityId: string,
  ancestorId: string,
  entities: HierarchicalEntity[]
): boolean {
  let current = entities.find(e => e.id === entityId);
  while (current && current.parentId) {
    if (current.parentId === ancestorId) {
      return true;
    }
    current = entities.find(e => e.id === current?.parentId);
  }
  return false;
}

/**
 * Strict Document access control
 */
export function canUserViewDocument(
  user: User,
  doc: DocumentItem,
  entities: HierarchicalEntity[]
): { allowed: boolean; reason?: string } {
  // Account locked?
  if (user.status === 'verrouille') {
    return { allowed: false, reason: 'Compte verrouillé pour raison disciplinaire / intrusion.' };
  }

  // 1. SPECIFIC RULE FOR PAYSLIPS (BULLETINS DE PAIE)
  // "Pour les Bulletin des Paie. Lorsque le celui-ci est publié seule l’agent peut voir son bulletin de pays et le DR et son service de Paie."
  if (doc.subtype === 'bulletin_de_paie' || doc.isConfidentialPayslip) {
    const isTargetAgent = doc.targetUserId === user.id;
    const isDRH = user.role === 'directeur' && user.directionId === 'dir-rh';
    const isPayService = user.serviceId === 'srv-paie';
    const isDG = user.role === 'dg'; // DG retains high oversight

    if (isTargetAgent || isDRH || isPayService || isDG) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Strictement Confidentiel : Seuls l’agent titulaire, le Directeur RH et le Service Traitement de la Paie sont autorisés à consulter ce bulletin.',
    };
  }

  // 2. DG / PDG / DGA - Sees ALL documents
  if (user.role === 'dg') {
    return { allowed: true };
  }

  // 3. User is author
  if (doc.authorId === user.id) {
    return { allowed: true };
  }

  // 4. Check hierarchical entity scope
  if (doc.targetEntityId) {
    const inScope = isEntityInUserScope(user, doc.targetEntityId, entities);
    if (!inScope) {
      return {
        allowed: false,
        reason: `Ce document relève de l’entité ${doc.targetEntityName || doc.targetEntityId}, hors de votre périmètre hiérarchique.`,
      };
    }
  }

  // 5. Check role allowed in permissions
  if (doc.permissions.viewRoles.includes(user.role)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Votre rang hiérarchique (${user.roleTitle}) ne dispose pas du privilège de consultation pour cette pièce.`,
  };
}

/**
 * Check if user can execute or edit a task
 */
export function canUserManageTask(
  user: User,
  task: TaskItem,
  entities: HierarchicalEntity[]
): { canEdit: boolean; canValidate: boolean; canSign: boolean } {
  if (user.status === 'verrouille') {
    return { canEdit: false, canValidate: false, canSign: false };
  }

  if (user.role === 'dg') {
    return { canEdit: true, canValidate: true, canSign: true };
  }

  const inScope = isEntityInUserScope(user, task.assignedEntityId, entities);

  // Agent or any assigned intervenant: can edit/execute task if assigned to his service or directly designated
  const isDirectIntervenant = task.assignedIntervenants?.some(i => i.userId === user.id);
  const intervenantRecord = task.assignedIntervenants?.find(i => i.userId === user.id);

  if (user.role === 'agent') {
    const isAssigned = isDirectIntervenant || task.assignedAgentId === user.id || task.assignedEntityId === user.serviceId;
    return {
      canEdit: isAssigned,
      canValidate: intervenantRecord?.roleType === 'validateur',
      canSign: false,
    };
  }

  // Service Head, Division Head, Director, Dept Head
  if (inScope || isDirectIntervenant) {
    return {
      canEdit: true,
      canValidate: ['chef_departement', 'directeur', 'chef_division', 'chef_service'].includes(user.role) || intervenantRecord?.roleType === 'validateur',
      canSign: ['chef_departement', 'directeur', 'chef_division', 'chef_service'].includes(user.role),
    };
  }

  return { canEdit: false, canValidate: false, canSign: false };
}

/**
 * Check who can create agents according to prompt rules:
 * - DG can create any agent and revoke anyone
 * - Chef Dépt can create agents in his sub-entities
 * - Directeur can create agents in his sub-entities
 * - Chef Division can create agents in his sub-entities
 * - Chef Service can create agents in his service
 */
export function getAgentCreationPermissions(user: User): {
  canCreate: boolean;
  allowedTargetLevels: string[];
} {
  if (user.status === 'verrouille') return { canCreate: false, allowedTargetLevels: [] };

  switch (user.role) {
    case 'dg':
      return {
        canCreate: true,
        allowedTargetLevels: ['departement', 'direction', 'division', 'service', 'agent'],
      };
    case 'chef_departement':
      return {
        canCreate: true,
        allowedTargetLevels: ['direction', 'division', 'service', 'agent'],
      };
    case 'directeur':
      return {
        canCreate: true,
        allowedTargetLevels: ['division', 'service', 'agent'],
      };
    case 'chef_division':
      return {
        canCreate: true,
        allowedTargetLevels: ['service', 'agent'],
      };
    case 'chef_service':
      return {
        canCreate: true,
        allowedTargetLevels: ['agent'],
      };
    case 'agent':
    default:
      return {
        canCreate: false,
        allowedTargetLevels: [],
      };
  }
}

/**
 * Returns a human-readable scope summary for the current user
 */
export function getScopeDescription(user: User): string {
  switch (user.role) {
    case 'dg':
      return 'Super Utilisateur Global - Visibilité totale sur toutes les entités, documents et flux';
    case 'chef_departement':
      return 'Super Utilisateur de Département - Autorité sur toutes les directions, divisions et services rattachés';
    case 'directeur':
      return 'Super Utilisateur de Direction - Autorité sur les divisions et services de son pôle';
    case 'chef_division':
      return 'Super Utilisateur de Division - Autorité sur les services rattachés à sa division';
    case 'chef_service':
      return 'Super Utilisateur de Service - Autorité sur le service et ses collaborateurs agents';
    case 'agent':
    default:
      return 'Agent Exécutant - Consultation et exécution restreintes aux tâches et pièces assignées';
  }
}

/**
 * Checks whether user belongs to Human Resources Department or has authority to configure payroll
 */
export function isUserHROfficer(user: User): boolean {
  if (!user) return false;
  // DG has overarching authority
  if (user.role === 'dg') return true;
  // DRH direction, division paie, service paie
  if (user.directionId === 'dir-rh' || user.divisionId === 'div-paie' || user.serviceId === 'srv-paie') {
    return true;
  }
  const title = (user.roleTitle || '').toLowerCase();
  return (
    title.includes('rh') ||
    title.includes('ressources humaines') ||
    title.includes('paie') ||
    title.includes('rémunération') ||
    title.includes('personnel')
  );
}

