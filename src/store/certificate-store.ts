import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { socketService } from '@/lib/socket';

export interface CertificateAttachment {
    id: string;
    fileSlot: 'Atestado' | 'NF' | 'Contrato' | 'Nota de Empenho' | 'Relatório de execução';
    fileName: string;
    fileSize: number;
    fileData: string; // Base64
}

export interface CapacityCertificate {
    id: string;
    type: ('Produto' | 'Serviço')[];
    suppliedItems: string;
    suppliedQuantity?: string;
    kunbunCardId?: string; // Reference to a card if applicable
    issuingAgency: string;
    executionDate: string;
    description: string;
    attachments: CertificateAttachment[];
    createdAt: string;
    updatedAt: string;
    trashed?: boolean;
    trashedAt?: string;
}

interface CertificateStore {
    certificates: CapacityCertificate[];
    addCertificate: (cert: Omit<CapacityCertificate, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateCertificate: (id: string, cert: Partial<CapacityCertificate>) => void;
    trashCertificate: (id: string) => void;
    restoreCertificate: (id: string) => void;
    permanentlyDeleteCertificate: (id: string) => void;
    cleanOldTrash: () => void;
    processSystemAction: (action: any) => void;
}

export const useCertificateStore = create<CertificateStore>()(
    persist(
        (set) => ({
            certificates: [],
            addCertificate: (cert) => {
                const id = crypto.randomUUID();
                const now = new Date().toISOString();
                const newCert = { ...cert, id, createdAt: now, updatedAt: now };
                set((state) => ({
                    certificates: [...state.certificates, newCert],
                }));
                socketService.emit('system_action', { store: 'CERTIFICATES', type: 'ADD_CERT', payload: newCert });
            },

            updateCertificate: (id, updatedFields) => {
                const now = new Date().toISOString();
                set((state) => ({
                    certificates: state.certificates.map((cert) =>
                        cert.id === id ? { ...cert, ...updatedFields, updatedAt: now } : cert
                    ),
                }));
                socketService.emit('system_action', { store: 'CERTIFICATES', type: 'UPDATE_CERT', payload: { id, data: updatedFields } });
            },

            trashCertificate: (id) => {
                const now = new Date().toISOString();
                set((state) => ({
                    certificates: state.certificates.map((cert) =>
                        cert.id === id ? { ...cert, trashed: true, trashedAt: now, updatedAt: now } : cert
                    ),
                }));
                socketService.emit('system_action', { store: 'CERTIFICATES', type: 'TRASH_CERT', payload: { id } });
            },

            restoreCertificate: (id) => {
                const now = new Date().toISOString();
                set((state) => ({
                    certificates: state.certificates.map((cert) =>
                        cert.id === id ? { ...cert, trashed: false, updatedAt: now } : cert
                    ),
                }));
                socketService.emit('system_action', { store: 'CERTIFICATES', type: 'RESTORE_CERT', payload: { id } });
            },

            permanentlyDeleteCertificate: (id) => {
                set((state) => ({
                    certificates: state.certificates.filter((cert) => cert.id !== id),
                }));
                socketService.emit('system_action', { store: 'CERTIFICATES', type: 'DELETE_CERT', payload: { id } });
            },

            cleanOldTrash: () => set(state => {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                return {
                    certificates: state.certificates.filter(cert => !cert.trashedAt || new Date(cert.trashedAt) >= thirtyDaysAgo)
                };
            }),

            processSystemAction: (action: any) => {
                const { type, payload } = action;
                if (type === 'ADD_CERT') {
                    set(s => ({ certificates: [...s.certificates, payload] }));
                } else if (type === 'UPDATE_CERT') {
                    set(s => ({
                        certificates: s.certificates.map(c => c.id === payload.id ? { ...c, ...payload.data, updatedAt: new Date().toISOString() } : c)
                    }));
                } else if (type === 'TRASH_CERT') {
                    set(s => ({
                        certificates: s.certificates.map(c => c.id === payload.id ? { ...c, trashed: true, trashedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : c)
                    }));
                } else if (type === 'RESTORE_CERT') {
                    set(s => ({
                        certificates: s.certificates.map(c => c.id === payload.id ? { ...c, trashed: false, updatedAt: new Date().toISOString() } : c)
                    }));
                } else if (type === 'DELETE_CERT') {
                    set(s => ({ certificates: s.certificates.filter(c => c.id !== payload.id) }));
                }
            }
        }),
        {
            name: 'polaryon-certificates-storage',
            version: 1,
        }
    )
);

// Subscribe to global system events
socketService.on('system_sync', (action: any) => {
    if (action.store === 'CERTIFICATES') {
        useCertificateStore.getState().processSystemAction(action);
    }
});

