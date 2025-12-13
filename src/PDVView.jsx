import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, X, Plus, Minus, Trash2, CreditCard, Banknote, 
    QrCode, User, Check, AlertCircle, ShoppingCart
} from 'lucide-react';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Formas de pagamento disponíveis
const PAYMENT_METHODS = [
    { id: 'dinheiro', name: 'Dinheiro', icon: Banknote, color: 'emerald' },
    { id: 'credito', name: 'Crédito', icon: CreditCard, color: 'blue' },
    { id: 'debito', name: 'Débito', icon: CreditCard, color: 'violet' },
    { id: 'pix', name: 'PIX', icon: QrCode, color: 'cyan' },
];

const PDVView = ({ isDark, products, clients, suppliers, onClientCreated }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentValue, setPaymentValue] = useState('');
    const [changeAmount, setChangeAmount] = useState(0);

    // Filtrar produtos com estoque disponível
    const availableProducts = useMemo(() => {
        return products.filter(p => p.stock > 0).filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            suppliers.find(s => s.id === p.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, suppliers, searchTerm]);

    // Calcular totais do carrinho
    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, itemCount };
    }, [cart]);

    // Funções do carrinho
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ));
            }
        } else {
            setCart([...cart, {
                id: product.id,
                name: product.name,
                image: product.image,
                price: product.sellPrice,
                quantity: 1,
                unit: product.unit,
                maxStock: product.stock,
                supplierId: product.supplierId
            }]);
        }
    };

    const decreaseQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        if (item.quantity === 1) {
            setCart(cart.filter(i => i.id !== productId));
        } else {
            setCart(cart.map(i => 
                i.id === productId 
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            ));
        }
    };

    const increaseQuantity = (productId) => {
        setCart(cart.map(i => {
            if (i.id === productId && i.quantity < i.maxStock) {
                return { ...i, quantity: i.quantity + 1 };
            }
            return i;
        }));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(i => i.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setSelectedClient(null);
        setSelectedPaymentMethod(null);
        setPaymentValue('');
        setChangeAmount(0);
    };

    const calculateChange = (value) => {
        const numValue = parseFloat(value) || 0;
        setPaymentValue(value);
        
        if (selectedPaymentMethod?.id === 'dinheiro') {
            setChangeAmount(Math.max(0, numValue - cartTotals.subtotal));
        } else {
            setChangeAmount(0);
        }
    };

    const finalizeSale = () => {
        if (cart.length === 0) return;
        if (!selectedPaymentMethod) return;
        
        console.log('Venda finalizada:', {
            client: selectedClient,
            items: cart,
            paymentMethod: selectedPaymentMethod.id,
            total: cartTotals.subtotal,
            paymentValue: parseFloat(paymentValue) || cartTotals.subtotal,
            change: changeAmount
        });

        alert('Venda finalizada com sucesso!');
        clearCart();
        setShowPaymentModal(false);
    };

    const getSupplierName = (supplierId) => {
        return suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] overflow-hidden">
            {/* LADO ESQUERDO - PRODUTOS */}
            <div className="flex-1 flex flex-col lg:mr-4 h-1/2 lg:h-full">
                {/* Barra de Busca */}
                <div className="relative mb-4 px-1 py-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar produtos ou fornecedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-2 focus:ring-2 outline-none transition-all text-base md:text-lg
                            ${isDark 
                                ? 'bg-zinc-900 border-zinc-700 text-white focus:ring-emerald-500' 
                                : 'bg-white border-gray-200 text-zinc-800 focus:ring-emerald-500'
                            }`}
                    />
                </div>

                {/* Grid de Produtos */}
                <div className="flex-1 overflow-y-auto overflow-x-visible grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-2 md:gap-3 content-start pb-4 lg:pb-0 pl-1 pr-3 py-3">
                    {availableProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500">
                            <Search size={48} className="mb-4 opacity-30" />
                            <p className="text-lg font-bold mb-1">Nenhum produto encontrado</p>
                            <p className="text-sm">Tente buscar por outro termo</p>
                        </div>
                    ) : (
                        availableProducts.map(product => {
                        const supplier = suppliers.find(s => s.id === product.supplierId);
                        const inCart = cart.find(item => item.id === product.id);
                        
                        return (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addToCart(product)}
                                className={`relative aspect-square p-2 md:p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col
                                    ${inCart 
                                        ? 'border-emerald-500 bg-emerald-500/10' 
                                        : isDark 
                                            ? 'border-zinc-700 bg-zinc-800 hover:border-zinc-600' 
                                            : 'border-gray-200 bg-white hover:border-emerald-300'
                                    }`}
                                style={{ zIndex: inCart ? 5 : 1 }}
                            >
                                {inCart && (
                                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-7 md:h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] md:text-xs font-bold shadow-lg z-10">
                                        {inCart.quantity}
                                    </div>
                                )}

                                <div className="text-2xl md:text-3xl mb-1 text-center flex-shrink-0">{product.image}</div>
                                
                                <h3 className={`font-bold text-[10px] md:text-xs mb-1 text-center line-clamp-2 flex-shrink-0 ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                                    {product.name}
                                </h3>

                                <p className="hidden sm:block text-[9px] md:text-[10px] text-zinc-500 mb-auto text-center truncate" title={supplier?.name}>
                                    {supplier?.name}
                                </p>

                                <div className="flex flex-col gap-0.5 md:gap-1 mt-auto pt-1 md:pt-2 border-t border-zinc-700">
                                    <span className="text-emerald-500 font-bold text-[10px] md:text-xs text-center">
                                        {money(product.sellPrice)}
                                    </span>
                                    <span className="text-[8px] md:text-[10px] text-zinc-500 text-center">
                                        {product.stock} {product.unit}
                                    </span>
                                </div>
                            </motion.div>
                        );
                        })
                    )}
                </div>
            </div>

            {/* LADO DIREITO - CARRINHO COM LARGURA FIXA RESPONSIVA */}
            <div 
                className={`
                    w-full lg:w-96
                    h-1/2 lg:h-full
                    flex flex-col rounded-t-3xl lg:rounded-2xl border-2 p-4 lg:p-6 
                    ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-gray-200'}
                    shadow-2xl lg:shadow-none
                    overflow-hidden
                    flex-shrink-0
                `}
            >
                {/* Cliente Selecionado */}
                <div className="mb-4 lg:mb-6 flex-shrink-0">
                    <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                        Cliente (Opcional)
                    </label>
                    <button
                        onClick={() => setShowClientModal(true)}
                        className={`w-full p-2 lg:p-3 rounded-lg border-2 border-dashed flex items-center gap-2 transition-all text-sm
                            ${selectedClient 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : isDark 
                                    ? 'border-zinc-700 hover:border-zinc-600' 
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                    >
                        <User size={16} className="text-zinc-500" />
                        <span className={selectedClient ? 'text-emerald-500 font-bold' : 'text-zinc-500'}>
                            {selectedClient ? selectedClient.name : 'Selecionar Cliente'}
                        </span>
                    </button>
                </div>

                {/* Lista de Itens do Carrinho */}
                <div className="flex-1 mb-4 min-h-0" style={{ overflowY: cart.length > 0 ? 'auto' : 'hidden' }}>
                    <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">
                        Itens ({cartTotals.itemCount})
                    </h3>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <ShoppingCart size={36} className="mb-2 opacity-30" />
                            <p className="text-xs lg:text-sm">Carrinho vazio</p>
                        </div>
                    ) : (
                        <div className="space-y-2 lg:space-y-3">
                            {cart.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`p-2 lg:p-3 rounded-lg border ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1 lg:gap-2 mb-1">
                                                <span className="text-base lg:text-lg">{item.image}</span>
                                                <h4 className="font-bold text-xs lg:text-sm">{item.name}</h4>
                                            </div>
                                            <p className="text-[10px] lg:text-xs text-zinc-500">
                                                {getSupplierName(item.supplierId)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-rose-500 hover:bg-rose-500/10 p-1 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 lg:gap-2">
                                            <button
                                                onClick={() => decreaseQuantity(item.id)}
                                                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-white"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => increaseQuantity(item.id)}
                                                disabled={item.quantity >= item.maxStock}
                                                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center text-white
                                                    ${item.quantity >= item.maxStock 
                                                        ? 'bg-zinc-700/50 cursor-not-allowed' 
                                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                                    }`}
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] lg:text-xs text-zinc-500">{money(item.price)}/un</p>
                                            <p className="text-base lg:text-lg font-bold text-emerald-500">
                                                {money(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Total e Ações */}
                <div className="border-t-2 border-zinc-700 pt-3 lg:pt-4 space-y-3 lg:space-y-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="text-base lg:text-lg font-bold uppercase tracking-wider">Total</span>
                        <span className="text-2xl lg:text-3xl font-bold text-emerald-500">
                            {money(cartTotals.subtotal)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 lg:gap-3">
                        <button
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-bold border-2 border-rose-500 text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                        >
                            Pagar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE SELEÇÃO DE CLIENTE */}
            <AnimatePresence>
                {showClientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Selecionar Cliente</h2>
                                <button
                                    onClick={() => setShowClientModal(false)}
                                    className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {/* Botão Criar Novo Cliente */}
                                <button
                                    onClick={() => {
                                        setShowClientModal(false);
                                        setShowCreateClientModal(true);
                                    }}
                                    className={`w-full p-4 rounded-xl text-left border-2 border-dashed transition-all flex items-center gap-3
                                        ${isDark 
                                            ? 'border-emerald-600 hover:border-emerald-500 hover:bg-emerald-500/10' 
                                            : 'border-emerald-500 hover:border-emerald-600 hover:bg-emerald-50'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Plus size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-500">Criar Novo Cliente</p>
                                        <p className="text-sm text-zinc-500">Cadastrar um novo cliente</p>
                                    </div>
                                </button>

                                <div className="border-t-2 border-zinc-700 my-3"></div>

                                {/* Opção Sem Cliente */}
                                <button
                                    onClick={() => {
                                        setSelectedClient(null);
                                        setShowClientModal(false);
                                    }}
                                    className={`w-full p-4 rounded-xl text-left border-2 transition-all
                                        ${selectedClient === null 
                                            ? 'border-emerald-500 bg-emerald-500/10' 
                                            : isDark 
                                                ? 'border-zinc-700 hover:border-zinc-600' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <p className="font-bold">Sem Cliente (Venda Rápida)</p>
                                    <p className="text-sm text-zinc-500">Não vincular a um cliente</p>
                                </button>

                                {clients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setShowClientModal(false);
                                        }}
                                        className={`w-full p-4 rounded-xl text-left border-2 transition-all
                                            ${selectedClient?.id === client.id 
                                                ? 'border-emerald-500 bg-emerald-500/10' 
                                                : isDark 
                                                    ? 'border-zinc-700 hover:border-zinc-600' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <p className="font-bold">{client.name}</p>
                                        <p className="text-sm text-zinc-500">{client.contact}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE PAGAMENTO */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Finalizar Pagamento</h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                                <p className="text-sm text-zinc-500 mb-1">Total a Pagar</p>
                                <p className="text-3xl font-bold text-emerald-500">
                                    {money(cartTotals.subtotal)}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 block">
                                    Forma de Pagamento
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {PAYMENT_METHODS.map(method => {
                                        const Icon = method.icon;
                                        const isSelected = selectedPaymentMethod?.id === method.id;
                                        
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => {
                                                    setSelectedPaymentMethod(method);
                                                    if (method.id !== 'dinheiro') {
                                                        setPaymentValue(cartTotals.subtotal.toFixed(2));
                                                        setChangeAmount(0);
                                                    }
                                                }}
                                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                                    ${isSelected 
                                                        ? `border-${method.color}-500 bg-${method.color}-500/10` 
                                                        : isDark 
                                                            ? 'border-zinc-700 hover:border-zinc-600' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Icon size={24} className={isSelected ? `text-${method.color}-500` : 'text-zinc-500'} />
                                                <span className="text-sm font-bold">{method.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedPaymentMethod?.id === 'dinheiro' && (
                                <div className="mb-6">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Valor Recebido
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={paymentValue}
                                        onChange={(e) => calculateChange(e.target.value)}
                                        className={`w-full p-4 rounded-xl border-2 text-2xl font-bold text-right
                                            ${isDark 
                                                ? 'bg-zinc-800 border-zinc-700 text-white' 
                                                : 'bg-gray-50 border-gray-200 text-zinc-800'
                                            }`}
                                    />
                                    
                                    {changeAmount > 0 && (
                                        <div className="mt-3 p-3 bg-emerald-500/10 border-2 border-emerald-500 rounded-lg">
                                            <p className="text-xs text-zinc-500 mb-1">Troco</p>
                                            <p className="text-2xl font-bold text-emerald-500">
                                                {money(changeAmount)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={finalizeSale}
                                disabled={!selectedPaymentMethod || (selectedPaymentMethod.id === 'dinheiro' && parseFloat(paymentValue) < cartTotals.subtotal)}
                                className="w-full py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                Confirmar Venda
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE CRIAÇÃO DE CLIENTE */}
            <AnimatePresence>
                {showCreateClientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-lg p-6 rounded-3xl ${isDark ? 'bg-zinc-900 text-white' : 'bg-white'} shadow-2xl`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Novo Cliente</h2>
                                <button
                                    onClick={() => setShowCreateClientModal(false)}
                                    className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                // Aqui você salvaria o cliente
                                console.log('Cliente criado!');
                                setShowCreateClientModal(false);
                                setShowClientModal(true);
                            }}>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Nome <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors
                                            ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300'}
                                            focus:ring-emerald-500`}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="(99) 99999-9999"
                                        className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors
                                            ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300'}
                                            focus:ring-emerald-500`}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="cliente@exemplo.com"
                                        className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors
                                            ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300'}
                                            focus:ring-emerald-500`}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        CPF/CNPJ
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="999.999.999-99"
                                        className={`w-full p-3 rounded-lg border focus:ring-2 outline-none transition-colors
                                            ${isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-gray-50 border-gray-300'}
                                            focus:ring-emerald-500`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 mt-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
                                >
                                    Cadastrar Cliente
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PDVView;
