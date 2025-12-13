import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Contact, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductModal, EntityModal } from '@/components/modals';
import { suppliers, products, clients } from '@/data/mockData';

export const RegistrationsPage = ({ activeTab, setActiveTab }) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [entityType, setEntityType] = useState(null);
  const [entityToEdit, setEntityToEdit] = useState(null);

  const handleNewProduct = () => {
    setProductToEdit(null);
    setShowProductModal(true);
  };

  const handleNewClient = () => {
    setEntityType('client');
    setEntityToEdit({ name: '', contact: '', cpf: '', docType: 'CPF', email: '' });
    setShowEntityModal(true);
  };

  const handleNewSupplier = () => {
    setEntityType('supplier');
    setEntityToEdit({ name: '', contact: '', doc: '', docType: 'CNPJ', email: '' });
    setShowEntityModal(true);
  };

  useEffect(() => {
    window.handleNewRegistration = {
      products: handleNewProduct,
      clients: handleNewClient,
      suppliers: handleNewSupplier
    };
  }, []);

  const ProductsList = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Produtos Cadastrados ({products.length})
      </h3>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2 pr-4">
          {products.map(p => (
            <Card key={p.id} className="hover:border-primary/30 transition-all">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 text-lg bg-muted rounded-lg flex items-center justify-center flex-shrink-0">{p.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">Estoque: {p.stock} {p.unit}</p>
                </div>
                <Button onClick={() => { setProductToEdit(p); setShowProductModal(true); }} variant="ghost" size="sm">Editar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const ClientsList = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Clientes Cadastrados ({clients.length})
      </h3>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2 pr-4">
          {clients.map(c => (
            <Card key={c.id} className="hover:border-primary/30 transition-all">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.contact}</p>
                </div>
                <Button onClick={() => { setEntityType('client'); setEntityToEdit(c); setShowEntityModal(true); }} variant="ghost" size="sm">Editar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const SuppliersList = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Fornecedores Cadastrados ({suppliers.length})
      </h3>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2 pr-4">
          {suppliers.map(s => (
            <Card key={s.id} className="hover:border-primary/30 transition-all">
              <CardContent className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.contact}</p>
                </div>
                <Button onClick={() => { setEntityType('supplier'); setEntityToEdit(s); setShowEntityModal(true); }} variant="ghost" size="sm">Editar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-2 mb-6 p-1 rounded-lg bg-muted">
        {[
          { id: 'products', label: 'Produtos', Icon: Package },
          { id: 'clients', label: 'Clientes', Icon: Contact },
          { id: 'suppliers', label: 'Fornecedores', Icon: Truck },
        ].map(item => (
          <Button key={item.id} variant={activeTab === item.id ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab(item.id)} className="flex-1 gap-2">
            <item.Icon size={14} strokeWidth={2} />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === 'products' && <ProductsList />}
          {activeTab === 'clients' && <ClientsList />}
          {activeTab === 'suppliers' && <SuppliersList />}
        </motion.div>
      </AnimatePresence>

      <ProductModal show={showProductModal} onClose={() => setShowProductModal(false)} productToEdit={productToEdit} suppliers={suppliers} />
      {showEntityModal && <EntityModal show={showEntityModal} onClose={() => setShowEntityModal(false)} type={entityType} entity={entityToEdit} />}
    </motion.div>
  );
};
