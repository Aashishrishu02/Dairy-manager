import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: any;

class MockDatabase {
  private getStorage(key: string): any[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setStorage(key: string, data: any[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }

  execSync(sql: string) {
    // Initial tables setup in localStorage
    if (sql.includes('CREATE TABLE IF NOT EXISTS members')) {
      if (this.getStorage('mock_members').length === 0) {
        this.setStorage('mock_members', []);
      }
      if (this.getStorage('mock_fat_rates').length === 0) {
        this.setStorage('mock_fat_rates', [
          { id: 1, fat_min: 3.0, fat_max: 3.4, rate_per_litre: 22 },
          { id: 2, fat_min: 3.5, fat_max: 3.9, rate_per_litre: 24 },
          { id: 3, fat_min: 4.0, fat_max: 4.4, rate_per_litre: 26 },
          { id: 4, fat_min: 4.5, fat_max: 4.9, rate_per_litre: 28 },
          { id: 5, fat_min: 5.0, fat_max: 5.4, rate_per_litre: 30 },
          { id: 6, fat_min: 5.5, fat_max: 5.9, rate_per_litre: 32 },
          { id: 7, fat_min: 6.0, fat_max: 6.4, rate_per_litre: 35 },
          { id: 8, fat_min: 6.5, fat_max: 6.9, rate_per_litre: 38 },
          { id: 9, fat_min: 7.0, fat_max: 7.4, rate_per_litre: 42 },
          { id: 10, fat_min: 7.5, fat_max: 99.0, rate_per_litre: 46 }
        ]);
      }
      if (this.getStorage('mock_collections').length === 0) {
        this.setStorage('mock_collections', []);
      }
      if (this.getStorage('mock_payments').length === 0) {
        this.setStorage('mock_payments', []);
      }
    }
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    if (sql.includes('SELECT COUNT(*) as c FROM fat_rates')) {
      const rates = this.getStorage('mock_fat_rates');
      return { c: rates.length } as any;
    }
    if (sql.includes('SELECT * FROM members WHERE id = ?')) {
      const members = this.getStorage('mock_members');
      const member = members.find(m => m.id === params[0]);
      return (member || null) as any;
    }
    if (sql.includes('SELECT rate_per_litre FROM fat_rates')) {
      const fat = params[0];
      const rates = this.getStorage('mock_fat_rates');
      // Find matching fat range
      const rate = rates.find(r => fat >= r.fat_min && fat <= r.fat_max);
      return (rate || null) as any;
    }
    if (sql.includes('FROM collections WHERE collection_date = ?')) {
      const date = params[0];
      const collections = this.getStorage('mock_collections');
      const daily = collections.filter(c => c.collection_date === date);
      const total_litres = daily.reduce((sum, c) => sum + c.quantity_litres, 0);
      const total_amount = daily.reduce((sum, c) => sum + c.amount_due, 0);
      return { total_litres, total_amount } as any;
    }
    return null;
  }

  getAllSync<T>(sql: string, params: any[] = []): T[] {
    if (sql.includes('SELECT * FROM members WHERE is_active = 1')) {
      const members = this.getStorage('mock_members');
      return members
        .filter(m => m.is_active === 1)
        .sort((a, b) => a.name.localeCompare(b.name)) as any;
    }
    if (sql.includes('SELECT * FROM fat_rates ORDER BY fat_min ASC')) {
      return this.getStorage('mock_fat_rates') as any;
    }
    if (sql.includes('SELECT c.*, m.name as member_name FROM collections c')) {
      const date = params[0];
      const collections = this.getStorage('mock_collections');
      const members = this.getStorage('mock_members');
      
      const filtered = collections
        .filter(c => c.collection_date === date)
        .map(c => {
          const member = members.find(m => m.id === c.member_id);
          return { ...c, member_name: member ? member.name : 'Unknown' };
        });

      return filtered.sort((a, b) => {
        if (a.session !== b.session) {
          return a.session.localeCompare(b.session);
        }
        return a.member_name.localeCompare(b.member_name);
      }) as any;
    }
    if (sql.includes('SELECT * FROM collections WHERE member_id = ? AND collection_date LIKE ?')) {
      const memberId = params[0];
      const monthPrefix = params[1].replace('%', '');
      const collections = this.getStorage('mock_collections');
      return collections
        .filter(c => c.member_id === memberId && c.collection_date.startsWith(monthPrefix))
        .sort((a, b) => a.collection_date.localeCompare(b.collection_date)) as any;
    }
    if (sql.includes('SELECT\n       c.member_id,\n       m.name as member_name')) {
      const monthPrefix = params[0].replace('%', '');
      const collections = this.getStorage('mock_collections');
      const members = this.getStorage('mock_members');

      const filtered = collections.filter(c => c.collection_date.startsWith(monthPrefix));
      const groups: Record<number, any> = {};

      filtered.forEach(c => {
        const member = members.find(m => m.id === c.member_id);
        if (!member) return;
        if (!groups[c.member_id]) {
          groups[c.member_id] = {
            member_id: c.member_id,
            member_name: member.name,
            total_litres: 0,
            avg_fat_sum: 0,
            avg_fat_count: 0,
            total_amount: 0,
            dates: new Set<string>()
          };
        }
        const g = groups[c.member_id];
        g.total_litres += c.quantity_litres;
        g.avg_fat_sum += c.fat_percent;
        g.avg_fat_count += 1;
        g.total_amount += c.amount_due;
        g.dates.add(c.collection_date);
      });

      const summaries = Object.values(groups).map(g => ({
        member_id: g.member_id,
        member_name: g.member_name,
        total_litres: Math.round(g.total_litres * 100) / 100,
        avg_fat: Math.round((g.avg_fat_sum / g.avg_fat_count) * 100) / 100,
        total_amount: Math.round(g.total_amount * 100) / 100,
        days_count: g.dates.size
      }));

      return summaries.sort((a, b) => b.total_amount - a.total_amount) as any;
    }
    return [];
  }

  runSync(sql: string, params: any[] = []): { lastInsertRowId: number; changes: number } {
    if (sql.includes('INSERT INTO fat_rates')) {
      const rates = this.getStorage('mock_fat_rates');
      const newId = rates.length ? Math.max(...rates.map(r => r.id)) + 1 : 1;
      const newRate = {
        id: newId,
        fat_min: params[0],
        fat_max: params[1],
        rate_per_litre: params[2],
        effective_from: new Date().toISOString().split('T')[0]
      };
      rates.push(newRate);
      this.setStorage('mock_fat_rates', rates);
      return { lastInsertRowId: newId, changes: 1 };
    }
    if (sql.includes('INSERT INTO members')) {
      const members = this.getStorage('mock_members');
      const newId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;
      const newMember = {
        id: newId,
        name: params[0],
        phone: params[1],
        village: params[2],
        cattle_count: params[3],
        advance_balance: params[4],
        is_active: 1,
        created_at: new Date().toISOString().split('T')[0]
      };
      members.push(newMember);
      this.setStorage('mock_members', members);
      return { lastInsertRowId: newId, changes: 1 };
    }
    if (sql.includes('UPDATE members SET name=?')) {
      const members = this.getStorage('mock_members');
      const idx = members.findIndex(m => m.id === params[5]);
      if (idx !== -1) {
        members[idx] = {
          ...members[idx],
          name: params[0],
          phone: params[1],
          village: params[2],
          cattle_count: params[3],
          advance_balance: params[4]
        };
        this.setStorage('mock_members', members);
      }
      return { lastInsertRowId: 0, changes: 1 };
    }
    if (sql.includes('UPDATE members SET is_active = 0')) {
      const members = this.getStorage('mock_members');
      const idx = members.findIndex(m => m.id === params[0]);
      if (idx !== -1) {
        members[idx].is_active = 0;
        this.setStorage('mock_members', members);
      }
      return { lastInsertRowId: 0, changes: 1 };
    }
    if (sql.includes('UPDATE fat_rates SET rate_per_litre = ?')) {
      const rates = this.getStorage('mock_fat_rates');
      const idx = rates.findIndex(r => r.id === params[1]);
      if (idx !== -1) {
        rates[idx].rate_per_litre = params[0];
        this.setStorage('mock_fat_rates', rates);
      }
      return { lastInsertRowId: 0, changes: 1 };
    }
    if (sql.includes('INSERT INTO collections')) {
      const collections = this.getStorage('mock_collections');
      const newId = collections.length ? Math.max(...collections.map(c => c.id)) + 1 : 1;
      const newCol = {
        id: newId,
        member_id: params[0],
        collection_date: params[1],
        session: params[2],
        quantity_litres: params[3],
        fat_percent: params[4],
        rate_per_litre: params[5],
        amount_due: params[6],
        entered_by: 'admin',
        created_at: new Date().toISOString()
      };
      collections.push(newCol);
      this.setStorage('mock_collections', collections);
      return { lastInsertRowId: newId, changes: 1 };
    }
    if (sql.includes('DELETE FROM collections WHERE id = ?')) {
      const collections = this.getStorage('mock_collections');
      const filtered = collections.filter(c => c.id !== params[0]);
      this.setStorage('mock_collections', filtered);
      return { lastInsertRowId: 0, changes: 1 };
    }
    return { lastInsertRowId: 0, changes: 0 };
  }
}

interface DatabaseInterface {
  execSync(sql: string): void;
  getFirstSync<T>(sql: string, params?: any[]): T | null;
  getAllSync<T>(sql: string, params?: any[]): T[];
  runSync(sql: string, params?: any[]): { lastInsertRowId: number; changes: number };
}

export function getDB(): DatabaseInterface {
  if (!db) {
    if (Platform.OS === 'web') {
      db = new MockDatabase();
    } else {
      db = SQLite.openDatabaseSync('dairy.db');
    }
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
