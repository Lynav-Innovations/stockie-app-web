export const suppliers = [
  { id: 101, name: 'Hortifruti Central', contact: '(31) 95555-4444', doc: '99.999.999/0001-00', docType: 'CNPJ', email: 'horti@exemplo.com' },
  { id: 102, name: 'Distribuidora do Zé', contact: '(41) 96666-3333', doc: '111.222.333-44', docType: 'CPF', email: 'ze@exemplo.com' },
  { id: 103, name: 'Frutas Tropicais Ltda', contact: '(21) 97777-8888', doc: '88.888.888/0001-88', docType: 'CNPJ', email: 'tropicais@exemplo.com' },
];

export const products = [
  { id: 1, name: 'Mamão Papaya', stock: 45, unit: 'cx', image: '🥭', buyPrice: 15, sellPrice: 23, supplierId: 101 },
  { id: 2, name: 'Mamão Papaya', stock: 30, unit: 'cx', image: '🥭', buyPrice: 14, sellPrice: 22, supplierId: 103 },
  { id: 3, name: 'Banana Prata', stock: 120, unit: 'kg', image: '🍌', buyPrice: 20, sellPrice: 35, supplierId: 101 },
  { id: 4, name: 'Banana Prata', stock: 80, unit: 'kg', image: '🍌', buyPrice: 18, sellPrice: 32, supplierId: 102 },
  { id: 5, name: 'Morango', stock: 15, unit: 'bdja', image: '🍓', buyPrice: 8, sellPrice: 15, supplierId: 101 },
  { id: 6, name: 'Morango', stock: 25, unit: 'bdja', image: '🍓', buyPrice: 9, sellPrice: 16, supplierId: 103 },
  { id: 7, name: 'Abacaxi', stock: 50, unit: 'un', image: '🍍', buyPrice: 5, sellPrice: 8, supplierId: 101 },
  { id: 8, name: 'Melancia', stock: 35, unit: 'un', image: '🍉', buyPrice: 12, sellPrice: 20, supplierId: 102 },
  { id: 9, name: 'Uva Itália', stock: 40, unit: 'kg', image: '🍇', buyPrice: 15, sellPrice: 25, supplierId: 103 },
  { id: 10, name: 'Maçã Fuji', stock: 60, unit: 'kg', image: '🍎', buyPrice: 10, sellPrice: 18, supplierId: 101 },
];

export const clients = [
  { id: 1, name: 'Mercadinho da Esquina', contact: '(11) 98765-4321', cpf: '123.456.789-00', docType: 'CPF', email: 'mercado@exemplo.com' },
  { id: 2, name: 'Restaurante Sabor', contact: '(21) 91234-5678', cpf: '000.111.222-33', docType: 'CPF', email: 'sabor@exemplo.com' },
  { id: 3, name: 'Padaria Pão Quente', contact: '(31) 99999-1111', cpf: '444.555.666-77', docType: 'CPF', email: 'padaria@exemplo.com' },
];

export const generateMockTransactions = () => {
  const transactions = [];
  const daysInPast = 90;
  const baseProducts = [
    { id: 1, name: 'Mamão Papaya (Cx)', buyPrice: 15, sellPrice: 23 },
    { id: 2, name: 'Banana Prata (Cx)', buyPrice: 20, sellPrice: 35 },
    { id: 3, name: 'Morango (Bdja)', buyPrice: 8, sellPrice: 15 },
  ];

  for (let i = daysInPast; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const numTransactions = Math.floor(Math.random() * 4) + 2;

    for (let j = 0; j < numTransactions; j++) {
      const prod = baseProducts[Math.floor(Math.random() * baseProducts.length)];
      const type = ['venda', 'compra', 'perda'][Math.floor(Math.random() * 3)];
      const qtd = Math.floor(Math.random() * 30) + 1;

      let total;
      if (type === 'venda') {
        total = qtd * prod.sellPrice * (1 + Math.random() * 0.1);
      } else if (type === 'compra') {
        total = qtd * prod.buyPrice * (1 - Math.random() * 0.05);
      } else {
        total = qtd * prod.buyPrice * (0.1 + Math.random() * 0.2);
      }

      transactions.push({
        id: transactions.length + 1,
        date: dateStr,
        type,
        productId: prod.id,
        product: prod.name,
        qtd,
        total: parseFloat(total.toFixed(2)),
        reason: type === 'perda' ? 'Estragou' : null,
      });
    }
  }
  return transactions;
};
