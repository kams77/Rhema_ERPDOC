// src/components/PayrollSystemView.tsx
// Module Intégral Paie & RH RDC (Code du Travail RDC, CNSS, INPP, ONEM, IPR)
// Strictement deux devises autorisées : USD ($) et CDF (Franc Congolais)
// Look & Feel 100% aligné avec le Dark Theme Slate-900 / Slate-950 et identité RHEMA BUSINESS

import React, { useState, useMemo } from 'react';
import { 
  PayrollSystemConfig, 
  PayrollAllowance, 
  PayrollSocialContribution, 
  PayrollTaxBracket, 
  User, 
  Organization,
  EmployeeContract,
  LeaveRequest,
  SalaryAdvanceRequest,
  PayrollRunPeriod,
  PayslipRecord,
  OvertimeRecord,
  DisciplinaryAction,
  PerformanceReview
} from '../types';
import { 
  calculatePayslipSimulation, 
  createStandardPayrollSystem,
  DEFAULT_EXCHANGE_RATE_USD_CDF
} from '../data/standardPayroll';
import { isUserHROfficer } from '../utils/rbac';
import { RhemaDocumentHeader, RhemaDocumentFooter } from './RhemaOfficialDocument';
import { 
  ContractModal, 
  LeaveModal, 
  AdvanceModal, 
  OvertimeModal, 
  DisciplinaryModal 
} from './HRActionsModals';
import { OfficialHRDocumentModal, HRDocType } from './OfficialHRDocumentModal';
import { LaravelCodeView } from './LaravelCodeView';
import { 
  Coins, 
  Calculator, 
  RotateCcw, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Percent, 
  Clock, 
  FileText, 
  Printer, 
  Building2, 
  Sparkles,
  Sliders,
  ChevronRight,
  Info,
  Users,
  DollarSign,
  Calendar,
  Briefcase,
  Download,
  CreditCard,
  FileCheck,
  Check,
  X,
  Lock,
  ArrowRightLeft,
  UserCheck,
  Paperclip,
  CheckSquare,
  FileCode2
} from 'lucide-react';

export interface PayrollSystemViewProps {
  currentOrg?: Organization;
  organization?: Organization;
  currentUser: User;
  users: User[];
  payrollConfig?: PayrollSystemConfig;
  onUpdatePayrollConfig?: (updatedConfig: PayrollSystemConfig, auditNote?: string) => void;
  onResetToStandard?: () => void;
  onLogAction?: (action: string, details: string, category: 'admin' | 'document' | 'task' | 'security') => void;
}

export type PayrollTabType = 
  | 'overview' 
  | 'payroll_run' 
  | 'contracts' 
  | 'leaves' 
  | 'advances' 
  | 'overtime' 
  | 'discipline' 
  | 'allowances' 
  | 'social' 
  | 'taxes' 
  | 'simulator'
  | 'backend_code';

export const PayrollSystemView: React.FC<PayrollSystemViewProps> = ({
  currentOrg: propCurrentOrg,
  organization,
  currentUser,
  users = [],
  payrollConfig,
  onUpdatePayrollConfig,
  onResetToStandard,
  onLogAction
}) => {
  const currentOrg: Organization = propCurrentOrg || organization || {
    id: 'org-rb-01',
    name: 'RHEMA BUSINESS RDC',
    code: 'RB-RDC',
    logoUrl: '',
    rccm: 'CD/KNG/RCCM/18-B-01290',
    idNat: '01-83-N45201L',
    numImpot: 'A1934892Z',
    address: 'Avenue de la Justice, Gombe, Kinshasa - RDC',
    phone: '+243 81 000 0000',
    email: 'direction@rhemabusiness.cd',
    directorGeneral: 'Junior Monya'
  };

  const isHR = isUserHROfficer(currentUser);

  // Configuration locale avec devise stricte USD ou CDF et fallback robuste
  const [config, setConfig] = useState<PayrollSystemConfig>(() => {
    if (payrollConfig) {
      try {
        const raw = JSON.parse(JSON.stringify(payrollConfig));
        if (raw.currency !== 'USD' && raw.currency !== 'CDF') {
          raw.currency = 'USD';
        }
        return raw;
      } catch {
        // En cas d'erreur de parse
      }
    }
    return createStandardPayrollSystem(currentOrg.id, currentOrg.name);
  });

  const [activeTab, setActiveTab] = useState<PayrollTabType>('overview');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Taux de change BCC USD <-> CDF
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE_USD_CDF);

  // -------------------------------------------------------------
  // DONNÉES RH & CONTRATS D'EXEMPLE
  // -------------------------------------------------------------
  const [contracts, setContracts] = useState<EmployeeContract[]>([
    {
      id: 'ctr-1',
      userId: users[0]?.id || 'u-1',
      employeeCode: 'RH-2026-001',
      matricule: 'MAT-001-DG',
      contractType: 'CDI',
      startDate: '2020-01-15',
      baseSalary: 2800,
      salaryCurrency: 'USD',
      categoryPro: 'Cadre Dirigeant (HC)',
      echelon: 'Hors Classe E4',
      cnssNumber: 'CNSS-CD-9982410',
      inppRegistered: true,
      onemRegistered: true,
      bankName: 'Rawbank Kinshasa',
      bankAccountNumber: '01002-39201928019-88',
      mobileMoneyNumber: '+243812791228',
      paymentMode: 'virement',
      dependentsCount: 3,
      maritalStatus: 'marie',
      active: true
    },
    {
      id: 'ctr-2',
      userId: users[1]?.id || 'u-2',
      employeeCode: 'RH-2026-002',
      matricule: 'MAT-002-DIR',
      contractType: 'CDI',
      startDate: '2021-03-01',
      baseSalary: 1950,
      salaryCurrency: 'USD',
      categoryPro: 'Cadre Supérieur',
      echelon: 'Catégorie 7 / Echelon 2',
      cnssNumber: 'CNSS-CD-8817290',
      inppRegistered: true,
      onemRegistered: true,
      bankName: 'Equity BCDC Gombe',
      bankAccountNumber: '00015-88291039821-42',
      mobileMoneyNumber: '+243820000002',
      paymentMode: 'virement',
      dependentsCount: 2,
      maritalStatus: 'marie',
      active: true
    },
    {
      id: 'ctr-3',
      userId: users[2]?.id || 'u-3',
      employeeCode: 'RH-2026-003',
      matricule: 'MAT-003-TECH',
      contractType: 'CDI',
      startDate: '2022-06-15',
      baseSalary: 1100,
      salaryCurrency: 'USD',
      categoryPro: 'Agent de Maîtrise / Télécoms',
      echelon: 'Catégorie 5 / Echelon 1',
      cnssNumber: 'CNSS-CD-7729102',
      inppRegistered: true,
      onemRegistered: true,
      bankName: 'TMB Kinshasa',
      bankAccountNumber: '00004-12903829102-12',
      mobileMoneyNumber: '+243819999003',
      paymentMode: 'virement',
      dependentsCount: 1,
      maritalStatus: 'celibataire',
      active: true
    },
    {
      id: 'ctr-4',
      userId: users[3]?.id || 'u-4',
      employeeCode: 'RH-2026-004',
      matricule: 'MAT-004-LOG',
      contractType: 'CDD',
      startDate: '2023-09-01',
      endDate: '2026-12-31',
      baseSalary: 2280000,
      salaryCurrency: 'CDF',
      categoryPro: 'Exécution Spécialisée',
      echelon: 'Catégorie 4 / Echelon 2',
      cnssNumber: 'CNSS-CD-6638190',
      inppRegistered: true,
      onemRegistered: true,
      bankName: 'Airtel Money RDC',
      bankAccountNumber: '+243998877665',
      mobileMoneyNumber: '+243998877665',
      paymentMode: 'mobile_money',
      dependentsCount: 4,
      maritalStatus: 'marie',
      active: true
    }
  ]);

  // Congés & Absences
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    {
      id: 'lv-1',
      userId: users[1]?.id || 'u-2',
      userName: users[1]?.name || 'Collaborateur DGA',
      type: 'conge_annuel',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      durationDays: 14,
      reason: 'Congé annuel payé au titre de l\'exercice 2026',
      status: 'approuve',
      approvedBy: 'Junior Monya (DG)',
      approvedAt: '2026-09-20'
    },
    {
      id: 'lv-2',
      userId: users[2]?.id || 'u-3',
      userName: users[2]?.name || 'Ingénieur VSAT',
      type: 'circonstance',
      startDate: '2026-09-28',
      endDate: '2026-09-30',
      durationDays: 3,
      reason: 'Événement familial (Mariage civil d\'un proche)',
      status: 'en_attente'
    }
  ]);

  // Avances sur salaire & Prêts
  const [advances, setAdvances] = useState<SalaryAdvanceRequest[]>([
    {
      id: 'adv-1',
      userId: users[2]?.id || 'u-3',
      userName: users[2]?.name || 'Ingénieur VSAT',
      amount: 200,
      currency: 'USD',
      requestDate: '2026-09-12',
      repaymentMonth: '2026-09',
      reason: 'Dépannage urgence médicale pharmacie',
      status: 'valide_rh',
      deductedFromPayroll: true
    }
  ]);

  // Clôture mensuelle des paies
  const [payrollRuns, setPayrollRuns] = useState<PayrollRunPeriod[]>([
    {
      id: 'run-2026-08',
      month: '2026-08',
      title: 'Paie RHEMA BUSINESS - Août 2026',
      currency: 'USD',
      exchangeRateUSD_CDF: 2850,
      status: 'cloture',
      totalGross: 8650,
      totalNet: 7120,
      totalEmployerCharges: 1420,
      totalEmployees: 4,
      validatedByDG: 'Junior Monya (DG)',
      validatedAt: '2026-08-31 17:00',
      closureHash: 'SHA256:d892bc018ae82103fca9182390a821e'
    },
    {
      id: 'run-2026-09',
      month: '2026-09',
      title: 'Paie RHEMA BUSINESS - Septembre 2026',
      currency: 'USD',
      exchangeRateUSD_CDF: 2850,
      status: 'en_validation',
      totalGross: 8950,
      totalNet: 7380,
      totalEmployerCharges: 1475,
      totalEmployees: 4
    }
  ]);

  // Modales & États Actions RH
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [editingContract, setEditingContract] = useState<EmployeeContract | null>(null);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [showAddAdvanceModal, setShowAddAdvanceModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showDisciplinaryModal, setShowDisciplinaryModal] = useState(false);

  // Registre des Heures Supplémentaires RDC
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>([
    {
      id: 'ot-1',
      userId: users[2]?.id || 'u-3',
      userName: users[2]?.name || 'Ingénieur VSAT',
      date: '2026-09-18',
      dayHours: 6,
      nightHours: 3,
      weekendHolidayHours: 0,
      calculatedPayUSD: 110,
      calculatedPayCDF: 313500,
      reason: 'Rétablissement liaison satellitaire site minier Kolwezi',
      month: '2026-09',
      status: 'valide',
      approvedBy: 'Junior Monya (DG)'
    },
    {
      id: 'ot-2',
      userId: users[3]?.id || 'u-4',
      userName: users[3]?.name || 'Technicien Réseau',
      date: '2026-09-20',
      dayHours: 0,
      nightHours: 0,
      weekendHolidayHours: 5,
      calculatedPayUSD: 85,
      calculatedPayCDF: 242250,
      reason: 'Maintenance préventive des serveurs le dimanche',
      month: '2026-09',
      status: 'valide',
      approvedBy: 'Claire Mbarga (DRH)'
    }
  ]);

  // Registre Disciplinaire & Sanctions RH RDC
  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>([
    {
      id: 'disc-1',
      userId: users[3]?.id || 'u-4',
      userName: users[3]?.name || 'Technicien Réseau',
      matricule: 'MAT-004-LOG',
      date: '2026-09-10',
      incidentDate: '2026-09-08',
      type: 'avertissement',
      reason: 'Retards répétés à la prise de quart matinal sans justification préalable.',
      status: 'sanction_appliquee',
      issuedBy: 'Direction des Ressources Humaines',
      referenceNumber: 'DISC-2026-014'
    }
  ]);

  // Visionneuse de document officiel (Contrat, Titre de congé, Attestation, Lettre de sanction)
  const [officialDocModal, setOfficialDocModal] = useState<{
    isOpen: boolean;
    type: HRDocType;
    title: string;
    referenceNumber: string;
    data: Record<string, any>;
  } | null>(null);

  // État d'expansion du Journal de Paie consolidé
  const [expandedRunId, setExpandedRunId] = useState<string | null>('run-2026-09');

  // Primes & Cotisations modales
  const [showAddAllowanceModal, setShowAddAllowanceModal] = useState<boolean>(false);
  const [newAllowance, setNewAllowance] = useState<Partial<PayrollAllowance>>({
    name: '',
    code: '',
    type: 'fixe',
    defaultValue: 100,
    isTaxable: true,
    isSubjectToSocialContributions: true,
    isActive: true,
    category: 'performance',
    description: ''
  });

  const [showAddSocialModal, setShowAddSocialModal] = useState<boolean>(false);
  const [newSocial, setNewSocial] = useState<Partial<PayrollSocialContribution>>({
    name: '',
    code: '',
    employeeRate: 5.0,
    employerRate: 5.0,
    isActive: true,
    description: ''
  });

  // Simulateur
  const [simSelectedUserId, setSimSelectedUserId] = useState<string>(users[0]?.id || '');
  const [simBaseSalary, setSimBaseSalary] = useState<number>(1800);
  const [simSeniorityYears, setSimSeniorityYears] = useState<number>(4);
  const [simDependents, setSimDependents] = useState<number>(3);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Synchronisation externe sécurisée
  React.useEffect(() => {
    if (!payrollConfig) return;
    try {
      const raw = JSON.parse(JSON.stringify(payrollConfig));
      if (raw.currency !== 'USD' && raw.currency !== 'CDF') {
        raw.currency = 'USD';
      }
      setConfig(raw);
    } catch {
      // Ignorer si invalide
    }
  }, [payrollConfig]);

  // Sélection employé simulateur
  const handleSelectSimUser = (userId: string) => {
    setSimSelectedUserId(userId);
    const contract = contracts.find(c => c.userId === userId);
    if (contract) {
      setSimBaseSalary(contract.baseSalary);
      setSimDependents(contract.dependentsCount);
      setSimSeniorityYears(4);
    } else {
      const selected = users.find(u => u.id === userId);
      if (selected) {
        let est = 1200;
        if (selected.role === 'dg') est = 2800;
        else if (selected.role.includes('directeur')) est = 1900;
        else if (selected.role.includes('chef')) est = 1400;
        setSimBaseSalary(est);
        setSimSeniorityYears(3);
      }
    }
  };

  // Calcul du bulletin simulateur
  const simulation = useMemo(() => {
    return calculatePayslipSimulation(config, simBaseSalary, simSeniorityYears, simDependents);
  }, [config, simBaseSalary, simSeniorityYears, simDependents]);

  // Sauvegarder la configuration
  const handleSave = () => {
    if (!isHR) return;
    const updated: PayrollSystemConfig = {
      ...config,
      isStandardTemplate: false,
      lastModifiedBy: `${currentUser.name} (${currentUser.roleTitle})`,
      lastModifiedAt: new Date().toISOString().slice(0, 10),
    };
    setConfig(updated);
    if (onUpdatePayrollConfig) {
      onUpdatePayrollConfig(updated, `Système de Paie & RH RDC mis à jour par (${currentUser.name})`);
    }
    if (onLogAction) {
      onLogAction(
        'Mise à jour Système Paie RH',
        `Politique salariale RDC (Devise: ${config.currency}) sauvegardée pour "${currentOrg.name}".`,
        'admin'
      );
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Réinitialiser au barème officiel RDC
  const handleConfirmReset = () => {
    const standard = createStandardPayrollSystem(currentOrg.id, currentOrg.name);
    setConfig(standard);
    if (onResetToStandard) {
      onResetToStandard();
    }
    setShowResetConfirm(false);
    if (onLogAction) {
      onLogAction(
        'Réinitialisation Barème Légal RDC',
        `Rétablissement du modèle légal RDC (CNSS 5%/13%, INPP, ONEM, IPR) pour "${currentOrg.name}".`,
        'admin'
      );
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Bascule prime
  const toggleAllowance = (id: string) => {
    if (!isHR) return;
    setConfig(prev => ({
      ...prev,
      allowances: prev.allowances.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a)
    }));
  };

  // Ajouter prime
  const handleAddAllowance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllowance.name?.trim()) return;
    const code = newAllowance.code?.trim() || `PRIME_${Date.now().toString().slice(-4)}`;
    const created: PayrollAllowance = {
      id: `allw-custom-${Date.now()}`,
      name: newAllowance.name.trim(),
      code: code.toUpperCase().replace(/\s+/g, '_'),
      type: newAllowance.type || 'fixe',
      defaultValue: Number(newAllowance.defaultValue) || 0,
      isTaxable: newAllowance.isTaxable ?? true,
      isSubjectToSocialContributions: newAllowance.isSubjectToSocialContributions ?? true,
      isActive: true,
      category: newAllowance.category || 'performance',
      description: newAllowance.description?.trim() || 'Prime personnalisée définie par la DRH RHEMA BUSINESS.'
    };
    setConfig(prev => ({
      ...prev,
      allowances: [...prev.allowances, created]
    }));
    setShowAddAllowanceModal(false);
    setNewAllowance({
      name: '',
      code: '',
      type: 'fixe',
      defaultValue: 100,
      isTaxable: true,
      isSubjectToSocialContributions: true,
      isActive: true,
      category: 'performance',
      description: ''
    });
  };

  // Clôturer le mois de paie par le DG
  const handleSignAndClosePayroll = (runId: string) => {
    const hash = `SHA256:d892bc018ae82103fca9182390a821e${Math.random().toString(36).substring(2, 6)}`;
    setPayrollRuns(prev => prev.map(r => {
      if (r.id !== runId) return r;
      return {
        ...r,
        status: 'cloture',
        validatedByDG: `${currentUser.name} (${currentUser.roleTitle})`,
        validatedAt: `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        closureHash: hash
      };
    }));
    if (onLogAction) {
      onLogAction(
        'Clôture & Signature Électronique Paie',
        `La paie mensuelle a été scellée et signée électroniquement par la Direction Générale.`,
        'admin'
      );
    }
  };

  // Formatage des montants selon la devise active (USD ou CDF)
  const formatMoney = (amount: number, customCurr?: string) => {
    const curr = customCurr || config.currency;
    if (curr === 'USD') {
      return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`;
    }
    return `${amount.toLocaleString('fr-FR')} CDF`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-slate-100">
      
      {/* 1. EN-TÊTE PRINCIPAL DU MODULE PAIE & RH RDC (DARK THEME SLATE-900) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
              RESSOURCES HUMAINES & PAIE RDC
            </span>
            <span className="text-xs text-slate-400 font-medium">Code du Travail RDC • CNSS • INPP • ONEM • IPR</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              Devises : USD ($) & CDF
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <span>Système Intégral de Gestion de la Paie & RH</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Gestion complète des contrats de travail, congés payés, avances sur salaires, déclarations fiscales IPR et cotisations sociales CNSS. Calcul en temps réel selon les barèmes officiels en Franc Congolais (CDF) et Dollar Américain (USD).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Sélecteur de Devise Officielle */}
          <div className="flex items-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 mr-2 font-medium">Devise active :</span>
            <button
              onClick={() => {
                if (!isHR) return;
                setConfig({ ...config, currency: 'USD' });
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                config.currency === 'USD'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => {
                if (!isHR) return;
                setConfig({ ...config, currency: 'CDF' });
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ml-1 ${
                config.currency === 'CDF'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CDF (FC)
            </button>
          </div>

          {isHR && (
            <>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                title="Rétablir le Barème Légal RDC"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rétablir Standard</span>
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* NOTIFICATION DE SUCCÈS */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Paramètres et barèmes du système de paie RDC enregistrés avec succès.</span>
          </div>
        </div>
      )}

      {/* 2. ONGLETS DE NAVIGATION FONCTIONNELLE DU MODULE RH */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: '1. Paramètres & Taux BCC', icon: Sliders },
          { id: 'payroll_run', label: `2. Clôture & Journal de Paie (${payrollRuns.length})`, icon: Calendar },
          { id: 'contracts', label: `3. Contrats & Fiches Salariés (${contracts.length})`, icon: Briefcase },
          { id: 'overtime', label: `4. Heures Sup (+30%/+60%/+100%) (${overtimeRecords.length})`, icon: Clock },
          { id: 'leaves', label: `5. Congés & Absences (${leaves.length})`, icon: Calendar },
          { id: 'advances', label: `6. Avances & Acomptes (${advances.length})`, icon: DollarSign },
          { id: 'discipline', label: `7. Discipline & Sanctions (${disciplinaryActions.length})`, icon: ShieldCheck },
          { id: 'allowances', label: `8. Primes & Indemnités (${config.allowances.filter(a => a.isActive).length})`, icon: Layers },
          { id: 'social', label: '9. Cotisations CNSS & INPP', icon: Percent },
          { id: 'taxes', label: '10. Barème Fiscal IPR', icon: FileText },
          { id: 'simulator', label: '11. Spécimen & Bulletin Officiel', icon: Calculator },
          { id: 'backend_code', label: '12. Code Source Laravel Paie & RH', icon: FileCode2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PayrollTabType)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 1: VUE GÉNÉRALE & PARAMÈTRES MONÉTAIRES RDC                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Politique Salariale & Paramètres de Rémunération RDC</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Conforme République Démocratique du Congo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Intitulé Officiel du Système de Paie
                </label>
                <input
                  type="text"
                  disabled={!isHR}
                  value={config.systemName}
                  onChange={(e) => setConfig({ ...config, systemName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Devise Monétaire Principale (Stricte)
                </label>
                <select
                  disabled={!isHR}
                  value={config.currency}
                  onChange={(e) => setConfig({ ...config, currency: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="USD">Dollar Américain ($ USD) - Référence Télécoms & Équipements</option>
                  <option value="CDF">Franc Congolais (CDF / FC) - Monnaie Nationale RDC</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Taux de Change Légal BCC (1 USD en CDF)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs font-mono">CDF</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Utilisé pour les conversions contractuelles et déclarations.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Base Horaire Légale Mensuelle (Heures)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={!isHR}
                    value={config.standardMonthlyHours}
                    onChange={(e) => setConfig({ ...config, standardMonthlyHours: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs font-mono">h/mois</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Prime d'Ancienneté (% tous les 2 ans de service)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={!isHR}
                    value={config.seniorityBonusPerTwoYearsPercent}
                    onChange={(e) => setConfig({ ...config, seniorityBonusPerTwoYearsPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 text-xs font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Fréquence d'Émission des Bulletins
                </label>
                <select
                  disabled={!isHR}
                  value={config.payFrequency}
                  onChange={(e) => setConfig({ ...config, payFrequency: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mensuelle">Mensuelle (Fin de mois)</option>
                  <option value="quinzaine">Par quinzaine</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                </select>
              </div>
            </div>

            {/* Majorations Heures Supplémentaires */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Barème Légal des Heures Supplémentaires (Code du Travail RDC)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Heures Sup. Jour Ouvrable</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      disabled={!isHR}
                      value={config.overtimeRates.firstBracketRate}
                      onChange={(e) => setConfig({
                        ...config,
                        overtimeRates: { ...config.overtimeRates, firstBracketRate: Number(e.target.value) }
                      })}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
                    />
                    <span className="text-amber-400 font-bold">% majoration</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Heures Sup. Nuit</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      disabled={!isHR}
                      value={config.overtimeRates.secondBracketRate}
                      onChange={(e) => setConfig({
                        ...config,
                        overtimeRates: { ...config.overtimeRates, secondBracketRate: Number(e.target.value) }
                      })}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
                    />
                    <span className="text-amber-400 font-bold">% majoration</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Dimanches & Fériés Chômés</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      disabled={!isHR}
                      value={config.overtimeRates.weekendHolidayRate}
                      onChange={(e) => setConfig({
                        ...config,
                        overtimeRates: { ...config.overtimeRates, weekendHolidayRate: Number(e.target.value) }
                      })}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-bold text-xs"
                    />
                    <span className="text-amber-400 font-bold">% majoration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Synthèse Rémunération & Organismes RDC */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Conformité Fiscale & Sociale RDC</span>
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">CNSS Régime Général</div>
                    <div className="text-[10px] text-slate-400">Pensions + Risques prof.</div>
                  </div>
                  <div className="text-right font-mono font-bold text-indigo-400">
                    5% salarié / 13% patronal
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">INPP RDC</div>
                    <div className="text-[10px] text-slate-400">Formation professionnelle</div>
                  </div>
                  <div className="text-right font-mono font-bold text-indigo-400">
                    3% patronal
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">ONEM RDC</div>
                    <div className="text-[10px] text-slate-400">Office National Emploi</div>
                  </div>
                  <div className="text-right font-mono font-bold text-indigo-400">
                    0.2% patronal
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">IPR (Impôt Rémunérations)</div>
                    <div className="text-[10px] text-slate-400">DGI République Démocratique du Congo</div>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-400">
                    Progressif 3% à 40%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl text-xs space-y-2">
              <span className="text-slate-400 block font-medium">Dernière révision RH :</span>
              <p className="text-white font-semibold">{config.lastModifiedBy}</p>
              <p className="text-[11px] text-slate-400">Horodatage : {config.lastModifiedAt}</p>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 2: CLÔTURE MENSUELLE DE LA PAIE & E-SIGNATURE DG               */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'payroll_run' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Périodes d'Émission des Paies & Validations Hiérarchiques</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Génération des états récapitulatifs mensuels, contrôle d'assiette et signature électronique obligatoire du Directeur Général (DG).
              </p>
            </div>

            <button
              onClick={() => {
                const nextMonth = '2026-10';
                const createdRun: PayrollRunPeriod = {
                  id: `run-${nextMonth}`,
                  month: nextMonth,
                  title: `Paie RHEMA BUSINESS - Octobre 2026`,
                  currency: config.currency as 'USD' | 'CDF',
                  exchangeRateUSD_CDF: exchangeRate,
                  status: 'brouillon',
                  totalGross: 8950,
                  totalNet: 7380,
                  totalEmployerCharges: 1475,
                  totalEmployees: contracts.length
                };
                setPayrollRuns([createdRun, ...payrollRuns]);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ouvrir une Période de Paie</span>
            </button>
          </div>

          <div className="space-y-4">
            {payrollRuns.map(run => {
              const isClosed = run.status === 'cloture';
              return (
                <div
                  key={run.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-white font-mono bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {run.month}
                      </span>
                      <h4 className="text-base font-bold text-white">{run.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isClosed 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {isClosed ? 'Clôturé & E-Signé par le DG' : 'En Validation Direction'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isClosed && currentUser.role === 'dg' && (
                        <button
                          onClick={() => handleSignAndClosePayroll(run.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow transition"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Apposer la Signature DG & Clôturer</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Statistiques Financières de la Période */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Effectif Traité</span>
                      <span className="text-lg font-bold text-white mt-1 block font-mono">{run.totalEmployees} agents</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Masse Salariale Brute</span>
                      <span className="text-lg font-bold text-indigo-400 mt-1 block font-mono">{formatMoney(run.totalGross, run.currency)}</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Net Global à Virer</span>
                      <span className="text-lg font-bold text-emerald-400 mt-1 block font-mono">{formatMoney(run.totalNet, run.currency)}</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Charges Patronales (CNSS/INPP)</span>
                      <span className="text-lg font-bold text-amber-400 mt-1 block font-mono">{formatMoney(run.totalEmployerCharges, run.currency)}</span>
                    </div>
                  </div>

                  {/* Bouton d'accès au Journal de Paie Consolidé */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                      className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{expandedRunId === run.id ? 'Masquer le Livre de Paie' : 'Consulter le Livre de Paie Consolidé & Virements'}</span>
                    </button>

                    <div className="text-[11px] text-slate-400">
                      Taux de conversion appliqué : <strong>1 USD = {run.exchangeRateUSD_CDF} CDF</strong>
                    </div>
                  </div>

                  {/* Tableau Consolidé : Livre de Paie & Fiches Individuelles */}
                  {expandedRunId === run.id && (
                    <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                          <span>Livre de Paie Détaillé des Salariés ({run.month})</span>
                        </h5>
                        <button
                          onClick={() => {
                            if (onLogAction) {
                              onLogAction('Exportation Journal de Paie', `Livre de Paie ${run.month} exporté par la DRH.`, 'admin');
                            }
                            window.print();
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer le Journal</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold">
                            <tr>
                              <th className="py-2.5 px-3">Collaborateur</th>
                              <th className="py-2.5 px-2">Matricule</th>
                              <th className="py-2.5 px-2 text-right">Base Fixé</th>
                              <th className="py-2.5 px-2 text-right">Heures Sup</th>
                              <th className="py-2.5 px-2 text-right">Primes</th>
                              <th className="py-2.5 px-2 text-right">Brut Imposable</th>
                              <th className="py-2.5 px-2 text-right">CNSS 5%</th>
                              <th className="py-2.5 px-2 text-right">IPR DGI</th>
                              <th className="py-2.5 px-2 text-right">Avance</th>
                              <th className="py-2.5 px-3 text-right">Net à Payer</th>
                              <th className="py-2.5 px-2">Règlement</th>
                              <th className="py-2.5 px-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-slate-200">
                            {contracts.map(contract => {
                              const emp = users.find(u => u.id === contract.userId);
                              const ot = overtimeRecords.find(o => o.userId === contract.userId && o.month === run.month);
                              const otPay = ot ? (config.currency === 'USD' ? ot.calculatedPayUSD : ot.calculatedPayCDF) : 0;
                              
                              // Calculs proportionnels
                              const base = contract.salaryCurrency === config.currency 
                                ? contract.baseSalary 
                                : config.currency === 'CDF' 
                                  ? Math.round(contract.baseSalary * run.exchangeRateUSD_CDF)
                                  : Math.round(contract.baseSalary / run.exchangeRateUSD_CDF);
                              
                              const primes = Math.round(base * 0.15);
                              const gross = base + otPay + primes;
                              const cnssEmp = Math.round(gross * 0.05);
                              const ipr = Math.round(gross * 0.10);
                              
                              const adv = advances.find(a => a.userId === contract.userId && a.repaymentMonth === run.month);
                              const advAmount = adv ? (adv.currency === config.currency ? adv.amount : config.currency === 'CDF' ? adv.amount * run.exchangeRateUSD_CDF : Math.round(adv.amount / run.exchangeRateUSD_CDF)) : 0;
                              
                              const net = Math.max(0, gross - cnssEmp - ipr - advAmount);

                              return (
                                <tr key={contract.id} className="hover:bg-slate-950/40">
                                  <td className="py-2 px-3 font-semibold text-white">
                                    {emp?.name || 'Agent'}
                                    <span className="block text-[10px] text-slate-400 font-normal">{contract.categoryPro}</span>
                                  </td>
                                  <td className="py-2 px-2 font-mono text-[11px] text-slate-300">{contract.matricule}</td>
                                  <td className="py-2 px-2 text-right font-mono">{formatMoney(base)}</td>
                                  <td className="py-2 px-2 text-right font-mono text-amber-400">{otPay > 0 ? `+${formatMoney(otPay)}` : '-'}</td>
                                  <td className="py-2 px-2 text-right font-mono text-slate-300">+{formatMoney(primes)}</td>
                                  <td className="py-2 px-2 text-right font-mono font-bold text-white">{formatMoney(gross)}</td>
                                  <td className="py-2 px-2 text-right font-mono text-amber-300">-{formatMoney(cnssEmp)}</td>
                                  <td className="py-2 px-2 text-right font-mono text-red-400">-{formatMoney(ipr)}</td>
                                  <td className="py-2 px-2 text-right font-mono text-slate-400">{advAmount > 0 ? `-${formatMoney(advAmount)}` : '-'}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400 text-xs">{formatMoney(net)}</td>
                                  <td className="py-2 px-2 text-[10px] text-slate-300">
                                    <span className="font-semibold block uppercase">{contract.paymentMode.replace('_', ' ')}</span>
                                    <span className="text-slate-500 font-mono">{contract.bankName.slice(0, 10)}</span>
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      onClick={() => {
                                        setSimSelectedUserId(contract.userId);
                                        setSimBaseSalary(base);
                                        setSimDependents(contract.dependentsCount);
                                        setShowPrintModal(true);
                                      }}
                                      className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded font-semibold text-[10px] border border-indigo-500/30"
                                      title="Consulter et Imprimer le Bulletin Individuel"
                                    >
                                      Bulletin
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Récapitulatif Virements Bancaires & Télécoms */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Bordereau des Virements Bancaires & Mobile Money</span>
                          </span>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">Rawbank Kinshasa :</span>
                              <span className="font-mono font-bold text-white">4 750 $ (2 agents)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">Equity BCDC Gombe :</span>
                              <span className="font-mono font-bold text-white">1 950 $ (1 agent)</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">TMB (Trust Merchant Bank) :</span>
                              <span className="font-mono font-bold text-white">1 100 $ (1 agent)</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">Mobile Money (M-Pesa / Airtel Money) :</span>
                              <span className="font-mono font-bold text-white">2 280 000 CDF (1 agent)</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Déclarations Fiscales & Cotisations Sociales RDC</span>
                          </span>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">CNSS Total (Employé 5% + Patronal 13%) :</span>
                              <span className="font-mono font-bold text-indigo-300">1 580 $ à verser</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">IPR DGI (Retenue à la source impôt) :</span>
                              <span className="font-mono font-bold text-red-400">895 $ à reverser DGI</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                              <span className="text-slate-400">INPP (Contribution 3% formation) :</span>
                              <span className="font-mono font-bold text-slate-300">268 $</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">ONEM (Contribution 0.2% emploi) :</span>
                              <span className="font-mono font-bold text-slate-300">18 $</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 3: CONTRATS & FICHES SALARIÉS CONFORMES RDC                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'contracts' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Registre du Personnel & Paramètres Contractuels RDC</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Fiches individuelles : Matricule, Type de contrat (CDI/CDD), Numéro CNSS, Salaire de base (USD ou CDF), coordonnées bancaires ou Mobile Money.
              </p>
            </div>

            {isHR && (
              <button
                onClick={() => setShowAddContractModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enregistrer un Contrat</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map(contract => {
              const matchedUser = users.find(u => u.id === contract.userId);
              return (
                <div
                  key={contract.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                        {matchedUser?.name ? matchedUser.name.slice(0, 2).toUpperCase() : 'AG'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{matchedUser?.name || 'Collaborateur'}</h4>
                        <div className="text-[11px] text-slate-400">{contract.categoryPro} • {contract.echelon}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {contract.contractType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Matricule Interne</span>
                      <span className="text-slate-200 font-mono font-semibold">{contract.matricule}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Numéro CNSS RDC</span>
                      <span className="text-slate-200 font-mono font-semibold">{contract.cnssNumber}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Salaire de Base Fixé</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {contract.baseSalary.toLocaleString()} {contract.salaryCurrency === 'USD' ? '$' : 'CDF'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Mode de Règlement</span>
                      <span className="text-slate-200 font-semibold uppercase">{contract.paymentMode.replace('_', ' ')}</span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Charges de famille : <strong>{contract.dependentsCount} enfant(s)</strong></span>
                      <span>Compte : {contract.bankName}</span>
                    </div>
                  </div>

                  {/* Actions Rapides Collaborateur & Documents Officiels */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingContract(contract);
                          setShowAddContractModal(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          setOfficialDocModal({
                            isOpen: true,
                            type: 'contrat_travail',
                            title: `CONTRAT DE TRAVAIL (${contract.contractType})`,
                            referenceNumber: `CT-${contract.matricule}-2026`,
                            data: {
                              employeeName: matchedUser?.name || 'Collaborateur',
                              matricule: contract.matricule,
                              cnssNumber: contract.cnssNumber,
                              contractType: contract.contractType,
                              startDate: contract.startDate,
                              endDate: contract.endDate,
                              baseSalary: contract.baseSalary,
                              salaryCurrency: contract.salaryCurrency,
                              categoryPro: contract.categoryPro,
                              echelon: contract.echelon,
                              paymentMode: contract.paymentMode,
                              bankName: contract.bankName,
                              bankAccountNumber: contract.bankAccountNumber,
                              mobileMoneyNumber: contract.mobileMoneyNumber
                            }
                          });
                        }}
                        className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-[10px] font-semibold border border-indigo-500/30 transition flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Contrat Officiel</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setOfficialDocModal({
                            isOpen: true,
                            type: 'attestation_travail',
                            title: "ATTESTATION DE TRAVAIL & D'EMPLOI",
                            referenceNumber: `ATT-${contract.matricule}-2026`,
                            data: {
                              employeeName: matchedUser?.name || 'Collaborateur',
                              matricule: contract.matricule,
                              cnssNumber: contract.cnssNumber,
                              categoryPro: contract.categoryPro,
                              echelon: contract.echelon,
                              startDate: contract.startDate
                            }
                          });
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-semibold transition"
                      >
                        Attestation
                      </button>
                      <button
                        onClick={() => {
                          const leaveDaysLeft = 14;
                          const prorata = Math.round(contract.baseSalary * 0.75);
                          const leaveComp = Math.round((contract.baseSalary / 26) * leaveDaysLeft);
                          const severance = contract.contractType === 'CDI' ? Math.round(contract.baseSalary * 1.5) : 0;
                          const totalSTC = prorata + leaveComp + severance;

                          setOfficialDocModal({
                            isOpen: true,
                            type: 'solde_tout_compte',
                            title: 'REÇU POUR SOLDE DE TOUT COMPTE (STC)',
                            referenceNumber: `STC-${contract.matricule}-2026`,
                            data: {
                              employeeName: matchedUser?.name || 'Collaborateur',
                              matricule: contract.matricule,
                              currency: contract.salaryCurrency,
                              totalAmount: totalSTC,
                              prorataSalary: prorata,
                              leaveDaysLeft,
                              leaveCompensation: leaveComp,
                              severancePay: severance,
                              advanceDeduction: 0
                            }
                          });
                        }}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-[10px] font-semibold border border-amber-500/30 transition"
                      >
                        Solde STC
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 4: CONGÉS & ABSENCES                                           */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'leaves' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Gestion des Congés Payés & Absences Conventionnelles</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Décompte des jours ouvrables, validation hiérarchique et impact sur la retenue d'absence sur le bulletin de paie.
              </p>
            </div>

            <button
              onClick={() => setShowAddLeaveModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Déposer une Demande de Congé</span>
            </button>
          </div>

          <div className="space-y-3">
            {leaves.map(l => (
              <div
                key={l.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{l.userName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                      {l.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{l.reason}</p>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Du {l.startDate} au {l.endDate}</span>
                    <span>•</span>
                    <span className="font-bold text-indigo-300">{l.durationDays} jour(s) ouvrables</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                    l.status === 'approuve'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {l.status === 'approuve' ? 'Approuvé' : 'En Attente de Visa'}
                  </span>

                  {l.status === 'approuve' && (
                    <button
                      onClick={() => {
                        setOfficialDocModal({
                          isOpen: true,
                          type: 'titre_conge',
                          title: 'TITRE OFFICIEL DE CONGÉ PAYÉ RHEMA',
                          referenceNumber: `TC-${l.id.toUpperCase()}-2026`,
                          data: {
                            userName: l.userName,
                            type: l.type,
                            startDate: l.startDate,
                            endDate: l.endDate,
                            durationDays: l.durationDays,
                            reason: l.reason
                          }
                        });
                      }}
                      className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg font-semibold text-xs border border-indigo-500/30 flex items-center gap-1 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Titre de Congé</span>
                    </button>
                  )}

                  {l.status === 'en_attente' && isHR && (
                    <button
                      onClick={() => {
                        setLeaves(prev => prev.map(item => item.id === l.id ? { ...item, status: 'approuve', approvedBy: currentUser.name, approvedAt: new Date().toISOString().slice(0, 10) } : item));
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow"
                    >
                      Valider
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 5: AVANCES SUR SALAIRES & PRÊTS                                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'advances' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                <span>Avances sur Salaire & Acomptes RDC</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Suivi des acomptes versés en cours de mois et retenue automatique sur le bulletin de paie de l'échéance.
              </p>
            </div>

            <button
              onClick={() => setShowAddAdvanceModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Octroyer une Avance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advances.map(adv => (
              <div
                key={adv.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{adv.userName}</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    {adv.amount.toLocaleString()} {adv.currency === 'USD' ? '$' : 'CDF'}
                  </span>
                </div>

                <p className="text-slate-400 text-xs">{adv.reason}</p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                  <span>Mois de déduction sur paie : <strong>{adv.repaymentMonth}</strong></span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Déduction Programmée
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET HEURES SUPPLÉMENTAIRES (CODE DU TRAVAIL RDC ART. 119)          */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overtime' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Heures Supplémentaires & Majorations Légales RDC</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Barème officiel Art. 119 du Code du Travail : +30% jour ouvrable, +60% nuit, +100% dimanches et jours fériés chômés. Intégration directe sur la fiche de paie.
              </p>
            </div>

            {isHR && (
              <button
                onClick={() => setShowOvertimeModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Saisir des Heures Sup</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overtimeRecords.map(ot => (
              <div
                key={ot.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm">{ot.userName}</span>
                    <span className="text-[10px] text-slate-400 block">Date : {ot.date} (Mois : {ot.month})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
                    Validé
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-center">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Jour (+30%)</span>
                    <span className="font-bold font-mono text-white">{ot.dayHours} h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nuit (+60%)</span>
                    <span className="font-bold font-mono text-white">{ot.nightHours} h</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Dim/Férié (+100%)</span>
                    <span className="font-bold font-mono text-white">{ot.weekendHolidayHours} h</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs italic">{ot.reason}</p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Majoration à verser :</span>
                  <div className="text-right font-mono font-bold">
                    <span className="text-amber-400 text-sm">
                      {config.currency === 'USD' ? `${ot.calculatedPayUSD} $` : `${ot.calculatedPayCDF?.toLocaleString()} CDF`}
                    </span>
                    <span className="text-slate-500 text-[10px] block">
                      {config.currency === 'USD' ? `≈ ${ot.calculatedPayCDF?.toLocaleString()} CDF` : `≈ ${ot.calculatedPayUSD} $`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET DISCIPLINE & SANCTIONS RH (CODE DU TRAVAIL RDC)                */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'discipline' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span>Registre Disciplinaire & Conformité Droit du Travail RDC</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Suivi des demandes d'explications, avertissements écrits, blâmes et mises à pied conservatoires (limitées à 3 jours ouvrables selon la loi RDC).
              </p>
            </div>

            {isHR && (
              <button
                onClick={() => setShowDisciplinaryModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Émettre une Sanction</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disciplinaryActions.map(disc => (
              <div
                key={disc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900">
                      {disc.referenceNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{disc.userName}</h4>
                    <span className="text-[10px] text-slate-400">Faits constatés le : {disc.incidentDate}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 uppercase text-[10px]">
                    {disc.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 text-xs">
                  <strong className="text-white block mb-0.5">Motif :</strong>
                  {disc.reason}
                </div>

                {disc.sanctionDurationDays && (
                  <div className="text-amber-400 font-semibold text-[11px]">
                    Mise à pied appliquée : {disc.sanctionDurationDays} jour(s) avec retenue sur salaire.
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Émis par : {disc.issuedBy}</span>
                  <button
                    onClick={() => {
                      setOfficialDocModal({
                        isOpen: true,
                        type: 'lettre_sanction',
                        title: 'NOTIFICATION DISCIPLINAIRE OFFICIELLE',
                        referenceNumber: disc.referenceNumber,
                        data: {
                          userName: disc.userName,
                          matricule: disc.matricule,
                          type: disc.type,
                          incidentDate: disc.incidentDate,
                          reason: disc.reason,
                          sanctionDurationDays: disc.sanctionDurationDays
                        }
                      });
                    }}
                    className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-xs font-semibold border border-red-500/30 flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notification Officielle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 6: PRIMES & INDEMNITÉS                                         */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'allowances' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Nomenclature des Primes & Indemnités en RDC</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Indemnités de transport, logement, restauration et primes de fonction. Activez ou désactivez les éléments selon votre convention d'entreprise.
              </p>
            </div>

            {isHR && (
              <button
                onClick={() => setShowAddAllowanceModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une Prime Sur-Mesure</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.allowances.map(a => (
              <div
                key={a.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-xl space-y-3 transition ${
                  a.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900">
                      {a.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1.5">{a.name}</h4>
                  </div>

                  {isHR && (
                    <button
                      onClick={() => toggleAllowance(a.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                        a.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {a.isActive ? 'Active' : 'Désactivée'}
                    </button>
                  )}
                </div>

                <p className="text-slate-400 text-xs">{a.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Valeur Standard</span>
                    <span className="text-white font-bold font-mono">
                      {a.type === 'fixe' ? formatMoney(a.defaultValue) : `${a.defaultValue}% du base`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Régime Fiscal & Social</span>
                    <span className="text-slate-300">
                      {a.isTaxable ? 'Imposable IPR' : 'Exonéré IPR'} • {a.isSubjectToSocialContributions ? 'Soumis CNSS' : 'Exonéré CNSS'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 7: COTISATIONS SOCIALES CNSS / INPP / ONEM                     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'social' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span>Cotisations Sociales & Organismes Parafiscaux RDC</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Barème légal obligatoire de la Caisse Nationale de Sécurité Sociale (CNSS), de l'Institut National de Préparation Professionnelle (INPP) et de l'Office National de l'Emploi (ONEM).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.socialContributions.map(sc => (
              <div
                key={sc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900">
                    {sc.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Légal RDC
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{sc.name}</h4>
                <p className="text-slate-400 text-xs">{sc.description}</p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Part Salariale</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">{sc.employeeRate}%</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Part Patronale</span>
                    <span className="text-indigo-400 font-bold font-mono text-sm">{sc.employerRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 8: BARÈME FISCAL IPR RDC                                       */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'taxes' && (
        <div className="space-y-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Barème Progressif de l'IPR (Direction Générale des Impôts - DGI RDC)</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              L'Impôt Professionnel sur les Rémunérations (IPR) est calculé par tranches progressives sur le net imposable après déduction de la cotisation CNSS salariale.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Tranche</th>
                    <th className="py-2.5 px-3">Revenu Imposable ({config.currency})</th>
                    <th className="py-2.5 px-3">Taux Applicable</th>
                    <th className="py-2.5 px-3">Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {config.taxConfig.brackets.map((b, idx) => (
                    <tr key={b.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-3 font-bold text-white font-mono">Tranche {idx + 1}</td>
                      <td className="py-3 px-3 font-mono">
                        {formatMoney(b.min)} {b.max !== null ? `à ${formatMoney(b.max)}` : 'et plus'}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400 font-mono text-sm">{b.rate}%</td>
                      <td className="py-3 px-3 text-slate-400">Calcul progressif sur fraction de tranche</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">Réduction d'IPR par charge de famille (Enfant à charge)</span>
                <p className="text-[10px] text-slate-400">Déduction directe sur le montant de l'impôt calculé.</p>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {formatMoney(config.taxConfig.creditPerDependentChild)} / enfant
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 9: SIMULATEUR & SPÉCIMEN DU BULLETIN OFFICIEL RHEMA             */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* Panneau de saisie */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Simulateur & Calcul en Direct</span>
            </h3>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Sélectionner un Collaborateur
              </label>
              <select
                value={simSelectedUserId}
                onChange={(e) => handleSelectSimUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roleTitle})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Salaire de Base Mensuel ({config.currency})
              </label>
              <input
                type="number"
                value={simBaseSalary}
                onChange={(e) => setSimBaseSalary(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Ancienneté (Années)
                </label>
                <input
                  type="number"
                  value={simSeniorityYears}
                  onChange={(e) => setSimSeniorityYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Enfants à Charge
                </label>
                <input
                  type="number"
                  value={simDependents}
                  onChange={(e) => setSimDependents(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Salaire Brut Total :</span>
                <span className="font-bold text-white font-mono">{formatMoney(simulation.grossSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cotisations Employé :</span>
                <span className="font-bold text-amber-400 font-mono">- {formatMoney(simulation.totalEmployeeContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retenue Fiscale IPR :</span>
                <span className="font-bold text-red-400 font-mono">- {formatMoney(simulation.totalTaxes)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                <span className="font-bold text-emerald-400">Net à Payer :</span>
                <span className="font-bold text-emerald-400 font-mono">{formatMoney(simulation.netPay)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPrintModal(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Afficher & Imprimer le Bulletin Officiel</span>
            </button>
          </div>

          {/* Décomposition du bulletin au format Pro RDC */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">Spécimen Décomposition Salariale</h4>
                <p className="text-slate-400 text-xs">Simulateur instantané conforme au barème RH RHEMA BUSINESS</p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Devise : {config.currency}
              </span>
            </div>

            {/* Tableau récapitulatif des lignes */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Rubrique</th>
                    <th className="py-2 px-3">Base</th>
                    <th className="py-2 px-3">Taux / Formule</th>
                    <th className="py-2 px-3 text-right">Gains (+)</th>
                    <th className="py-2 px-3 text-right">Retenues (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Salaire de Base Mensuel</td>
                    <td className="py-2.5 px-3 font-mono">{formatMoney(simulation.baseSalary)}</td>
                    <td className="py-2.5 px-3 text-slate-400">173.33 h</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatMoney(simulation.baseSalary)}</td>
                    <td className="py-2.5 px-3 text-right">-</td>
                  </tr>

                  {simulation.seniorityBonus > 0 && (
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-white">Prime d'Ancienneté ({simSeniorityYears} ans)</td>
                      <td className="py-2.5 px-3 font-mono">{formatMoney(simulation.baseSalary)}</td>
                      <td className="py-2.5 px-3 text-slate-400">+{Math.floor(simSeniorityYears / 2) * config.seniorityBonusPerTwoYearsPercent}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatMoney(simulation.seniorityBonus)}</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                    </tr>
                  )}

                  {simulation.activeAllowances.map(a => (
                    <tr key={a.code}>
                      <td className="py-2.5 px-3 font-semibold text-white">{a.name}</td>
                      <td className="py-2.5 px-3 font-mono">{formatMoney(simulation.baseSalary)}</td>
                      <td className="py-2.5 px-3 text-slate-400">{a.isTaxable ? 'Imposable' : 'Exonéré'}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{formatMoney(a.amount)}</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                    </tr>
                  ))}

                  {simulation.employeeContributions.map(sc => (
                    <tr key={sc.code} className="text-amber-300">
                      <td className="py-2.5 px-3">{sc.name}</td>
                      <td className="py-2.5 px-3 font-mono">{formatMoney(sc.base)}</td>
                      <td className="py-2.5 px-3 font-mono">{sc.rate}%</td>
                      <td className="py-2.5 px-3 text-right">-</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">{formatMoney(sc.amount)}</td>
                    </tr>
                  ))}

                  <tr className="text-red-300">
                    <td className="py-2.5 px-3">IPR (Impôt Professionnel RDC)</td>
                    <td className="py-2.5 px-3 font-mono">{formatMoney(simulation.taxableNet)}</td>
                    <td className="py-2.5 px-3">Barème DGI</td>
                    <td className="py-2.5 px-3 text-right">-</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{formatMoney(simulation.irppTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total final */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-xs block">NET À PAYER EN BANQUE OU MOBILE MONEY :</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                  {formatMoney(simulation.netPay)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 text-xs block">Coût Global Employeur RHEMA :</span>
                <span className="text-base font-bold text-indigo-300 font-mono mt-1 block">
                  {formatMoney(simulation.totalEmployerCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ONGLET 12: CODE SOURCE LARAVEL 11/12 DU SYSTÈME DE PAIE ET RH RDC     */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'backend_code' && (
        <div className="space-y-4">
          <LaravelCodeView />
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODALE DU BULLETIN OFFICIEL SUR FEUILLE BLANCHE RHEMA BUSINESS         */}
      {/* --------------------------------------------------------------------- */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bulletin Officiel de Rémunération • République Démocratique du Congo
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* En-tête officiel RHEMA */}
            <RhemaDocumentHeader
              documentTitle="BULLETIN DE PAIE ET DE RÉMUNÉRATION MENSUELLE"
              referenceNumber={`BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
              date={new Date().toLocaleDateString('fr-FR')}
            />

            {/* Coordonnées Salarié */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Bénéficiaire :</p>
                <p className="font-bold text-slate-900 text-sm">
                  {users.find(u => u.id === simSelectedUserId)?.name || currentUser.name}
                </p>
                <p className="text-slate-600">{users.find(u => u.id === simSelectedUserId)?.roleTitle || currentUser.roleTitle}</p>
                <p className="text-slate-500 text-[11px] mt-1">Numéro CNSS : CNSS-CD-9982410</p>
              </div>

              <div className="text-right">
                <p className="text-slate-500 font-medium">Période de Décompte :</p>
                <p className="font-bold text-slate-900 text-sm">Mois de Septembre 2026</p>
                <p className="text-slate-600 font-mono">Devise de règlement : {config.currency}</p>
                <p className="text-slate-500 text-[11px] mt-1">Enfants à charge : {simDependents}</p>
              </div>
            </div>

            {/* Tableau du bulletin blanc officiel */}
            <table className="w-full text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2 px-3 text-left">Désignation des Rubriques</th>
                  <th className="py-2 px-3 text-right">Base ({config.currency})</th>
                  <th className="py-2 px-3 text-right">Taux</th>
                  <th className="py-2 px-3 text-right">Part Salariale (-)</th>
                  <th className="py-2 px-3 text-right">Part Patronale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-2 px-3 font-semibold">Salaire de Base Mensuel</td>
                  <td className="py-2 px-3 text-right font-mono">{formatMoney(simulation.baseSalary)}</td>
                  <td className="py-2 px-3 text-right">100%</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">{formatMoney(simulation.baseSalary)}</td>
                  <td className="py-2 px-3 text-right">-</td>
                </tr>

                {simulation.seniorityBonus > 0 && (
                  <tr>
                    <td className="py-2 px-3 font-semibold">Prime d'Ancienneté ({simSeniorityYears} ans)</td>
                    <td className="py-2 px-3 text-right font-mono">{formatMoney(simulation.baseSalary)}</td>
                    <td className="py-2 px-3 text-right">+{Math.floor(simSeniorityYears / 2) * config.seniorityBonusPerTwoYearsPercent}%</td>
                    <td className="py-2 px-3 text-right font-mono">{formatMoney(simulation.seniorityBonus)}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>
                )}

                {simulation.activeAllowances.map(a => (
                  <tr key={a.code}>
                    <td className="py-2 px-3">{a.name}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatMoney(simulation.baseSalary)}</td>
                    <td className="py-2 px-3 text-right">Fixe</td>
                    <td className="py-2 px-3 text-right font-mono">{formatMoney(a.amount)}</td>
                    <td className="py-2 px-3 text-right">-</td>
                  </tr>
                ))}

                {simulation.employeeContributions.map(sc => (
                  <tr key={sc.code} className="bg-amber-50/50">
                    <td className="py-2 px-3 font-medium text-slate-900">{sc.name}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatMoney(sc.base)}</td>
                    <td className="py-2 px-3 text-right">{sc.rate}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">{formatMoney(sc.amount)}</td>
                    <td className="py-2 px-3 text-right font-mono text-indigo-700">
                      {formatMoney(Math.round(sc.base * (config.socialContributions.find(c => c.code === sc.code)?.employerRate || 0) / 100))}
                    </td>
                  </tr>
                ))}

                <tr className="bg-red-50/40">
                  <td className="py-2 px-3 font-medium text-slate-900">IPR (Impôt Professionnel sur les Rémunérations)</td>
                  <td className="py-2 px-3 text-right font-mono">{formatMoney(simulation.taxableNet)}</td>
                  <td className="py-2 px-3 text-right">DGI</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-red-700">{formatMoney(simulation.irppTax)}</td>
                  <td className="py-2 px-3 text-right">-</td>
                </tr>
              </tbody>
            </table>

            {/* Synthèse finale du bulletin */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl text-center shadow">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Total Brut</span>
                <span className="font-bold font-mono text-sm">{formatMoney(simulation.grossSalary)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Retenues CNSS</span>
                <span className="font-bold font-mono text-sm text-amber-400">{formatMoney(simulation.totalEmployeeContributions)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Retenues IPR</span>
                <span className="font-bold font-mono text-sm text-red-400">{formatMoney(simulation.totalTaxes)}</span>
              </div>
              <div className="bg-emerald-950/80 p-1.5 rounded-lg border border-emerald-500/30">
                <span className="text-[10px] uppercase text-emerald-300 block font-bold">Net à Payer</span>
                <span className="font-bold font-mono text-base text-emerald-400">{formatMoney(simulation.netPay)}</span>
              </div>
            </div>

            {/* Pied de page officiel RHEMA */}
            <RhemaDocumentFooter />
          </div>
        </div>
      )}

      {/* MODALE CONFIRMATION RÉINITIALISATION */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-3">
            <h3 className="font-bold text-sm text-amber-400">Rétablir le Barème Légal RDC</h3>
            <p className="text-xs text-slate-300">
              Voulez-vous rétablir les cotisations officielles de la République Démocratique du Congo (CNSS 5%/13%, INPP 3%, ONEM 0.2%, barème IPR) et les devises autorisées USD & CDF ?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CONTRAT SALARIÉ (CRÉATION & MODIFICATION) */}
      <ContractModal
        isOpen={showAddContractModal}
        users={users}
        contract={editingContract}
        currency={config.currency as 'USD' | 'CDF'}
        exchangeRate={exchangeRate}
        onClose={() => {
          setShowAddContractModal(false);
          setEditingContract(null);
        }}
        onSave={(savedContract) => {
          setContracts(prev => {
            const exists = prev.some(c => c.id === savedContract.id);
            if (exists) {
              return prev.map(c => c.id === savedContract.id ? savedContract : c);
            }
            return [savedContract, ...prev];
          });
          if (onLogAction) {
            onLogAction(
              'Enregistrement Contrat de Travail',
              `Contrat ${savedContract.contractType} (${savedContract.matricule}) enregistré pour ${savedContract.categoryPro}.`,
              'admin'
            );
          }
        }}
      />

      {/* MODALE DÉPÔT DE CONGÉ */}
      <LeaveModal
        isOpen={showAddLeaveModal}
        users={users}
        onClose={() => setShowAddLeaveModal(false)}
        onSave={(savedLeave) => {
          setLeaves(prev => [savedLeave, ...prev]);
          if (onLogAction) {
            onLogAction(
              'Demande de Congé Déposée',
              `Demande de ${savedLeave.durationDays} jour(s) pour ${savedLeave.userName}.`,
              'task'
            );
          }
        }}
      />

      {/* MODALE AVANCE SUR SALAIRE */}
      <AdvanceModal
        isOpen={showAddAdvanceModal}
        users={users}
        currency={config.currency as 'USD' | 'CDF'}
        onClose={() => setShowAddAdvanceModal(false)}
        onSave={(savedAdvance) => {
          setAdvances(prev => [savedAdvance, ...prev]);
          if (onLogAction) {
            onLogAction(
              'Avance sur Salaire Accordée',
              `Avance de ${savedAdvance.amount} ${savedAdvance.currency} accordée à ${savedAdvance.userName}.`,
              'admin'
            );
          }
        }}
      />

      {/* MODALE HEURES SUPPLÉMENTAIRES */}
      <OvertimeModal
        isOpen={showOvertimeModal}
        users={users}
        exchangeRate={exchangeRate}
        onClose={() => setShowOvertimeModal(false)}
        onSave={(savedOt) => {
          setOvertimeRecords(prev => [savedOt, ...prev]);
          if (onLogAction) {
            onLogAction(
              'Saisie Heures Supplémentaires',
              `Heures sup enregistrées pour ${savedOt.userName} (+30%/${savedOt.dayHours}h, +60%/${savedOt.nightHours}h, +100%/${savedOt.weekendHolidayHours}h).`,
              'admin'
            );
          }
        }}
      />

      {/* MODALE DISCIPLINAIRE */}
      <DisciplinaryModal
        isOpen={showDisciplinaryModal}
        users={users}
        onClose={() => setShowDisciplinaryModal(false)}
        onSave={(savedDisc) => {
          setDisciplinaryActions(prev => [savedDisc, ...prev]);
          if (onLogAction) {
            onLogAction(
              'Mesure Disciplinaire Émise',
              `Mesure ${savedDisc.type} émise à l'encontre de ${savedDisc.userName}.`,
              'admin'
            );
          }
        }}
      />

      {/* MODALE VISIONNEUSE DOCUMENT OFFICIEL RHEMA */}
      {officialDocModal && officialDocModal.isOpen && (
        <OfficialHRDocumentModal
          type={officialDocModal.type}
          title={officialDocModal.title}
          referenceNumber={officialDocModal.referenceNumber}
          data={officialDocModal.data}
          onClose={() => setOfficialDocModal(null)}
        />
      )}

    </div>
  );
};
