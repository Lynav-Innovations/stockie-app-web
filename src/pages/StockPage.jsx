import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { money, formatDate } from '@/utils/formatters';

export const StockPage = ({ products, selectedProduct, setSelectedProduct, dateRange, getProductStats }) => {
  return (
    <AnimatePresence mode="wait">
      {!selectedProduct ? (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2 pr-4">
              {products.map(p => {
                const stats = getProductStats(p.id);
                return (
                  <Card key={p.id} className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => setSelectedProduct(p)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 text-xl bg-muted rounded-lg flex items-center justify-center flex-shrink-0">{p.image}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">Estoque: {p.stock} {p.unit}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] uppercase font-semibold text-muted-foreground">Resultado</p>
                        <Badge variant={stats.result >= 0 ? 'default' : 'destructive'} className="text-xs">
                          {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                        </Badge>
                      </div>
                      <ChevronLeft size={16} strokeWidth={2} className="rotate-180 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </motion.div>
      ) : (
        <motion.div key="detail" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(null)} className="mb-6 gap-2">
            <ChevronLeft size={14} strokeWidth={2} /> Voltar
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl">{selectedProduct.image}</div>
            <div>
              <h2 className="text-xl font-semibold">{selectedProduct.name}</h2>
              <p className="text-muted-foreground text-xs">Análise de {formatDate(dateRange.start)} até {formatDate(dateRange.end)}</p>
            </div>
          </div>

          {(() => {
            const stats = getProductStats(selectedProduct.id);
            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <Card className="bg-violet-500/5 border-violet-500/20">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Vendas</p>
                      <p className="text-lg font-bold text-violet-400">{money(stats.sold)}</p>
                      <p className="text-xs text-muted-foreground">{stats.soldQtd} {selectedProduct.unit}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Compras</p>
                      <p className="text-lg font-bold text-blue-400">{money(stats.bought)}</p>
                      <p className="text-xs text-muted-foreground">{stats.boughtQtd} {selectedProduct.unit}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-rose-500/5 border-rose-500/20">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Perdas</p>
                      <p className="text-lg font-bold text-rose-400">{money(stats.lost)}</p>
                      <p className="text-xs text-muted-foreground">{stats.lostQtd} {selectedProduct.unit}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Resultado</p>
                      <p className={`text-lg font-bold ${stats.result >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
                        {stats.result >= 0 ? '+' : ''}{money(stats.result)}
                      </p>
                      <p className="text-xs text-muted-foreground">Líquido</p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Histórico</h3>
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {stats.history.length === 0 && <p className="text-muted-foreground text-xs">Sem dados neste período.</p>}
                    {stats.history.map(h => {
                      const TypeIcon = h.type === 'venda' ? DollarSign : h.type === 'compra' ? ShoppingBag : AlertTriangle;
                      return (
                        <Card key={h.id} className={`hover:translate-x-1 transition-all border-l-2 ${h.type === 'venda' ? 'border-l-violet-500' : h.type === 'compra' ? 'border-l-blue-500' : 'border-l-rose-500'}`}>
                          <CardContent className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`${h.type === 'venda' ? 'text-violet-400' : h.type === 'compra' ? 'text-blue-400' : 'text-rose-400'}`} size={14} strokeWidth={2} />
                              <div>
                                <p className="font-medium text-xs">{h.type.toUpperCase()}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(h.date)} ({h.qtd} un)</p>
                              </div>
                            </div>
                            <span className={`font-semibold text-sm ${h.type === 'venda' ? 'text-violet-400' : h.type === 'compra' ? 'text-blue-400' : 'text-rose-400'}`}>
                              {h.type === 'venda' ? '+' : '-'} {money(h.total)}
                            </span>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
