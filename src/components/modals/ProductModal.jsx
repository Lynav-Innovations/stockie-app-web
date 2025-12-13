import React, { useState } from 'react';
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

export const ProductModal = ({ 
  show, 
  onClose, 
  productToEdit, 
  suppliers 
}) => {
  const isEditing = !!productToEdit;
  const [formData, setFormData] = useState(productToEdit || { 
    name: '', 
    image: '', 
    stock: 0, 
    unit: 'un', 
    buyPrice: 0, 
    sellPrice: 0, 
    supplierId: '' 
  });

  const unitOptions = [
    { value: 'kg', label: 'kg (Kilo)' },
    { value: 'cx', label: 'cx (Caixa)' },
    { value: 'un', label: 'un (Unidade)' },
    { value: 'bdja', label: 'bdja (Bandeja)' },
  ];

  const supplierOptions = suppliers.map(s => ({ 
    value: String(s.id), 
    label: s.name 
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validações
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "❌ Nome obrigatório",
          description: "Digite o nome do produto"
        });
        return;
      }

      console.log("Produto salvo:", formData);
      
      toast({
        variant: "success",
        title: isEditing ? "✅ Produto atualizado!" : "✅ Produto cadastrado!",
        description: `${formData.name} ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso`
      });

      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Erro ao salvar",
        description: error.message
      });
    }
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar: ${formData.name}` : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            <FormField
              label="Nome do Produto"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Emoji/Ícone"
                value={formData.image}
                onChange={(value) => setFormData({ ...formData, image: value })}
                placeholder="Ex: 🥭"
              />

              <FormSelect
                label="Unidade"
                value={formData.unit}
                onChange={(value) => setFormData({ ...formData, unit: value })}
                options={unitOptions}
              />
            </div>

            <FormSelect
              label="Fornecedor"
              value={formData.supplierId ? String(formData.supplierId) : ''}
              onChange={(value) => setFormData({ ...formData, supplierId: value ? parseInt(value) : '' })}
              options={supplierOptions}
              placeholder="Selecione (opcional)"
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Estoque Atual"
                type="number"
                value={formData.stock}
                onChange={(value) => setFormData({ ...formData, stock: value })}
                min="0"
              />

              <CurrencyInput
                label="Custo (R$)"
                value={formData.buyPrice}
                onChange={(value) => setFormData({ ...formData, buyPrice: value })}
              />

              <CurrencyInput
                label="Preço Venda (R$)"
                value={formData.sellPrice}
                onChange={(value) => setFormData({ ...formData, sellPrice: value })}
              />
            </div>

            <Button type="submit" className="w-full mt-6">
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
