import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Lock, LogIn, User, ArrowLeft, 
    Smartphone, MessageCircle, RefreshCw, CheckCircle, Package, Check, 
    X, Shield, Sparkles
} from 'lucide-react';

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
    const isSuccess = type === 'success';

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
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg backdrop-blur-xl border shadow-lg z-50 flex items-center gap-3 ${
                isSuccess 
                    ? 'bg-violet-500/10 border-violet-500/20' 
                    : 'bg-rose-500/10 border-rose-500/20'
            }`}
        >
            <div className={`p-1 rounded-full ${isSuccess ? 'bg-violet-500/20' : 'bg-rose-500/20'}`}>
                <Check size={14} className={isSuccess ? 'text-violet-400' : 'text-rose-400'} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-medium text-zinc-100">{message}</span>
            <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-zinc-100 transition-colors">
                <X size={16} strokeWidth={2} />
            </button>
        </motion.div>
    );
};

const AuthScreen = ({ onLoginSuccess }) => {
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
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-violet-500/0 to-white/10 rounded-xl"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                    <Package size={24} className="text-white" strokeWidth={1.5} />
                </div>
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-2xl font-semibold text-zinc-100 mb-1 tracking-tight"
            >
                {title}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm text-zinc-400 font-normal"
            >
                {subtitle}
            </motion.p>
        </div>
    );

    const InputField = ({ icon: Icon, type, placeholder, value, onChange, required, name }) => (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400 transition-colors">
                <Icon size={16} strokeWidth={2} />
            </div>
            <input 
                type={type} 
                placeholder={placeholder} 
                value={value} 
                onChange={onChange} 
                required={required}
                name={name}
                className="input-refined pl-10 h-10"
            />
        </div>
    );

    const LoginView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        return (
            <motion.div key="login" variants={screenVariants} initial="initial" animate="in" exit="out">
                <LogoBlock title="Stockie" subtitle="Sistema de Gestão de Estoque" />
                <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }} className="space-y-4">
                    <InputField 
                        icon={Mail} 
                        type="email" 
                        placeholder="E-mail" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <InputField 
                        icon={Lock} 
                        type="password" 
                        placeholder="Senha" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <div className="flex justify-between items-center text-xs pt-1">
                        <button 
                            type="button" 
                            onClick={() => setCurrentView('forgotPassword')} 
                            className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
                        >
                            Esqueceu a senha?
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setCurrentView('requestContact')} 
                            className="text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
                        >
                            Criar conta
                        </button>
                    </div>
                    
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-refined w-full mt-6 h-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <LogIn size={16} strokeWidth={2} />
                            <span>Entrar</span>
                        </div>
                    </motion.button>
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
                <button 
                    onClick={() => setCurrentView('login')} 
                    className="mb-6 flex items-center text-zinc-400 hover:text-zinc-100 transition-colors group"
                >
                    <ArrowLeft size={14} strokeWidth={2} className="mr-1.5"/>
                    <span className="text-xs font-medium">Voltar</span>
                </button>
                <LogoBlock title="Criar Conta" subtitle="Preencha os dados para solicitar acesso" />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField icon={User} type="text" placeholder="Nome completo" name="name" value={formData.name} onChange={handleChange} required />
                    <InputField icon={Smartphone} type="tel" placeholder="(00) 00000-0000" name="phone" value={formData.phone} onChange={handleChange} required />
                    <InputField icon={Mail} type="email" placeholder="E-mail" name="email" value={formData.email} onChange={handleChange} required />
                    
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-refined w-full mt-6 h-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <MessageCircle size={16} strokeWidth={2} />
                            <span>Solicitar Acesso</span>
                        </div>
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    const ForgotPasswordView = () => {
        const [resetUser, setResetUser] = useState('');
        
        return (
            <motion.div key="forgot" variants={screenVariants} initial="initial" animate="in" exit="out">
                <button 
                    onClick={() => setCurrentView('login')} 
                    className="mb-6 flex items-center text-zinc-400 hover:text-zinc-100 transition-colors group"
                >
                    <ArrowLeft size={14} strokeWidth={2} className="mr-1.5"/>
                    <span className="text-xs font-medium">Voltar</span>
                </button>
                <LogoBlock title="Recuperar Senha" subtitle="Digite seu e-mail cadastrado" />
                
                <form onSubmit={(e) => { e.preventDefault(); setCurrentView('codeVerification'); }} className="space-y-4">
                    <InputField icon={Mail} type="email" placeholder="E-mail" value={resetUser} onChange={(e) => setResetUser(e.target.value)} required />
                    
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                        <Shield size={16} className="text-violet-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Enviaremos um código de verificação de 6 dígitos para o e-mail informado.
                        </p>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-refined w-full mt-6 h-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Mail size={16} strokeWidth={2} />
                            <span>Enviar Código</span>
                        </div>
                    </motion.button>
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
                <button 
                    onClick={() => setCurrentView('forgotPassword')} 
                    className="mb-6 flex items-center text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <ArrowLeft size={14} strokeWidth={2} className="mr-1.5"/>
                    <span className="text-xs font-medium">Alterar e-mail</span>
                </button>
                <LogoBlock title="Código de Verificação" subtitle="Digite o código enviado para seu e-mail" />
                
                <form onSubmit={(e) => { e.preventDefault(); if(isCodeComplete) setCurrentView('resetPassword'); }} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                className={`w-full h-12 text-center text-lg font-semibold rounded-lg border bg-zinc-900/50 text-white transition-all
                                    ${digit ? 'border-violet-500/50 bg-violet-500/5' : 'border-zinc-800/50 hover:border-zinc-700/50'}
                                    focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50`}
                                required
                            />
                        ))}
                    </div>
                    
                    <motion.button
                        type="submit"
                        disabled={!isCodeComplete}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-refined w-full h-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <RefreshCw size={16} strokeWidth={2} />
                            <span>Verificar</span>
                        </div>
                    </motion.button>
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
                    <InputField icon={Lock} type="password" placeholder="Nova senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary-refined w-full mt-6 h-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle size={16} strokeWidth={2} />
                            <span>Redefinir Senha</span>
                        </div>
                    </motion.button>

                    <button 
                        type="button" 
                        onClick={() => setCurrentView('login')} 
                        className="w-full text-zinc-500 hover:text-zinc-300 transition-colors mt-3 text-xs font-medium"
                    >
                        Voltar ao login
                    </button>
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
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
            {/* Grid de fundo sutil */}
            <div className="absolute inset-0 bg-grid-refined opacity-30"></div>
            
            {/* Gradientes de fundo suaves */}
            <div className="absolute w-96 h-96 rounded-full blur-3xl bg-violet-600/5 -top-48 -left-48"></div>
            <div className="absolute w-96 h-96 rounded-full blur-3xl bg-purple-600/5 -bottom-48 -right-48"></div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                <div className="card-refined p-8">
                    <AnimatePresence mode="wait">
                        {renderView()}
                    </AnimatePresence>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center text-xs text-zinc-600 mt-8"
                    >
                        © 2025 Stockie · Lynav Innovations
                    </motion.p>
                </div>
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

export default AuthScreen;
