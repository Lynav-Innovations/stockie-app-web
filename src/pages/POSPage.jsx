import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, X, Plus, Minus, Trash2, CreditCard, Banknote, 
    QrCode, User, Check, ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const money = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAYMENT_METHODS = [
    { id: 'dinheiro', name: 'Dinheiro', icon: Banknote },
    { id: 'credito', name: 'Crédito', icon: CreditCard },
    { id: 'debito', name: 'Débito', icon: CreditCard },
    { id: 'pix', name: 'PIX', icon: QrCode },
];

export const POSPage = ({ isDark, products, clients, suppliers }) => {
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
        <>
            <div className="h-[calc(100vh-8rem)] flex gap-4">
                {/* LEFT PANEL - PRODUCTS */}
                <div className="flex-[2] flex flex-col min-w-0">
                    <div className="relative mb-4 flex-shrink-0">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 pb-4 px-1 py-2">
                            {availableProducts.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
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
                                            className={inCart ? 'relative z-20' : 'relative z-0'}
                                        >
                                            <div 
                                                className={`relative aspect-square p-2 cursor-pointer transition-all rounded-lg border shadow-sm ${
                                                    inCart 
                                                        ? 'border-violet-500 bg-violet-500/5' 
                                                        : 'border-border bg-card hover:bg-accent hover:border-accent-foreground/20'
                                                }`}
                                            >
                                                <div className="flex flex-col h-full">
                                                    <div className="text-xl mb-1 text-center flex-shrink-0">{product.image}</div>
                                                    
                                                    <h3 className="font-medium text-[10px] mb-1 text-center line-clamp-2 flex-shrink-0">
                                                        {product.name}
                                                    </h3>

                                                    <p className="hidden sm:block text-[9px] text-muted-foreground mb-auto text-center truncate" title={supplier?.name}>
                                                        {supplier?.name}
                                                    </p>

                                                    <div className="flex flex-col gap-0.5 mt-auto pt-1 border-t border-border">
                                                        <span className="text-violet-500 font-semibold text-[10px] text-center">
                                                            {money(product.sellPrice)}
                                                        </span>
                                                        <span className="text-[8px] text-muted-foreground text-center">
                                                            {product.stock} {product.unit}
                                                        </span>
                                                        
                                                        {inCart && (
                                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-violet-500/20">
                                                                <span className="text-[10px] font-bold text-violet-500">
                                                                    {inCart.quantity}x
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeFromCart(product.id);
                                                                    }}
                                                                    className="text-muted-foreground hover:text-violet-500 transition-colors p-0.5"
                                                                >
                                                                    <X size={12} strokeWidth={2.5} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL - CART */}
                <div className="flex-1 min-w-[320px] max-w-md">
                    <Card className="h-full flex flex-col border-l-2">
                        <CardHeader className="pb-4 flex-shrink-0">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Cliente (Opcional)
                                </label>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowClientModal(true)}
                                    className={`w-full justify-start py-2 h-auto ${selectedClient ? 'border-violet-500 bg-violet-500/5 text-violet-500' : ''}`}
                                >
                                    <User className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="text-xs truncate">{selectedClient ? selectedClient.name : 'Selecionar'}</span>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
                            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Itens ({cartTotals.itemCount})
                                </h3>
                            </div>

                            {/* SCROLLAREA COM ALTURA AJUSTADA */}
                            <ScrollArea className="flex-1 -mx-4 px-4 mb-3" style={{ maxHeight: 'calc(100vh - 26rem)' }}>
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                        <ShoppingCart size={28} className="mb-2 opacity-20" strokeWidth={1.5} />
                                        <p className="text-xs">Carrinho vazio</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 pr-4">
                                        {cart.map(item => (
                                            <motion.div key={item.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                                <Card>
                                                    <CardContent className="p-3">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                    <span className="text-sm flex-shrink-0">{item.image}</span>
                                                                    <h4 className="font-medium text-xs truncate">{item.name}</h4>
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground truncate">{getSupplierName(item.supplierId)}</p>
                                                            </div>
                                                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="h-6 w-6 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <Button variant="outline" size="icon" onClick={() => decreaseQuantity(item.id)} className="h-6 w-6">
                                                                    <Minus size={10} />
                                                                </Button>
                                                                <span className="w-6 text-center font-semibold text-xs">{item.quantity}</span>
                                                                <Button variant="outline" size="icon" onClick={() => increaseQuantity(item.id)} disabled={item.quantity >= item.maxStock} className="h-6 w-6">
                                                                    <Plus size={10} />
                                                                </Button>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-[10px] text-muted-foreground">{money(item.price)}/un</p>
                                                                <p className="text-sm font-semibold text-violet-500">{money(item.price * item.quantity)}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* TOTAL NO FIM DO CARD - SEMPRE VISÍVEL */}
                            <div className="border-t pt-3 space-y-3 flex-shrink-0 mt-auto">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                                    <span className="text-2xl font-bold text-violet-500">{money(cartTotals.subtotal)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={clearCart} disabled={cart.length === 0} className="py-2 h-auto">Limpar</Button>
                                    <Button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0} className="py-2 h-auto">Pagar</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Selecionar Cliente</DialogTitle></DialogHeader>
                    <ScrollArea className="max-h-96">
                        <div className="space-y-2">
                            <Button variant="outline" onClick={() => { setShowClientModal(false); setShowCreateClientModal(true); }} className="w-full justify-start py-3 h-auto border-dashed border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/5">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center mr-3 flex-shrink-0">
                                    <Plus size={14} className="text-violet-500" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-sm text-violet-500">Novo Cliente</p>
                                    <p className="text-xs text-muted-foreground">Cadastrar cliente</p>
                                </div>
                            </Button>
                            <div className="h-px bg-border my-3"></div>
                            <Button variant="outline" onClick={() => { setSelectedClient(null); setShowClientModal(false); }} className={`w-full justify-start py-3 h-auto ${selectedClient === null ? 'border-violet-500 bg-violet-500/5' : ''}`}>
                                <div className="text-left">
                                    <p className="font-medium text-sm">Sem Cliente</p>
                                    <p className="text-xs text-muted-foreground">Venda rápida</p>
                                </div>
                            </Button>
                            {clients.map(client => (
                                <Button key={client.id} variant="outline" onClick={() => { setSelectedClient(client); setShowClientModal(false); }} className={`w-full justify-start py-3 h-auto ${selectedClient?.id === client.id ? 'border-violet-500 bg-violet-500/5' : ''}`}>
                                    <div className="text-left">
                                        <p className="font-medium text-sm">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">{client.contact}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Finalizar Pagamento</DialogTitle>
                        <DialogDescription>Selecione a forma de pagamento</DialogDescription>
                    </DialogHeader>
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Total a Pagar</p>
                            <p className="text-3xl font-bold text-violet-500">{money(cartTotals.subtotal)}</p>
                        </CardContent>
                    </Card>
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(method => {
                                const Icon = method.icon;
                                const isSelected = selectedPaymentMethod?.id === method.id;
                                return (
                                    <Button key={method.id} variant="outline" onClick={() => { setSelectedPaymentMethod(method); if (method.id !== 'dinheiro') { setPaymentValue(cartTotals.subtotal.toFixed(2)); setChangeAmount(0); } }} className={`h-auto py-3 flex-col gap-2 ${isSelected ? 'border-violet-500 bg-violet-500/5' : ''}`}>
                                        <Icon size={20} className={isSelected ? 'text-violet-500' : ''} />
                                        <span className="text-xs font-medium">{method.name}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                    {selectedPaymentMethod?.id === 'dinheiro' && (
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Valor Recebido</label>
                            <Input type="number" step="0.01" placeholder="0,00" value={paymentValue} onChange={(e) => calculateChange(e.target.value)} className="text-right text-lg font-semibold h-12" />
                            {changeAmount > 0 && (
                                <Card className="mt-3 bg-violet-500/5 border-violet-500/20">
                                    <CardContent className="p-3">
                                        <p className="text-xs text-muted-foreground mb-1">Troco</p>
                                        <p className="text-xl font-bold text-violet-500">{money(changeAmount)}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                    <Button onClick={finalizeSale} disabled={!selectedPaymentMethod || (selectedPaymentMethod.id === 'dinheiro' && parseFloat(paymentValue) < cartTotals.subtotal)} className="w-full">
                        <Check className="mr-2 h-4 w-4" /> Confirmar Venda
                    </Button>
                </DialogContent>
            </Dialog>

            <Dialog open={showCreateClientModal} onOpenChange={setShowCreateClientModal}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Novo Cliente</DialogTitle>
                        <DialogDescription>Cadastre um novo cliente</DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); console.log('Cliente criado!'); setShowCreateClientModal(false); setShowClientModal(true); }}>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Nome <span className="text-destructive">*</span></label>
                            <Input type="text" required />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Telefone</label>
                            <Input type="tel" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Email</label>
                            <Input type="email" placeholder="cliente@exemplo.com" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">CPF/CNPJ</label>
                            <Input type="text" placeholder="000.000.000-00" />
                        </div>
                        <Button type="submit" className="w-full mt-6">Cadastrar Cliente</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
