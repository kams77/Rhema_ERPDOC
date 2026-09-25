import React, { useState } from 'react';
import { SecurityAlert, User, HierarchicalEntity } from '../types';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  FileText, 
  Users, 
  Building2, 
  Send, 
  CheckCircle2, 
  Fingerprint, 
  Clock, 
  AlertOctagon, 
  Gavel,
  ShieldCheck
} from 'lucide-react';

interface SecurityViewProps {
  alerts: SecurityAlert[];
  users: User[];
  entities: HierarchicalEntity[];
  currentUser: User;
  onSimulateIntrusion: (agentId: string, targetEntityId: string) => void;
  onUnlockAccount: (userId: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  alerts = [],
  users = [],
  entities = [],
  currentUser,
  onSimulateIntrusion,
  onUnlockAccount,
  onResolveAlert,
}) => {
  const userList = users || [];
  const entityList = entities || [];
  const alertList = alerts || [];

  const [selectedAgentId, setSelectedAgentId] = useState(
    userList.find(u => u.role === 'agent')?.id || userList[0]?.id || ''
  );
  const [selectedTargetEntityId, setSelectedTargetEntityId] = useState(
    entityList.find(e => e.id === 'srv-paie')?.id || entityList[0]?.id || ''
  );
  const [viewingConvocation, setViewingConvocation] = useState<SecurityAlert | null>(null);

  const activeAlerts = alertList.filter(a => a && a.status !== 'resolue');
  const lockedUsers = userList.filter(u => u && (u.status === 'verrouille' || u.status === 'convoque'));

  const handleTriggerTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !selectedTargetEntityId) return;
    onSimulateIntrusion(selectedAgentId, selectedTargetEntityId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300 uppercase tracking-wider">
              Sentinelle Anti-Intrusion & Conformité
            </span>
            <span className="text-xs text-slate-400">Cloisonnement Hiérarchique Strict</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Surveillance des Accès & Procédure Disciplinaire
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Toute tentative d'intrusion d'un agent hors de son périmètre hiérarchique alerte immédiatement le DG et le chef d'entité. En cas de récidive, le compte est verrouillé et une convocation officielle devant la commission de sécurité est dressée.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>{activeAlerts.length} Alerte(s) en cours</span>
          </div>
        </div>
      </div>

      {/* Simulator Card (Enables testing the exact constraint requested in prompt) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950/30 border border-red-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">
              Simulateur d’Intrusion & Vérification des Alertes
            </h2>
            <p className="text-xs text-slate-400">
              Sélectionnez un agent et une entité cible hors de son affectation pour tester le déclenchement d’alerte et le verrouillage automatique.
            </p>
          </div>
        </div>

        <form onSubmit={handleTriggerTest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              1. Agent ou Collaborateur
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.roleTitle}) - Tentatives : {u.failedAccessAttempts}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              2. Entité Cible (Hors Périmètre)
            </label>
            <select
              value={selectedTargetEntityId}
              onChange={(e) => setSelectedTargetEntityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {entities.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.level}) - Resp: {e.managerName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              id="btn-trigger-intrusion-sim"
              className="w-full py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Forcer Tentative d’Accès
            </button>
          </div>
        </form>
      </div>

      {/* Locked Accounts & Summons Section */}
      {lockedUsers.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Gavel className="w-4 h-4 text-amber-400" />
              <span>Comptes Verrouillés & Convocations Disciplinaires en Instance ({lockedUsers.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lockedUsers.map((lockedUser) => {
              const userAlert = alerts.find(a => a.userId === lockedUser.id && a.convocationNotice);

              return (
                <div
                  key={lockedUser.id}
                  className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{lockedUser.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] bg-red-600 text-white rounded font-mono uppercase">
                          {lockedUser.status}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400">
                        {lockedUser.failedAccessAttempts} tentatives
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1">
                      Fonction : <span className="text-slate-200">{lockedUser.roleTitle}</span>
                    </div>

                    {userAlert?.convocationNotice && (
                      <div className="mt-2.5 p-2 bg-black/40 rounded-lg text-xs space-y-1 border border-slate-800">
                        <div className="text-amber-300 font-semibold flex items-center gap-1.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          Audition : {userAlert.convocationNotice.summonDate}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Lieu : {userAlert.convocationNotice.location}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    {userAlert && (
                      <button
                        id={`btn-view-summon-${lockedUser.id}`}
                        onClick={() => setViewingConvocation(userAlert)}
                        className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Voir la Convocation Officielle
                      </button>
                    )}

                    {currentUser.role === 'dg' ? (
                      <button
                        id={`btn-unlock-${lockedUser.id}`}
                        onClick={() => onUnlockAccount(lockedUser.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Réhabiliter (Pouvoir DG)
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500">Déverrouillage réservé au DG</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Alerts Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Historique & Journal des Alertes de Sécurité
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {alerts.length} événements enregistrés
          </span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all ${
                alert.status === 'convocation_programmee'
                  ? 'bg-red-950/20 border-red-500/50'
                  : alert.status === 'compte_verrouille'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    alert.severity === 'critique' 
                      ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {alert.userName} ({alert.userRole.replace('_', ' ')})
                  </span>
                  <span className="text-xs text-slate-400">tentative vers :</span>
                  <span className="text-xs font-semibold text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30">
                    {alert.targetEntityName}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  {alert.timestamp} • IP: {alert.ipAddress}
                </div>
              </div>

              {/* Alert Details & Dispatched Notifications */}
              <div className="mt-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <p className="leading-relaxed">
                  <strong className="text-red-400">Motif :</strong> {alert.reason}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Notification transmise au DG :</span>
                    <span className="text-white font-medium">✓ {alert.notifiedDgName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Notification transmise au Responsable d'Entité :</span>
                    <span className="text-white font-medium">✓ {alert.notifiedManagerName}</span>
                  </div>
                </div>
              </div>

              {/* Alert actions */}
              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {alert.convocationNotice && (
                    <button
                      onClick={() => setViewingConvocation(alert)}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      Convocation Disciplinaire
                    </button>
                  )}
                </div>

                {alert.status !== 'resolue' && currentUser.role === 'dg' && (
                  <button
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                  >
                    Marquer résolue
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Convocation Modal */}
      {viewingConvocation && viewingConvocation.convocationNotice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Convocation Disciplinaire & Sécurité du SI
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Document officiel d’instruction - Décret de sécurité d’entreprise
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingConvocation(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-3 font-sans">
              <div className="text-right text-[10px] text-slate-400 font-mono">
                Réf : CONVOC-DISCIP-{viewingConvocation.id}
              </div>

              <p className="text-slate-300 leading-relaxed">
                Il est porté à la connaissance de l'agent <strong>{viewingConvocation.userName}</strong> ({viewingConvocation.userEntityName}) que son compte utilisateur a été <strong>mis sous séquestre et verrouillé</strong> suite à des tentatives répétées d'accès illégitime à l'entité :
              </p>

              <div className="p-3 bg-red-950/30 rounded-lg border border-red-800/40 text-red-200">
                <strong>Cible visée :</strong> {viewingConvocation.targetEntityName} <br />
                <strong>Constat d'incident :</strong> {viewingConvocation.reason}
              </div>

              <div className="space-y-1 pt-2">
                <div className="font-semibold text-white">Date & Heure de Comparution :</div>
                <div className="text-amber-400 font-mono font-bold text-sm">
                  {viewingConvocation.convocationNotice.summonDate}
                </div>
                <div className="text-slate-400">
                  Lieu : {viewingConvocation.convocationNotice.location}
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-white mb-1.5">Composition de la Commission d’Audition :</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  {viewingConvocation.convocationNotice.panelMembers.map((member, idx) => (
                    <li key={idx}>{member}</li>
                  ))}
                </ul>
              </div>

              <div className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800">
                Conformément à la politique d'entreprise, la non-présentation de l'agent sans justification médicale entraîne la révocation immédiate du contrat de travail.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setViewingConvocation(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
