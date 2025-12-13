import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { maskPhone, maskCPF, maskCNPJ } from '@/utils/formatters';
import { toast } from '@/hooks/use-toast';

export const EntityModal = ({ 
  show, 
  onClose, 
  type, // 'client' ou 'supplier'
  entity 
}) => {
  const isClient = type === 'client';
  const isEditing = !!entity.name;
  const title = isClient 
    ? (isEditing ? 'Editar Cliente' : 'Novo Cliente') 
    : (isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor');

  const description = isClient
    ? (isEditing ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente')
    : (isEditing ? 'Atualize as informações do fornecedor' : 'Preencha os dados do novo fornecedor');

  const [formData, setFormData] = useState({
    name: entity.name || '',
    contact: entity.contact || '',
    email: entity.email || '',
    docType: entity.docType || 'CPF',
    doc: entity.doc || entity.cpf || ''
  });

  const docMask = formData.docType === 'CPF' ? maskCPF : maskCNPJ;
  const docPlaceholder = formData.docType === 'CPF' ? '999.999.999-99' : '99.999.999/9999-99';

  const docTypeOptions = [
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Validações
      if (!formData.name) {
        toast({
          variant: "destructive",
          title: "❌ Nome obrigatório",
          description: "Digite o nome/razão social"
        });
        return;
      }

      console.log(`Entidade Salva (${type}):`, formData);
      
      const entityLabel = isClient ? 'Cliente' : 'Fornecedor';
      toast({
        variant: "success",
        title: isEditing ? `✅ ${entityLabel} atualizado!` : `✅ ${entityLabel} cadastrado!`,
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-4 pr-4">
            <FormField
              label="Nome/Razão Social"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
            />

            <FormField
              label="Telefone"
              value={formData.contact}
              onChange={(value) => setFormData({ ...formData, contact: value })}
              placeholder="(99) 99999-9999"
              mask={maskPhone}
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Documento
              </label>
              <div className="flex gap-2">
                <FormSelect
                  value={formData.docType}
                  onChange={(value) => setFormData({ ...formData, docType: value })}
                  options={docTypeOptions}
                  className="w-1/3"
                />
                <Input
                  type="text"
                  placeholder={docPlaceholder}
                  value={formData.doc}
                  onChange={(e) => setFormData({ ...formData, doc: docMask(e.target.value) })}
                  className="w-2/3"
                />
              </div>
            </div>

            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              placeholder="contato@exemplo.com"
            />

            <Button type="submit" className="w-full mt-6">
              {isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
