// Usage: node scripts/seed.mjs <ownerUid> <sharerUid>
//   ownerUid  — the seed user (gets the main book + the archived book)
//   sharerUid — a second user who owns a shared book and adds ownerUid as member
// Requires: serviceAccountKey.json in project root (Firebase Console → Project Settings → Service Accounts)

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const OWNER_UID  = process.argv[2];
const SHARER_UID = process.argv[3];
if (!OWNER_UID || !SHARER_UID) {
  console.error('Usage: node scripts/seed.mjs <ownerUid> <sharerUid>');
  console.error('Find UIDs in Firebase Console → Authentication → Users');
  process.exit(1);
}

const d = (dateStr) => Timestamp.fromDate(new Date(dateStr));

// ─────────────────────────────────────────────────────────────
// BOOK 1 — Main book (owner = OWNER_UID)
// ─────────────────────────────────────────────────────────────

// maxBudget is a total cap, not monthly. Chosen to create a spread of states:
//   Boodschappen:    ~€2380 spent → over budget  (≥100%)
//   Huur:            ~€6570 spent → comfortably under
//   Energie & Water: ~€690  spent → warning zone (≥80%)
//   Transport:       ~€540  spent → just under
//   Uit eten:        ~€460  spent → over budget  (≥100%)
//   Abonnementen:    ~€192  spent → comfortably under
const categoriesMain = [
  { name: 'Boodschappen',      maxBudget: 2200 },
  { name: 'Huur',              maxBudget: 7500 },
  { name: 'Energie & Water',   maxBudget: 750  },
  { name: 'Transport',         maxBudget: 600  },
  { name: 'Uit eten',          maxBudget: 400  },
  { name: 'Abonnementen',      maxBudget: 250  },
];

const CAT_MAIN = Object.fromEntries(categoriesMain.map((c, i) => [c.name, i]));

const transactionsMain = [
  // ── January 2026 ──
  { date: '2026-01-01', type: 'expense', amount: 1095.00, description: 'Huur januari',          category: 'Huur' },
  { date: '2026-01-07', type: 'expense', amount: 87.43,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-01-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-01-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-01-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-01-14', type: 'expense', amount: 63.20,   description: 'Lidl',                   category: 'Boodschappen' },
  { date: '2026-01-17', type: 'expense', amount: 38.50,   description: 'Pizzeria Roma',          category: 'Uit eten' },
  { date: '2026-01-20', type: 'expense', amount: 134.60,  description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-01-21', type: 'expense', amount: 74.15,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-01-24', type: 'expense', amount: 29.90,   description: 'Tankbeurt',              category: 'Transport' },
  { date: '2026-01-25', type: 'income',  amount: 2650.00, description: 'Salaris januari',        category: null },
  { date: '2026-01-28', type: 'expense', amount: 91.05,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-01-30', type: 'expense', amount: 22.40,   description: 'Sushi restaurant',       category: 'Uit eten' },

  // ── February 2026 ──
  { date: '2026-02-01', type: 'expense', amount: 1095.00, description: 'Huur februari',          category: 'Huur' },
  { date: '2026-02-04', type: 'expense', amount: 78.30,   description: 'Jumbo',                  category: 'Boodschappen' },
  { date: '2026-02-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-02-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-02-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-02-13', type: 'expense', amount: 55.60,   description: 'Lidl',                   category: 'Boodschappen' },
  { date: '2026-02-14', type: 'expense', amount: 67.00,   description: 'Valentijnsdiner',        category: 'Uit eten' },
  { date: '2026-02-18', type: 'expense', amount: 141.20,  description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-02-20', type: 'expense', amount: 82.45,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-02-22', type: 'expense', amount: 44.00,   description: 'Benzine',                category: 'Transport' },
  { date: '2026-02-25', type: 'income',  amount: 2650.00, description: 'Salaris februari',       category: null },
  { date: '2026-02-27', type: 'expense', amount: 69.80,   description: 'Albert Heijn',           category: 'Boodschappen' },

  // ── March 2026 ──
  { date: '2026-03-01', type: 'expense', amount: 1095.00, description: 'Huur maart',             category: 'Huur' },
  { date: '2026-03-03', type: 'expense', amount: 93.15,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-03-08', type: 'expense', amount: 27.50,   description: 'Kebabzaak',              category: 'Uit eten' },
  { date: '2026-03-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-03-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-03-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-03-15', type: 'expense', amount: 71.40,   description: 'Jumbo',                  category: 'Boodschappen' },
  { date: '2026-03-18', type: 'expense', amount: 128.90,  description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-03-20', type: 'expense', amount: 38.60,   description: 'Tankbeurt',              category: 'Transport' },
  { date: '2026-03-22', type: 'expense', amount: 85.70,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-03-25', type: 'income',  amount: 2650.00, description: 'Salaris maart',          category: null },
  { date: '2026-03-25', type: 'income',  amount: 350.00,  description: 'Freelance klus',         category: null },
  { date: '2026-03-27', type: 'expense', amount: 44.20,   description: 'Thais restaurant',       category: 'Uit eten' },
  { date: '2026-03-29', type: 'expense', amount: 60.10,   description: 'Lidl',                   category: 'Boodschappen' },

  // ── April 2026 ──
  { date: '2026-04-01', type: 'expense', amount: 1095.00, description: 'Huur april',             category: 'Huur' },
  { date: '2026-04-05', type: 'expense', amount: 79.90,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-04-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-04-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-04-10', type: 'expense', amount: 9.99,    description: 'Disney+',                category: 'Abonnementen' },
  { date: '2026-04-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-04-14', type: 'expense', amount: 88.35,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-04-17', type: 'expense', amount: 102.40,  description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-04-19', type: 'expense', amount: 55.00,   description: 'Paasbrunch',             category: 'Uit eten' },
  { date: '2026-04-22', type: 'expense', amount: 66.80,   description: 'Jumbo',                  category: 'Boodschappen' },
  { date: '2026-04-24', type: 'expense', amount: 33.50,   description: 'Benzine',                category: 'Transport' },
  { date: '2026-04-25', type: 'income',  amount: 2650.00, description: 'Salaris april',          category: null },
  { date: '2026-04-28', type: 'expense', amount: 74.25,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-04-30', type: 'expense', amount: 31.80,   description: 'Burger Bar',             category: 'Uit eten' },

  // ── May 2026 ──
  { date: '2026-05-01', type: 'expense', amount: 1095.00, description: 'Huur mei',               category: 'Huur' },
  { date: '2026-05-04', type: 'expense', amount: 82.60,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-05-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-05-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-05-10', type: 'expense', amount: 9.99,    description: 'Disney+',                category: 'Abonnementen' },
  { date: '2026-05-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-05-13', type: 'expense', amount: 59.40,   description: 'Lidl',                   category: 'Boodschappen' },
  { date: '2026-05-16', type: 'expense', amount: 95.10,   description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-05-17', type: 'expense', amount: 48.75,   description: 'Grieks restaurant',      category: 'Uit eten' },
  { date: '2026-05-20', type: 'expense', amount: 77.30,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-05-22', type: 'expense', amount: 41.00,   description: 'Tankbeurt',              category: 'Transport' },
  { date: '2026-05-25', type: 'income',  amount: 2650.00, description: 'Salaris mei',            category: null },
  { date: '2026-05-25', type: 'income',  amount: 500.00,  description: 'Belastingteruggave',     category: null },
  { date: '2026-05-28', type: 'expense', amount: 68.90,   description: 'Jumbo',                  category: 'Boodschappen' },
  { date: '2026-05-30', type: 'expense', amount: 26.50,   description: 'Snackbar',               category: 'Uit eten' },

  // ── June 2026 ──
  { date: '2026-06-01', type: 'expense', amount: 1095.00, description: 'Huur juni',              category: 'Huur' },
  { date: '2026-06-03', type: 'expense', amount: 90.20,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-06-07', type: 'expense', amount: 34.60,   description: 'Terras centrum',         category: 'Uit eten' },
  { date: '2026-06-10', type: 'expense', amount: 14.99,   description: 'Netflix',                category: 'Abonnementen' },
  { date: '2026-06-10', type: 'expense', amount: 11.99,   description: 'Spotify',                category: 'Abonnementen' },
  { date: '2026-06-10', type: 'expense', amount: 9.99,    description: 'Disney+',                category: 'Abonnementen' },
  { date: '2026-06-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',          category: 'Transport' },
  { date: '2026-06-14', type: 'expense', amount: 73.15,   description: 'Albert Heijn',           category: 'Boodschappen' },
  { date: '2026-06-17', type: 'expense', amount: 89.40,   description: 'Eneco energierekening',  category: 'Energie & Water' },
  { date: '2026-06-19', type: 'expense', amount: 62.00,   description: 'Vaderdag diner',         category: 'Uit eten' },
  { date: '2026-06-21', type: 'expense', amount: 80.50,   description: 'Lidl',                   category: 'Boodschappen' },
  { date: '2026-06-23', type: 'expense', amount: 35.00,   description: 'Benzine',                category: 'Transport' },
  { date: '2026-06-25', type: 'income',  amount: 2650.00, description: 'Salaris juni',           category: null },
  { date: '2026-06-28', type: 'expense', amount: 55.70,   description: 'Jumbo',                  category: 'Boodschappen' },
];

// ─────────────────────────────────────────────────────────────
// BOOK 2 — Archived book (owner = OWNER_UID, archived = true)
// A small book for 2025 Q4 that has been closed off.
// ─────────────────────────────────────────────────────────────

const categoriesArchived = [
  { name: 'Boodschappen', maxBudget: 600 },
  { name: 'Huur',         maxBudget: 3300 },
  { name: 'Transport',    maxBudget: 200 },
];

const CAT_ARCHIVED = Object.fromEntries(categoriesArchived.map((c, i) => [c.name, i]));

const transactionsArchived = [
  { date: '2025-10-01', type: 'expense', amount: 1095.00, description: 'Huur oktober',    category: 'Huur' },
  { date: '2025-10-08', type: 'expense', amount: 65.40,   description: 'Albert Heijn',    category: 'Boodschappen' },
  { date: '2025-10-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',   category: 'Transport' },
  { date: '2025-10-25', type: 'income',  amount: 2650.00, description: 'Salaris oktober', category: null },
  { date: '2025-11-01', type: 'expense', amount: 1095.00, description: 'Huur november',   category: 'Huur' },
  { date: '2025-11-06', type: 'expense', amount: 71.20,   description: 'Jumbo',           category: 'Boodschappen' },
  { date: '2025-11-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',   category: 'Transport' },
  { date: '2025-11-25', type: 'income',  amount: 2650.00, description: 'Salaris november',category: null },
  { date: '2025-12-01', type: 'expense', amount: 1095.00, description: 'Huur december',   category: 'Huur' },
  { date: '2025-12-10', type: 'expense', amount: 88.90,   description: 'Albert Heijn',    category: 'Boodschappen' },
  { date: '2025-12-12', type: 'expense', amount: 52.80,   description: 'NS maandkaart',   category: 'Transport' },
  { date: '2025-12-25', type: 'income',  amount: 2650.00, description: 'Salaris december',category: null },
];

// ─────────────────────────────────────────────────────────────
// BOOK 3 — Shared book (owner = SHARER_UID, member = OWNER_UID)
// A household book owned by someone else, shared with the seed user.
// ─────────────────────────────────────────────────────────────

const categoriesShared = [
  { name: 'Boodschappen', maxBudget: 1800 },
  { name: 'Huur',         maxBudget: 9000 },
  { name: 'Energie',      maxBudget: 600  },
  { name: 'Uit eten',     maxBudget: 300  },
];

const CAT_SHARED = Object.fromEntries(categoriesShared.map((c, i) => [c.name, i]));

const transactionsShared = [
  // ── April 2026 ──
  { date: '2026-04-01', type: 'expense', amount: 1450.00, description: 'Huur april',          category: 'Huur' },
  { date: '2026-04-05', type: 'expense', amount: 112.30,  description: 'Supermarkt',          category: 'Boodschappen' },
  { date: '2026-04-15', type: 'expense', amount: 98.50,   description: 'Energierekening',     category: 'Energie' },
  { date: '2026-04-20', type: 'expense', amount: 44.00,   description: 'Italiaans restaurant',category: 'Uit eten' },
  { date: '2026-04-25', type: 'income',  amount: 3200.00, description: 'Salaris april',       category: null },
  { date: '2026-04-28', type: 'expense', amount: 95.60,   description: 'Supermarkt',          category: 'Boodschappen' },

  // ── May 2026 ──
  { date: '2026-05-01', type: 'expense', amount: 1450.00, description: 'Huur mei',            category: 'Huur' },
  { date: '2026-05-07', type: 'expense', amount: 103.80,  description: 'Supermarkt',          category: 'Boodschappen' },
  { date: '2026-05-15', type: 'expense', amount: 91.20,   description: 'Energierekening',     category: 'Energie' },
  { date: '2026-05-18', type: 'expense', amount: 37.50,   description: 'Brunch café',         category: 'Uit eten' },
  { date: '2026-05-25', type: 'income',  amount: 3200.00, description: 'Salaris mei',         category: null },
  { date: '2026-05-29', type: 'expense', amount: 88.40,   description: 'Supermarkt',          category: 'Boodschappen' },

  // ── June 2026 ──
  { date: '2026-06-01', type: 'expense', amount: 1450.00, description: 'Huur juni',           category: 'Huur' },
  { date: '2026-06-04', type: 'expense', amount: 119.70,  description: 'Supermarkt',          category: 'Boodschappen' },
  { date: '2026-06-13', type: 'expense', amount: 85.60,   description: 'Energierekening',     category: 'Energie' },
  { date: '2026-06-21', type: 'expense', amount: 52.00,   description: 'Sushi restaurant',    category: 'Uit eten' },
  { date: '2026-06-25', type: 'income',  amount: 3200.00, description: 'Salaris juni',        category: null },
  { date: '2026-06-27', type: 'expense', amount: 76.30,   description: 'Supermarkt',          category: 'Boodschappen' },
];

// ─────────────────────────────────────────────────────────────

async function seedBook({ name, description, ownerUid, members, archived, categories, CAT, transactions, createdAtStr }) {
  const now = Timestamp.now();
  const createdAt = createdAtStr ? Timestamp.fromDate(new Date(createdAtStr)) : now;

  const bookRef = await db.collection('huishoudboekjes').add({
    name,
    description,
    ownerUid,
    members,
    archived,
    createdAt,
  });
  console.log(`\n✓ Boekje aangemaakt: "${name}" (${bookRef.id})${archived ? ' [gearchiveerd]' : ''}`);

  const categoryIds = {};
  for (let i = 0; i < categories.length; i++) {
    const catRef = await bookRef.collection('categories').add({
      name: categories[i].name,
      maxBudget: categories[i].maxBudget,
      createdAt,
    });
    categoryIds[i] = catRef.id;
    console.log(`  ✓ Categorie: ${categories[i].name} (max €${categories[i].maxBudget})`);
  }

  for (const tx of transactions) {
    const catIdx = tx.category !== null ? CAT[tx.category] : null;
    await bookRef.collection('transactions').add({
      amount: tx.amount,
      description: tx.description,
      date: d(tx.date),
      type: tx.type,
      categoryId: catIdx !== null && catIdx !== undefined ? categoryIds[catIdx] : '',
      createdBy: ownerUid,
      createdAt,
    });
  }

  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  console.log(`  ✓ ${transactions.length} transacties — inkomsten €${income.toFixed(2)}, uitgaven €${expense.toFixed(2)}, saldo €${(income - expense).toFixed(2)}`);

  return bookRef.id;
}

async function seed() {
  console.log(`Seed gestart`);
  console.log(`  ownerUid:  ${OWNER_UID}`);
  console.log(`  sharerUid: ${SHARER_UID}`);

  await seedBook({
    name: 'Huishoudboekje 2026',
    description: 'Uitgaven en inkomsten van januari t/m juni 2026',
    ownerUid: OWNER_UID,
    members: [],
    archived: false,
    categories: categoriesMain,
    CAT: CAT_MAIN,
    transactions: transactionsMain,
  });

  await seedBook({
    name: 'Huishoudboekje Q4 2025',
    description: 'Afgesloten boekje voor oktober – december 2025',
    ownerUid: OWNER_UID,
    members: [],
    archived: true,
    categories: categoriesArchived,
    CAT: CAT_ARCHIVED,
    transactions: transactionsArchived,
    createdAtStr: '2025-10-01',
  });

  await seedBook({
    name: 'Gedeeld huishoudboekje',
    description: 'Boekje van een huisgenoot, gedeeld met jou',
    ownerUid: SHARER_UID,
    members: [OWNER_UID],
    archived: false,
    categories: categoriesShared,
    CAT: CAT_SHARED,
    transactions: transactionsShared,
  });

  console.log('\nKlaar!');
}

seed().catch(err => {
  console.error('Seed mislukt:', err.message);
  process.exit(1);
});
