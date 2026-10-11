export const INITIAL_ACCOUNTS = [
  {
    id: 'acc-1',
    name: 'HDFC Salary Account',
    type: 'bank',
    accountNumber: '•••• 4821',
    balance: 84500,
    institution: 'HDFC Bank',
    color: 'emerald'
  },
  {
    id: 'acc-2',
    name: 'ICICI Savings',
    type: 'bank',
    accountNumber: '•••• 9104',
    balance: 32000,
    institution: 'ICICI Bank',
    color: 'blue'
  },
  {
    id: 'acc-3',
    name: 'Paytm Wallet',
    type: 'wallet',
    accountNumber: '+91 98765 43210',
    balance: 4250,
    institution: 'Paytm Payments',
    color: 'indigo'
  },
  {
    id: 'acc-4',
    name: 'Cash in Hand',
    type: 'cash',
    accountNumber: 'Emergency & Daily',
    balance: 6500,
    institution: 'Physical Cash',
    color: 'amber'
  }
];

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)' },
  { id: 'card', label: 'Debit / Credit Card' },
  { id: 'bank-transfer', label: 'Net Banking / IMPS' },
  { id: 'cash', label: 'Cash' }
];

export const EXPENSE_CATEGORIES = [
  'Groceries & Food',
  'Dining Out',
  'Rent & Housing',
  'Utilities & Bills',
  'Transportation & Fuel',
  'Shopping & Retail',
  'Entertainment & OTT',
  'Healthcare & Medical',
  'Education & Courses',
  'Investments',
  'Miscellaneous'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance / Consulting',
  'Investments & Dividends',
  'Rental Income',
  'Gifts & Reimbursements',
  'Other Income'
];

export const INITIAL_BUDGETS = [
  {
    id: 'b-1',
    category: 'Groceries & Food',
    allocated: 15000,
    period: 'monthly'
  },
  {
    id: 'b-2',
    category: 'Dining Out',
    allocated: 6000,
    period: 'monthly'
  },
  {
    id: 'b-3',
    category: 'Rent & Housing',
    allocated: 28000,
    period: 'monthly'
  },
  {
    id: 'b-4',
    category: 'Transportation & Fuel',
    allocated: 5000,
    period: 'monthly'
  },
  {
    id: 'b-5',
    category: 'Shopping & Retail',
    allocated: 8000,
    period: 'monthly'
  },
  {
    id: 'b-6',
    category: 'Utilities & Bills',
    allocated: 4500,
    period: 'monthly'
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'expense',
    title: 'Nature Basket Supermarket',
    amount: 3240,
    category: 'Groceries & Food',
    accountId: 'acc-1',
    paymentMethod: 'upi',
    date: '2026-10-10',
    notes: 'Weekly fresh produce & essentials'
  },
  {
    id: 'tx-2',
    type: 'income',
    title: 'Monthly Tech Salary - Oct',
    amount: 115000,
    category: 'Salary',
    accountId: 'acc-1',
    paymentMethod: 'bank-transfer',
    date: '2026-10-01',
    notes: 'Direct deposit employer credit'
  },
  {
    id: 'tx-3',
    type: 'expense',
    title: 'Apartment Monthly Rent',
    amount: 28000,
    category: 'Rent & Housing',
    accountId: 'acc-1',
    paymentMethod: 'bank-transfer',
    date: '2026-10-02',
    notes: 'Flat 402 owner transfer'
  },
  {
    id: 'tx-4',
    type: 'expense',
    title: 'Shell Petrol Station',
    amount: 2150,
    category: 'Transportation & Fuel',
    accountId: 'acc-2',
    paymentMethod: 'card',
    date: '2026-10-05',
    notes: 'Full tank fuel'
  },
  {
    id: 'tx-5',
    type: 'expense',
    title: 'Blue Tokai Cafe & Roasters',
    amount: 680,
    category: 'Dining Out',
    accountId: 'acc-3',
    paymentMethod: 'upi',
    date: '2026-10-07',
    notes: 'Client catch-up coffee'
  },
  {
    id: 'tx-6',
    type: 'income',
    title: 'UI/UX Design Consultation',
    amount: 18500,
    category: 'Freelance / Consulting',
    accountId: 'acc-2',
    paymentMethod: 'bank-transfer',
    date: '2026-10-08',
    notes: 'Invoice #104 freelance payout'
  },
  {
    id: 'tx-7',
    type: 'expense',
    title: 'Electricity & High-speed WiFi',
    amount: 3120,
    category: 'Utilities & Bills',
    accountId: 'acc-1',
    paymentMethod: 'upi',
    date: '2026-10-06',
    notes: 'BESCOM and Airtel Fiber'
  },
  {
    id: 'tx-8',
    type: 'expense',
    title: 'Local Farmer Market Vegetables',
    amount: 450,
    category: 'Groceries & Food',
    accountId: 'acc-4',
    paymentMethod: 'cash',
    date: '2026-10-09',
    notes: 'Vegetables and seasonal fruits'
  },
  {
    id: 'tx-9',
    type: 'expense',
    title: 'Zomato Weekend Dinner',
    amount: 1250,
    category: 'Dining Out',
    accountId: 'acc-3',
    paymentMethod: 'upi',
    date: '2026-10-09',
    notes: 'Dinner with family'
  },
  {
    id: 'tx-10',
    type: 'expense',
    title: 'Zara Autumn Casuals',
    amount: 4990,
    category: 'Shopping & Retail',
    accountId: 'acc-2',
    paymentMethod: 'card',
    date: '2026-10-04',
    notes: 'Weekend apparel shopping'
  }
];

export const MONTHLY_TREND = [
  { month: 'May', income: 105000, expenses: 54000 },
  { month: 'Jun', income: 110000, expenses: 58500 },
  { month: 'Jul', income: 112000, expenses: 51200 },
  { month: 'Aug', income: 124000, expenses: 62000 },
  { month: 'Sep', income: 118000, expenses: 49500 },
  { month: 'Oct (Current)', income: 133500, expenses: 43880 }
];
