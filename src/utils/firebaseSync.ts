import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { getDB } from '../db/database';

// Default mock/fallback config or developer default to keep the app working instantly
const defaultFirebaseConfig = {
  apiKey: "AIzaSyFakeKeyPlaceholderForBuildSuccess",
  authDomain: "dairy-manager-app.firebaseapp.com",
  projectId: "dairy-manager-app",
  storageBucket: "dairy-manager-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

export async function syncDataToCloud(
  customConfig?: typeof defaultFirebaseConfig,
  deviceId: string = 'default_device'
): Promise<{ success: boolean; message: string }> {
  try {
    const config = customConfig || defaultFirebaseConfig;
    
    // Initialize firebase app
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const firestore = getFirestore(app);

    const db = getDB();

    // 1. Fetch SQLite tables
    const members = db.getAllSync<any>('SELECT * FROM members');
    const collections = db.getAllSync<any>('SELECT * FROM collections');
    const fatRates = db.getAllSync<any>('SELECT * FROM fat_rates');
    const payments = db.getAllSync<any>('SELECT * FROM payments');

    const batch = writeBatch(firestore);

    // 2. Add members to batch sync
    members.forEach((m) => {
      const memberRef = doc(firestore, `devices/${deviceId}/members`, String(m.id));
      batch.set(memberRef, {
        name: m.name,
        phone: m.phone || '',
        village: m.village || '',
        cattle_count: m.cattle_count || 0,
        advance_balance: m.advance_balance || 0,
        is_active: m.is_active,
        created_at: m.created_at || ''
      });
    });

    // 3. Add collections to batch sync
    collections.forEach((c) => {
      const colRef = doc(firestore, `devices/${deviceId}/collections`, String(c.id));
      batch.set(colRef, {
        member_id: c.member_id,
        collection_date: c.collection_date,
        session: c.session,
        quantity_litres: c.quantity_litres,
        fat_percent: c.fat_percent,
        rate_per_litre: c.rate_per_litre,
        amount_due: c.amount_due,
        entered_by: c.entered_by || 'admin',
        created_at: c.created_at || ''
      });
    });

    // 4. Add fat rates to batch sync
    fatRates.forEach((fr) => {
      const rateRef = doc(firestore, `devices/${deviceId}/fat_rates`, String(fr.id));
      batch.set(rateRef, {
        fat_min: fr.fat_min,
        fat_max: fr.fat_max,
        rate_per_litre: fr.rate_per_litre,
        effective_from: fr.effective_from || ''
      });
    });

    // 5. Add payments to batch sync
    payments.forEach((p) => {
      const payRef = doc(firestore, `devices/${deviceId}/payments`, String(p.id));
      batch.set(payRef, {
        member_id: p.member_id,
        amount: p.amount,
        payment_date: p.payment_date,
        note: p.note || ''
      });
    });

    // Commit Firestore batch sync
    await batch.commit();

    return {
      success: true,
      message: `Successfully synchronized ${members.length} members, ${collections.length} collections, ${fatRates.length} fat rates, and ${payments.length} payments to the cloud.`
    };
  } catch (error: any) {
    console.error('Firebase Sync Error:', error);
    return {
      success: false,
      message: error.message || 'Unknown syncing error occurred.'
    };
  }
}
