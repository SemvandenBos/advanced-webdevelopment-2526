// Usage: node scripts/seed.mjs <ownerUid>
// Requires: serviceAccountKey.json in project root (download from Firebase Console → Project Settings → Service Accounts)
// Install dep first: npm install --save-dev firebase-admin

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const OWNER_UID = process.argv[2];
if (!OWNER_UID) {
  console.error('Usage: node scripts/seed.mjs <ownerUid>');
  console.error('Find your UID in Firebase Console → Authentication → Users');
  process.exit(1);
}

// customers → categories
const customers = [
  { name: 'Evil Rabbit' },
  { name: 'Delba de Oliveira' },
  { name: 'Lee Robinson' },
  { name: 'Michael Novotny' },
  { name: 'Amy Burns' },
  { name: 'Balazs Orban' },
];

// invoices → transactions (customer_idx maps to customers array above)
// status 'paid' → expense (money out), 'pending' → income (money expected in)
const invoices = [
  { customer_idx: 0, amount: 15795, status: 'pending', date: '2022-12-06' },
  { customer_idx: 1, amount: 20348, status: 'pending', date: '2022-11-14' },
  { customer_idx: 4, amount: 3040,  status: 'paid',    date: '2022-10-29' },
  { customer_idx: 3, amount: 44800, status: 'paid',    date: '2023-09-10' },
  { customer_idx: 5, amount: 34577, status: 'pending', date: '2023-08-05' },
  { customer_idx: 2, amount: 54246, status: 'pending', date: '2023-07-16' },
  { customer_idx: 0, amount: 666,   status: 'pending', date: '2023-06-27' },
  { customer_idx: 3, amount: 32545, status: 'paid',    date: '2023-06-09' },
  { customer_idx: 4, amount: 1250,  status: 'paid',    date: '2023-06-17' },
  { customer_idx: 5, amount: 8546,  status: 'paid',    date: '2023-06-07' },
  { customer_idx: 1, amount: 500,   status: 'paid',    date: '2023-08-19' },
  { customer_idx: 5, amount: 8945,  status: 'paid',    date: '2023-06-03' },
  { customer_idx: 2, amount: 1000,  status: 'paid',    date: '2022-06-05' },
];

// revenue → income transactions (one per month in 2023)
const revenue = [
  { month: 'Jan', amount: 2000 },
  { month: 'Feb', amount: 1800 },
  { month: 'Mar', amount: 2200 },
  { month: 'Apr', amount: 2500 },
  { month: 'May', amount: 2300 },
  { month: 'Jun', amount: 3200 },
  { month: 'Jul', amount: 3500 },
  { month: 'Aug', amount: 3700 },
  { month: 'Sep', amount: 2500 },
  { month: 'Oct', amount: 2800 },
  { month: 'Nov', amount: 3000 },
  { month: 'Dec', amount: 4800 },
];

const MONTH_NUM = { Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12 };

async function seed() {
  const now = Timestamp.now();

  // 1. Create huishoudboekje
  const bookRef = await db.collection('huishoudboekjes').add({
    name: 'Demo Huishoudboekje',
    description: 'Voorbeelddata voor demonstratie',
    ownerUid: OWNER_UID,
    members: [],
    archived: false,
    createdAt: now,
  });
  console.log(`✓ Boekje aangemaakt: ${bookRef.id}`);

  // 2. Create categories from customers; maxBudget = sum of their invoices (cents → EUR)
  const categoryIds = {};
  for (let i = 0; i < customers.length; i++) {
    const totalCents = invoices
      .filter(inv => inv.customer_idx === i)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const catRef = await bookRef.collection('categories').add({
      name: customers[i].name,
      maxBudget: Math.round(totalCents / 100),
      createdAt: now,
    });
    categoryIds[i] = catRef.id;
    console.log(`  ✓ Categorie: ${customers[i].name} (budget: €${Math.round(totalCents / 100)})`);
  }

  // 3. Create transactions from invoices
  for (const inv of invoices) {
    await bookRef.collection('transactions').add({
      amount: inv.amount / 100,
      description: customers[inv.customer_idx].name,
      date: Timestamp.fromDate(new Date(inv.date)),
      type: inv.status === 'paid' ? 'expense' : 'income',
      categoryId: categoryIds[inv.customer_idx],
      createdBy: OWNER_UID,
      createdAt: now,
    });
  }
  console.log(`✓ ${invoices.length} transacties aangemaakt`);

  // 4. Create income transactions from revenue data (monthly, no category)
  for (const r of revenue) {
    const m = String(MONTH_NUM[r.month]).padStart(2, '0');
    await bookRef.collection('transactions').add({
      amount: r.amount,
      description: `Inkomen ${r.month} 2023`,
      date: Timestamp.fromDate(new Date(`2023-${m}-01`)),
      type: 'income',
      categoryId: '',
      createdBy: OWNER_UID,
      createdAt: now,
    });
  }
  console.log(`✓ ${revenue.length} inkomsten-transacties aangemaakt`);

  console.log('\nKlaar! Boekje ID:', bookRef.id);
}

seed().catch(err => {
  console.error('Seed mislukt:', err.message);
  process.exit(1);
});
