import React from 'react';
import { RhemaDocumentHeader, RhemaDocumentFooter } from './RhemaOfficialDocument';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

export type HRDocType = 
  | 'bulletin_paie'
  | 'contrat_travail'
  | 'attestation_travail'
  | 'titre_conge'
  | 'lettre_sanction'
  | 'solde_tout_compte';

export interface OfficialDocProps {
  type: HRDocType;
  title: string;
  referenceNumber: string;
  date?: string;
  data: Record<string, any>;
  onClose: () => void;
}

export const OfficialHRDocumentModal: React.FC<OfficialDocProps> = ({
  type,
  title,
  referenceNumber,
  date = new Date().toLocaleDateString('fr-FR'),
  data,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 print:p-0 print:shadow-none print:m-0 print:max-w-none">
        {/* Barre d'action */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Document Certifié RHEMA BUSINESS • RDC</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-[#0F4C81] hover:bg-[#0c3c66] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le Document</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* En-tête officiel */}
        <RhemaDocumentHeader
          documentTitle={title}
          referenceNumber={referenceNumber}
          date={date}
        />

        {/* Corps selon le type de document */}
        {type === 'contrat_travail' && (
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-semibold">
              <p>Entre les soussignés :</p>
              <p className="text-slate-900 font-bold">1. La Société RHEMA BUSINESS SARL, représentée par son Directeur Général M. Junior MONYA,</p>
              <p className="mt-1">Et d'autre part :</p>
              <p className="text-slate-900 font-bold">2. M./Mme {data.employeeName}, Matricule {data.matricule}, N° CNSS {data.cnssNumber || 'En cours'}, résidant à Kinshasa.</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm uppercase border-b pb-1">Article 1 : Nature du Contrat & Fonction</h4>
              <p>Le collaborateur est engagé sous contrat <strong>{data.contractType}</strong> en qualité de <strong>{data.categoryPro}</strong> (Échelon: {data.echelon}). Date de début : <strong>{data.startDate}</strong> {data.endDate ? `jusqu'au ${data.endDate}` : '(Durée indéterminée)'}.</p>

              <h4 className="font-bold text-slate-900 text-sm uppercase border-b pb-1">Article 2 : Rémunération & Mode de Paiement</h4>
              <p>Le salaire de base convenu est fixé à <strong>{data.baseSalary?.toLocaleString()} {data.salaryCurrency === 'USD' ? '$ USD' : 'CDF'}</strong> par mois pour une base légale de 173.33 heures de travail effectif. Règlement par {data.paymentMode} sur le compte {data.bankName} ({data.bankAccountNumber || data.mobileMoneyNumber}).</p>

              <h4 className="font-bold text-slate-900 text-sm uppercase border-b pb-1">Article 3 : Période d'Essai & Obligations</h4>
              <p>Le contrat est assorti d'une période d'essai de {data.probationMonths || 3} mois conformément aux dispositions de la Loi n° 015/2002 portant Code du Travail de la République Démocratique du Congo.</p>

              <h4 className="font-bold text-slate-900 text-sm uppercase border-b pb-1">Article 4 : Cotisations Sociales & Impôts</h4>
              <p>L'employé est affilié à la Caisse Nationale de Sécurité Sociale (CNSS). Les cotisations sociales salariales (5%) et l'IPR (DGI) font l'objet d'un prélèvement à la source obligatoire.</p>
            </div>

            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-bold text-slate-900">Pour le Salarié</p>
                <p className="text-slate-500 italic mt-1">« Lu et approuvé, bon pour accord »</p>
                <div className="mt-12 font-semibold">{data.employeeName}</div>
              </div>
              <div>
                <p className="font-bold text-slate-900">Pour RHEMA BUSINESS SARL</p>
                <p className="text-slate-500 italic mt-1">Le Directeur Général</p>
                <div className="mt-12 font-bold text-[#0F4C81]">M. Junior MONYA</div>
              </div>
            </div>
          </div>
        )}

        {type === 'attestation_travail' && (
          <div className="space-y-5 text-xs text-slate-800 leading-relaxed py-4">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-[#0F4C81]">
              ATTESTATION DE TRAVAIL & D'EMPLOI
            </h3>
            <p className="text-justify indent-8">
              Nous soussignés, <strong>RHEMA BUSINESS SARL</strong>, société de télécommunications et services VSAT, immatriculée au RCCM de Kinshasa sous le numéro <strong>RCCM/20-A-01120</strong>, certifions par la présente que :
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 my-3">
              <p>Nom & Prénom : <strong className="text-slate-900">{data.employeeName}</strong></p>
              <p>Matricule Interne : <strong className="text-slate-900">{data.matricule}</strong></p>
              <p>Numéro d'affiliation CNSS : <strong>{data.cnssNumber || 'CNSS-CD-9982410'}</strong></p>
              <p>Fonction occupée : <strong className="text-slate-900">{data.categoryPro}</strong> ({data.echelon})</p>
              <p>Période d'activité : Du <strong>{data.startDate}</strong> à ce jour (Personnel en fonction actif)</p>
            </div>
            <p className="text-justify indent-8">
              L'intéressé(e) est libre de tout engagement envers notre entreprise et la présente attestation lui est délivrée pour servir et valoir ce que de droit auprès des autorités, organismes bancaires et tiers.
            </p>
            <div className="pt-8 flex justify-end">
              <div className="text-center w-64">
                <p>Fait à Kinshasa, le {date}</p>
                <p className="font-bold text-slate-900 mt-2">La Direction des Ressources Humaines</p>
                <div className="h-16 flex items-center justify-center text-slate-400 italic">
                  [Cachet RHEMA BUSINESS & Visa RH]
                </div>
                <p className="font-bold text-[#0F4C81]">Junior MONYA (DG)</p>
              </div>
            </div>
          </div>
        )}

        {type === 'titre_conge' && (
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed py-3">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-[#0F4C81]">
              TITRE OFFICIEL DE CONGÉ PAYÉ & AUTORISATION D'ABSENCE
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500">Collaborateur :</p>
                <p className="text-sm font-bold text-slate-900">{data.userName}</p>
                <p className="text-slate-600">Matricule : {data.matricule || 'MAT-RH'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Motif de congé :</p>
                <p className="text-sm font-bold text-slate-900 capitalize">{data.type?.replace('_', ' ')}</p>
                <p className="text-slate-600">Exercice : 2026</p>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200 divide-y divide-slate-200">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-semibold bg-slate-50">Date de départ en congé</td>
                  <td className="p-2.5 font-bold text-slate-900">{data.startDate}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold bg-slate-50">Date de reprise effective du service</td>
                  <td className="p-2.5 font-bold text-slate-900">{data.endDate}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold bg-slate-50">Nombre total de jours ouvrables décomptés</td>
                  <td className="p-2.5 font-bold text-emerald-700">{data.durationDays} jour(s)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold bg-slate-50">Solde de congés restants pour l'année</td>
                  <td className="p-2.5 font-bold text-indigo-700">{Math.max(0, 24 - (data.durationDays || 0))} jour(s) sur 24j légaux</td>
                </tr>
              </tbody>
            </table>

            <div className="pt-6 grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="font-bold text-slate-900">Émargement du Bénéficiaire</p>
                <div className="mt-12 text-slate-600 font-semibold">{data.userName}</div>
              </div>
              <div>
                <p className="font-bold text-slate-900">Visa de la Direction Générale</p>
                <div className="mt-12 font-bold text-[#0F4C81]">Approuvé • Junior MONYA (DG)</div>
              </div>
            </div>
          </div>
        )}

        {type === 'lettre_sanction' && (
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed py-2">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-red-600">
              NOTIFICATION DISCIPLINAIRE OFFICIELLE
            </h3>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p>Type de notification : <strong className="text-red-700 uppercase">{data.type?.replace('_', ' ')}</strong></p>
              <p>Destinataire : <strong>{data.userName}</strong> (Matricule : {data.matricule})</p>
              <p>Date d'émission : {date}</p>
            </div>
            <p className="text-justify indent-8">
              Par la présente, la Direction des Ressources Humaines de RHEMA BUSINESS porte à votre connaissance la notification suivante suite aux faits constatés en date du <strong>{data.incidentDate || date}</strong>.
            </p>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Motifs et faits reprochés :</p>
              <p className="italic text-slate-700">{data.reason}</p>
            </div>
            {data.sanctionDurationDays && (
              <p className="font-bold text-red-700">
                Mesure appliquée : Mise à pied de {data.sanctionDurationDays} jour(s) ouvrables sans traitement salarial, conformément au règlement intérieur.
              </p>
            )}
            <p>
              Vous êtes invité(e) à prendre toutes les dispositions utiles afin de vous conformer rigoureusement aux obligations professionnelles et éthiques de RHEMA BUSINESS SARL.
            </p>
            <div className="pt-6 flex justify-between items-end">
              <div>
                <p className="font-bold text-slate-900">Pour notification et accusé de réception :</p>
                <div className="mt-10 font-semibold">{data.userName}</div>
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">La Direction Générale</p>
                <div className="mt-10 font-bold text-[#0F4C81]">Junior MONYA (DG)</div>
              </div>
            </div>
          </div>
        )}

        {type === 'solde_tout_compte' && (
          <div className="space-y-4 text-xs text-slate-800 leading-relaxed py-2">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-[#0F4C81]">
              REÇU POUR SOLDE DE TOUT COMPTE (STC)
            </h3>
            <p className="text-justify indent-8">
              Je soussigné(e), <strong>{data.employeeName}</strong>, matricule <strong>{data.matricule}</strong>, reconnais avoir reçu de la Société RHEMA BUSINESS SARL la somme totale de :
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <span className="text-2xl font-bold font-mono text-emerald-800">
                {data.totalAmount?.toLocaleString()} {data.currency === 'USD' ? '$ USD' : 'CDF'}
              </span>
              <p className="text-[11px] text-emerald-600 mt-1">Arrêté pour décompte final et solde libératoire</p>
            </div>

            <table className="w-full text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 text-left">Éléments du Décompte Final</th>
                  <th className="p-2 text-right">Montant ({data.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2">Dernier salaire au prorata des jours travaillés</td>
                  <td className="p-2 text-right font-mono font-bold">{data.prorataSalary?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2">Indemnité compensatrice de congés payés non pris ({data.leaveDaysLeft || 12} jours)</td>
                  <td className="p-2 text-right font-mono font-bold">{data.leaveCompensation?.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="p-2">Indemnité légale de fin de contrat ou préavis</td>
                  <td className="p-2 text-right font-mono font-bold">{data.severancePay?.toLocaleString()}</td>
                </tr>
                {data.advanceDeduction > 0 && (
                  <tr className="text-red-600">
                    <td className="p-2">Déduction avance sur salaire non remboursée</td>
                    <td className="p-2 text-right font-mono font-bold">- {data.advanceDeduction?.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pt-6 grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="font-bold text-slate-900">Le Collaborateur sortant</p>
                <div className="mt-10 font-semibold">{data.employeeName}</div>
              </div>
              <div>
                <p className="font-bold text-slate-900">Pour RHEMA BUSINESS SARL</p>
                <div className="mt-10 font-bold text-[#0F4C81]">Junior MONYA (DG)</div>
              </div>
            </div>
          </div>
        )}

        {/* Pied de page officiel */}
        <RhemaDocumentFooter />
      </div>
    </div>
  );
};
