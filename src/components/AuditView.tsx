import React from 'react';
import { AuditLog } from '../types';
import { History, Shield, Hash, Search, Download, Clock } from 'lucide-react';

interface AuditViewProps {
  logs: AuditLog[];
}

export const AuditView: React.FC<AuditViewProps> = ({ logs }) => {
  const [search, setSearch] = React.useState('');

  const filteredLogs = logs.filter(l => 
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.hash.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
              Traçabilité & Preuve Juridique
            </span>
            <span className="text-xs text-slate-400">Journal d'Audit Immuable SHA-256</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Audit Trail & Enregistrement des Opérations
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Historique infalsifiable de toutes les connexions, tentatives d'accès hors périmètre, publications de pièces, approbations et signatures électroniques.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/30 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Hash className="w-4 h-4" />
          <span>Intégrité Chaînée Active</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filtrer par auteur, action, hash SHA-256..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Horodatage & IP</th>
                <th className="p-3.5">Opérateur & Rôle</th>
                <th className="p-3.5">Action Exécutée</th>
                <th className="p-3.5">Détails de l'Événement</th>
                <th className="p-3.5">Empreinte SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {log.timestamp}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.ip}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-white">{log.userName}</div>
                    <div className="text-[10px] text-indigo-400">{log.userRole}</div>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${
                      log.category === 'security'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : log.category === 'document'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : log.category === 'task'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="p-3.5 max-w-xs sm:max-w-md">
                    <p className="text-xs text-slate-300 leading-relaxed">{log.details}</p>
                  </td>

                  <td className="p-3.5 whitespace-nowrap font-mono text-[10px] text-cyan-400/90">
                    <div className="bg-black/40 px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span>{log.hash.slice(0, 16)}...</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
