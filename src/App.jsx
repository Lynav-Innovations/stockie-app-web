import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthScreen from './AuthScreen'; // Importa a tela de autenticação
import { 
    LayoutGrid, ShoppingBag, Users, Package, 
    TrendingUp, TrendingDown, AlertTriangle, 
    Wallet, Search, X, Moon, Sun, Calendar, 
    ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Check,
    Tag, BarChart3, Clock, DollarSign, List, Calculator, Divide,
    Contact, Truck, Plus, Smile, LogOut, ShoppingCart // <<< NOVO ICONE ShoppingCart ADICIONADO
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

// FUNÇÃO DE MÁSCARA DE MOEDA GLOBAL
const formatCurrencyInput = (value) => {
    let digits = value.replace(/\D/g, ''); 
    if (!digits) return '';

    digits = digits.padStart(3, '0'); 

    const cents = digits.slice(-2);
    let reais = digits.slice(0, -2); 

    reais = reais.replace(/^0+/, ''); 
    if (!reais) reais = '0'; 
    reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, "."); 

    return `R$ ${reais},${cents}`;
};

// --- FUNÇÕES DE MÁSCARA DE ENTIDADES ---
const maskPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "").substring(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
};

const maskCPF = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "").substring(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return value;
};

const maskCNPJ = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "").substring(0, 14);
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    return value.substring(0, 18);
};
// --- FIM DAS FUNÇÕES DE MÁSCARA ---


// --- MOCK DATA (ATUALIZADA COM supplierId) ---
const products = [
    { id: 1, name: 'Mamão Papaya (Cx)', stock: 45, unit: 'cx (Caixa)', image: '🥭', buyPrice: 15, sellPrice: 23, supplierId: 101 },
    { id: 2, name: 'Banana Prata (Cx)', stock: 120, unit: 'kg (Kilo)', image: '🍌', buyPrice: 20, sellPrice: 35, supplierId: 102 },
    { id: 3, name: 'Morango (Bdja)', stock: 15, unit: 'un (Unidade)', image: '🍓', buyPrice: 8, sellPrice: 15, supplierId: 101 },
];
const clients = [
    { id: 1, name: 'Mercadinho da Esquina', contact: maskPhone('11987654321'), cpf: '12345678900', docType: 'CPF', email: 'mercado@exemplo.com' },
    { id: 2, name: 'Restaurante Sabor', contact: maskPhone('21912345678'), cpf: '00011122233', docType: 'CPF', email: 'sabor@exemplo.com' },
];
const suppliers = [
    { id: 101, name: 'Hortifruti Central', contact: maskPhone('31955554444'), doc: '99999999000100', docType: 'CNPJ', email: 'horti@exemplo.com' },
    { id: 102, name: 'Distribuidora do Zé', contact: maskPhone('41966663333'), doc: '11122233344', docType: 'CPF', email: 'ze@exemplo.com' },
];

// --- NOVOS HELPERS DE BUSCA ---
const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Não Definido';
};

const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Consumidor Final';
};


const generateMockTransactions = () => {
    const transactions = [];
    const daysInPast = 90;
    const baseProducts = [
        { id: 1, name: 'Mamão Papaya (Cx)', buyPrice: 15, sellPrice: 23, supplierId: 101 },
        { id: 2, name: 'Banana Prata (Cx)', buyPrice: 20, sellPrice: 35, supplierId: 102 },
        { id: 3, name: 'Morango (Bdja)', buyPrice: 8, sellPrice: 15, supplierId: 101 },
    ];
    
    // Arrays de IDs para atribuição randômica
    const clientIds = clients.map(c => c.id);
    const supplierIds = suppliers.map(s => s.id);

    for (let i = daysInPast; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const numTransactions = Math.floor(Math.random() * 4) + 2;

        for (let j = 0; j < numTransactions; j++) {
            const prod = baseProducts[Math.floor(Math.random() * baseProducts.length)];
            const type = ['venda', 'compra', 'perda'][Math.floor(Math.random() * 3)];
            const qtd = Math.floor(Math.random() * 30) + 1;

            let total;
            let clientId = null;
            let supplierId = null; 
            
            // Lógica de Atribuição de IDs
            if (type === 'venda') {
                total = qtd * prod.sellPrice * (1 + Math.random() * 0.1);
                clientId = clientIds[Math.floor(Math.random() * clientIds.length)]; 
            } else if (type === 'compra') {
                total = qtd * prod.buyPrice * (1 - Math.random() * 0.05);
                supplierId = supplierIds[Math.floor(Math.random() * supplierIds.length)]; 
            } else {
                total = qtd * prod.buyPrice * (0.1 + Math.random() * 0.2);
            }

            // Para fins de PDV, o produto vendido/perdido mantém o supplierId original do cadastro
            supplierId = supplierId || prod.supplierId; 

            transactions.push({
                id: transactions.length + 1,
                date: dateStr,
                type,
                productId: prod.id,
                product: prod.name,
                qtd,
                total: parseFloat(total.toFixed(2)),
                clientId, // Adicionado Cliente ID (para Vendas)
                supplierId, // Adicionado Fornecedor ID
                reason: type === 'perda' ? 'Estragou' : null,
            });
        }
    }
    return transactions;
};

const allTransactions = generateMockTransactions();

// --- REUSABLE COMPONENTS ---

// Estilo Base de Input (Com W-FULL)
const inputStyle = (isDark) => {
    return `w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors 
        ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300'} 
        focus:ring-emerald-500`;
};

// Helper Input for Cadastros (handles masking)
const EntityInput = ({ label, placeholder, type = 'text', required = false, mask, isDark, value, setValue, min, children = null }) => {
    const handleChange = (e) => {
        const rawValue = e.target.value;
        let maskedValue = rawValue;

        if (type === 'number' && min === '0') {
             const numValue = parseFloat(rawValue);
             if (rawValue === '') {
                 maskedValue = '';
             } else if (numValue < 0) {
                 maskedValue = '0';
             }
        }

        maskedValue = mask ? mask(maskedValue) : maskedValue;
        
        if (type === 'number') {
            setValue(maskedValue === '' ? 0 : parseFloat(maskedValue));
        } else {
            setValue(maskedValue);
        }
    };

    const inputValue = type === 'number' && value === 0 ? '' : value;

    return (
        <div>
            <label className={`text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block ${required ? 'required' : ''}`}>
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative flex items-center">
                {children}
                <input 
                    type={type} 
                    value={inputValue}
                    onChange={handleChange}
                    placeholder={placeholder} 
                    required={required}
                    className={inputStyle(isDark) + (children ? ' pl-12' : '')}
                    min={min} 
                />
            </div>
        </div>
    );
};


// INPUT DE MOEDA PARA CADASTROS
const CurrencyInputProduct = ({ label, isDark, value, setValue }) => {
    const [displayValue, setDisplayValue] = useState(value > 0 ? formatCurrencyInput(String(Math.round(value * 100))).replace('R$', '').trim() : ''); 

    const style = inputStyle(isDark) + ' text-right font-bold tracking-wider';

    useEffect(() => {
        setDisplayValue(value > 0 ? formatCurrencyInput(String(Math.round(value * 100))).replace('R$', '').trim() : '');
    }, [value]);

    const handleInputChange = (e) => {
        const rawValue = e.target.value;
        const newDigits = rawValue.replace(/\D/g, ''); 

        if (newDigits === '') {
            setDisplayValue('');
            setValue(0); 
        } else {
            const formatted = formatCurrencyInput(newDigits);
            setDisplayValue(formatted.replace('R$', '').trim());
            
            const numericValue = parseInt(newDigits, 10) / 100;
            setValue(numericValue);
        }
    };

    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 font-bold text-sm">R$</span>
                <input 
                    type="text" 
                    value={displayValue}
                    onChange={handleInputChange} 
                    placeholder="0,00"
                    className={style + ' pl-10'}
                />
            </div>
        </div>
    );
};


// MODAL PARA CADASTRO/EDIÇÃO DE PRODUTOS (ATUALIZADO PARA INCLUIR FORNECEDOR)
const ProductFormModal = ({ show, onClose, isDark, productToEdit, suppliers }) => { // Recebe suppliers
    const isEditing = !!productToEdit;
    
    // Estado inicial com supplierId
    const [formData, setFormData] = useState(productToEdit || { 
        name: '', 
        image: '', 
        stock: 0, 
        unit: 'un (Unidade)', 
        buyPrice: 0, 
        sellPrice: 0, 
        supplierId: suppliers.length > 0 ? suppliers[0].id : '' 
    });

    const style = inputStyle(isDark);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Produto salvo:", formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`w-full max-w-lg p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{isEditing ? `Editar: ${formData.name}` : 'Novo Cadastro de Produto'}</h2>
                            <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-200 text-zinc-800 hover:bg-gray-300'}`}>
                                <X/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* NOME: ÚNICO CAMPO OBRIGATÓRIO */}
                            <EntityInput label="Nome do Produto" required isDark={isDark} value={formData.name} setValue={val => setFormData({...formData, name: val})} />
                            
                            {/* FORNECEDOR PRINCIPAL */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Fornecedor Principal</label>
                                <select 
                                    value={formData.supplierId} 
                                    onChange={e => setFormData({...formData, supplierId: parseInt(e.target.value)})} 
                                    className={style}
                                    required
                                >
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* CAMPO DE ÍCONE SIMPLIFICADO */}
                                <EntityInput 
                                    label="Emoji/Ícone" 
                                    isDark={isDark} 
                                    value={formData.image} 
                                    setValue={val => setFormData({...formData, image: val})} 
                                    placeholder="Ex: 🥭" 
                                />
                                
                                {/* SELECT DE UNIDADE */}
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Unidade</label>
                                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className={style}>
                                        <option value="kg (Kilo)">kg (Kilo)</option>
                                        <option value="cx (Caixa)">cx (Caixa)</option>
                                        <option value="un (Unidade)">un (Unidade)</option>
                                        <option value="bdja (Bandeja)">bdja (Bandeja)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* ESTOQUE ATUAL (OPCIONAL, MIN=0) */}
                                <EntityInput 
                                    label="Estoque Atual" 
                                    type="number" 
                                    isDark={isDark} 
                                    value={formData.stock} 
                                    setValue={val => setFormData({...formData, stock: val})} 
                                    min="0"
                                />

                                {/* CUSTO (R$) - OPCIONAL */}
                                <CurrencyInputProduct 
                                    label="Custo (R$)" 
                                    isDark={isDark} 
                                    value={formData.buyPrice} 
                                    setValue={val => setFormData({...formData, buyPrice: val})} 
                                />
                                
                                {/* PREÇO VENDA (R$) - OPCIONAL */}
                                <CurrencyInputProduct 
                                    label="Preço Venda (R$)" 
                                    isDark={isDark} 
                                    value={formData.sellPrice} 
                                    setValue={val => setFormData({...formData, sellPrice: val})} 
                                />
                            </div>

                            <button type="submit" className="w-full py-3 mt-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all">
                                {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


// --- PDV VIEW (PONTO DE VENDA) (NOVO COMPONENTE) ---
const PosView = ({ isDark, products, clients }) => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]); // { product: {}, qtd: 1, total: price }

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products]);
    
    const totalCart = cart.reduce((sum, item) => sum + item.total, 0);

    const handleAddToCart = (product) => {
        // Lógica simples: adiciona 1 unidade
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
             setCart(cart.map(item => 
                 item.product.id === product.id 
                 ? { ...item, qtd: item.qtd + 1, total: (item.qtd + 1) * product.sellPrice }
                 : item
             ));
        } else {
             setCart([...cart, { product, qtd: 1, total: product.sellPrice }]);
        }
    };

    const handleRemoveFromCart = (productId) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        
        console.log("VENDA FINALIZADA:", {
            client: selectedClient,
            items: cart,
            total: totalCart,
            date: new Date().toISOString().split('T')[0]
        });
        
        // Simulação de limpeza após venda
        alert(`Venda de ${money(totalCart)} registrada para ${selectedClient ? selectedClient.name : 'Consumidor Final'}!`);
        setCart([]);
        setSelectedClient(null);
        setSearchTerm('');
    };


    const cardClass = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm';
    const inputClass = inputStyle(isDark);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
            
            {/* 1. Painel de Produtos (Ocupa 2/3) */}
            <div className="md:w-2/3 space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-500">
                    <List size={20} /> Catálogo de Vendas
                </h3>

                {/* Busca */}
                <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar produto por nome..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={inputClass + ' pl-12'}
                    />
                </div>

                {/* Lista de Produtos */}
                <div className={`grid grid-cols-2 gap-4 h-[60vh] overflow-y-auto p-2 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}>
                    {filteredProducts.map(p => (
                        <motion.div
                            key={p.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(p)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${cardClass}`}
                        >
                            <span className="text-3xl block mb-2">{p.image}</span>
                            <p className="font-bold text-sm">{p.name}</p>
                            <p className="text-xs text-zinc-500">Estoque: {p.stock} {p.unit}</p>
                            <p className="text-lg font-extrabold text-emerald-500 mt-1">{money(p.sellPrice)}</p>
                            <div className="absolute top-2 right-2 text-emerald-500"><Plus size={16} /></div>
                        </motion.div>
                    ))}
                    {filteredProducts.length === 0 && <p className="text-zinc-500 col-span-2 text-center py-10">Nenhum produto encontrado.</p>}
                </div>
            </div>

            {/* 2. Painel do Carrinho e Total (Ocupa 1/3) */}
            <div className={`md:w-1/3 p-6 rounded-3xl sticky top-8 h-fit space-y-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200 shadow-xl'}`}>
                
                <h3 className="text-xl font-bold border-b pb-3 mb-4 flex items-center gap-2 text-zinc-500">
                    <ShoppingCart size={20} /> Carrinho
                </h3>

                {/* Cliente Selecionado */}
                <div className={`p-3 rounded-xl border border-dashed ${isDark ? 'border-zinc-700' : 'border-blue-300 bg-blue-50'}`}>
                    <p className="text-xs font-bold uppercase text-blue-500 mb-1">Cliente</p>
                    <div className="flex justify-between items-center">
                        <p className="font-bold">
                            {selectedClient ? selectedClient.name : 'Consumidor Final'}
                        </p>
                        {selectedClient ? (
                            <button onClick={() => setSelectedClient(null)} className="text-rose-500 text-sm hover:underline">
                                Mudar
                            </button>
                        ) : (
                            <button onClick={() => alert('Abrir modal de seleção de cliente/cadastro')} className="text-blue-500 text-sm hover:underline">
                                Selecionar
                            </button>
                        )}
                    </div>
                </div>

                {/* Itens no Carrinho */}
                <div className="space-y-3 max-h-52 overflow-y-auto">
                    {cart.length === 0 ? (
                        <p className="text-center text-zinc-500 py-4">Carrinho vazio.</p>
                    ) : (
                        cart.map((item) => (
                            <motion.div 
                                key={item.product.id}
                                className={`flex justify-between items-center p-2 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{item.product.image}</span>
                                    <div>
                                        <p className="font-bold text-sm">{item.product.name}</p>
                                        <p className="text-xs text-zinc-500">{item.qtd} x {money(item.product.sellPrice)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-md text-emerald-500">{money(item.total)}</p>
                                    <button 
                                        onClick={() => handleRemoveFromCart(item.product.id)}
                                        className="text-xs text-rose-500 hover:text-rose-700"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Resumo e Botão Finalizar */}
                <div className="pt-4 border-t border-dashed border-zinc-700 dark:border-zinc-700">
                    <div className="flex justify-between font-bold text-2xl mb-4">
                        <span>TOTAL</span>
                        <span className="text-emerald-500">{money(totalCart)}</span>
                    </div>
                    
                    <motion.button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                        style={{ background: '#059669' }} // Cor primária (emerald-600)
                    >
                         <Check size={24} /> Finalizar Venda
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};


// --- VISTAS DA TELA DE CADASTROS ---

const CadastrosView = ({ isDark, products, clients, suppliers }) => {
    const [activeCadastro, setActiveCadastro] = useState('produtos'); 
    
    // Estados para o modal de produto
    const [showProductModal, setShowProductModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);

    // Estados para o modal genérico de entidade (clientes/fornecedores)
    const [showEntityModal, setShowEntityModal] = useState(false);
    const [entityType, setEntityType] = useState(null); // 'client' ou 'supplier'
    const [entityToEdit, setEntityToEdit] = useState(null); 


    // --- Sub-View: Produtos (ATUALIZADA PARA EXIBIR FORNECEDOR) ---
    const CadastroProducts = () => (
        <div className="space-y-6">
            <button 
                onClick={() => { setProductToEdit(null); setShowProductModal(true); }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20`}
            >
                <Plus size={20} /> Novo Produto
            </button>

            <h3 className="text-xl font-bold mt-8 mb-4">Produtos Cadastrados ({products.length})</h3>
            {products.map(p => (
                <div key={p.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                    {/* Fundo do ícone: Corrigido para Light Mode */}
                    <div className="w-10 h-10 text-xl bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">{p.image}</div>
                    <div className="flex-1">
                       <h3 className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.name}</h3>
                       {/* EXIBINDO O FORNECEDOR */}
                       <p className="text-xs text-zinc-500">
                            Estoque: {p.stock} {p.unit} | Fornecedor: {getSupplierName(p.supplierId)} 
                       </p>
                    </div>
                    {/* Botão Editar: Corrigido para Light Mode */}
                    <button 
                        onClick={() => { setProductToEdit(p); setShowProductModal(true); }}
                        className="py-2 px-4 rounded-lg font-bold text-sm text-emerald-600 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                    >
                        Editar
                    </button>
                </div>
            ))}
        </div>
    );


    // --- Sub-View: Clientes (Criação via Modal) ---
    const CadastroClients = () => {
        // Mock state para novo cliente
        const handleNewClient = () => {
             setEntityType('client'); 
             setEntityToEdit({ name: '', contact: '', cpf: '', docType: 'CPF', email: '' }); // Entidade vazia
             setShowEntityModal(true);
        };

        return (
            <div className="space-y-6">
                <button 
                    onClick={handleNewClient}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20`}
                >
                    <Plus size={20} /> Novo Cliente
                </button>

                <h3 className="text-xl font-bold mt-8 mb-4">Clientes Cadastrados ({clients.length})</h3>
                <div className="space-y-3">
                    {clients.map(c => (
                        <div key={c.id} className={`p-4 rounded-xl border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div>
                                <p className="font-bold">{c.name}</p>
                                <p className="text-sm text-zinc-500">{c.contact} | {c.cpf || c.doc}</p>
                            </div>
                            {/* Botão Editar: Corrigido para Light Mode */}
                            <button 
                                onClick={() => { setEntityType('client'); setEntityToEdit(c); setShowEntityModal(true); }}
                                className="py-2 px-4 rounded-lg font-bold text-sm text-emerald-600 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                            >
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- Sub-View: Fornecedores (Criação via Modal) ---
    const CadastroSuppliers = () => {
          // Mock state para novo fornecedor
          const handleNewSupplier = () => {
             setEntityType('supplier'); 
             setEntityToEdit({ name: '', contact: '', doc: '', docType: 'CNPJ', email: '' }); // Entidade vazia
             setShowEntityModal(true);
          };

        return (
            <div className="space-y-6">
                <button 
                    onClick={handleNewSupplier}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20`}
                >
                    <Plus size={20} /> Novo Fornecedor
                </button>

                <h3 className="text-xl font-bold mt-8 mb-4">Fornecedores Cadastrados ({suppliers.length})</h3>
                <div className="space-y-3">
                    {suppliers.map(s => (
                        <div key={s.id} className={`p-4 rounded-xl border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div>
                                <p className="font-bold">{s.name}</p>
                                <p className="text-sm text-zinc-500">{s.contact} | {s.doc}</p>
                            </div>
                            {/* Botão Editar: Corrigido para Light Mode */}
                            <button 
                                onClick={() => { setEntityType('supplier'); setEntityToEdit(s); setShowEntityModal(true); }}
                                className="py-2 px-4 rounded-lg font-bold text-sm text-emerald-600 bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                            >
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Sub-Navegação */}
            <div className={`p-1 mb-6 rounded-xl border flex justify-around shadow-inner ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-gray-100'}`}>
                {[
                    { id: 'produtos', label: 'Produtos', Icon: Package },
                    { id: 'clientes', label: 'Clientes', Icon: Contact },
                    { id: 'fornecedores', label: 'Fornecedores', Icon: Truck },
                ].map(item => (
                    <motion.button 
                        key={item.id}
                        onClick={() => setActiveCadastro(item.id)}
                        className={`py-2 px-4 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors relative`}
                    >
                        {activeCadastro === item.id && (
                            <motion.div 
                                layoutId="cadastro-pill"
                                className={`absolute inset-0 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-white shadow-sm'}`}
                            />
                        )}
                        <item.Icon size={16} className={`z-10 ${activeCadastro === item.id ? 'text-emerald-500' : 'text-zinc-500'}`}/>
                        <span className={`z-10 ${activeCadastro === item.id ? (isDark ? 'text-white' : 'text-zinc-800') : 'text-zinc-500'}`}>{item.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Renderizar Sub-Conteúdo */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCadastro}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeCadastro === 'produtos' && <CadastroProducts />}
                    {activeCadastro === 'clientes' && <CadastroClients />}
                    {activeCadastro === 'fornecedores' && <CadastroSuppliers />}
                </motion.div>
            </AnimatePresence>

            {/* Modal de Produto (Novo/Edição) */}
            <ProductFormModal 
                show={showProductModal}
                onClose={() => setShowProductModal(false)}
                isDark={isDark}
                productToEdit={productToEdit}
                suppliers={suppliers} // <<< ENVIANDO SUPPLIERS
            />

            {/* Modal Genérico de Entidade (Cliente/Fornecedor Edição) */}
            {showEntityModal && (
                 <EntityEditModal
                    show={showEntityModal}
                    onClose={() => setShowEntityModal(false)}
                    isDark={isDark}
                    type={entityType}
                    entity={entityToEdit}
                 />
            )}
        </motion.div>
    );
};

// --- MODAL DE EDIÇÃO GENÉRICO (CLIENTE / FORNECEDOR) ---

const EntityEditModal = ({ show, onClose, isDark, type, entity }) => {
    const isClient = type === 'client';
    const isSupplier = type === 'supplier';
    const isEditing = !!entity.name; 
    
    const title = isClient ? (isEditing ? 'Editar Cliente' : 'Novo Cliente') : (isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor');
    
    // Mock State com os dados da entidade para edição/criação
    const [nome, setNome] = useState(entity.name);
    const [telefone, setTelefone] = useState(entity.contact);
    const [email, setEmail] = useState(entity.email || '');
    
    // CPF/CNPJ Logic
    const initialDocType = entity.docType || (isClient ? 'CPF' : 'CNPJ'); 
    const initialDoc = entity.doc || entity.cpf || '';
    const [docType, setDocType] = useState(initialDocType);
    const [doc, setDoc] = useState(initialDoc);

    // Máscara e Placeholder adaptável universal
    const docMask = docType === 'CPF' ? maskCPF : maskCNPJ;
    const docPlaceholder = docType === 'CPF' ? '999.999.999-99' : '99.999.999/9999-99';

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Entidade Salva (${type}):`, { nome, telefone, email, doc, docType });
        onClose();
    };

    // Estilo base SEM w-full, usado para select e input de documento
    const inputStyleDocumentoBase = 'p-3 rounded-lg border focus:ring-2 outline-none transition-colors ' +
        (isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300') +
        ' focus:ring-emerald-500';

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`w-full max-w-lg p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-200 text-zinc-800 hover:bg-gray-300'}`}>
                                <X/>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* NOME: ÚNICO CAMPO OBRIGATÓRIO */}
                            <EntityInput label="Nome/Razão Social" required isDark={isDark} value={nome} setValue={setNome} />
                            
                            {/* TELEFONE: OPCIONAL */}
                            <EntityInput label="Telefone" placeholder="(99) 99999-9999" mask={maskPhone} isDark={isDark} value={telefone} setValue={setTelefone} />
                            
                            {/* INPUT DE DOCUMENTO COM SELETOR (CORREÇÃO DE LAYOUT APLICADA AQUI) */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
                                    Documento
                                </label>
                                <div className="flex items-stretch gap-2">
                                    {/* Seletor: w-1/3. Usa o estilo base SEM w-full */}
                                    <select 
                                        value={docType} 
                                        onChange={e => setDocType(e.target.value)} 
                                        className={inputStyleDocumentoBase + ' w-1/3 flex-none'}
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder={docPlaceholder} 
                                        value={doc}
                                        onChange={(e) => setDoc(docMask(e.target.value))}
                                        // Input: w-2/3. Usa o estilo base SEM w-full
                                        className={inputStyleDocumentoBase + ' w-2/3 flex-none'} 
                                    />
                                </div>
                            </div>
                            
                            {/* EMAIL: OPCIONAL */}
                            <EntityInput 
                                label="Email" 
                                placeholder="contato@exemplo.com" 
                                type="email" 
                                isDark={isDark} 
                                value={email} 
                                setValue={setEmail} 
                            />

                            <button type="submit" className="w-full py-3 mt-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all">
                                {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


// --- COMPONENTES AUXILIARES DE DATA ---

const SimpleRangeCalendar = ({ dateRange, setDateRange, isDark }) => {
    
    const [tempStart, setTempStart] = useState(dateRange.start ? new Date(dateRange.start) : null);
    const [tempEnd, setTempEnd] = useState(dateRange.end ? new Date(dateRange.end) : null);

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const getDaysInMonth = (month, year) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }
        return days;
    };
    
    const handleDayClick = (day) => {
        if (tempStart && tempEnd || (tempStart && day < tempStart)) {
            setTempStart(day);
            setTempEnd(null);
        } else if (tempStart && day >= tempStart) {
            setTempEnd(day);
        } else {
            setTempStart(day);
            setTempEnd(null);
        }
    };

    const handleApply = () => {
        if (tempStart) {
            const end = tempEnd || tempStart;

            setDateRange({ 
                start: tempStart.toISOString().split('T')[0], 
                end: end.toISOString().split('T')[0]
            });
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(prev => {
            if (prev === 0) { setCurrentYear(y => y - 1); return 11; }
            return prev - 1;
        });
    };
    const handleNextMonth = () => {
        setCurrentMonth(prev => {
            if (prev === 11) { setCurrentYear(y => y + 1); return 0; }
            return prev + 1;
        });
    };


    const days = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const calendarDays = [...Array(firstDayOfMonth).fill(null), ...days]; 

    const isSelected = (day) => {
        if (!day) return false;
        const dayStr = day.toISOString().split('T')[0];
        const startStr = tempStart ? tempStart.toISOString().split('T')[0] : null;
        const endStr = tempEnd ? tempEnd.toISOString().split('T')[0] : null;
        return dayStr === startStr || dayStr === endStr;
    };

    const isInRange = (day) => {
        if (!day || !tempStart) return false;
        
        const effectiveEnd = tempEnd || tempStart;
        
        const start = tempStart < effectiveEnd ? tempStart : effectiveEnd;
        const end = tempStart > effectiveEnd ? tempStart : effectiveEnd;
        
        return day > start && day < end;
    };

    return (
        <div className="space-y-4">
            <div className={`p-3 rounded-xl border border-dashed transition-all 
                               ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-emerald-300 text-zinc-700 bg-emerald-50'}`}>
                <span className="text-sm font-bold">
                    {tempStart ? formatDate(tempStart.toISOString()) : 'Início'} 
                </span>
                <ArrowRight size={14} className="inline mx-2 text-zinc-500" />
                <span className="text-sm font-bold">
                    {tempEnd ? formatDate(tempEnd.toISOString()) : (tempStart ? 'Fim (Selecionando...)' : 'Fim')}
                </span>
            </div>

            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"><ChevronLeft size={20}/></button>
                <span className="font-bold">{months[currentMonth]} {currentYear}</span>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"><ChevronRight size={20}/></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {daysOfWeek.map(day => <span key={day} className="font-bold text-zinc-500">{day}</span>)}
              
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDayClick(day)}
                      disabled={day > today}
                      className={`w-10 h-10 rounded-full transition-all text-sm font-medium relative
                        ${isSelected(day) ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 
                          isInRange(day) ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 
                          day > today ? 'text-zinc-400 cursor-not-allowed' :
                          `${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-700 hover:bg-zinc-100'}`
                        }`}
                    >
                      {day.getDate()}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleApply}
              disabled={!tempStart}
              className={`w-full py-3 mt-4 rounded-xl font-bold text-white transition-all transform active:scale-95 disabled:opacity-50
                ${tempStart ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-zinc-500'}`}
            >
              Aplicar Período
            </button>
        </div>
    );
};


const DateRangeDropdown = ({ dateRange, setDateRange, isDark, show, onClose }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scaleY: 0.9 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-3 p-4 rounded-xl shadow-2xl z-50 origin-top 
                                ${isDark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-gray-200'} w-96`}
                >
                    <SimpleRangeCalendar 
                        dateRange={dateRange}
                        setDateRange={(range) => { setDateRange(range); onClose(); }} 
                        isDark={isDark}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const DateFilterButton = ({ dateRange, setDateRange, isDark }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.date-filter-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    return (
        <div className="relative date-filter-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all hover:ring-2 hover:ring-emerald-500/50 
                    ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-200 text-zinc-700 shadow-sm'}`}
            >
                <Calendar size={18} className="text-emerald-500" />
                <span className="font-bold text-sm">
                    {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </span>
            </button>

            <DateRangeDropdown 
                show={showDropdown}
                onClose={() => setShowDropdown(false)}
                dateRange={dateRange}
                setDateRange={setDateRange}
                isDark={isDark}
            />
        </div>
    );
};


// --- CONSTANTES DE ESTILO (AQUI ESTÁ A SOLUÇÃO DEFINITIVA) ---
const STYLES_MAP = {
    // Venda (Emerald)
    emerald: {
        icon: 'text-emerald-500',
        gradient: 'from-emerald-400 to-green-600',
        bgStat: 'bg-emerald-900/20 border border-emerald-500/20',
        textStat: 'text-emerald-600',
        textValue: 'text-emerald-400',
        bgLight: 'bg-emerald-50 border border-emerald-100',
        textLight: 'text-emerald-700',
    },
    // Compra (Blue)
    blue: {
        icon: 'text-blue-500',
        gradient: 'from-blue-400 to-indigo-600',
        bgStat: 'bg-blue-900/20 border border-blue-500/20',
        textStat: 'text-blue-600',
        textValue: 'text-blue-400',
        bgLight: 'bg-blue-50 border border-blue-100',
        textLight: 'text-blue-700',
    },
    // Perda (Rose)
    rose: {
        icon: 'text-rose-500',
        gradient: 'from-rose-400 to-red-600',
        bgStat: 'bg-rose-900/20 border border-rose-500/20',
        textStat: 'text-rose-600',
        textValue: 'text-rose-400',
        bgLight: 'bg-rose-50 border border-rose-100',
        textLight: 'text-rose-700',
    }
};

const ActionButton = ({ icon: Icon, label, color, onClick, isDark }) => {
    const styles = STYLES_MAP[color] || STYLES_MAP.emerald; // Default para emerald se a cor falhar

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl p-5 flex flex-col items-center justify-center gap-2 shadow-lg ${isDark ? 'shadow-black/40' : 'shadow-gray-200'} w-full group`}
        >
            {/* O Tailwind lê estas classes estáticas do STYLES_MAP */}
            <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
            <div className={`p-3 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-white'} shadow-sm ${styles.icon} group-hover:scale-110 transition-transform`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <span className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{label}</span>
        </motion.button>
    );
};


const TransactionFormModal = ({ show, onClose, type, isDark, products, clients, suppliers }) => {
    
    const [inputMode, setInputMode] = useState('unit'); 

    let title, color, Icon, buttonText;
    let styles;

    if (type === 'venda') {
        title = 'Registrar Nova Venda'; color = 'emerald'; Icon = ArrowUpRight; buttonText = 'VENDER';
    } else if (type === 'compra') {
        title = 'Registrar Nova Compra'; color = 'blue'; Icon = ShoppingBag; buttonText = 'COMPRAR';
    } else {
        title = 'Registrar Perda/Desperdício'; color = 'rose'; Icon = AlertTriangle; buttonText = 'REGISTRAR PERDA';
    }
    
    // Garantimos o mapeamento de estilo aqui também
    styles = STYLES_MAP[color] || STYLES_MAP.emerald;

    const inputStyleWithWFull = inputStyle(isDark);

    const getSegmentedButtonClass = (mode) => {
        const isSelected = inputMode === mode;
        const baseClasses = 'flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2';
        
        let selectedStyle;
        if (color === 'emerald') {
            selectedStyle = 'bg-emerald-500 text-white shadow-emerald-500/30';
        } else if (color === 'blue') {
            selectedStyle = 'bg-blue-500 text-white shadow-blue-500/30';
        } else if (color === 'rose') {
            selectedStyle = 'bg-rose-500 text-white shadow-rose-500/30';
        }

        return `${baseClasses} ${isSelected ? selectedStyle : 'text-zinc-500'}`;
    };

    const CurrencyInput = ({ placeholder, isDisabled, label, inputId }) => {
        const [displayValue, setDisplayValue] = useState('');

        const style = inputStyle(isDark);
        
        const handleInputChange = (e) => {
            const rawValue = e.target.value;
            const newDigits = rawValue.replace(/\D/g, '');

            if (newDigits === '') {
                setDisplayValue('');
            } else {
                setDisplayValue(formatCurrencyInput(newDigits));
            }
        };

        return (
            <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">{label}</label>
                <input 
                    type="text" 
                    id={inputId}
                    value={displayValue}
                    onChange={handleInputChange} 
                    placeholder={placeholder}
                    disabled={isDisabled}
                    className={style + ' text-right font-bold tracking-wider'}
                />
            </div>
        );
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    {/* OTIMIZAÇÃO: Usando transição spring para suavizar o lag percebido */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`w-full max-w-sm p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {/* Usa a classe estática do styles map */}
                                <Icon className={styles.icon} size={24} /> {title}
                            </h2>
                            <button 
                                onClick={onClose} 
                                className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-200 text-zinc-800 hover:bg-gray-300'}`}
                            >
                                <X/>
                            </button>
                        </div>
                        
                        {(type === 'venda' || type === 'compra') && (
                            <div className={`flex p-1 mb-4 rounded-xl border transition-colors 
                                ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-gray-100'}`}>
                                <motion.button 
                                    onClick={() => setInputMode('unit')}
                                    className={getSegmentedButtonClass('unit')}
                                >
                                    <Divide size={16} /> Preço Unitário
                                </motion.button>
                                <motion.button 
                                    onClick={() => setInputMode('total')}
                                    className={getSegmentedButtonClass('total')}
                                >
                                    <Calculator size={16} /> Preço Total
                                </motion.button>
                            </div>
                        )}

                        <form className="space-y-4">
                            {/* Produto */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Produto</label>
                                <select className={inputStyleWithWFull}>
                                    <option>Selecione...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.image})</option>)}
                                </select>
                            </div>

                            {/* Quantidade (min="0" para validar) */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Quantidade</label>
                                <input type="number" min="0" placeholder="10" className={inputStyleWithWFull} />
                            </div>

                            {/* Valor Unitário e Total (Dinâmico) */}
                            <div className="grid grid-cols-2 gap-4">
                                <CurrencyInput
                                    label="Preço Unitário"
                                    placeholder="0,00"
                                    inputId="unitPrice"
                                    isDisabled={inputMode === 'total' && (type === 'venda' || type === 'compra')}
                                />
                                <CurrencyInput
                                    label="Preço Total"
                                    placeholder="0,00"
                                    inputId="totalPrice"
                                    isDisabled={inputMode === 'unit' && (type === 'venda' || type === 'compra')}
                                />
                            </div>
                            
                            {/* Campos Específicos (Mantidos) */}
                            {type === 'compra' && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Fornecedor</label>
                                    <select className={inputStyleWithWFull}>
                                        <option>Selecione...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {type === 'venda' && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Cliente (Opcional)</label>
                                    <select className={inputStyleWithWFull}>
                                        <option value="">Consumidor Final</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                             {type === 'perda' && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1 block">Motivo da Perda</label>
                                    <select className={inputStyleWithWFull}>
                                        <option>Estragou (Perecível)</option>
                                        <option>Quebra/Dano</option>
                                        <option>Desconhecido</option>
                                    </select>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className={`w-full py-3 mt-6 rounded-xl font-bold text-white transition-all transform active:scale-95 bg-${color}-600 hover:bg-${color}-700`}
                            >
                                {buttonText}
                            </button>
                        </form>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// --- APP PRINCIPAL ---
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); 
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDark, setIsDark] = useState(true); // PADRÃO DARK MODE
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('venda'); 
    const [selectedProduct, setSelectedProduct] = useState(null); 
    
    // NOVO ESTADO PARA O MENU DO PERFIL
    const [showProfileMenu, setShowProfileMenu] = useState(false); 

    // Função para simular o Logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        setActiveTab('dashboard'); 
        setShowProfileMenu(false); // Fecha o menu ao sair
    };

    // Efeito para fechar o menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verifica se o clique não foi no container do perfil
            if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu]);


    const today = new Date().toISOString().split('T')[0];
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const [dateRange, setDateRange] = useState({ 
        start: threeWeeksAgo.toISOString().split('T')[0], 
        end: today 
    });


    const filteredTransactions = useMemo(() => {
        return allTransactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end);
    }, [dateRange]);

    const dashboardStats = useMemo(() => {
        let entradas = 0;
        let saidas = 0;
        let perdas = 0;

        filteredTransactions.forEach(t => {
            if (t.type === 'venda') entradas += t.total;
            if (t.type === 'compra') saidas += t.total;
            if (t.type === 'perda') perdas += t.total;
        });

        return {
            entradas,
            saidas,
            perdas,
            saldo: entradas - saidas - perdas
        };
    }, [filteredTransactions]);

    const getProductStats = useCallback((prodId) => {
        const prodTrans = filteredTransactions.filter(t => t.productId === prodId);
        let sold = 0, bought = 0, lost = 0;
        let soldQtd = 0, boughtQtd = 0, lostQtd = 0;

        prodTrans.forEach(t => {
            if (t.type === 'venda') { sold += t.total; soldQtd += t.qtd; }
            if (t.type === 'compra') { bought += t.total; boughtQtd += t.qtd; }
            if (t.type === 'perda') { lost += t.total; lostQtd += t.qtd; }
        });

        const result = sold - bought - lost;

        return { sold, bought, lost, result, soldQtd, boughtQtd, lostQtd, history: prodTrans };
    }, [filteredTransactions]);
    
    // Função auxiliar para estabilizar a cor da borda no JIT do Tailwind
    const getBorderColorClass = (color) => {
        if (color === 'emerald') return 'border-emerald-500';
        if (color === 'blue') return 'border-blue-500';
        if (color === 'rose') return 'border-rose-500';
        return 'border-zinc-500'; 
    };
    
    // Usamos o STYLES_MAP criado acima para garantir o acesso às classes
    const emeraldStyles = STYLES_MAP.emerald;
    const blueStyles = STYLES_MAP.blue;
    const roseStyles = STYLES_MAP.rose;

    if (!isAuthenticated) {
        return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
    }


    // A PARTIR DAQUI SÓ RENDERIZA SE ESTIVER AUTENTICADO
    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans pb-24 md:pb-0 md:pl-24 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-zinc-800'}`}>
            
            {/* --- SIDEBAR e NAV BAR --- */}
            <nav className={`fixed z-40 transition-all duration-300 md:top-0 md:left-0 md:h-full md:w-24 md:flex-col md:border-r bottom-0 left-0 w-full flex justify-around items-center p-2 ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-gray-200'} backdrop-blur-lg`}>
                <div className="hidden md:flex flex-col items-center mt-6 mb-12">
                    {/* Logo 'S' ou outro ícone de branding */}
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">S</div>
                </div>
                {[
                    { id: 'dashboard', icon: LayoutGrid, label: 'Início' },
                    { id: 'pdv', icon: DollarSign, label: 'PDV' }, // <<< PDV ADICIONADO AQUI
                    { id: 'estoque', icon: Package, label: 'Estoque' },
                    { id: 'cadastros', icon: Users, label: 'Cadastros' }, 
                ].map(item => (
                    <button key={item.id} onClick={() => {setActiveTab(item.id); setSelectedProduct(null)}} className={`relative p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === item.id ? (isDark ? 'text-white' : 'text-emerald-600') : 'text-zinc-400'}`}>
                        {activeTab === item.id && <motion.div layoutId="tab-pill" className={`absolute inset-0 rounded-xl ${isDark ? 'bg-zinc-800' : 'bg-emerald-50'} -z-10`} />}
                        <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        <span className="text-[10px] font-medium hidden md:block">{item.label}</span>
                    </button>
                ))}
                <div className="hidden md:flex flex-col items-center mt-auto mb-6">
                   <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-full ${isDark ? 'bg-zinc-800 text-yellow-400' : 'bg-gray-100 text-zinc-600'}`}>{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
                </div>
            </nav>
            
            {/* --- MAIN CONTENT --- */}
            <main className="max-w-4xl mx-auto p-4 md:p-6 pt-8">
                
                {/* HEADER GERAL */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {activeTab === 'dashboard' ? 'Visão Geral' : activeTab === 'estoque' ? (selectedProduct ? `Análise: ${selectedProduct.name}` : 'Gestão de Produtos') : activeTab === 'pdv' ? 'Ponto de Venda' : 'Cadastros Essenciais'}
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {activeTab === 'cadastros' ? 'Gestão de Entidades (Produtos, Clientes, Fornecedores)' : activeTab === 'pdv' ? 'Finalize vendas rapidamente e com controle' : 'Dados referentes ao período selecionado'}
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto">
                         {(activeTab === 'dashboard' || activeTab === 'estoque') && (
                            <DateFilterButton dateRange={dateRange} setDateRange={setDateRange} isDark={isDark} />
                         )}
                         
                         {/* BOTÃO DE PERFIL E SAIR (CORRIGIDO PARA CLIQUE) */}
                         <div className="flex gap-2">
                           <button onClick={() => setIsDark(!isDark)} className="md:hidden p-2 rounded-full border border-zinc-200 dark:border-zinc-800">
                              {isDark ? <Sun size={20}/> : <Moon size={20}/>}
                           </button>
                           
                           {/* Menu do Avatar com Logout - CONTAINER DE CLIQUE */}
                           <div className="relative profile-menu-container"> 
                             {/* AVATAR - CHAMA O MENU NO CLIQUE */}
                             <div 
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden border-2 border-white dark:border-zinc-700 cursor-pointer"
                             >
                               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juruba" alt="Avatar" />
                             </div>
                             
                             {/* Dropdown de Sair (Visibilidade controlada pelo estado showProfileMenu) */}
                             <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: -5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                                        transition={{ duration: 0.15 }}
                                        className={`absolute right-0 mt-3 w-40 rounded-xl shadow-xl py-1 origin-top-right z-50
                                                    ${isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-gray-200'}`}
                                    >
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-sm text-left text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <LogOut size={16} className="transform rotate-180"/> Sair
                                        </button>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                           </div>
                         </div>
                         {/* FIM BOTÃO DE PERFIL E SAIR */}
                    </div>
                </header>
                
                {/* --- PDV VIEW (NOVO) --- */}
                {activeTab === 'pdv' && (
                    <PosView 
                        isDark={isDark}
                        products={products}
                        clients={clients}
                    />
                )}

                {/* --- DASHBOARD VIEW --- */}
                {activeTab === 'dashboard' && !selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <ActionButton 
                                icon={TrendingUp} label="Venda" color="emerald" isDark={isDark}
                                onClick={() => { setModalType('venda'); setShowModal(true); }} 
                            />
                            <ActionButton 
                                icon={ShoppingBag} label="Compra" color="blue" isDark={isDark}
                                onClick={() => { setModalType('compra'); setShowModal(true); }} 
                            />
                            <ActionButton 
                                icon={AlertTriangle} label="Perda" color="rose" isDark={isDark}
                                onClick={() => { setModalType('perda'); setShowModal(true); }} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Entradas */}
                            <div className={`p-6 rounded-3xl ${isDark ? emeraldStyles.bgStat : emeraldStyles.bgLight}`}>
                                <div className={`flex items-center gap-3 mb-2 ${emeraldStyles.textStat}`}>
                                    <TrendingUp size={20} /> <span className="text-sm font-bold uppercase">Entradas (Vendas)</span>
                                </div>
                                <h3 className={`text-3xl font-bold ${isDark ? emeraldStyles.textValue : emeraldStyles.textLight}`}>{money(dashboardStats.entradas)}</h3>
                            </div>
                            
                            {/* Saídas */}
                            <div className={`p-6 rounded-3xl ${isDark ? blueStyles.bgStat : blueStyles.bgLight}`}>
                                <div className={`flex items-center gap-3 mb-2 ${blueStyles.textStat}`}>
                                    <ShoppingBag size={20} /> <span className="text-sm font-bold uppercase">Saídas (Compras)</span>
                                </div>
                                <h3 className={`text-3xl font-bold ${isDark ? blueStyles.textValue : blueStyles.textLight}`}>{money(dashboardStats.saidas)}</h3>
                            </div>

                            {/* Resultado */}
                            <div className={`p-6 rounded-3xl ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                                <div className="flex items-center gap-3 mb-2 text-zinc-500">
                                    <Wallet size={20} /> <span className="text-sm font-bold uppercase">Resultado Líquido</span>
                                </div>
                                <h3 className={`text-3xl font-bold ${dashboardStats.saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {dashboardStats.saldo >= 0 ? '+' : ''}{money(dashboardStats.saldo)}
                                </h3>
                                {dashboardStats.perdas > 0 && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                                        <AlertTriangle size={12}/> Perdas: {money(dashboardStats.perdas)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Extrato do Período ({filteredTransactions.length} Lançamentos)</h3>
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">Nenhuma movimentação nestas datas.</div>
                            ) : (
                                filteredTransactions.slice(0, 5).map(t => (
                                    <div key={t.id} className={`flex justify-between items-center p-4 mb-2 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            {/* Cor da bolinha baseada no tipo */}
                                            <div className={`p-2 rounded-lg ${t.type === 'venda' ? 'bg-emerald-500/10 text-emerald-500' : t.type === 'compra' ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {t.type === 'venda' ? <ArrowUpRight size={18} /> : t.type === 'compra' ? <ShoppingBag size={18} /> : <ArrowDownRight size={18} />}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{t.product}</p>
                                                <p className="text-xs text-zinc-500">{formatDate(t.date)} • {t.type.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                           <p className={`font-bold ${t.type === 'venda' ? 'text-emerald-500' : 'text-zinc-800 dark:text-white'}`}>
                                             {money(t.total)}
                                           </p>
                                           <p className={`text-xs ${t.type === 'perda' ? 'text-rose-500' : 'text-zinc-500'}`}>{t.qtd} un</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* --- ESTOQUE VIEW --- */}
                {activeTab === 'estoque' && (
                    <AnimatePresence mode="wait">
                        {!selectedProduct ? (
                            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                               <div className="grid gap-4">
                                  {products.map(p => {
                                     const stats = getProductStats(p.id);
                                     return (
                                       <div 
                                         key={p.id} 
                                         onClick={() => setSelectedProduct(p)}
                                         className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all
                                             ${isDark ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-gray-100 shadow-sm hover:border-emerald-200'}`}
                                       >
                                          <div className="w-12 h-12 text-2xl bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">{p.image}</div>
                                          <div className="flex-1">
                                             <h3 className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.name}</h3>
                                             <p className="text-xs text-zinc-500">Estoque Atual: {p.stock} {p.unit}</p>
                                          </div>
                                          <div className="text-right hidden sm:block">
                                             <p className="text-[10px] uppercase font-bold text-zinc-400">Lucro/Prejuízo Líquido</p>
                                             <span className={`text-sm font-bold ${stats.result >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                                             </span>
                                          </div>
                                          <ChevronLeft size={20} className="rotate-180 text-zinc-400" />
                                       </div>
                                     )
                                  })}
                               </div>
                            </motion.div>
                        ) : (
                            <motion.div key="detail" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
                                <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-sm font-bold text-zinc-500 mb-6 hover:text-emerald-500">
                                  <ChevronLeft size={16} /> Voltar para lista
                                </button>

                                <div className="flex items-center gap-4 mb-8">
                                  <div className="text-4xl">{selectedProduct.image}</div>
                                  <div>
                                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{selectedProduct.name}</h2>
                                    <p className="text-zinc-500 text-sm">Análise de {formatDate(dateRange.start)} até {formatDate(dateRange.end)}</p>
                                  </div>
                                </div>

                                {(() => {
                                   const stats = getProductStats(selectedProduct.id);
                                   return (
                                     <>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                          <p className="text-xs uppercase font-bold text-zinc-500 mb-1">Vendas (Faturado)</p>
                                          <p className="text-xl font-bold text-emerald-500">{money(stats.sold)}</p>
                                          <p className="text-xs text-zinc-400">{stats.soldQtd} {selectedProduct.unit} vendidos</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                          <p className="text-xs uppercase font-bold text-zinc-500 mb-1">Compras (Custo)</p>
                                          <p className="text-xl font-bold text-blue-500">{money(stats.bought)}</p>
                                          <p className="text-xs text-zinc-400">{stats.boughtQtd} {selectedProduct.unit} comprados</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                          <p className="text-xs uppercase font-bold text-zinc-500 mb-1">Perdas</p>
                                          <p className="text-xl font-bold text-rose-500">{money(stats.lost)}</p>
                                          <p className="text-xs text-zinc-400">{stats.lostQtd} {selectedProduct.unit} perdidos</p>
                                        </div>
                                        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'} relative overflow-hidden`}>
                                           <div className={`absolute inset-0 opacity-10 ${stats.result >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                          <p className="text-xs uppercase font-bold text-zinc-500 mb-1">Resultado Real</p>
                                          <p className={`text-xl font-bold ${stats.result >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                                          </p>
                                          <p className="text-xs text-zinc-400">Lucro/Prejuízo Líquido</p>
                                        </div>
                                      </div>

                                      <h3 className="font-bold mb-4">Histórico neste período</h3>
                                      <div className="space-y-2">
                                        {stats.history.length === 0 && <p className="text-zinc-500 text-sm">Sem dados neste período. Tente ampliar o filtro.</p>}
                                        {stats.history.map(h => {
                                            let typeColor, typeLabel, typeIcon;
                                            if (h.type === 'venda') {
                                                typeColor = 'emerald'; typeLabel = 'VENDA'; typeIcon = DollarSign;
                                            } else if (h.type === 'compra') {
                                                typeColor = 'blue'; typeLabel = 'COMPRA'; typeIcon = ShoppingBag;
                                            } else {
                                                typeColor = 'rose'; typeLabel = 'PERDA'; typeIcon = AlertTriangle;
                                            }

                                            const dynamicBorderClass = getBorderColorClass(typeColor);

                                            return (
                                                <motion.div 
                                                    key={h.id} 
                                                    whileHover={{ scale: 1.02, x: 5 }} 
                                                    className={`flex justify-between items-center p-3 rounded-lg text-sm transition-colors 
                                                    ${isDark ? 'bg-zinc-900' : 'bg-white hover:shadow-md'} 
                                                    border-l-4 ${dynamicBorderClass}`} 
                                                >
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <typeIcon className={`text-${typeColor}-500`} size={16} /> 
                                                        <div>
                                                            <p className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{typeLabel}</p>
                                                            <p className="text-xs text-zinc-500">
                                                                {formatDate(h.date)} ({h.qtd} un) 
                                                                {h.clientId && ` - Cliente: ${getClientName(h.clientId)}`}
                                                                {h.supplierId && ` - Forn: ${getSupplierName(h.supplierId)}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <span className={`font-mono font-bold text-lg text-${typeColor}-500`}>
                                                        {h.type === 'venda' ? '+' : '-'} {money(h.total)}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                      </div>
                                     </>
                                   )
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* --- CADASTROS VIEW (NOVA TELA) --- */}
                {activeTab === 'cadastros' && (
                    <CadastrosView 
                        isDark={isDark} 
                        products={products}
                        clients={clients}
                        suppliers={suppliers}
                    />
                )}

            </main>

            {/* --- MODAL DE TRANSAÇÃO (CHAMADA DO COMPONENTE) --- */}
            <TransactionFormModal 
                show={showModal} 
                onClose={() => setShowModal(false)} 
                type={modalType} 
                isDark={isDark} 
                products={products}
                clients={clients}
                suppliers={suppliers}
            />
        </div>
    );
};
export default App;