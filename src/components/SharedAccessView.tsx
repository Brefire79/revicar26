import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Wrench, 
  Eye, 
  Mail, 
  Trash2, 
  Check, 
  X, 
  KeyRound,
  UserCheck
} from 'lucide-react';
import { SharedUser, Vehicle } from '../types';

interface SharedAccessViewProps {
  vehicle: Vehicle;
  sharedUsers: SharedUser[];
  onAddUser: (user: SharedUser) => void;
  onRemoveUser: (id: string) => void;
}

export const SharedAccessView: React.FC<SharedAccessViewProps> = ({
  vehicle,
  sharedUsers,
  onAddUser,
  onRemoveUser,
}) => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'owner' | 'co_owner' | 'mechanic' | 'buyer'>('co_owner');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: SharedUser = {
      id: `user-${Date.now()}`,
      vehicleId: vehicle.id,
      name,
      email,
      role,
      invitedAt: new Date().toISOString().slice(0, 10),
      status: 'Ativo',
    };

    onAddUser(newUser);
    setIsInviteOpen(false);
    setName('');
    setEmail('');
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'owner':
        return { label: 'Proprietário Principal', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'co_owner':
        return { label: 'Co-Proprietário / Família', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' };
      case 'mechanic':
        return { label: 'Mecânico de Confiança', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'buyer':
        return { label: 'Comprador (Somente Leitura)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: r, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Gestão Compartilhada do Veículo
          </h2>
          <p className="text-xs text-slate-400">
            Compartilhe o acesso ao aplicativo com familiares, motoristas ou mecânicos de confiança com papéis e permissões flexíveis.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Familiar ou Mecânico</span>
        </button>
      </div>

      {/* Permissions Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <KeyRound className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Co-Proprietário / Família</h4>
          </div>
          <p className="text-xs text-slate-400">
            Pode atualizar o hodômetro, adicionar abastecimentos e registrar manutenções preventivas.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-amber-400">
            <Wrench className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Mecânico de Confiança</h4>
          </div>
          <p className="text-xs text-slate-400">
            Anexa peças com código SKU/Part Number, registra garanta das ordens de serviço e fotos de notas fiscais.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Eye className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Potencial Comprador</h4>
          </div>
          <p className="text-xs text-slate-400">
            Acessa exclusivamente o Passaporte de Revenda em modo leitura, sem permissão de edição.
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-blue-400" />
          Pessoas com Acesso Ativo ao Veículo ({sharedUsers.length})
        </h3>

        <div className="space-y-3">
          {sharedUsers.map((u) => {
            const roleInfo = getRoleLabel(u.role);
            return (
              <div
                key={u.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm">{u.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {u.email} • Adicionado em {new Date(u.invitedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {u.role !== 'owner' && (
                  <button
                    onClick={() => onRemoveUser(u.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center space-x-1 self-start sm:self-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                Convidar para Gerenciar
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mecânico H-Tech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Função / Nível de Acesso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                >
                  <option value="co_owner">Co-Proprietário / Família (Leitura & Edição)</option>
                  <option value="mechanic">Mecânico de Confiança (Reg. Peças e Serviços)</option>
                  <option value="buyer">Comprador (Visualizador de Passaporte)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Enviar Convite</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
