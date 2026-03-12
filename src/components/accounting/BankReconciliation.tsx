import React, { useState, useRef } from 'react';
import { useAccountingStore } from '@/store/accounting-store';
import { useKanbanStore } from '@/store/kanban-store';
import { Check, Columns, RefreshCw, UploadCloud, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const BankReconciliation = () => {
    const { entries, bankTransactions, addBankTransaction, reconcileTransaction } = useAccountingStore();
    const { mainCompanies } = useKanbanStore();
    const activeCompany = mainCompanies.find((c) => c.isDefault) || mainCompanies[0];

    const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const companyEntries = entries.filter(e => e.companyId === activeCompany?.id && e.status === 'pending');
    const pendingTransactions = bankTransactions.filter(t => t.companyId === activeCompany?.id && t.status === 'pending');

    const handleReconcile = () => {
        if (!selectedEntry || !selectedTransaction) return;
        reconcileTransaction(selectedTransaction, selectedEntry);
        toast.success("Lançamento conciliado com sucesso!");
        setSelectedEntry(null);
        setSelectedTransaction(null);
    };

    const handleAutoReconcile = () => {
        let count = 0;
        pendingTransactions.forEach(tx => {
            const matchingEntry = companyEntries.find(e =>
                e.status === 'pending' &&
                e.amount === tx.amount &&
                (
                    (tx.type === 'credit' && e.type === 'revenue') ||
                    (tx.type === 'debit' && e.type === 'expense')
                )
            );
            if (matchingEntry) {
                reconcileTransaction(tx.id, matchingEntry.id);
                count++;
            }
        });
        if (count > 0) {
            toast.success(`${count} lançamentos conciliados automaticamente!`);
        } else {
            toast.info("Nenhuma correspondência exata encontrada para conciliação automática.");
        }
        setSelectedEntry(null);
        setSelectedTransaction(null);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeCompany) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            
            try {
                let parsedTransactions = 0;

                if (file.name.toLowerCase().endsWith('.ofx')) {
                    parsedTransactions = parseOFX(content, activeCompany.id);
                } else if (file.name.toLowerCase().endsWith('.csv')) {
                    parsedTransactions = parseCSV(content, activeCompany.id);
                } else {
                    toast.error("Formato não suportado. Use .ofx ou .csv.");
                    return;
                }

                if (parsedTransactions > 0) {
                    toast.success(`${parsedTransactions} transações importadas com sucesso!`);
                } else {
                    toast.warning("Nenhuma transação válida foi encontrada no arquivo.");
                }

            } catch (err) {
                console.error("Erro ao fazer parse do arquivo:", err);
                toast.error("Ocorreu um erro ao ler o arquivo. Verifique se ele não está corrompido.");
            }
            
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };

        reader.readAsText(file);
    };

    const parseOFX = (content: string, companyId: string) => {
        let count = 0;
        // Basic OFX parsing identifying STMTTRN blocks
        const blocks = content.split('<STMTTRN>');
        
        // Skip the first split as it contains headers
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i].split('</STMTTRN>')[0];
            
            // Extract fields using Regex
            const amountMatch = block.match(/<TRNAMT>([^<\r\n]+)/);
            const dateMatch = block.match(/<DTPOSTED>(\d{8})/);
            const memoMatch = block.match(/<MEMO>([^<\r\n]+)/);
            
            if (amountMatch && dateMatch) {
                const amountText = amountMatch[1].trim();
                const amount = parseFloat(amountText.replace(/,/g, ''));
                
                const dateStr = dateMatch[1];
                const date = new Date(`${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}T12:00:00Z`);
                
                let description = "Transação Bancária";
                if (memoMatch) {
                    description = memoMatch[1].trim();
                }

                addBankTransaction({
                    companyId: companyId,
                    date: date.toISOString(),
                    description: description,
                    amount: Math.abs(amount),
                    type: amount >= 0 ? 'credit' : 'debit',
                    status: 'pending'
                });
                count++;
            }
        }
        return count;
    };

    const parseCSV = (content: string, companyId: string) => {
        let count = 0;
        const lines = content.split('\n');
        
        // Assuming a generic pattern: Date, Description, Amount
        // This is a naive heuristic parser for common bank CSVs.
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle comma or semicolon parsing with quotes
            const columns = line.split(/;|,/).map(col => col.replace(/^"|"$/g, '').trim());
            
            // Very loose heuristic for columns: find one date-like, one number-like, one text-like
            let dateStr = "";
            let description = "";
            let amount = 0;
            let amountFound = false;

            for (const col of columns) {
                // Determine if it's a date (DD/MM/YYYY)
                if (/\d{2}\/\d{2}\/\d{4}/.test(col)) {
                    dateStr = col;
                } 
                // Determine if it's an amount
                else if (/^-?[\d.,]+$/.test(col) && !amountFound && col.length > 0) {
                    const parsed = parseFloat(col.replace(/\./g, '').replace(',', '.'));
                    if (!isNaN(parsed)) {
                        amount = parsed;
                        amountFound = true;
                    }
                }
                // Determine if it's text
                else if (/[A-Za-z]/.test(col) && col.length > 3) {
                    description = description ? `${description} ${col}` : col;
                }
            }

            if (dateStr && amountFound) {
                const [day, month, year] = dateStr.split('/');
                const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
                
                if (!description) description = amount >= 0 ? 'Crédito' : 'Débito';

                addBankTransaction({
                    companyId: companyId,
                    date: date.toISOString(),
                    description: description.substring(0, 100),
                    amount: Math.abs(amount),
                    type: amount >= 0 ? 'credit' : 'debit',
                    status: 'pending'
                });
                count++;
            }
        }
        return count;
    };

    return (
        <div className="kanban-card rounded-xl border border-border shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold flex items-center gap-2">
                    <Columns className="h-4 w-4 text-primary" />
                    Conciliação Bancária
                </h3>
                <div className="flex items-center gap-2">
                    {/* Hidden file input for OFX / CSV */}
                    <input 
                        type="file" 
                        accept=".ofx,.csv"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-medium border bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    >
                        <UploadCloud className="h-3.5 w-3.5" />
                        Importar Arquivo (.ofx, .csv)
                    </button>
                    
                    <button
                        onClick={handleAutoReconcile}
                        className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded flex items-center gap-1 transition-colors font-medium ml-2"
                        title="Conciliar automaticamente valores idênticos"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Conciliação Automática
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 divide-x divide-border relative">
                {/* Extrato Bancário */}
                <div className="p-4 flex flex-col h-full">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Extrato Bancário (Aberto)</h4>
                    <div className="flex-1 space-y-2 overflow-auto custom-scrollbar">
                        {pendingTransactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <FileText className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-xs italic">Nenhuma transação bancária pendente.</p>
                                <p className="text-[10px] mt-1">Importe um arquivo de extrato para começar.</p>
                            </div>
                        ) : (
                            pendingTransactions.map(tx => (
                                <div
                                    key={tx.id}
                                    onClick={() => setSelectedTransaction(selectedTransaction === tx.id ? null : tx.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTransaction === tx.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border/50 bg-muted/20 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-semibold">{tx.description}</p>
                                        <span className={`text-xs font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Lançamentos do Sistema */}
                <div className="p-4 flex flex-col h-full">
                    <h4 className="text-sm font-medium text-muted-foreground mb-4">Lançamentos no ERP (Pendentes)</h4>
                    <div className="flex-1 space-y-2 overflow-auto custom-scrollbar">
                        {companyEntries.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic text-center py-8">Nenhum lançamento pendente no sistema.</p>
                        ) : (
                            companyEntries.map(entry => (
                                <div
                                    key={entry.id}
                                    onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEntry === entry.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border/50 bg-muted/20 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="truncate pr-2">
                                            <p className="text-xs font-semibold truncate">{entry.title}</p>
                                            <p className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs font-bold shrink-0 ${entry.type === 'revenue' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Ação de Conciliar */}
            <div className="p-4 border-t border-border bg-muted/10 flex justify-between items-center z-20">
                <p className="text-xs text-muted-foreground">
                    Selecione uma transação do banco e um lançamento do ERP para conciliar.
                </p>
                <button
                    disabled={!selectedEntry || !selectedTransaction}
                    onClick={handleReconcile}
                    className="bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors hover:bg-primary/90"
                >
                    <Check className="h-4 w-4" />
                    Conciliar Selecionados
                </button>
            </div>
        </div>
    );
};
