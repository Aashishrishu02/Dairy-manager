import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('dairy.db');
  }
  return db;
}

export function initDB() {
  const database = getDB();

  database.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE,
      village TEXT,
      cattle_count INTEGER DEFAULT 0,
      advance_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS fat_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fat_min REAL NOT NULL,
      fat_max REAL NOT NULL,
      rate_per_litre REAL NOT NULL,
      effective_from TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      collection_date TEXT NOT NULL,
      session TEXT NOT NULL CHECK(session IN ('AM','PM')),
      quantity_litres REAL NOT NULL,
      fat_percent REAL NOT NULL,
      rate_per_litre REAL NOT NULL,
      amount_due REAL NOT NULL,
      entered_by TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (member_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (member_id) REFERENCES members(id)
    );
  `);

  // Seed default fat rates if empty
  const count = database.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM fat_rates');
  if (count && count.c === 0) {
    const defaultRates = [
      [3.0, 3.4, 22], [3.5, 3.9, 24], [4.0, 4.4, 26],
      [4.5, 4.9, 28], [5.0, 5.4, 30], [5.5, 5.9, 32],
      [6.0, 6.4, 35], [6.5, 6.9, 38], [7.0, 7.4, 42],
      [7.5, 99.0, 46],
    ];
    for (const [min, max, rate] of defaultRates) {
      database.runSync(
        'INSERT INTO fat_rates (fat_min, fat_max, rate_per_litre) VALUES (?, ?, ?)',
        [min, max, rate]
      );
    }
  }
}

// ─── Members ────────────────────────────────────────────────
export interface Member {
  id: number;
  name: string;
  phone: string;
  village: string;
  cattle_count: number;
  advance_balance: number;
  is_active: number;
  created_at: string;
}

export function getAllMembers(): Member[] {
  return getDB().getAllSync<Member>(
    'SELECT * FROM members WHERE is_active = 1 ORDER BY name ASC'
  );
}

export function getMemberById(id: number): Member | null {
  return getDB().getFirstSync<Member>('SELECT * FROM members WHERE id = ?', [id]);
}

export function insertMember(m: Omit<Member, 'id' | 'created_at' | 'is_active'>): number {
  const result = getDB().runSync(
    'INSERT INTO members (name, phone, village, cattle_count, advance_balance) VALUES (?, ?, ?, ?, ?)',
    [m.name, m.phone, m.village, m.cattle_count, m.advance_balance]
  );
  return result.lastInsertRowId;
}

export function updateMember(m: Member) {
  getDB().runSync(
    'UPDATE members SET name=?, phone=?, village=?, cattle_count=?, advance_balance=? WHERE id=?',
    [m.name, m.phone, m.village, m.cattle_count, m.advance_balance, m.id]
  );
}

export function deactivateMember(id: number) {
  getDB().runSync('UPDATE members SET is_active = 0 WHERE id = ?', [id]);
}

// ─── Fat Rates ───────────────────────────────────────────────
export interface FatRate {
  id: number;
  fat_min: number;
  fat_max: number;
  rate_per_litre: number;
}

export function getRateForFat(fat: number): number {
  const row = getDB().getFirstSync<FatRate>(
    'SELECT rate_per_litre FROM fat_rates WHERE ? >= fat_min AND ? <= fat_max ORDER BY effective_from DESC LIMIT 1',
    [fat, fat]
  );
  return row ? row.rate_per_litre : 0;
}

export function getAllRates(): FatRate[] {
  return getDB().getAllSync<FatRate>(
    'SELECT * FROM fat_rates ORDER BY fat_min ASC'
  );
}

export function updateRate(id: number, rate: number) {
  getDB().runSync('UPDATE fat_rates SET rate_per_litre = ? WHERE id = ?', [rate, id]);
}

// ─── Collections ─────────────────────────────────────────────
export interface Collection {
  id: number;
  member_id: number;
  member_name?: string;
  collection_date: string;
  session: 'AM' | 'PM';
  quantity_litres: number;
  fat_percent: number;
  rate_per_litre: number;
  amount_due: number;
  created_at: string;
}

export function insertCollection(c: Omit<Collection, 'id' | 'created_at' | 'member_name'>): number {
  const result = getDB().runSync(
    `INSERT INTO collections
      (member_id, collection_date, session, quantity_litres, fat_percent, rate_per_litre, amount_due)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [c.member_id, c.collection_date, c.session, c.quantity_litres, c.fat_percent, c.rate_per_litre, c.amount_due]
  );
  return result.lastInsertRowId;
}

export function getCollectionsByDate(date: string): Collection[] {
  return getDB().getAllSync<Collection>(
    `SELECT c.*, m.name as member_name FROM collections c
     JOIN members m ON c.member_id = m.id
     WHERE c.collection_date = ? ORDER BY c.session, m.name`,
    [date]
  );
}

export function getCollectionsByMember(memberId: number, month: string): Collection[] {
  return getDB().getAllSync<Collection>(
    `SELECT * FROM collections WHERE member_id = ? AND collection_date LIKE ? ORDER BY collection_date ASC`,
    [memberId, `${month}%`]
  );
}

export function deleteCollection(id: number) {
  getDB().runSync('DELETE FROM collections WHERE id = ?', [id]);
}

// ─── Reports / Summaries ─────────────────────────────────────
export interface MemberSummary {
  member_id: number;
  member_name: string;
  total_litres: number;
  avg_fat: number;
  total_amount: number;
  days_count: number;
}

export function getMonthlySummary(month: string): MemberSummary[] {
  return getDB().getAllSync<MemberSummary>(
    `SELECT
       c.member_id,
       m.name as member_name,
       ROUND(SUM(c.quantity_litres), 2) as total_litres,
       ROUND(AVG(c.fat_percent), 2) as avg_fat,
       ROUND(SUM(c.amount_due), 2) as total_amount,
       COUNT(DISTINCT c.collection_date) as days_count
     FROM collections c
     JOIN members m ON c.member_id = m.id
     WHERE c.collection_date LIKE ?
     GROUP BY c.member_id
     ORDER BY total_amount DESC`,
    [`${month}%`]
  );
}

export function getDailyTotal(date: string): { total_litres: number; total_amount: number } {
  return getDB().getFirstSync<{ total_litres: number; total_amount: number }>(
    `SELECT ROUND(SUM(quantity_litres),2) as total_litres, ROUND(SUM(amount_due),2) as total_amount
     FROM collections WHERE collection_date = ?`,
    [date]
  ) ?? { total_litres: 0, total_amount: 0 };
}
