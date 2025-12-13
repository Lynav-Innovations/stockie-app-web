import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import { StockPage } from './pages/StockPage';
import { RegistrationsPage } from './pages/RegistrationsPage';
import { POSPage } from './pages/POSPage';
import {
  LayoutGrid, Users, Package, CreditCard, Plus, LogOut, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TransactionModal } from '@/components/modals';
import { suppliers, products, clients, generateMockTransactions } from '@/data/mockData';
import { DateRangePicker } from '@/components/layout/DateRangePicker';

const allTransactions = generateMockTransactions();

const MainLayout = ({ children, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('venda');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeRegistrationTab, setActiveRegistrationTab] = useState('products');

  const currentPath = location.pathname;
  const activeTab = currentPath.split('/')[1] || 'home';

  const handleLogout = () => {
    navigate('/');
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

  const getProductStats = useCallback((prodId) => {
    const prodTrans = filteredTransactions.filter(t => t.productId === prodId);
    let sold = 0, bought = 0, lost = 0, soldQtd = 0, boughtQtd = 0, lostQtd = 0;
    prodTrans.forEach(t => {
      if (t.type === 'venda') { sold += t.total; soldQtd += t.qtd; }
      if (t.type === 'compra') { bought += t.total; boughtQtd += t.qtd; }
      if (t.type === 'perda') { lost += t.total; lostQtd += t.qtd; }
    });
    return { sold, bought, lost, result: sold - bought - lost, soldQtd, boughtQtd, lostQtd, history: prodTrans };
  }, [filteredTransactions]);

  const handleNewClick = () => {
    if (window.handleNewRegistration && window.handleNewRegistration[activeRegistrationTab]) {
      window.handleNewRegistration[activeRegistrationTab]();
    }
  };

  const getNewButtonLabel = () => {
    if (activeRegistrationTab === 'products') return 'Novo Produto';
    if (activeRegistrationTab === 'clients') return 'Novo Cliente';
    if (activeRegistrationTab === 'suppliers') return 'Novo Fornecedor';
    return 'Novo';
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen pb-20 md:pb-0 md:pl-20 ${isDark ? '' : 'light'}`}>
      {/* Sidebar */}
      <nav className="fixed z-40 md:top-0 md:left-0 md:h-full md:w-20 md:flex-col md:border-r bottom-0 left-0 w-full flex justify-around items-center p-2 bg-card/80 border-border/50 backdrop-blur-xl border-t md:border-t-0">
        <div className="hidden md:flex flex-col items-center mt-6 mb-8">
          <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
        </div>
        {[
          { id: 'home', icon: LayoutGrid, label: 'Início', path: '/home' },
          { id: 'stock', icon: Package, label: 'Estoque', path: '/stock' },
          { id: 'pos', icon: CreditCard, label: 'PDV', path: '/pos' },
          { id: 'registrations', icon: Users, label: 'Cadastros', path: '/registrations' },
        ].map(item => (
          <Button 
            key={item.id} 
            variant={activeTab === item.id ? 'default' : 'ghost'} 
            className={`relative flex flex-col items-center justify-center m-1 gap-1 h-14 w-14`} 
            onClick={() => { 
              navigate(item.path); 
              setSelectedProduct(null); 
            }}
          >
            <item.icon size={22} strokeWidth={2} />
            <span className="text-[8px] font-medium hidden md:block">{item.label}</span>
          </Button>
        ))}
        <div className="hidden md:flex flex-col items-center mt-auto mb-6">
          <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
            {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`mx-auto p-4 md:p-6 pt-6 ${activeTab === 'pos' ? 'max-w-full' : 'max-w-5xl'}`}>
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {activeTab === 'home' ? 'Visão Geral' :
                activeTab === 'pos' ? 'Ponto de Venda' :
                  activeTab === 'stock' ? (selectedProduct ? `Análise: ${selectedProduct.name}` : 'Gestão de Produtos') :
                    'Cadastros'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeTab === 'registrations' ? 'Gerenciamento de entidades' :
                activeTab === 'pos' ? 'Sistema de vendas rápido' :
                  'Dados do período selecionado'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(activeTab === 'home' || activeTab === 'stock') && <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />}
            
            {activeTab === 'registrations' && (
              <Button onClick={handleNewClick} className="gap-2">
                <Plus size={16} strokeWidth={2.5} />
                {getNewButtonLabel()}
              </Button>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setIsDark(!isDark)} className="md:hidden">
                {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
              </Button>

              <div className="relative profile-menu-container">
                <Button variant="outline" size="icon" onClick={() => setShowProfileMenu(!showProfileMenu)} className="overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Juruba" alt="Avatar" className="w-full h-full object-cover" />
                </Button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-2 w-36 z-50">
                      <Card>
                        <CardContent className="p-1">
                          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-destructive hover:text-destructive gap-2">
                            <LogOut size={14} strokeWidth={2} className="transform rotate-180" /> Sair
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Pages with Routes */}
        <Routes>
          <Route path="/home" element={<HomePage filteredTransactions={filteredTransactions} onModalOpen={handleModalOpen} />} />
          <Route path="/stock" element={<StockPage products={products} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} dateRange={dateRange} getProductStats={getProductStats} />} />
          <Route path="/registrations" element={<RegistrationsPage activeTab={activeRegistrationTab} setActiveTab={setActiveRegistrationTab} />} />
          <Route path="/pos" element={<POSPage isDark={isDark} products={products} clients={clients} suppliers={suppliers} />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>

      <TransactionModal show={showModal} onClose={() => setShowModal(false)} type={modalType} products={products} suppliers={suppliers} />
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <BrowserRouter>
      <MainLayout isAuthenticated={isAuthenticated} />
    </BrowserRouter>
  );
};

export default App;
