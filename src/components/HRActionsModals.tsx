import React, { useState } from 'react';
import { 
  User, 
  EmployeeContract, 
  LeaveRequest, 
  SalaryAdvanceRequest, 
  OvertimeRecord,
  DisciplinaryAction,
  PerformanceReview,
  PayrollAllowance,
  PayrollSocialContribution
} from '../types';
import { X, Check, Calculator, Clock, Briefcase, DollarSign, ShieldAlert, Award } from 'lucide-react';

// ==========================================
// 1. MODALE CONTRAT DE TRAVAIL & FICHE SALARIÉ
// ==========================================
export const ContractModal: React.FC<{
  isOpen: boolean;
  users: User[];
  contract?: EmployeeContract | null;
  currency: 'USD' | 'CDF';
  exchangeRate: number;
  onClose: () => void;
  onSave: (contract: EmployeeContract) => void;
}> = ({ isOpen, users, contract, currency, exchangeRate, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<EmployeeContract>>(() => {
    if (contract) return { ...contract };
    return {
      userId: users[0]?.id || '',
      employeeCode: `RH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      matricule: `MAT-${Math.floor(100 + Math.random() * 900)}-RB`,
      contractType: 'CDI',
      startDate: new Date().toISOString().slice(0, 10),
      baseSalary: currency === 'USD' ? 1200 : 3420000,
      salaryCurrency: currency,
      categoryPro: 'Cadre Technique VSAT',
      echelon: 'Catégorie 6 / Échelon 1',
      cnssNumber: `CNSS-CD-${Math.floor(1000000 + Math.random() * 9000000)}`,
      inppRegistered: true,
      onemRegistered: true,
      bankName: 'Rawbank Kinshasa',
      bankAccountNumber: '01002-39201928019-88',
      mobileMoneyNumber: '+243812791228',
      paymentMode: 'virement',
      dependentsCount: 2,
      maritalStatus: 'marie',
      active: true
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: EmployeeContract = {
      id: contract?.id || `ctr-${Date.now()}`,
      userId: formData.userId || users[0]?.id || 'u-1',
      employeeCode: formData.employeeCode || 'RH-001',
      matricule: formData.matricule || 'MAT-001',
      contractType: formData.contractType || 'CDI',
      startDate: formData.startDate || new Date().toISOString().slice(0, 10),
      endDate: formData.endDate,
      baseSalary: Number(formData.baseSalary) || 1000,
      salaryCurrency: formData.salaryCurrency || currency,
      categoryPro: formData.categoryPro || 'Agent Technique',
      echelon: formData.echelon || 'Échelon 1',
      cnssNumber: formData.cnssNumber || 'CNSS-CD-0000000',
      inppRegistered: !!formData.inppRegistered,
      onemRegistered: !!formData.onemRegistered,
      bankName: formData.bankName || 'Rawbank',
      bankAccountNumber: formData.bankAccountNumber || '',
      mobileMoneyNumber: formData.mobileMoneyNumber || '',
      paymentMode: formData.paymentMode || 'virement',
      dependentsCount: Number(formData.dependentsCount) || 0,
      maritalStatus: formData.maritalStatus || 'marie',
      active: true
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8 text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>{contract ? 'Modifier le Contrat de Travail' : 'Enregistrer un Nouveau Contrat RDC'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Collaborateur Assujetti</label>
              <select
                value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Type de Contrat (Code Travail RDC)</label>
              <select
                value={formData.contractType}
                onChange={e => setFormData({ ...formData, contractType: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="CDI">CDI - Durée Indéterminée</option>
                <option value="CDD">CDD - Durée Déterminée</option>
                <option value="Stage">Stage Professionnel</option>
                <option value="Consultant">Consultant / Expert Externe</option>
                <option value="Journalier">Journalier / Prestation Ponctuelle</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Matricule Interne Entreprise</label>
              <input
                type="text"
                value={formData.matricule}
                onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Numéro d'Affiliation CNSS RDC</label>
              <input
                type="text"
                value={formData.cnssNumber}
                onChange={e => setFormData({ ...formData, cnssNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date d'Embauche / Début</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {formData.contractType === 'CDD' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Date de Fin de Contrat</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Salaire de Base Mensuel ({formData.salaryCurrency})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={e => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold font-mono text-sm"
                />
                <select
                  value={formData.salaryCurrency}
                  onChange={e => setFormData({ ...formData, salaryCurrency: e.target.value as 'USD' | 'CDF' })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white font-bold"
                >
                  <option value="USD">$ USD</option>
                  <option value="CDF">CDF (FC)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Catégorie Professionnelle</label>
              <input
                type="text"
                value={formData.categoryPro}
                onChange={e => setFormData({ ...formData, categoryPro: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Mode de Paiement des Salaires</label>
              <select
                value={formData.paymentMode}
                onChange={e => setFormData({ ...formData, paymentMode: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="virement">Virement Bancaire RDC</option>
                <option value="mobile_money">Mobile Money (M-Pesa, Airtel, Orange)</option>
                <option value="cheque">Chèque Bancaire</option>
                <option value="especes">Espèces (Caisse)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Établissement Bancaire ou Opérateur</label>
              <select
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="Rawbank Kinshasa">Rawbank Kinshasa</option>
                <option value="Equity BCDC Gombe">Equity BCDC Gombe</option>
                <option value="TMB Kinshasa">TMB (Trust Merchant Bank)</option>
                <option value="M-Pesa Vodacom RDC">M-Pesa Vodacom RDC</option>
                <option value="Airtel Money RDC">Airtel Money RDC</option>
                <option value="Orange Money RDC">Orange Money RDC</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Numéro de Compte / Mobile Money</label>
              <input
                type="text"
                value={formData.bankAccountNumber || formData.mobileMoneyNumber}
                onChange={e => setFormData({ ...formData, bankAccountNumber: e.target.value, mobileMoneyNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Enfants à Charge (Déduction IPR)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.dependentsCount}
                onChange={e => setFormData({ ...formData, dependentsCount: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer le Contrat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. MODALE DÉPÔT & GESTION DES CONGÉS
// ==========================================
export const LeaveModal: React.FC<{
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onSave: (leave: LeaveRequest) => void;
}> = ({ isOpen, users, onClose, onSave }) => {
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [type, setType] = useState<LeaveRequest['type']>('conge_annuel');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [durationDays, setDurationDays] = useState(14);
  const [reason, setReason] = useState('Congé annuel payé au titre de l\'exercice 2026');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === userId);
    const created: LeaveRequest = {
      id: `lv-${Date.now()}`,
      userId,
      userName: targetUser?.name || 'Collaborateur',
      type,
      startDate,
      endDate,
      durationDays: Number(durationDays) || 1,
      reason,
      status: 'en_attente'
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Déposer une Demande de Congé</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Collaborateur Demandeur</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Type de Congé</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="conge_annuel">Congé Annuel Payé (Droit légal 24 jours ouvrables)</option>
              <option value="maladie">Congé Maladie (Certificat médical)</option>
              <option value="circonstance">Circonstance (Mariage, Décès, Naissance)</option>
              <option value="maternite">Congé de Maternité (14 semaines légales)</option>
              <option value="sans_solde">Congé Spécial Sans Solde</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date de Départ</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Date de Reprise</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nombre de Jours Ouvrables</label>
            <input
              type="number"
              min="1"
              value={durationDays}
              onChange={e => setDurationDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Motif ou Précisions</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow">
              <Check className="w-4 h-4" />
              <span>Soumettre la Demande</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. MODALE AVANCE SUR SALAIRE & ACOMPTES
// ==========================================
export const AdvanceModal: React.FC<{
  isOpen: boolean;
  users: User[];
  currency: 'USD' | 'CDF';
  onClose: () => void;
  onSave: (advance: SalaryAdvanceRequest) => void;
}> = ({ isOpen, users, currency, onClose, onSave }) => {
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [amount, setAmount] = useState(currency === 'USD' ? 200 : 570000);
  const [curr, setCurr] = useState<'USD' | 'CDF'>(currency);
  const [repaymentMonth, setRepaymentMonth] = useState('2026-10');
  const [reason, setReason] = useState('Frais scolaires / urgence médicale');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === userId);
    const created: SalaryAdvanceRequest = {
      id: `adv-${Date.now()}`,
      userId,
      userName: targetUser?.name || 'Collaborateur',
      amount: Number(amount) || 0,
      currency: curr,
      requestDate: new Date().toISOString().slice(0, 10),
      repaymentMonth,
      reason,
      status: 'valide_rh',
      deductedFromPayroll: true
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Octroyer une Avance sur Salaire</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Bénéficiaire</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Montant Accordé</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold font-mono text-sm"
              />
              <select
                value={curr}
                onChange={e => setCurr(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
              >
                <option value="USD">$ USD</option>
                <option value="CDF">CDF (FC)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Mois de Retenue Programmée sur Bulletin</label>
            <input
              type="month"
              value={repaymentMonth}
              onChange={e => setRepaymentMonth(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Motif de l'Avance</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow">
              <Check className="w-4 h-4" />
              <span>Valider & Enregistrer l'Avance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. MODALE HEURES SUPPLÉMENTAIRES (RDC ART. 119)
// ==========================================
export const OvertimeModal: React.FC<{
  isOpen: boolean;
  users: User[];
  exchangeRate: number;
  onClose: () => void;
  onSave: (ot: OvertimeRecord) => void;
}> = ({ isOpen, users, exchangeRate, onClose, onSave }) => {
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dayHours, setDayHours] = useState(4);
  const [nightHours, setNightHours] = useState(2);
  const [weekendHolidayHours, setWeekendHolidayHours] = useState(0);
  const [reason, setReason] = useState('Intervention d\'urgence déploiement antenne VSAT');

  if (!isOpen) return null;

  // Calcul basé sur un taux horaire moyen (ex: 8 USD/h)
  const hourlyRateUSD = 8.5;
  const payDay = dayHours * hourlyRateUSD * 1.30;
  const payNight = nightHours * hourlyRateUSD * 1.60;
  const paySunday = weekendHolidayHours * hourlyRateUSD * 2.00;
  const totalUSD = Math.round(payDay + payNight + paySunday);
  const totalCDF = Math.round(totalUSD * exchangeRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === userId);
    const created: OvertimeRecord = {
      id: `ot-${Date.now()}`,
      userId,
      userName: targetUser?.name || 'Collaborateur',
      date,
      dayHours: Number(dayHours) || 0,
      nightHours: Number(nightHours) || 0,
      weekendHolidayHours: Number(weekendHolidayHours) || 0,
      calculatedPayUSD: totalUSD,
      calculatedPayCDF: totalCDF,
      reason,
      month: date.slice(0, 7),
      status: 'valide',
      approvedBy: 'Junior Monya (DG)'
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Saisie des Heures Supplémentaires RDC</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Agent / Collaborateur</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Date de la Prestation</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Jour (+30%)</span>
              <input
                type="number"
                min="0"
                value={dayHours}
                onChange={e => setDayHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-mono font-bold"
              />
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Nuit (+60%)</span>
              <input
                type="number"
                min="0"
                value={nightHours}
                onChange={e => setNightHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-mono font-bold"
              />
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Dim/Férié (+100%)</span>
              <input
                type="number"
                min="0"
                value={weekendHolidayHours}
                onChange={e => setWeekendHolidayHours(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1 text-white font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center justify-between">
            <span className="text-amber-300 font-semibold">Majoration brute estimée :</span>
            <div className="text-right font-mono font-bold">
              <div className="text-amber-400">{totalUSD} $ USD</div>
              <div className="text-slate-400 text-[10px]">{totalCDF.toLocaleString()} CDF</div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Motif de la prestation</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold flex items-center gap-1.5 shadow">
              <Check className="w-4 h-4" />
              <span>Enregistrer les Heures</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MODALE DISCIPLINE & SANCTIONS RH
// ==========================================
export const DisciplinaryModal: React.FC<{
  isOpen: boolean;
  users: User[];
  onClose: () => void;
  onSave: (action: DisciplinaryAction) => void;
}> = ({ isOpen, users, onClose, onSave }) => {
  const [userId, setUserId] = useState(users[1]?.id || users[0]?.id || '');
  const [type, setType] = useState<DisciplinaryAction['type']>('avertissement');
  const [reason, setReason] = useState('Absence non justifiée et retard récurrent');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [sanctionDays, setSanctionDays] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUser = users.find(u => u.id === userId);
    const created: DisciplinaryAction = {
      id: `disc-${Date.now()}`,
      userId,
      userName: targetUser?.name || 'Collaborateur',
      matricule: `MAT-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      incidentDate,
      type,
      reason,
      sanctionDurationDays: type === 'mise_a_pied' ? sanctionDays : undefined,
      status: 'sanction_appliquee',
      issuedBy: 'Direction des Ressources Humaines RHEMA BUSINESS',
      referenceNumber: `DISC-2026-${Math.floor(100 + Math.random() * 900)}`
    };
    onSave(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Procédure Disciplinaire & Sanction</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Collaborateur Concerné</label>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.roleTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Nature de la Mesure</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value="demande_explication">Demande d'Explication Écrite (Préalable)</option>
              <option value="avertissement">Avertissement avec inscription au dossier</option>
              <option value="blame">Blâme officiel</option>
              <option value="mise_a_pied">Mise à pied conservatoire (max 3 jours RDC)</option>
              <option value="licenciement">Notification de Licenciement</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Date des Faits Constatés</label>
            <input
              type="date"
              value={incidentDate}
              onChange={e => setIncidentDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
            />
          </div>

          {type === 'mise_a_pied' && (
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Durée (Jours ouvrables sans solde)</label>
              <input
                type="number"
                min="1"
                max="3"
                value={sanctionDays}
                onChange={e => setSanctionDays(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Motif / Exposé des Manquements</label>
            <textarea
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow">
              <Check className="w-4 h-4" />
              <span>Émettre la Sanction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
