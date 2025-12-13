import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, X, Plus, Minus, Trash2, CreditCard, Banknote, 
    QrCode, User, Check, ShoppingCart
} from 'lucide-react';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_METHODS = [
    { id: 'dinheiro', name: 'Dinheiro', icon: Banknote },
    { id: 'credito', name: 'Crédito', icon: CreditCard },
    { id: 'debito', name: 'Débito', icon: CreditCard },
    { id: 'pix', name: 'PIX', icon: QrCode },
];

const PDVView = ({ isDark, products, clients, suppliers }) => {
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showCreateClientModal, setShowCreateClientModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [paymentValue, setPaymentValue] = useState('');
    const [changeAmount, setChangeAmount] = useState(0);

    const availableProducts = useMemo(() => {
        return products.filter(p => p.stock > 0).filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            suppliers.find(s => s.id === p.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, suppliers, searchTerm]);

    const cartTotals = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, itemCount };
    }, [cart]);

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                setCart(cart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            }
        } else {
            setCart([...cart, {
                id: product.id, name: product.name, image: product.image,
                price: product.sellPrice, quantity: 1, unit: product.unit,
                maxStock: product.stock, supplierId: product.supplierId
            }]);
        }
    };

    const decreaseQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        if (item.quantity === 1) {
            setCart(cart.filter(i => i.id !== productId));
        } else {
            setCart(cart.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i));
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

    const removeFromCart = (productId) => setCart(cart.filter(i => i.id !== productId));

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
        if (cart.length === 0 || !selectedPaymentMethod) return;
        console.log('Venda finalizada:', {
            client: selectedClient, items: cart, paymentMethod: selectedPaymentMethod.id,
            total: cartTotals.subtotal, paymentValue: parseFloat(paymentValue) || cartTotals.subtotal,
            change: changeAmount
        });
        alert('Venda finalizada com sucesso!');
        clearCart();
        setShowPaymentModal(false);
    };

    const getSupplierName = (supplierId) => suppliers.find(s => s.id === supplierId)?.name || 'Desconhecido';

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] overflow-hidden gap-4">
            {/* LADO ESQUERDO - PRODUTOS */}
            <div className="flex-1 flex flex-col h-1/2 lg:h-full">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" size={16} strokeWidth={2} />
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-refined pl-10 h-10"
                    />
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 content-start pb-4">
                    {availableProducts.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500">
                            <Search size={32} className="mb-3 opacity-30" strokeWidth={1.5} />
                            <p className="text-sm font-medium">Nenhum produto encontrado</p>
                        </div>
                    ) : (
                        availableProducts.map(product => {
                            const supplier = suppliers.find(s => s.id === product.supplierId);
                            const inCart = cart.find(item => item.id === product.id);
                            
                            return (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    className={`relative aspect-square p-2 rounded-lg border cursor-pointer transition-all flex flex-col
                                        ${inCart 
                                            ? 'border-violet-500/50 bg-violet-500/5' 
                                            : 'border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/50 hover:bg-zinc-900/60'
                                        }`}
                                >
                                    {inCart && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shadow-lg">
                                            {inCart.quantity}
                                        </div>
                                    )}

                                    <div className="text-xl mb-1 text-center flex-shrink-0">{product.image}</div>
                                    
                                    <h3 className="font-medium text-[10px] mb-1 text-center line-clamp-2 flex-shrink-0 text-zinc-100">
                                        {product.name}
                                    </h3>

                                    <p className="hidden sm:block text-[9px] text-zinc-500 mb-auto text-center truncate" title={supplier?.name}>
                                        {supplier?.name}
                                    </p>

                                    <div className="flex flex-col gap-0.5 mt-auto pt-1 border-t border-zinc-800/50">
                                        <span className="text-violet-400 font-semibold text-[10px] text-center">
                                            {money(product.sellPrice)}
                                        </span>
                                        <span className="text-[8px] text-zinc-500 text-center">
                                            {product.stock} {product.unit}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* LADO DIREITO - CARRINHO */}
            <div className="w-full lg:w-80 h-1/2 lg:h-full flex flex-col card-refined p-4 overflow-hidden flex-shrink-0">
                <div className="mb-4 flex-shrink-0">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                        Cliente (Opcional)
                    </label>
                    <button
                        onClick={() => setShowClientModal(true)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2
                            ${selectedClient 
                                ? 'border-violet-500/50 bg-violet-500/5 text-violet-400' 
                                : 'border-zinc-800/50 hover:border-zinc-700/50 text-zinc-500'
                            }`}
                    >
                        <User size={14} strokeWidth={2} />
                        <span className="text-xs font-medium">{selectedClient ? selectedClient.name : 'Selecionar'}</span>
                    </button>
                </div>

                <div className="flex-1 mb-4 min-h-0 overflow-y-auto scrollbar-thin">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                        Itens ({cartTotals.itemCount})
                    </h3>

                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <ShoppingCart size={28} className="mb-2 opacity-20" strokeWidth={1.5} />
                            <p className="text-xs">Carrinho vazio</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {cart.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="p-2 rounded-lg border border-zinc-800/50 bg-zinc-900/40"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-sm">{item.image}</span>
                                                <h4 className="font-medium text-xs text-zinc-100">{item.name}</h4>
                                            </div>
                                            <p className="text-[10px] text-zinc-500">
                                                {getSupplierName(item.supplierId)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-rose-400 hover:text-rose-300 transition-colors"
                                        >
                                            <Trash2 size={12} strokeWidth={2} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => decreaseQuantity(item.id)}
                                                className="w-6 h-6 rounded-md bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center text-zinc-300 transition-colors"
                                            >
                                                <Minus size={10} strokeWidth={2.5} />
                                            </button>
                                            <span className="w-6 text-center font-semibold text-xs text-zinc-100">{item.quantity}</span>
                                            <button
                                                onClick={() => increaseQuantity(item.id)}
                                                disabled={item.quantity >= item.maxStock}
                                                className={`w-6 h-6 rounded-md flex items-center justify-center text-white transition-colors
                                                    ${item.quantity >= item.maxStock 
                                                        ? 'bg-zinc-800/30 cursor-not-allowed opacity-50' 
                                                        : 'bg-violet-600 hover:bg-violet-500'
                                                    }`}
                                            >
                                                <Plus size={10} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-500">{money(item.price)}/un</p>
                                            <p className="text-sm font-semibold text-violet-400">
                                                {money(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-zinc-800/50 pt-3 space-y-3 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Total</span>
                        <span className="text-2xl font-bold text-violet-400">
                            {money(cartTotals.subtotal)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={clearCart}
                            disabled={cart.length === 0}
                            className="btn-secondary-refined h-9 text-xs"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={cart.length === 0}
                            className="btn-primary-refined h-9 text-xs"
                        >
                            Pagar
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE SELEÇÃO DE CLIENTE */}
            <AnimatePresence>
                {showClientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md card-refined p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-zinc-100">Selecionar Cliente</h2>
                                <button
                                    onClick={() => setShowClientModal(false)}
                                    className="text-zinc-400 hover:text-zinc-100 transition-colors"
                                >
                                    <X size={18} strokeWidth={2} />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                                <button
                                    onClick={() => {
                                        setShowClientModal(false);
                                        setShowCreateClientModal(true);
                                    }}
                                    className="w-full p-3 rounded-lg border border-dashed border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all flex items-center gap-3 text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                        <Plus size={14} className="text-violet-400" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-violet-400">Novo Cliente</p>
                                        <p className="text-xs text-zinc-500">Cadastrar cliente</p>
                                    </div>
                                </button>

                                <div className="separator-refined my-3"></div>

                                <button
                                    onClick={() => {
                                        setSelectedClient(null);
                                        setShowClientModal(false);
                                    }}
                                    className={`w-full p-3 rounded-lg border transition-all text-left
                                        ${selectedClient === null 
                                            ? 'border-violet-500/50 bg-violet-500/5' 
                                            : 'border-zinc-800/50 hover:border-zinc-700/50'
                                        }`}
                                >
                                    <p className="font-medium text-sm text-zinc-100">Sem Cliente</p>
                                    <p className="text-xs text-zinc-500">Venda rápida</p>
                                </button>

                                {clients.map(client => (
                                    <button
                                        key={client.id}
                                        onClick={() => {
                                            setSelectedClient(client);
                                            setShowClientModal(false);
                                        }}
                                        className={`w-full p-3 rounded-lg border transition-all text-left
                                            ${selectedClient?.id === client.id 
                                                ? 'border-violet-500/50 bg-violet-500/5' 
                                                : 'border-zinc-800/50 hover:border-zinc-700/50'
                                            }`}
                                    >
                                        <p className="font-medium text-sm text-zinc-100">{client.name}</p>
                                        <p className="text-xs text-zinc-500">{client.contact}</p>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-md card-refined p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-zinc-100">Finalizar Pagamento</h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-zinc-400 hover:text-zinc-100 transition-colors"
                                >
                                    <X size={18} strokeWidth={2} />
                                </button>
                            </div>

                            <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-6">
                                <p className="text-xs text-zinc-500 mb-1">Total a Pagar</p>
                                <p className="text-3xl font-bold text-violet-400">
                                    {money(cartTotals.subtotal)}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">
                                    Forma de Pagamento
                                </label>
                                <div className="grid grid-cols-2 gap-2">
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
                                                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2
                                                    ${isSelected 
                                                        ? 'border-violet-500/50 bg-violet-500/5' 
                                                        : 'border-zinc-800/50 hover:border-zinc-700/50'
                                                    }`}
                                            >
                                                <Icon size={20} strokeWidth={2} className={isSelected ? 'text-violet-400' : 'text-zinc-500'} />
                                                <span className="text-xs font-medium text-zinc-100">{method.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedPaymentMethod?.id === 'dinheiro' && (
                                <div className="mb-6">
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Valor Recebido
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={paymentValue}
                                        onChange={(e) => calculateChange(e.target.value)}
                                        className="input-refined text-right text-lg font-semibold h-12"
                                    />
                                    
                                    {changeAmount > 0 && (
                                        <div className="mt-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
                                            <p className="text-xs text-zinc-500 mb-1">Troco</p>
                                            <p className="text-xl font-bold text-violet-400">
                                                {money(changeAmount)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={finalizeSale}
                                disabled={!selectedPaymentMethod || (selectedPaymentMethod.id === 'dinheiro' && parseFloat(paymentValue) < cartTotals.subtotal)}
                                className="btn-primary-refined w-full h-11 flex items-center justify-center gap-2"
                            >
                                <Check size={16} strokeWidth={2.5} />
                                <span>Confirmar Venda</span>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL DE CRIAÇÃO DE CLIENTE */}
            <AnimatePresence>
                {showCreateClientModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-lg card-refined p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-zinc-100">Novo Cliente</h2>
                                <button
                                    onClick={() => setShowCreateClientModal(false)}
                                    className="text-zinc-400 hover:text-zinc-100 transition-colors"
                                >
                                    <X size={18} strokeWidth={2} />
                                </button>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                console.log('Cliente criado!');
                                setShowCreateClientModal(false);
                                setShowClientModal(true);
                            }}>
                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Nome <span className="text-rose-400">*</span>
                                    </label>
                                    <input type="text" required className="input-refined h-10" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Telefone
                                    </label>
                                    <input type="tel" placeholder="(00) 00000-0000" className="input-refined h-10" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        Email
                                    </label>
                                    <input type="email" placeholder="cliente@exemplo.com" className="input-refined h-10" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">
                                        CPF/CNPJ
                                    </label>
                                    <input type="text" placeholder="000.000.000-00" className="input-refined h-10" />
                                </div>

                                <button type="submit" className="btn-primary-refined w-full h-10 mt-6">
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
