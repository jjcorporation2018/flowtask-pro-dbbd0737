import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ActionType = 'CRIAR' | 'EDITAR' | 'EXCLUIR' | 'MOVER' | 'STATUS' | 'LOGIN' | 'SISTEMA';
export type EntityType = 'CARTÃO' | 'ORÇAMENTO' | 'LANÇAMENTO' | 'DOCUMENTO' | 'EMPRESA' | 'USUÁRIO' | 'QUADRO/LISTA';

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: ActionType;
    entity: EntityType;
    details: string;
    timestamp: string;
}

interface AuditState {
    logs: AuditLog[];
    addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
    clearOldLogs: (daysToKeep?: number) => void;
}

export const useAuditStore = create<AuditState>()(
    persist(
        (set, get) => ({
            logs: [],

            addLog: (log) => {
                set((state) => {
                    const newLog: AuditLog = {
                        ...log,
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString()
                    };

                    // Keep maximum of 5000 logs to prevent LocalStorage bloat
                    const updatedLogs = [newLog, ...state.logs].slice(0, 5000);

                    return { logs: updatedLogs };
                });
            },

            clearOldLogs: (daysToKeep = 90) => {
                const now = new Date();
                const cutoff = new Date(now.getTime() - (daysToKeep * 24 * 60 * 60 * 1000));

                set((state) => ({
                    logs: state.logs.filter(log => new Date(log.timestamp) >= cutoff)
                }));
            }
        }),
        {
            name: 'kunbun-audit-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
