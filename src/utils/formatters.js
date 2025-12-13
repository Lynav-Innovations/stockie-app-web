// Formatação de moeda
export const money = (value) => value.toLocaleString('pt-BR', { 
  style: 'currency', 
  currency: 'BRL' 
});

// Formatação de data SEM bug de timezone
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR');
};

export const formatCurrencyInput = (value) => {
  let digits = value.replace(/\D/g, ''); 
  if (!digits) return '';
  
  digits = digits.padStart(3, '0'); 
  const cents = digits.slice(-2);
  let reais = digits.slice(0, -2); 
  
  reais = reais.replace(/^0+/, ''); 
  if (!reais) reais = '0'; 
  reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
  
  return `R$ ${reais},${cents}`;
};

// Máscaras
export const maskPhone = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, "").substring(0, 11);
  value = value.replace(/(\d{2})(\d)/, "($1) $2");
  value = value.replace(/(\d{5})(\d)/, "$1-$2");
  return value;
};

export const maskCPF = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, "").substring(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return value;
};

export const maskCNPJ = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, "").substring(0, 14);
  value = value.replace(/^(\d{2})(\d)/, "$1.$2");
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
  value = value.replace(/(\d{4})(\d)/, "$1-$2");
  return value.substring(0, 18);
};
