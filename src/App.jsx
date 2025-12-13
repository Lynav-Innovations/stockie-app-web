import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthScreen from './AuthScreen';
import PDVView from './PDVView';
import { 
    LayoutGrid, ShoppingBag, Users, Package, 
    TrendingUp, TrendingDown, AlertTriangle, 
    Wallet, Search, X, Moon, Sun, Calendar, 
    ArrowRight, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
    Tag, BarChart3, Clock, DollarSign, Contact, Truck, Plus, LogOut, CreditCard
} from 'lucide-react';

// Helper Functions
const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

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

// Mock Data
const suppliers = [
    { id: 101, name: 'Hortifruti Central', contact: '(31) 95555-4444', doc: '99.999.999/0001-00', docType: 'CNPJ', email: 'horti@exemplo.com' },
    { id: 102, name: 'Distribuidora do Zé', contact: '(41) 96666-3333', doc: '111.222.333-44', docType: 'CPF', email: 'ze@exemplo.com' },
    { id: 103, name: 'Frutas Tropicais Ltda', contact: '(21) 97777-8888', doc: '88.888.888/0001-88', docType: 'CNPJ', email: 'tropicais@exemplo.com' },
];

const products = [
    { id: 1, name: 'Mamão Papaya', stock: 45, unit: 'cx', image: '🥭', buyPrice: 15, sellPrice: 23, supplierId: 101 },
    { id: 2, name: 'Mamão Papaya', stock: 30, unit: 'cx', image: '🥭', buyPrice: 14, sellPrice: 22, supplierId: 103 },
    { id: 3, name: 'Banana Prata', stock: 120, unit: 'kg', image: '🍌', buyPrice: 20, sellPrice: 35, supplierId: 101 },
    { id: 4, name: 'Banana Prata', stock: 80, unit: 'kg', image: '🍌', buyPrice: 18, sellPrice: 32, supplierId: 102 },
    { id: 5, name: 'Morango', stock: 15, unit: 'bdja', image: '🍓', buyPrice: 8, sellPrice: 15, supplierId: 101 },
    { id: 6, name: 'Morango', stock: 25, unit: 'bdja', image: '🍓', buyPrice: 9, sellPrice: 16, supplierId: 103 },
    { id: 7, name: 'Abacaxi', stock: 50, unit: 'un', image: '🍍', buyPrice: 5, sellPrice: 8, supplierId: 101 },
    { id: 8, name: 'Melancia', stock: 35, unit: 'un', image: '🍉', buyPrice: 12, sellPrice: 20, supplierId: 102 },
    { id: 9, name: 'Uva Itália', stock: 40, unit: 'kg', image: '🍇', buyPrice: 15, sellPrice: 25, supplierId: 103 },
    { id: 10, name: 'Maçã Fuji', stock: 60, unit: 'kg', image: '🍎', buyPrice: 10, sellPrice: 18, supplierId: 101 },
];

const clients = [
    { id: 1, name: 'Mercadinho da Esquina', contact: '(11) 98765-4321', cpf: '123.456.789-00', docType: 'CPF', email: 'mercado@exemplo.com' },
    { id: 2, name: 'Restaurante Sabor', contact: '(21) 91234-5678', cpf: '000.111.222-33', docType: 'CPF', email: 'sabor@exemplo.com' },
    { id: 3, name: 'Padaria Pão Quente', contact: '(31) 99999-1111', cpf: '444.555.666-77', docType: 'CPF', email: 'padaria@exemplo.com' },
];

const generateMockTransactions = () => {
    const transactions = [];
    const daysInPast = 90; 
    const baseProducts = [
        { id: 1, name: 'Mamão Papaya (Cx)', buyPrice: 15, sellPrice: 23 },
        { id: 2, name: 'Banana Prata (Cx)', buyPrice: 20, sellPrice: 35 },
        { id: 3, name: 'Morango (Bdja)', buyPrice: 8, sellPrice: 15 },
    ];

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
            if (type === 'venda') {
                total = qtd * prod.sellPrice * (1 + Math.random() * 0.1); 
            } else if (type === 'compra') {
                total = qtd * prod.buyPrice * (1 - Math.random() * 0.05); 
            } else {
                total = qtd * prod.buyPrice * (0.1 + Math.random() * 0.2);
            }

            transactions.push({
                id: transactions.length + 1,
                date: dateStr,
                type,
                productId: prod.id,
                product: prod.name,
                qtd,
                total: parseFloat(total.toFixed(2)),
                reason: type === 'perda' ? 'Estragou' : null,
            });
        }
    }
    return transactions;
};

const allTransactions = generateMockTransactions();

// Reusable Components
const InputField = ({ label, placeholder, type = 'text', required = false, mask, isDark, value, setValue, min, children = null }) => {
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
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            <div className="relative flex items-center">
                {children}
                <input 
                    type={type} 
                    value={inputValue}
                    onChange={handleChange}
                    placeholder={placeholder} 
                    required={required}
                    className={'input-refined h-10' + (children ? ' pl-10' : '')}
                    min={min} 
                />
            </div>
        </div>
    );
};

const CurrencyInputProduct = ({ label, isDark, value, setValue }) => {
    const [displayValue, setDisplayValue] = useState(value > 0 ? formatCurrencyInput(String(Math.round(value * 100))).replace('R$', '').trim() : ''); 

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
            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 font-medium text-xs">R$</span>
                <input 
                    type="text" 
                    value={displayValue}
                    onChange={handleInputChange} 
                    placeholder="0,00"
                    className="input-refined h-10 pl-10 text-right font-semibold"
                />
            </div>
        </div>
    );
};

// Product Form Modal
const ProductFormModal = ({ show, onClose, isDark, productToEdit, suppliers }) => {
    const isEditing = !!productToEdit;
    const [formData, setFormData] = useState(productToEdit || { name: '', image: '', stock: 0, unit: 'un (Unidade)', buyPrice: 0, sellPrice: 0, supplierId: null });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Produto salvo:", formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-lg card-refined p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-zinc-100">{isEditing ? `Editar: ${formData.name}` : 'Novo Produto'}</h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField label="Nome do Produto" required isDark={isDark} value={formData.name} setValue={val => setFormData({...formData, name: val})} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <InputField 
                                    label="Emoji/Ícone" 
                                    isDark={isDark} 
                                    value={formData.image} 
                                    setValue={val => setFormData({...formData, image: val})} 
                                    placeholder="Ex: 🥭" 
                                />
                                
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Unidade</label>
                                    <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="input-refined h-10">
                                        <option value="kg (Kilo)">kg (Kilo)</option>
                                        <option value="cx (Caixa)">cx (Caixa)</option>
                                        <option value="un (Unidade)">un (Unidade)</option>
                                        <option value="bdja (Bandeja)">bdja (Bandeja)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Fornecedor</label>
                                <select 
                                    value={formData.supplierId || ''} 
                                    onChange={e => setFormData({...formData, supplierId: e.target.value ? parseInt(e.target.value) : null})} 
                                    className="input-refined h-10"
                                >
                                    <option value="">Selecione (opcional)</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <InputField 
                                    label="Estoque Atual" 
                                    type="number" 
                                    isDark={isDark} 
                                    value={formData.stock} 
                                    setValue={val => setFormData({...formData, stock: val})} 
                                    min="0"
                                />
                                <CurrencyInputProduct 
                                    label="Custo (R$)" 
                                    isDark={isDark} 
                                    value={formData.buyPrice} 
                                    setValue={val => setFormData({...formData, buyPrice: val})} 
                                />
                                <CurrencyInputProduct 
                                    label="Preço Venda (R$)" 
                                    isDark={isDark} 
                                    value={formData.sellPrice} 
                                    setValue={val => setFormData({...formData, sellPrice: val})} 
                                />
                            </div>

                            <button type="submit" className="btn-primary-refined w-full h-10 mt-6">
                                {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Entity Edit Modal
const EntityEditModal = ({ show, onClose, isDark, type, entity }) => {
    const isClient = type === 'client';
    const isEditing = !!entity.name; 
    const title = isClient ? (isEditing ? 'Editar Cliente' : 'Novo Cliente') : (isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor');
    
    const [nome, setNome] = useState(entity.name);
    const [telefone, setTelefone] = useState(entity.contact);
    const [email, setEmail] = useState(entity.email || '');
    const initialDocType = entity.docType || 'CPF'; 
    const initialDoc = entity.doc || entity.cpf || '';
    const [docType, setDocType] = useState(initialDocType);
    const [doc, setDoc] = useState(initialDoc);

    const docMask = docType === 'CPF' ? maskCPF : maskCNPJ;
    const docPlaceholder = docType === 'CPF' ? '999.999.999-99' : '99.999.999/9999-99';

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`Entidade Salva (${type}):`, { nome, telefone, email, doc, docType });
        onClose();
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-lg card-refined p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
                            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField label="Nome/Razão Social" required isDark={isDark} value={nome} setValue={setNome} />
                            <InputField label="Telefone" placeholder="(99) 99999-9999" mask={maskPhone} isDark={isDark} value={telefone} setValue={setTelefone} />
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Documento</label>
                                <div className="flex items-stretch gap-2">
                                    <select 
                                        value={docType} 
                                        onChange={e => setDocType(e.target.value)} 
                                        className="input-refined w-1/3 flex-none h-10"
                                    >
                                        <option value="CPF">CPF</option>
                                        <option value="CNPJ">CNPJ</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder={docPlaceholder} 
                                        value={doc}
                                        onChange={(e) => setDoc(docMask(e.target.value))}
                                        className="input-refined w-2/3 flex-none h-10" 
                                    />
                                </div>
                            </div>
                            
                            <InputField 
                                label="Email" 
                                placeholder="contato@exemplo.com" 
                                type="email" 
                                isDark={isDark} 
                                value={email} 
                                setValue={setEmail} 
                            />

                            <button type="submit" className="btn-primary-refined w-full h-10 mt-6">
                                {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Cadastros View
const CadastrosView = ({ isDark, products, clients, suppliers }) => {
    const [activeCadastro, setActiveCadastro] = useState('produtos'); 
    const [showProductModal, setShowProductModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showEntityModal, setShowEntityModal] = useState(false);
    const [entityType, setEntityType] = useState(null);
    const [entityToEdit, setEntityToEdit] = useState(null); 

    const CadastroProducts = () => (
        <div className="space-y-4">
            <button 
                onClick={() => { setProductToEdit(null); setShowProductModal(true); }}
                className="btn-primary-refined w-full h-10 flex items-center justify-center gap-2"
            >
                <Plus size={16} strokeWidth={2.5} /> Novo Produto
            </button>

            <h3 className="text-sm font-semibold mt-6 mb-3 text-zinc-400">Produtos Cadastrados ({products.length})</h3>
            {products.map(p => (
                <div key={p.id} className="card-refined p-3 flex items-center gap-3">
                    <div className="w-9 h-9 text-lg bg-zinc-800/50 rounded-lg flex items-center justify-center flex-shrink-0">{p.image}</div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-medium text-sm text-zinc-100 truncate">{p.name}</h3>
                       <p className="text-xs text-zinc-500">Estoque: {p.stock} {p.unit}</p>
                    </div>
                    <button 
                        onClick={() => { setProductToEdit(p); setShowProductModal(true); }}
                        className="btn-ghost-refined h-8 px-3 text-xs flex-shrink-0"
                    >
                        Editar
                    </button>
                </div>
            ))}
        </div>
    );

    const CadastroClients = () => {
        const handleNewClient = () => {
             setEntityType('client'); 
             setEntityToEdit({ name: '', contact: '', cpf: '', docType: 'CPF', email: '' });
             setShowEntityModal(true);
        };

        return (
            <div className="space-y-4">
                <button 
                    onClick={handleNewClient}
                    className="btn-primary-refined w-full h-10 flex items-center justify-center gap-2"
                >
                    <Plus size={16} strokeWidth={2.5} /> Novo Cliente
                </button>

                <h3 className="text-sm font-semibold mt-6 mb-3 text-zinc-400">Clientes Cadastrados ({clients.length})</h3>
                <div className="space-y-2">
                    {clients.map(c => (
                        <div key={c.id} className="card-refined p-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-zinc-100">{c.name}</p>
                                <p className="text-xs text-zinc-500">{c.contact} | {c.cpf || c.doc}</p>
                            </div>
                            <button 
                                onClick={() => { setEntityType('client'); setEntityToEdit(c); setShowEntityModal(true); }}
                                className="btn-ghost-refined h-8 px-3 text-xs"
                            >
                                Editar
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const CadastroSuppliers = () => {
         const handleNewSupplier = () => {
            setEntityType('supplier'); 
            setEntityToEdit({ name: '', contact: '', doc: '', docType: 'CNPJ', email: '' });
            setShowEntityModal(true);
        };

        return (
            <div className="space-y-4">
                <button 
                    onClick={handleNewSupplier}
                    className="btn-primary-refined w-full h-10 flex items-center justify-center gap-2"
                >
                    <Plus size={16} strokeWidth={2.5} /> Novo Fornecedor
                </button>

                <h3 className="text-sm font-semibold mt-6 mb-3 text-zinc-400">Fornecedores Cadastrados ({suppliers.length})</h3>
                <div className="space-y-2">
                    {suppliers.map(s => (
                        <div key={s.id} className="card-refined p-3 flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-zinc-100">{s.name}</p>
                                <p className="text-xs text-zinc-500">{s.contact} | {s.doc}</p>
                            </div>
                            <button 
                                onClick={() => { setEntityType('supplier'); setEntityToEdit(s); setShowEntityModal(true); }}
                                className="btn-ghost-refined h-8 px-3 text-xs"
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
            <div className="flex gap-2 mb-6 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                {[
                    { id: 'produtos', label: 'Produtos', Icon: Package },
                    { id: 'clientes', label: 'Clientes', Icon: Contact },
                    { id: 'fornecedores', label: 'Fornecedores', Icon: Truck },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveCadastro(item.id)}
                        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                            activeCadastro === item.id 
                                ? 'bg-violet-600 text-white' 
                                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                        }`}
                    >
                        <item.Icon size={14} strokeWidth={2} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

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

            <ProductFormModal 
                show={showProductModal}
                onClose={() => setShowProductModal(false)}
                isDark={isDark}
                productToEdit={productToEdit}
                suppliers={suppliers}
            />

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

// Date Range Calendar
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
            <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/5">
                <span className="text-xs font-medium text-zinc-300">
                    {tempStart ? formatDate(tempStart.toISOString()) : 'Início'} 
                </span>
                <ArrowRight size={12} className="inline mx-2 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-300">
                    {tempEnd ? formatDate(tempEnd.toISOString()) : (tempStart ? 'Fim' : 'Fim')}
                </span>
            </div>

            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1.5 rounded-md hover:bg-zinc-800/50 transition-colors">
                    <ChevronLeft size={16} strokeWidth={2} className="text-zinc-400" />
                </button>
                <span className="font-medium text-sm text-zinc-100">{months[currentMonth]} {currentYear}</span>
                <button onClick={handleNextMonth} className="p-1.5 rounded-md hover:bg-zinc-800/50 transition-colors">
                    <ChevronRight size={16} strokeWidth={2} className="text-zinc-400" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {daysOfWeek.map(day => <span key={day} className="font-medium text-zinc-500 py-1">{day}</span>)}
              
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <button
                      onClick={() => handleDayClick(day)}
                      disabled={day > today}
                      className={`w-full h-full rounded-md transition-all text-xs font-medium
                        ${isSelected(day) ? 'bg-violet-600 text-white' : 
                          isInRange(day) ? 'bg-violet-500/20 text-violet-300' : 
                          day > today ? 'text-zinc-600 cursor-not-allowed' :
                          'text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                      {day.getDate()}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleApply}
              disabled={!tempStart}
              className="btn-primary-refined w-full h-9 mt-4"
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
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 p-4 rounded-lg card-refined shadow-2xl z-50 w-80"
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
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700/50 hover:bg-zinc-900/70 transition-all text-xs h-10"
            >
                <Calendar size={14} className="text-violet-400" strokeWidth={2} />
                <span className="font-medium text-zinc-300">
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

const STYLES_MAP = {
    violet: {
        icon: 'text-violet-400',
        gradient: 'from-violet-500 to-purple-600',
        bgStat: 'bg-violet-500/10 border border-violet-500/20',
        textStat: 'text-violet-400',
        textValue: 'text-violet-300',
        bgLight: 'bg-violet-50 border border-violet-100',
        textLight: 'text-violet-700',
    },
    blue: {
        icon: 'text-blue-400',
        gradient: 'from-blue-500 to-indigo-600',
        bgStat: 'bg-blue-500/10 border border-blue-500/20',
        textStat: 'text-blue-400',
        textValue: 'text-blue-300',
        bgLight: 'bg-blue-50 border border-blue-100',
        textLight: 'text-blue-700',
    },
    rose: {
        icon: 'text-rose-400',
        gradient: 'from-rose-500 to-red-600',
        bgStat: 'bg-rose-500/10 border border-rose-500/20',
        textStat: 'text-rose-400',
        textValue: 'text-rose-300',
        bgLight: 'bg-rose-50 border border-rose-100',
        textLight: 'text-rose-700',
    }
};

const ActionButton = ({ icon: Icon, label, color, onClick, isDark }) => {
    const styles = STYLES_MAP[color] || STYLES_MAP.violet;

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="card-refined p-4 flex flex-col items-center justify-center gap-2 w-full group transition-all hover:border-zinc-700/50"
        >
            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${styles.gradient} ${styles.icon}`}>
                <Icon size={18} strokeWidth={2} />
            </div>
            <span className="font-medium text-xs text-zinc-300">{label}</span>
        </motion.button>
    );
};

const TransactionFormModal = ({ show, onClose, type, isDark, products, clients, suppliers }) => {
    const [inputMode, setInputMode] = useState('unit'); 

    let title, color, Icon, buttonText;
    let styles;

    if (type === 'venda') {
        title = 'Nova Venda'; color = 'violet'; Icon = ArrowUpRight; buttonText = 'REGISTRAR VENDA';
    } else if (type === 'compra') {
        title = 'Nova Compra'; color = 'blue'; Icon = ShoppingBag; buttonText = 'REGISTRAR COMPRA';
    } else {
        title = 'Nova Perda'; color = 'rose'; Icon = AlertTriangle; buttonText = 'REGISTRAR PERDA';
    }
    
    styles = STYLES_MAP[color] || STYLES_MAP.violet;

    const CurrencyInput = ({ placeholder, isDisabled, label, inputId }) => {
        const [displayValue, setDisplayValue] = useState('');
        
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
                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">{label}</label>
                <input 
                    type="text" 
                    id={inputId}
                    value={displayValue}
                    onChange={handleInputChange} 
                    placeholder={placeholder}
                    disabled={isDisabled}
                    className="input-refined h-10 text-right font-semibold"
                />
            </div>
        );
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full max-w-sm card-refined p-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-100">
                                <Icon className={styles.icon} size={20} strokeWidth={2} /> {title}
                            </h2>
                            <button 
                                onClick={onClose} 
                                className="text-zinc-400 hover:text-zinc-100 transition-colors"
                            >
                                <X size={18} strokeWidth={2} />
                            </button>
                        </div>
                        
                        {(type === 'venda' || type === 'compra') && (
                            <div className="flex p-0.5 mb-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                                <button 
                                    onClick={() => setInputMode('unit')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                                        inputMode === 'unit' ? `bg-${color}-600 text-white` : 'text-zinc-400 hover:text-zinc-100'
                                    }`}
                                >
                                    Preço Unitário
                                </button>
                                <button 
                                    onClick={() => setInputMode('total')}
                                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                                        inputMode === 'total' ? `bg-${color}-600 text-white` : 'text-zinc-400 hover:text-zinc-100'
                                    }`}
                                >
                                    Preço Total
                                </button>
                            </div>
                        )}

                        <form className="space-y-4">
                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Produto</label>
                                <select className="input-refined h-10">
                                    <option>Selecione...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.image})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Quantidade</label>
                                <input type="number" min="0" placeholder="10" className="input-refined h-10" />
                            </div>

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
                            
                            {type === 'compra' && (
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Fornecedor</label>
                                    <select className="input-refined h-10">
                                        <option>Selecione...</option>
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                             {type === 'perda' && (
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Motivo da Perda</label>
                                    <select className="input-refined h-10">
                                        <option>Estragou (Perecível)</option>
                                        <option>Quebra/Dano</option>
                                        <option>Desconhecido</option>
                                    </select>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="btn-primary-refined w-full h-10 mt-6"
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

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('venda'); 
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [showProfileMenu, setShowProfileMenu] = useState(false); 

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard'); 
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
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
  
  const getBorderColorClass = (color) => {
      if (color === 'violet') return 'border-violet-500';
      if (color === 'blue') return 'border-blue-500';
      if (color === 'rose') return 'border-rose-500';
      return 'border-zinc-500'; 
  };
  
  const violetStyles = STYLES_MAP.violet;
  const blueStyles = STYLES_MAP.blue;
  const roseStyles = STYLES_MAP.rose;

  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen max-h-screen overflow-hidden transition-colors duration-300 pb-20 md:pb-0 md:pl-20 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-zinc-800 light'}`}>
      
      {/* Sidebar/Nav */}
      <nav className="fixed z-40 transition-all duration-300 md:top-0 md:left-0 md:h-full md:w-20 md:flex-col md:border-r bottom-0 left-0 w-full flex justify-around items-center p-2 bg-zinc-900/80 border-zinc-800/50 backdrop-blur-xl border-t md:border-t-0">
        <div className="hidden md:flex flex-col items-center mt-6 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
        </div>
        {[
          { id: 'dashboard', icon: LayoutGrid, label: 'Início' },
          { id: 'estoque', icon: Package, label: 'Estoque' },
          { id: 'pdv', icon: CreditCard, label: 'PDV' },
          { id: 'cadastros', icon: Users, label: 'Cadastros' }, 
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => {setActiveTab(item.id); setSelectedProduct(null)}} 
            className={`relative p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === item.id 
                ? 'text-white bg-violet-600' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
            }`}
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-[9px] font-medium hidden md:block">{item.label}</span>
          </button>
        ))}
        <div className="hidden md:flex flex-col items-center mt-auto mb-6">
           <button 
             onClick={() => setIsDark(!isDark)} 
             className="p-3 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
           >
             {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
           </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className={`mx-auto p-4 md:p-6 pt-6 ${activeTab === 'pdv' ? 'max-w-full' : 'max-w-5xl'}`}>
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
              {activeTab === 'dashboard' ? 'Visão Geral' : activeTab === 'pdv' ? 'Ponto de Venda' : activeTab === 'estoque' ? (selectedProduct ? `Análise: ${selectedProduct.name}` : 'Gestão de Produtos') : 'Cadastros'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              {activeTab === 'cadastros' ? 'Gerenciamento de entidades' : activeTab === 'pdv' ? 'Sistema de vendas rápido' : 'Dados do período selecionado'}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto">
             {(activeTab === 'dashboard' || activeTab === 'estoque') && (
                <DateFilterButton dateRange={dateRange} setDateRange={setDateRange} isDark={isDark} />
             )}
             
             <div className="flex gap-2">
               <button onClick={() => setIsDark(!isDark)} className="md:hidden p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/50 hover:bg-zinc-900/70 transition-colors">
                  {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
               </button>
               
               <div className="relative profile-menu-container"> 
                 <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-9 h-9 rounded-lg bg-zinc-800/50 overflow-hidden border border-zinc-700/50 cursor-pointer hover:border-zinc-600/50 transition-colors"
                 >
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juruba" alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 
                 <AnimatePresence>
                    {showProfileMenu && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-36 rounded-lg card-refined p-1 z-50"
                        >
                            <button 
                                onClick={handleLogout}
                                className="w-full px-3 py-2 text-xs text-left text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors flex items-center gap-2 font-medium"
                            >
                                <LogOut size={14} strokeWidth={2} className="transform rotate-180"/> Sair
                            </button>
                        </motion.div>
                    )}
                 </AnimatePresence>
               </div>
             </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && !selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              <ActionButton 
                icon={TrendingUp} label="Venda" color="violet" isDark={isDark}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-5 rounded-xl ${isDark ? violetStyles.bgStat : violetStyles.bgLight}`}>
                <div className={`flex items-center gap-2 mb-2 ${violetStyles.textStat}`}>
                  <TrendingUp size={16} strokeWidth={2} /> 
                  <span className="text-xs font-semibold uppercase tracking-wider">Entradas</span>
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? violetStyles.textValue : violetStyles.textLight}`}>{money(dashboardStats.entradas)}</h3>
              </div>
              
              <div className={`p-5 rounded-xl ${isDark ? blueStyles.bgStat : blueStyles.bgLight}`}>
                <div className={`flex items-center gap-2 mb-2 ${blueStyles.textStat}`}>
                  <ShoppingBag size={16} strokeWidth={2} /> 
                  <span className="text-xs font-semibold uppercase tracking-wider">Saídas</span>
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? blueStyles.textValue : blueStyles.textLight}`}>{money(dashboardStats.saidas)}</h3>
              </div>

              <div className="card-refined p-5">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <Wallet size={16} strokeWidth={2} /> 
                  <span className="text-xs font-semibold uppercase tracking-wider">Resultado</span>
                </div>
                <h3 className={`text-2xl font-bold ${dashboardStats.saldo >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                  {dashboardStats.saldo >= 0 ? '+' : ''}{money(dashboardStats.saldo)}
                </h3>
                {dashboardStats.perdas > 0 && (
                  <p className="text-xs text-rose-400 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle size={10} strokeWidth={2}/> Perdas: {money(dashboardStats.perdas)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 text-zinc-400">Extrato ({filteredTransactions.length} Lançamentos)</h3>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Nenhuma movimentação nestas datas.</div>
              ) : (
                filteredTransactions.slice(0, 5).map(t => (
                  <div key={t.id} className="card-refined p-3 mb-2 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.type === 'venda' ? 'bg-violet-500/10 text-violet-400' : t.type === 'compra' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'venda' ? <ArrowUpRight size={14} strokeWidth={2} /> : t.type === 'compra' ? <ShoppingBag size={14} strokeWidth={2} /> : <ArrowDownRight size={14} strokeWidth={2} />}
                      </div>
                      <div>
                        <p className="font-medium text-xs text-zinc-100">{t.product}</p>
                        <p className="text-[10px] text-zinc-500">{formatDate(t.date)} • {t.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`font-semibold text-sm ${t.type === 'venda' ? 'text-violet-400' : 'text-zinc-300'}`}>
                         {money(t.total)}
                       </p>
                       <p className={`text-[10px] ${t.type === 'perda' ? 'text-rose-400' : 'text-zinc-500'}`}>{t.qtd} un</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Estoque View */}
        {activeTab === 'estoque' && (
          <AnimatePresence mode="wait">
            {!selectedProduct ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <div className="grid gap-2">
                    {products.map(p => {
                       const stats = getProductStats(p.id);
                       return (
                         <div 
                           key={p.id} 
                           onClick={() => setSelectedProduct(p)}
                           className="card-refined p-3 flex items-center gap-3 cursor-pointer glow-violet-subtle"
                         >
                            <div className="w-10 h-10 text-xl bg-zinc-800/50 rounded-lg flex items-center justify-center flex-shrink-0">{p.image}</div>
                            <div className="flex-1 min-w-0">
                               <h3 className="font-medium text-sm text-zinc-100 truncate">{p.name}</h3>
                               <p className="text-xs text-zinc-500">Estoque: {p.stock} {p.unit}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                               <p className="text-[9px] uppercase font-semibold text-zinc-500">Resultado</p>
                               <span className={`text-xs font-semibold ${stats.result >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                                 {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                               </span>
                            </div>
                            <ChevronLeft size={16} strokeWidth={2} className="rotate-180 text-zinc-500" />
                         </div>
                       )
                    })}
                 </div>
              </motion.div>
            ) : (
              <motion.div key="detail" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
                <button onClick={() => setSelectedProduct(null)} className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 mb-6 transition-colors">
                  <ChevronLeft size={14} strokeWidth={2} /> Voltar
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl">{selectedProduct.image}</div>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-100">{selectedProduct.name}</h2>
                    <p className="text-zinc-500 text-xs">Análise de {formatDate(dateRange.start)} até {formatDate(dateRange.end)}</p>
                  </div>
                </div>

                {(() => {
                   const stats = getProductStats(selectedProduct.id);
                   return (
                     <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <div className="card-refined p-4">
                          <p className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">Vendas</p>
                          <p className="text-lg font-bold text-violet-400">{money(stats.sold)}</p>
                          <p className="text-xs text-zinc-500">{stats.soldQtd} {selectedProduct.unit}</p>
                        </div>
                        <div className="card-refined p-4">
                          <p className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">Compras</p>
                          <p className="text-lg font-bold text-blue-400">{money(stats.bought)}</p>
                          <p className="text-xs text-zinc-500">{stats.boughtQtd} {selectedProduct.unit}</p>
                        </div>
                        <div className="card-refined p-4">
                          <p className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">Perdas</p>
                          <p className="text-lg font-bold text-rose-400">{money(stats.lost)}</p>
                          <p className="text-xs text-zinc-500">{stats.lostQtd} {selectedProduct.unit}</p>
                        </div>
                        <div className="card-refined p-4 relative overflow-hidden">
                          <p className="text-[10px] uppercase font-semibold text-zinc-500 mb-1">Resultado</p>
                          <p className={`text-lg font-bold ${stats.result >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                            {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                          </p>
                          <p className="text-xs text-zinc-500">Líquido</p>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm mb-3 text-zinc-400">Histórico</h3>
                      <div className="space-y-2">
                        {stats.history.length === 0 && <p className="text-zinc-500 text-xs">Sem dados neste período.</p>}
                        {stats.history.map(h => {
                            let typeColor, typeLabel, typeIcon;
                            if (h.type === 'venda') {
                                typeColor = 'violet'; typeLabel = 'VENDA'; typeIcon = DollarSign;
                            } else if (h.type === 'compra') {
                                typeColor = 'blue'; typeLabel = 'COMPRA'; typeIcon = ShoppingBag;
                            } else {
                                typeColor = 'rose'; typeLabel = 'PERDA'; typeIcon = AlertTriangle;
                            }

                            const dynamicBorderClass = getBorderColorClass(typeColor);

                            return (
                                <motion.div 
                                    key={h.id} 
                                    whileHover={{ x: 3 }} 
                                    className={`flex justify-between items-center p-3 rounded-lg text-xs card-refined border-l-2 ${dynamicBorderClass}`} 
                                >
                                    <div className="flex items-center gap-2">
                                        <typeIcon className={`text-${typeColor}-400`} size={14} strokeWidth={2} /> 
                                        <div>
                                            <p className="font-medium text-zinc-100">{typeLabel}</p>
                                            <p className="text-[10px] text-zinc-500">{formatDate(h.date)} ({h.qtd} un)</p>
                                        </div>
                                    </div>
                                    
                                    <span className={`font-semibold text-sm text-${typeColor}-400`}>
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

        {/* Cadastros View */}
        {activeTab === 'cadastros' && (
            <CadastrosView 
                isDark={isDark} 
                products={products}
                clients={clients}
                suppliers={suppliers}
            />
        )}

        {/* PDV View */}
        {activeTab === 'pdv' && (
            <PDVView 
                isDark={isDark} 
                products={products}
                clients={clients}
                suppliers={suppliers}
            />
        )}

      </main>

      {/* Transaction Modal */}
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
