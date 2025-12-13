import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, AlertTriangle, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { money, formatDate } from '@/utils/formatters';

const ActionButton = ({ icon: Icon, label, onClick, color = 'violet' }) => {
  const gradients = {
    violet: 'from-violet-600 to-purple-600',
    blue: 'from-blue-600 to-indigo-600',
    rose: 'from-rose-600 to-red-600'
  };

  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-all group" onClick={onClick}>
      <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradients[color]} text-white group-hover:scale-110 transition-transform`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="font-medium text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
};

export const HomePage = ({ filteredTransactions, onModalOpen }) => {
  const dashboardStats = useMemo(() => {
    let entradas = 0, saidas = 0, perdas = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'venda') entradas += t.total;
      if (t.type === 'compra') saidas += t.total;
      if (t.type === 'perda') perdas += t.total;
    });
    return { entradas, saidas, perdas, saldo: entradas - saidas - perdas };
  }, [filteredTransactions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <ActionButton icon={TrendingUp} label="Venda" color="violet" onClick={() => onModalOpen('venda')} />
        <ActionButton icon={ShoppingBag} label="Compra" color="blue" onClick={() => onModalOpen('compra')} />
        <ActionButton icon={AlertTriangle} label="Perda" color="rose" onClick={() => onModalOpen('perda')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-violet-500/5 border-violet-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-violet-500">
              <TrendingUp size={16} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider">Entradas</span>
            </div>
            <h3 className="text-2xl font-bold text-violet-400">{money(dashboardStats.entradas)}</h3>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
              <ShoppingBag size={16} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider">Saídas</span>
            </div>
            <h3 className="text-2xl font-bold text-blue-400">{money(dashboardStats.saidas)}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Wallet size={16} strokeWidth={2} />
              <span className="text-xs font-semibold uppercase tracking-wider">Resultado</span>
            </div>
            <h3 className={`text-2xl font-bold ${dashboardStats.saldo >= 0 ? 'text-violet-400' : 'text-rose-400'}`}>
              {dashboardStats.saldo >= 0 ? '+' : ''}{money(dashboardStats.saldo)}
            </h3>
            {dashboardStats.perdas > 0 && (
              <p className="text-xs text-rose-400 mt-1 font-medium flex items-center gap-1">
                <AlertTriangle size={10} strokeWidth={2} /> Perdas: {money(dashboardStats.perdas)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Extrato ({filteredTransactions.length} Lançamentos)</h3>
        <ScrollArea className="h-96">
          <div className="space-y-2 pr-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">Nenhuma movimentação nestas datas.</div>
            ) : (
              filteredTransactions.slice(0, 10).map(t => (
                <Card key={t.id} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${t.type === 'venda' ? 'bg-violet-500/10 text-violet-400' : t.type === 'compra' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'venda' ? <ArrowUpRight size={14} strokeWidth={2} /> : t.type === 'compra' ? <ShoppingBag size={14} strokeWidth={2} /> : <ArrowDownRight size={14} strokeWidth={2} />}
                      </div>
                      <div>
                        <p className="font-medium text-xs">{t.product}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(t.date)} • {t.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${t.type === 'venda' ? 'text-violet-400' : ''}`}>{money(t.total)}</p>
                      <p className="text-[10px] text-muted-foreground">{t.qtd} un</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};
