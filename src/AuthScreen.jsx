import React, { useState, useEffect, useRef } from 'react'; // Adicionado useRef para gerenciar o foco
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Lock, LogIn, TrendingUp, User, ArrowLeft, 
    Smartphone, MessageCircle, RefreshCw, CheckCircle, Package, Check, 
    X 
} from 'lucide-react';

// Cor principal para destaque (Emerald)
const COLOR_PRIMARY = '#059669'; 

// Variantes para transições entre as telas (UX fluida)
const screenVariants = {
    initial: { opacity: 0, x: 200 },
    in: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
    out: { opacity: 0, x: -200, transition: { duration: 0.3 } }
};

// --- FUNÇÃO DE MÁSCARA DE TELEFONE (Copiada do App.jsx) ---
const maskPhone = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "").substring(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
};
// ------------------------------------------------------------

// --- NOVO COMPONENTE: TOAST/NOTIFICAÇÃO ---
const ToastNotification = ({ message, type = 'success', onClose }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-emerald-600' : 'bg-rose-600';

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Fecha após 3 segundos
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-4 right-4 p-4 rounded-xl text-white shadow-2xl z-50 ${bgColor} flex items-center gap-3`}
        >
            <Check size={20} />
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="p-1 -mr-2 opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} /> 
            </button>
        </motion.div>
    );
};
// --------------------------------------------


const AuthScreen = ({ onLoginSuccess }) => {
    const [currentView, setCurrentView] = useState('login');
    const [toast, setToast] = useState(null); // { message: '', type: 'success' }

    const inputStyle = `w-full p-3 pl-12 rounded-xl border border-zinc-700 bg-zinc-800 text-white 
                        focus:ring-2 focus:ring-emerald-500 outline-none transition-colors duration-300`;
    
    // LOGO
    const LogoBlock = ({ title, subtitle }) => (
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: `linear-gradient(45deg, ${COLOR_PRIMARY}, #3b82f6)` }}>
                <Package size={32} className="text-white"/>
            </div>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
        </div>
    );

    // --- SUB-TELAS ---

    // 1. TELA DE LOGIN 
    const LoginView = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');

        const handleSubmit = (e) => {
            e.preventDefault(); 
            onLoginSuccess();
        };

        return (
            <motion.div key="login" variants={screenVariants} initial="initial" animate="in" exit="out">
                <LogoBlock title="Bem-vindo ao Stockie" subtitle="Sua gestão de estoque começa aqui." />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                        <button type="button" onClick={() => setCurrentView('forgotPassword')} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                            Esqueceu a senha?
                        </button>
                        <button type="button" onClick={() => setCurrentView('requestContact')} className="text-zinc-400 hover:text-white transition-colors">
                            Solicitar Conta
                        </button>
                    </div>
                    
                    <motion.button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden group`}
                        style={{ background: COLOR_PRIMARY }}
                        whileHover={{ boxShadow: `0 0 20px 5px ${COLOR_PRIMARY}60` }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogIn size={20} className="inline mr-2 -mt-1" />
                        Entrar
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    // 2. TELA: SOLICITAR CONTATO (Máscara e Toast integrados)
    const RequestContactView = () => {
        const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
        
        const handleChange = (e) => {
            const { name, value } = e.target;
            let maskedValue = value;
            
            if (name === 'phone') {
                maskedValue = maskPhone(value); 
            }

            setFormData({...formData, [name]: maskedValue });
        };
        
        const handleSubmitRequest = (e) => {
             e.preventDefault(); 
             
             // Mostra o Toast em vez do alert
             setToast({ message: 'Solicitação de contato enviada! Em breve entraremos em contato.', type: 'success' });
             
             setCurrentView('login');
        };

        return (
            <motion.div key="request" variants={screenVariants} initial="initial" animate="in" exit="out">
                <button onClick={() => setCurrentView('login')} className="mb-6 flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Voltar
                </button>
                <LogoBlock title="Solicitar Contato" subtitle="Preencha o formulário e nossa equipe entrará em contato." />

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                    <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="text" name="name" placeholder="Seu Nome Completo" value={formData.name} onChange={handleChange} className={inputStyle} required />
                    </div>
                    <div className="relative">
                        <Smartphone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        {/* Campo de Telefone com Máscara */}
                        <input type="tel" name="phone" placeholder="(99) 99999-9999" value={formData.phone} onChange={handleChange} className={inputStyle} required maxLength={15} />
                    </div>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="email" name="email" placeholder="E-mail da Empresa" value={formData.email} onChange={handleChange} className={inputStyle} required />
                    </div>
                    
                    <motion.button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden`}
                        style={{ background: COLOR_PRIMARY }}
                        whileHover={{ boxShadow: `0 0 20px 5px ${COLOR_PRIMARY}60` }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <MessageCircle size={20} className="inline mr-2 -mt-1" />
                        Enviar Solicitação
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    // 3. TELA: ESQUECI A SENHA - PASSO 1 (E-MAIL)
    const ForgotPasswordView = () => {
        const [resetUser, setResetUser] = useState('');
        
        const handleSubmit = (e) => {
            e.preventDefault(); 
            setCurrentView('codeVerification'); 
        };

        return (
            <motion.div key="forgot" variants={screenVariants} initial="initial" animate="in" exit="out">
                <button onClick={() => setCurrentView('login')} className="mb-6 flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> Voltar
                </button>
                <LogoBlock title="Recuperar Senha" subtitle="Informe seu e-mail para receber o código de segurança." />
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="email" placeholder="Seu E-mail Cadastrado" value={resetUser} onChange={(e) => setResetUser(e.target.value)} className={inputStyle} required />
                    </div>
                    <p className="text-sm text-zinc-500 text-center">
                        Enviaremos um código de 6 dígitos para este endereço.
                    </p>
                    <motion.button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden`}
                        style={{ background: COLOR_PRIMARY }}
                        whileHover={{ boxShadow: `0 0 20px 5px ${COLOR_PRIMARY}60` }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Enviar Código
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    // 4. TELA: ESQUECI A SENHA - PASSO 2 (CÓDIGO - CORRIGIDO PARA BACKSPACE)
    const CodeVerificationView = () => {
        // Estado para 6 dígitos, inicializado com strings vazias
        const [code, setCode] = useState(['', '', '', '', '', '']);
        const inputRefs = useRef([]);
        const isCodeComplete = code.every(digit => digit !== ''); // Verifica se todos os campos estão preenchidos

        // Adiciona um ref para cada input na lista
        const setRef = (el) => {
            if (el && !inputRefs.current.includes(el)) {
                inputRefs.current.push(el);
            }
        };

        const handleChange = (e, index) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 1); // Aceita apenas 1 dígito
            
            // 1. Lógica de DIGITAÇÃO (Adicionar dígito e mover foco)
            if (value !== '') {
                // Atualiza o dígito atual
                const newCode = [...code];
                newCode[index] = value;
                setCode(newCode);
    
                // Move o foco para o próximo campo, se não for o último
                if (index < 5) {
                    inputRefs.current[index + 1].focus();
                }
            } else {
                // Se o usuário tentar apagar digitando vazio, tratamos como Backspace
                // O evento de Backspace é tratado separadamente no onKeyDown
            }
        };

        // Função para tratar o Backspace
        const handleKeyDown = (e, index) => {
            if (e.key === 'Backspace') {
                e.preventDefault(); // Impede o comportamento padrão de backspace
                
                // Se o campo atual ESTIVER PREENCHIDO, apaga apenas ele.
                if (code[index] !== '') {
                    const newCode = [...code];
                    newCode[index] = '';
                    setCode(newCode);
                } 
                // Se o campo atual ESTIVER VAZIO, move o foco para o anterior e apaga o conteúdo dele.
                else if (index > 0) {
                    inputRefs.current[index - 1].focus();
                    
                    // Apaga o dígito no campo anterior (UX intuitiva)
                    const newCode = [...code];
                    newCode[index - 1] = '';
                    setCode(newCode);
                }
            }
        };


        const handleSubmitCode = (e) => {
            e.preventDefault(); 
            const finalCode = code.join(''); 
            console.log("Código Verificado:", finalCode);

            if (isCodeComplete) {
                setCurrentView('resetPassword');
            }
        };

        return (
            <motion.div key="code" variants={screenVariants} initial="initial" animate="in" exit="out">
                <button onClick={() => setCurrentView('forgotPassword')} className="mb-6 flex items-center text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={16} className="mr-2"/> E-mail incorreto?
                </button>
                <LogoBlock title="Verificação de Código" subtitle={`Insira o código enviado para seu e-mail.`} />
                
                <form onSubmit={handleSubmitCode} className="space-y-6">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <motion.input
                                key={index}
                                ref={setRef} // Atribui o ref correto
                                type="text"
                                pattern="[0-9]"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)} // <<< NOVO HANDLER APLICADO AQUI
                                onFocus={(e) => e.target.select()} // Seleciona o conteúdo ao focar
                                className={`w-full aspect-square text-2xl text-center rounded-xl border-2 bg-zinc-800 text-white 
                                    focus:ring-2 focus:ring-emerald-500 outline-none transition-colors 
                                    ${digit ? 'border-emerald-500' : 'border-zinc-700'}`
                                }
                                required
                            />
                        ))}
                    </div>
                    <motion.button
                        type="submit"
                        disabled={!isCodeComplete} 
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden disabled:opacity-50`}
                        style={{ background: COLOR_PRIMARY }}
                        whileHover={{ boxShadow: `0 0 20px 5px ${COLOR_PRIMARY}60` }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw size={20} className="inline mr-2 -mt-1" />
                        Verificar
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    // 5. TELA: ESQUECI A SENHA - PASSO 3 (RESET)
    const ResetPasswordView = () => {
        const [newPassword, setNewPassword] = useState('');
        
        const handleReset = (e) => {
            e.preventDefault(); 
            
            // Mostra o Toast em vez do alert
            setToast({ message: 'Senha redefinida com sucesso! Redirecionando para o login.', type: 'success' });
            
            // Simula o tempo de feedback do usuário antes de voltar ao login
            setTimeout(() => {
                setCurrentView('login');
                setToast(null); // Limpa o toast
            }, 100); 
        };

        return (
            <motion.div key="reset" variants={screenVariants} initial="initial" animate="in" exit="out">
                <LogoBlock title="Definir Nova Senha" subtitle="Crie uma nova senha forte para sua conta." />
                
                <form onSubmit={handleReset} className="space-y-6">
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input type="password" placeholder="Nova Senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputStyle} required />
                    </div>
                    <motion.button
                        type="submit"
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 relative overflow-hidden`}
                        style={{ background: COLOR_PRIMARY }}
                        whileHover={{ boxShadow: `0 0 20px 5px ${COLOR_PRIMARY}60` }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <CheckCircle size={20} className="inline mr-2 -mt-1" />
                        Redefinir Senha
                    </motion.button>
                    <button type="button" onClick={() => setCurrentView('login')} className="w-full text-zinc-500 hover:text-white transition-colors mt-4">
                        Voltar para o Login
                    </button>
                </form>
            </motion.div>
        );
    };


    const renderView = () => {
        switch (currentView) {
            case 'login':
                return <LoginView />;
            case 'requestContact':
                return <RequestContactView />;
            case 'forgotPassword':
                return <ForgotPasswordView />;
            case 'codeVerification':
                return <CodeVerificationView />;
            case 'resetPassword':
                return <ResetPasswordView />;
            default:
                return <LoginView />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 font-sans p-4 relative overflow-hidden">
            {/* Ambient Glows */}
             <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: `radial-gradient(circle, ${COLOR_PRIMARY}, transparent 70%)`, top: '10%', left: '10%', transform: 'translate(-50%, -50%)', zIndex: 0 }}/>
            <div className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: `radial-gradient(circle, #3b82f6, transparent 70%)`, bottom: '10%', right: '10%', transform: 'translate(50%, 50%)', zIndex: 0 }}/>


            <motion.div
                className="relative w-full max-w-sm p-8 md:p-10 rounded-3xl bg-zinc-800/80 backdrop-blur-md border border-zinc-700 shadow-2xl shadow-black/60 z-10 overflow-hidden"
            >
                {/* O AnimatePresence lida com a transição suave entre as sub-telas */}
                <AnimatePresence mode="wait">
                    {renderView()}
                </AnimatePresence>
                
                <p className="text-center text-xs text-zinc-600 mt-8">
                    © 2025 Stockie | Lynav Innovations
                </p>
            </motion.div>
            
            {/* TOAST NOTIFICATION (Sempre no topo) */}
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