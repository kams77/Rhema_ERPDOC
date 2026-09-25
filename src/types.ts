export type OrganizationType = 'entreprise' | 'etablissement' | 'ong';

export type EntityLevel = 'departement' | 'direction' | 'division' | 'service';

export type UserRole = 
  | 'dg' 
  | 'chef_departement' 
  | 'directeur' 
  | 'chef_division' 
  | 'chef_service' 
  | 'agent';

export interface HierarchicalEntity {
  id: string;
  name: string;
  code: string;
  level: EntityLevel;
  parentId?: string; // e.g. service -> division -> direction -> departement -> org
  organizationId: string;
  managerName?: string;
  managerEmail?: string;
  managerRole?: UserRole;
  description?: string;
  agentCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string; // e.g. "Président Directeur Général (PDG)", "Directeur des Ressources Humaines"
  organizationId: string;
  departementId?: string;
  directionId?: string;
  divisionId?: string;
  serviceId?: string;
  avatar?: string;
  status: 'actif' | 'verrouille' | 'suspendu' | 'convoque';
  failedAccessAttempts: number;
  lastLogin?: string;
  phone?: string;
  canCreateSubAgents: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  headquarters: string;
  email: string;
  phone: string;
  logo?: string;
  managerName?: string;
  managerRole?: string;
  managerEmail?: string;
  hasDepartements: boolean;
  hasDirections: boolean;
  hasDivisions: boolean;
  hasServices: boolean;
  description: string;
  createdAt: string;
}

export type DocumentCategory = 
  | 'financier_comptable'
  | 'chaine_logistique_commerciale'
  | 'ressources_humaines';

export type DocumentSubtype = 
  // Financier
  | 'facture_client'
  | 'facture_fournisseur'
  | 'avoir'
  | 'bilan_comptable'
  | 'compte_resultat'
  | 'budget'
  | 'recu_fiscal'
  | 'note_de_frais'
  | 'releve_bancaire'
  // Logistique & Commercial
  | 'devis'
  | 'bon_commande_client'
  | 'contrat_commercial'
  | 'bon_livraison'
  | 'bon_reception'
  | 'ordre_preparation'
  | 'fiche_article'
  | 'inventaire_physique'
  | 'alerte_rupture_stock'
  | 'demande_achat'
  | 'bon_commande_fournisseur'
  // RH
  | 'contrat_travail'
  | 'avenant'
  | 'fiche_poste'
  | 'bulletin_de_paie'
  | 'feuille_de_temps'
  | 'solde_conges'
  | 'compte_rendu_entretien'
  | 'plan_formation';

export interface DocumentPermissionRule {
  canView: boolean;
  canOpen: boolean;
  canEdit: boolean;
  canTrack: boolean;
  canExecute: boolean;
  canValidate: boolean;
  canSign: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  referenceNumber: string;
  category: DocumentCategory;
  subtype: DocumentSubtype;
  organizationId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorEntity: string;
  createdAt: string;
  status: 'brouillon' | 'en_revue' | 'approuve' | 'signe' | 'rejete';
  size: string;
  fileType: string;
  targetEntityId?: string;
  targetEntityName?: string;
  targetUserId?: string; // For personal payslips or specific confidential docs
  isConfidentialPayslip?: boolean;
  amount?: number;
  currency?: string;
  electronicSignature?: {
    signedBy: string;
    signedAt: string;
    role: string;
    certificateHash: string;
    stampUrl?: string;
  };
  allowedRoles: UserRole[];
  permissions: {
    viewRoles: UserRole[];
    editRoles: UserRole[];
    validateRoles: UserRole[];
    signRoles: UserRole[];
  };
  description?: string;
}

export type TaskType = 
  | 'approbation' 
  | 'production' 
  | 'suivi_client' 
  | 'projet';

export interface TaskIntervenant {
  userId: string;
  userName: string;
  userRole: UserRole;
  userRoleTitle: string;
  entityName?: string;
  roleType: 'responsable' | 'executant' | 'contributeur' | 'validateur';
}

export interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  description: string;
  organizationId: string;
  creatorId: string;
  creatorName: string;
  creatorRole: UserRole;
  assignedEntityId: string;
  assignedEntityName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedIntervenants: TaskIntervenant[];
  priority: 'basse' | 'normale' | 'haute' | 'critique';
  status: 'a_faire' | 'en_cours' | 'en_attente_approbation' | 'validee_terminee' | 'bloquee';
  dueDate: string;
  createdAt: string;
  associatedDocumentId?: string;
  associatedDocumentTitle?: string;
  steps: {
    id: string;
    label: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
    assignedToUserId?: string;
    assignedToUserName?: string;
  }[];
  signatureRequired: boolean;
  signature?: {
    signedBy: string;
    role: string;
    timestamp: string;
    hash: string;
  };
}

export type NavigationTab = 
  | 'workspace'
  | 'hierarchy' 
  | 'documents' 
  | 'workflows' 
  | 'security' 
  | 'agents' 
  | 'audit' 
  | 'laravel';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  targetEntityLevel?: EntityLevel;
  attemptCount: number;
  status: 'alerte_emise' | 'compte_verrouille' | 'convocation_programmee' | 'resolue';
  severity: 'moyenne' | 'haute' | 'critique';
  ipAddress: string;
  reason: string;
  notifiedManagerName: string;
  notifiedDgName: string;
  convocationNotice?: {
    summonDate: string;
    location: string;
    panelMembers: string[];
    noticeSent?: boolean;
    charges?: string[];
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'auth' | 'document' | 'task' | 'security' | 'hierarchy' | 'admin';
  details: string;
  ip: string;
  hash: string;
}

export interface CoffeeBreakInterval {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  reason: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userRoleTitle: string;
  entityName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'en_poste' | 'pause_cafe' | 'cloture';
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  coffeeBreaks: CoffeeBreakInterval[];
  ipAddress: string;
  verifiedAutomatic: boolean;
}

// -------------------------------------------------------------
// SYSTÈME DE PAIE & RÉMUNÉRATION RH (MODÈLE STANDARD & SUR-MESURE)
// -------------------------------------------------------------

export interface PayrollAllowance {
  id: string;
  name: string;
  code: string;
  type: 'fixe' | 'pourcentage'; // fixe (montant direct) ou pourcentage (% du salaire de base)
  defaultValue: number;
  isTaxable: boolean;
  isSubjectToSocialContributions: boolean;
  isActive: boolean;
  category: 'transport' | 'logement' | 'repas' | 'performance' | 'responsabilite' | 'autre';
  description?: string;
}

export interface PayrollSocialContribution {
  id: string;
  name: string;
  code: string; // e.g. CNPS_PENS, CNPS_FAM, CNPS_ACC, MUTUELLE
  employeeRate: number; // % part salariale
  employerRate: number; // % part patronale
  ceilingAmount?: number; // Plafond mensuel d'assiette (si applicable)
  isActive: boolean;
  description?: string;
}

export interface PayrollTaxBracket {
  id: string;
  min: number;
  max: number | null; // null pour la dernière tranche sans plafond
  rate: number; // Taux en pourcentage (ex: 10, 15, 25)
}

export interface PayrollTaxConfig {
  taxName: string; // e.g. "IRPP (Impôt sur le Revenu des Personnes Physiques)"
  type: 'progressif' | 'taux_fixe';
  flatRate?: number;
  brackets: PayrollTaxBracket[];
  creditPerDependentChild: number; // Réduction pour charges de famille par enfant
  localDevelopmentTax: number; // Taxe de développement local forfaitaire (ex: 3000 FCFA)
}

export interface PayrollSystemConfig {
  id: string;
  organizationId: string;
  isStandardTemplate: boolean; // True si modèle standard de l'application, False si personnalisé par les RH
  systemName: string; // Ex: "Modèle Standard Conventionnel (Application)" ou "Système de Paie Personnalisé RH"
  currency: string; // Ex: "XAF", "EUR", "USD"
  standardMonthlyHours: number; // Base légale mensuelle, ex: 173.33 h
  overtimeRates: {
    firstBracketRate: number; // Majorations heures sup (+25%)
    secondBracketRate: number; // Majorations heures sup (+50%)
    weekendHolidayRate: number; // Dimanche & Fériés (+100%)
  };
  payFrequency: 'mensuelle' | 'quinzaine' | 'hebdomadaire';
  allowances: PayrollAllowance[];
  socialContributions: PayrollSocialContribution[];
  taxConfig: PayrollTaxConfig;
  seniorityBonusPerTwoYearsPercent: number; // ex: 2% tous les 2 ans
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  notes?: string;
}

// -------------------------------------------------------------
// MODULE PAIE & RH RDC AVANCÉ (CONFORME RDC CDF / USD & CAHIER DE CHARGES)
// -------------------------------------------------------------

export interface EmployeeContract {
  id: string;
  userId: string;
  employeeCode: string;
  matricule: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Consultant' | 'Journalier';
  startDate: string;
  endDate?: string;
  baseSalary: number;
  salaryCurrency: 'USD' | 'CDF';
  categoryPro: string; // Ex: Cadre Dirigeant, Agent de Maîtrise, Exécution
  echelon: string;
  cnssNumber: string;
  inppRegistered: boolean;
  onemRegistered: boolean;
  bankName: string;
  bankAccountNumber: string;
  mobileMoneyNumber?: string;
  paymentMode: 'virement' | 'mobile_money' | 'cheque' | 'especes';
  dependentsCount: number;
  maritalStatus: 'celibataire' | 'marie' | 'divorce' | 'veuf';
  active: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'conge_annuel' | 'maladie' | 'maternite' | 'circonstance' | 'sans_solde';
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  status: 'en_attente' | 'approuve' | 'rejete';
  approvedBy?: string;
  approvedAt?: string;
  certificateUrl?: string;
}

export interface SalaryAdvanceRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: 'USD' | 'CDF';
  requestDate: string;
  repaymentMonth: string; // Ex: 2026-10
  reason: string;
  status: 'en_attente' | 'valide_rh' | 'paye' | 'rejete';
  deductedFromPayroll: boolean;
}

export interface PayrollRunPeriod {
  id: string;
  month: string; // Ex: 2026-09
  title: string; // Ex: Paie Septembre 2026
  currency: 'USD' | 'CDF';
  exchangeRateUSD_CDF: number; // Taux de change légal BCC (ex: 2850 CDF = 1 USD)
  status: 'brouillon' | 'en_validation' | 'cloture' | 'archive';
  totalGross: number;
  totalNet: number;
  totalEmployerCharges: number;
  totalEmployees: number;
  validatedByDG?: string;
  validatedAt?: string;
  closureHash?: string;
}

export interface PayslipRecord {
  id: string;
  payrollRunId: string;
  userId: string;
  employeeName: string;
  matricule: string;
  department: string;
  period: string; // 09/2026
  baseSalary: number;
  currency: 'USD' | 'CDF';
  exchangeRate: number;
  seniorityBonus: number;
  overtimeHours: number;
  overtimePay: number;
  allowances: { name: string; amount: number; isTaxable: boolean }[];
  grossSalary: number;
  
  // Cotisations RDC
  cnssEmployee: number; // 5% CNSS
  iprTax: number; // IPR (Impôt Professionnel sur les Rémunérations)
  salaryAdvanceDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  
  netToPay: number;
  
  // Charges patronales RDC
  cnssEmployer: number; // 13% CNSS (9% pensions + 4% prestations/risques)
  inppEmployer: number; // INPP (3% à 5% selon effectif)
  onemEmployer: number; // ONEM (0.2%)
  totalEmployerCost: number;
  
  status: 'emis' | 'signe_electronique' | 'paye';
  signatureHash?: string;
  signedAt?: string;
}

export interface OvertimeRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  dayHours: number; // +30% jour
  nightHours: number; // +60% nuit
  weekendHolidayHours: number; // +100% dimanche & férié
  calculatedPayUSD: number;
  calculatedPayCDF: number;
  reason: string;
  month: string; // 2026-09
  status: 'en_attente' | 'valide' | 'rejete';
  approvedBy?: string;
}

export interface DisciplinaryAction {
  id: string;
  userId: string;
  userName: string;
  matricule: string;
  date: string;
  type: 'demande_explication' | 'avertissement' | 'blame' | 'mise_a_pied' | 'licenciement';
  incidentDate: string;
  reason: string;
  explanationProvided?: string;
  sanctionDurationDays?: number;
  status: 'en_attente_reponse' | 'sanction_appliquee' | 'classe_sans_suite';
  issuedBy: string;
  closureDate?: string;
  referenceNumber: string;
}

export interface PerformanceReview {
  id: string;
  userId: string;
  userName: string;
  matricule: string;
  department: string;
  period: string; // Ex: Année 2026 - T3
  evaluatorName: string;
  evaluationDate: string;
  goalsAchievementScore: number; // sur 40
  technicalCompetenceScore: number; // sur 30
  professionalBehaviorScore: number; // sur 30
  overallScore: number; // sur 100
  strengths: string;
  areasForImprovement: string;
  recommendedBonusPercent: number; // 0 à 25%
  recommendedPromotion: boolean;
  status: 'en_cours' | 'valide_rh' | 'approuve_dg';
}

export interface HRDocumentCertificate {
  id: string;
  type: 'attestation_travail' | 'certificat_fin_contrat' | 'contrat_travail' | 'ordre_mission' | 'titre_conge';
  referenceNumber: string;
  employeeId: string;
  employeeName: string;
  matricule: string;
  issueDate: string;
  contentTitle: string;
  details: Record<string, any>;
  signedBy: string;
  sealHash: string;
}
