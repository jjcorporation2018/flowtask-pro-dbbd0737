import { useState } from 'react';
import { Search, Building2, Truck, Briefcase, MapPin, Phone, Mail, Loader2, Check } from 'lucide-react';
import { useKanbanStore } from '@/store/kanban-store';
import { toast } from 'sonner';

interface CnpjResult {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    descricao_situacao_cadastral: string;
    data_inicio_atividade: string;
    cnae_fiscal_descricao: string;
    cep: string;
    uf: string;
    municipio: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
    ddd_telefone_1: string;
    ddd_telefone_2: string;
    email: string;
}

const SuppliersPage = () => {
    const [cnpj, setCnpj] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CnpjResult | null>(null);

    const { folders, boards, lists, addFolder, addBoard, addList, addCard, updateCard } = useKanbanStore();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCnpj = cnpj.replace(/\D/g, '');

        if (cleanCnpj.length !== 14) {
            toast.error('CNPJ inválido. Digite 14 números.');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
            if (!response.ok) throw new Error('Falha ao buscar CNPJ');
            const data = await response.json();
            setResult(data);
            toast.success('Empresa encontrada!');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error('Erro ao consultar CNPJ. Verifique se o número está correto.');
        } finally {
            setLoading(false);
        }
    };

    const ensureStructureAndSave = (type: 'Fornecedor' | 'Transportadora') => {
        if (!result) return;

        // 1. Ensure Folder exists
        let folderId = folders.find(f => f.name === 'Gestão Empresarial')?.id;
        if (!folderId) {
            addFolder('Gestão Empresarial', '#059669', undefined);
            // Let zustand process
            const currentFolders = useKanbanStore.getState().folders;
            folderId = currentFolders[currentFolders.length - 1].id;
        }

        // 2. Ensure Board exists
        let boardId = boards.find(b => b.folderId === folderId && b.name === 'Diretório de Empresas')?.id;
        if (!boardId) {
            addBoard(folderId, 'Diretório de Empresas', '#059669');
            const currentBoards = useKanbanStore.getState().boards;
            boardId = currentBoards[currentBoards.length - 1].id;
        }

        // 3. Ensure List exists
        let listId = lists.find(l => l.boardId === boardId && l.title === `${type}es`)?.id;
        if (!listId) {
            addList(boardId, `${type}es`);
            const currentLists = useKanbanStore.getState().lists;
            listId = currentLists[currentLists.length - 1].id;
        }

        // 4. Create Card
        const title = result.nome_fantasia || result.razao_social;
        const description = `
**Razão Social:** ${result.razao_social}
**CNPJ:** ${result.cnpj}
**Status:** ${result.descricao_situacao_cadastral}
**Atividade:** ${result.cnae_fiscal_descricao}

---

**Endereço:** ${result.logradouro}, ${result.numero} ${result.complemento ? `- ${result.complemento}` : ''}
${result.bairro} - ${result.municipio}/${result.uf}
**CEP:** ${result.cep}

---

**Contato:**
📞 ${result.ddd_telefone_1} ${result.ddd_telefone_2 ? ` / ${result.ddd_telefone_2}` : ''}
✉️ ${result.email || 'Não informado'}
    `.trim();

        addCard(listId, title);

        // Update card with description
        const store = useKanbanStore.getState();
        const newCardList = store.cards.filter(c => c.listId === listId);
        if (newCardList.length > 0) {
            const newCard = newCardList[newCardList.length - 1]; // latest created
            updateCard(newCard.id, { description });
        }

        toast.success(`Salvo como ${type} na lista '${type}es'!`);
        setCnpj('');
        setResult(null);
    };

    // Format CNPJ as user types
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);

        // Apply mask 00.000.000/0000-00
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
        }

        setCnpj(value);
    };

    return (
        <div className="flex-1 overflow-auto bg-background p-6 custom-scrollbar relative h-full">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header section */}
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Fornecedores e Transportadoras</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Consulte e adicione novas empresas ao diretório automaticamente a partir do CNPJ.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Search Column */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Search className="h-4 w-4 text-primary" />
                                    Buscar por CNPJ
                                </h2>
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Número do CNPJ</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={cnpj}
                                                onChange={handleCnpjChange}
                                                placeholder="00.000.000/0000-00"
                                                className="w-full pl-3 pr-10 py-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                                            />
                                            {cnpj.length === 18 && (
                                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || cnpj.length < 18}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        Consultar Receita
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Quick tips */}
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-sm text-accent-foreground text-center">
                            <p className="font-medium mb-1">Dica de uso</p>
                            <p className="text-xs opacity-90">
                                Os dados serão importados da Receita Federal. Após consultar, escolha se a empresa atuará como fornecedor ou transportadora no seu fluxo.
                            </p>
                        </div>
                    </div>

                    {/* Result Column */}
                    <div className="md:col-span-2">
                        {!result ? (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-8 text-center">
                                <Building2 className="h-16 w-16 mb-4 opacity-20" />
                                <p className="font-medium text-lg">Nenhuma empresa consultada</p>
                                <p className="text-sm mt-1 max-w-sm">
                                    Digite o CNPJ no painel lateral e faça a busca para visualizar os dados completos da empresa.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Result Header */}
                                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                                                {result.nome_fantasia || result.razao_social}
                                            </h2>
                                            <p className="text-sm font-medium text-muted-foreground mt-1">{result.razao_social}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${result.descricao_situacao_cadastral === 'ATIVA' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                                            {result.descricao_situacao_cadastral}
                                        </span>
                                    </div>
                                </div>

                                {/* Data Grid */}
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1"><Briefcase className="h-3 w-3" /> CNPJ</p>
                                        <p className="text-sm font-medium text-foreground">{result.cnpj}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Atividade Principal</p>
                                        <p className="text-sm font-medium text-foreground">{result.cnae_fiscal_descricao}</p>
                                    </div>

                                    <div className="space-y-1 sm:col-span-2 bg-muted/30 p-3 rounded-lg border border-border/50 text-sm">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço</p>
                                        <p className="text-foreground">{result.logradouro}, {result.numero} {result.complemento ? `- ${result.complemento}` : ''}</p>
                                        <p className="text-muted-foreground">{result.bairro} - {result.municipio} / {result.uf}</p>
                                        <p className="text-muted-foreground mt-1 font-medium">CEP: {result.cep}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="h-3 w-3" /> Contato</p>
                                        <p className="text-sm font-medium text-foreground">{result.ddd_telefone_1}</p>
                                        {result.ddd_telefone_2 && <p className="text-sm font-medium text-foreground">{result.ddd_telefone_2}</p>}
                                        {!result.ddd_telefone_1 && !result.ddd_telefone_2 && <span className="text-xs text-muted-foreground italic">Não informado</span>}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1"><Mail className="h-3 w-3" /> E-mail</p>
                                        <p className="text-sm font-medium text-foreground break-all">{result.email || <span className="text-xs text-muted-foreground italic">Não informado</span>}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-6 bg-muted/20 border-t border-border flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => ensureStructureAndSave('Fornecedor')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <Briefcase className="h-4 w-4" />
                                        Salvar como Fornecedor
                                    </button>
                                    <button
                                        onClick={() => ensureStructureAndSave('Transportadora')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                                    >
                                        <Truck className="h-4 w-4" />
                                        Salvar como Transportadora
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuppliersPage;
