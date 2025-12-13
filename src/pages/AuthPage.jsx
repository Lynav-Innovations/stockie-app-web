import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Lock, LogIn, User, ArrowLeft, 
    Smartphone, MessageCircle, RefreshCw, CheckCircle, Package, Check, 
    X, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const screenVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    out: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const maskPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "").substring(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
};

const ToastNotification = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <Badge variant={type === 'success' ? 'default' : 'destructive'} className="px-4 py-3 text-sm flex items-center gap-2">
                <Check size={14} strokeWidth={2.5} />
                {message}
                <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
                    <X size={14} strokeWidth={2} />
                </button>
            </Badge>
        </motion.div>
    );
};

export const AuthPage = ({ onLoginSuccess }) => {
    const [currentView, setCurrentView] = useState('login');
    const [toast, setToast] = useState(null);

    const LogoBlock = ({ title, subtitle }) => (
        <div className="flex flex-col items-center mb-8">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-14 h-14 mb-4"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-purple-600 rounded-xl"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-white" strokeWidth={1.5} />
                </div>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-2xl font-semibold tracking-tight mb-1"
            >
                {title}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm text-muted-foreground"
            >
                {subtitle}
            </motion.p>
        </div>
    );

    const LoginView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        return (
            <motion.div key="login" variants={screenVariants} initial="initial" animate="in" exit="out">
                <LogoBlock title="Stockie" subtitle="Sistema de Gestão de Estoque" />
                <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="email" 
                                placeholder="E-mail" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="password" 
                                placeholder="Senha" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs pt-1">
                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => setCurrentView('forgotPassword')}
                            className="h-auto p-0 text-violet-400 hover:text-violet-300"
                        >
                            Esqueceu a senha?
                        </Button>
                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => setCurrentView('requestContact')}
                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                        >
                            Criar conta
                        </Button>
                    </div>
                    
                    <Button type="submit" className="w-full mt-6">
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                    </Button>
                </form>
            </motion.div>
        );
    };

    const RequestContactView = () => {
        const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({...formData, [name]: name === 'phone' ? maskPhone(value) : value });
        };
        
        const handleSubmit = (e) => {
            e.preventDefault();
            setToast({ message: 'Solicitação enviada com sucesso!', type: 'success' });
            setTimeout(() => setCurrentView('login'), 1500);
        };

        return (
            <motion.div key="request" variants={screenVariants} initial="initial" animate="in" exit="out">
                <Button 
                    variant="ghost"
                    onClick={() => setCurrentView('login')} 
                    className="mb-6 px-0 hover:bg-transparent"
                >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Voltar
                </Button>
                <LogoBlock title="Criar Conta" subtitle="Preencha os dados para solicitar acesso" />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder="Nome completo" name="name" value={formData.name} onChange={handleChange} required className="pl-10" />
                    </div>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" placeholder="(00) 00000-0000" name="phone" value={formData.phone} onChange={handleChange} required className="pl-10" />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="E-mail" name="email" value={formData.email} onChange={handleChange} required className="pl-10" />
                    </div>
                    
                    <Button type="submit" className="w-full mt-6">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Solicitar Acesso
                    </Button>
                </form>
            </motion.div>
        );
    };

    const ForgotPasswordView = () => {
        const [resetUser, setResetUser] = useState('');
        
        return (
            <motion.div key="forgot" variants={screenVariants} initial="initial" animate="in" exit="out">
                <Button 
                    variant="ghost"
                    onClick={() => setCurrentView('login')} 
                    className="mb-6 px-0 hover:bg-transparent"
                >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Voltar
                </Button>
                <LogoBlock title="Recuperar Senha" subtitle="Digite seu e-mail cadastrado" />
                
                <form onSubmit={(e) => { e.preventDefault(); setCurrentView('codeVerification'); }} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="E-mail" value={resetUser} onChange={(e) => setResetUser(e.target.value)} required className="pl-10" />
                    </div>
                    
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                        <Shield size={16} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Enviaremos um código de verificação de 6 dígitos para o e-mail informado.
                        </p>
                    </div>

                    <Button type="submit" className="w-full mt-6">
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Código
                    </Button>
                </form>
            </motion.div>
        );
    };

    const CodeVerificationView = () => {
        const [code, setCode] = useState(['', '', '', '', '', '']);
        const inputRefs = useRef([]);
        const isCodeComplete = code.every(digit => digit !== '');

        const handleChange = (e, index) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 1);
            if (value !== '') {
                const newCode = [...code];
                newCode[index] = value;
                setCode(newCode);
                if (index < 5) inputRefs.current[index + 1]?.focus();
            }
        };

        const handleKeyDown = (e, index) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (code[index] !== '') {
                    const newCode = [...code];
                    newCode[index] = '';
                    setCode(newCode);
                } else if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                    const newCode = [...code];
                    newCode[index - 1] = '';
                    setCode(newCode);
                }
            }
        };

        return (
            <motion.div key="code" variants={screenVariants} initial="initial" animate="in" exit="out">
                <Button 
                    variant="ghost"
                    onClick={() => setCurrentView('forgotPassword')} 
                    className="mb-6 px-0 hover:bg-transparent"
                >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                    Alterar e-mail
                </Button>
                <LogoBlock title="Código de Verificação" subtitle="Digite o código enviado para seu e-mail" />
                
                <form onSubmit={(e) => { e.preventDefault(); if(isCodeComplete) setCurrentView('resetPassword'); }} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                className={`w-full h-12 text-center text-lg font-semibold ${digit ? 'border-violet-500 bg-violet-500/5' : ''}`}
                                required
                            />
                        ))}
                    </div>
                    
                    <Button type="submit" disabled={!isCodeComplete} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Verificar
                    </Button>
                </form>
            </motion.div>
        );
    };

    const ResetPasswordView = () => {
        const [newPassword, setNewPassword] = useState('');
        
        const handleReset = (e) => {
            e.preventDefault();
            setToast({ message: 'Senha redefinida com sucesso!', type: 'success' });
            setTimeout(() => setCurrentView('login'), 1500);
        };

        return (
            <motion.div key="reset" variants={screenVariants} initial="initial" animate="in" exit="out">
                <LogoBlock title="Nova Senha" subtitle="Crie uma senha segura para sua conta" />
                
                <form onSubmit={handleReset} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="pl-10" />
                    </div>
                    
                    <Button type="submit" className="w-full mt-6">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Redefinir Senha
                    </Button>

                    <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => setCurrentView('login')} 
                        className="w-full"
                    >
                        Voltar ao login
                    </Button>
                </form>
            </motion.div>
        );
    };

    const renderView = () => {
        switch (currentView) {
            case 'login': return <LoginView />;
            case 'requestContact': return <RequestContactView />;
            case 'forgotPassword': return <ForgotPasswordView />;
            case 'codeVerification': return <CodeVerificationView />;
            case 'resetPassword': return <ResetPasswordView />;
            default: return <LoginView />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
            <div className="absolute w-96 h-96 rounded-full blur-3xl bg-violet-600/5 -top-48 -left-48"></div>
            <div className="absolute w-96 h-96 rounded-full blur-3xl bg-purple-600/5 -bottom-48 -right-48"></div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                <Card className="border-border/50">
                    <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                            {renderView()}
                        </AnimatePresence>
                        
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-center text-xs text-muted-foreground mt-8"
                        >
                            © 2025 Stockie · Lynav Innovations
                        </motion.p>
                    </CardContent>
                </Card>
            </motion.div>
            
            <AnimatePresence>
                {toast && (
                    <ToastNotification 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
