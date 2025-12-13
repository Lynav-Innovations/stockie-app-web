import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ShoppingBag, 
  AlertTriangle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { CurrencyInput } from '@/components/forms/CurrencyInput';
import { toast } from '@/hooks/use-toast';

const TRANSACTION_CONFIG = {
  venda: {
    title: 'Nova Venda',
    description: 'Registre uma nova venda de produto',
    icon: ArrowUpRight,
    buttonText: 'REGISTRAR VENDA',
    color: 'violet'
  },
  compra: {
    title: 'Nova Compra',
    description: 'Registre uma nova compra de produto',
    icon: ShoppingBag,
    buttonText: 'REGISTRAR COMPRA',
    color: 'blue'
  },
  perda: {
    title: 'Nova Perda',
    description: 'Registre uma perda de produto',
    icon: AlertTriangle,
    buttonText: 'REGISTRAR PERDA',
    color: 'rose'
  }
};

export const TransactionModal = ({ 
  show, 
  onClose, 
  type, 
  products, 
  suppliers 
}) => {
  const [inputMode, setInputMode] = useState('unit');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    unitPrice: 0,
    totalPrice: 0,
    supplierId: '',
    reason: ''
  });

  const config = TRANSACTION_CONFIG[type] || TRANSACTION_CONFIG.venda;
  const Icon = config.icon;

  const productOptions = products.map(p => ({
    value: String(p.id),
    label: `${p.name} (${p.image})`
  }));

  const supplierOptions = suppliers.map(s => ({
    value: String(s.id),
    label: s.name
  }));

  const lossReasonOptions = [
    { value: 'estragou', label: 'Estragou (Perecível)' },
    { value: 'quebra', label: 'Quebra/Dano' },
    { value: 'desconhecido', label: 'Desconhecido' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validações básicas
      if (!formData.productId || formData.quantity <= 0) {
        toast({
          variant: "destructive",
          title: "❌ Dados inválidos",
          description: "Preencha todos os campos obrigatórios"
        });
        return;
      }

      // Simular salvamento
      console.log('Transação:', { type, ...formData });
      
      // Toast de sucesso
      const typeLabel = type === 'venda' ? 'Venda' : type === 'compra' ? 'Compra' : 'Perda';
      toast({
        variant: "success",
        title: `✅ ${typeLabel} registrada!`,
        description: `${typeLabel} cadastrada com sucesso`
      });

      // Resetar form e fechar
      setFormData({
        productId: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        supplierId: '',
        reason: ''
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao registrar",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            {/* Modo de Input (Venda/Compra) */}
            {(type === 'venda' || type === 'compra') && (
              <div className="flex p-0.5 rounded-lg bg-muted">
                <Button
                  type="button"
                  variant={inputMode === 'unit' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setInputMode('unit')}
                  className="flex-1 text-xs"
                >
                  Preço Unitário
                </Button>
                <Button
                  type="button"
                  variant={inputMode === 'total' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setInputMode('total')}
                  className="flex-1 text-xs"
                >
                  Preço Total
                </Button>
              </div>
            )}

            {/* Produto */}
            <FormSelect
              label="Produto"
              value={formData.productId}
              onChange={(value) => setFormData({ ...formData, productId: value })}
              options={productOptions}
              placeholder="Selecione o produto"
              required
            />

            {/* Quantidade */}
            <FormField
              label="Quantidade"
              type="number"
              value={formData.quantity}
              onChange={(value) => setFormData({ ...formData, quantity: value })}
              placeholder="10"
              min="0"
              required
            />

            {/* Preços */}
            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput
                label="Preço Unitário"
                value={formData.unitPrice}
                onChange={(value) => setFormData({ ...formData, unitPrice: value })}
                disabled={inputMode === 'total' && (type === 'venda' || type === 'compra')}
              />
              <CurrencyInput
                label="Preço Total"
                value={formData.totalPrice}
                onChange={(value) => setFormData({ ...formData, totalPrice: value })}
                disabled={inputMode === 'unit' && (type === 'venda' || type === 'compra')}
              />
            </div>

            {/* Fornecedor (Compra) */}
            {type === 'compra' && (
              <FormSelect
                label="Fornecedor"
                value={formData.supplierId}
                onChange={(value) => setFormData({ ...formData, supplierId: value })}
                options={supplierOptions}
                placeholder="Selecione o fornecedor"
              />
            )}

            {/* Motivo (Perda) */}
            {type === 'perda' && (
              <FormSelect
                label="Motivo da Perda"
                value={formData.reason}
                onChange={(value) => setFormData({ ...formData, reason: value })}
                options={lossReasonOptions}
                required
              />
            )}

            <Button type="submit" className="w-full mt-6">
              {config.buttonText}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
