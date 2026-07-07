import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { getAllRates, updateRate, FatRate } from '../db/database';
import { Card, Button } from '../components/UI';
import { colors, spacing, radius } from '../utils/theme';
import { useTranslation } from '../utils/i18n';
import { syncDataToCloud } from '../utils/firebaseSync';
import { auth } from '../utils/firebase';

export default function FatRatesScreen() {
  const [rates, setRates] = useState<FatRate[]>([]);
  const [editing, setEditing] = useState<FatRate | null>(null);
  const [newRate, setNewRate] = useState('');
  const [syncing, setSyncing] = useState(false);
  const { t } = useTranslation();

  const load = () => setRates(getAllRates());
  useFocusEffect(useCallback(() => { load(); }, []));

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncDataToCloud();
      if (res.success) {
        Alert.alert("Cloud Backup Success", res.message);
      } else {
        Alert.alert("Sync Failed", res.message);
      }
    } catch (err: any) {
      Alert.alert("Sync Error", err.message || "An error occurred");
    } finally {
      setSyncing(false);
    }
  };

  const openEdit = (r: FatRate) => {
    setEditing(r);
    setNewRate(String(r.rate_per_litre));
  };

  const handleSave = () => {
    if (!editing) return;
    const val = parseFloat(newRate);
    if (isNaN(val) || val <= 0) {
      Alert.alert(t('invalidRateAlert'), t('invalidRateAlertMsg'));
      return;
    }
    updateRate(editing.id, val);
    setEditing(null);
    load();
  };

  const renderItem = ({ item }: { item: FatRate }) => (
    <TouchableOpacity onPress={() => openEdit(item)} activeOpacity={0.85}>
      <Card style={styles.rateCard}>
        <View style={styles.rateRow}>
          <View style={styles.fatRange}>
            <Text style={styles.fatLabel}>
              {item.fat_min}% – {item.fat_max >= 99 ? '↑' : `${item.fat_max}%`}
            </Text>
            <Text style={styles.fatSub}>{t('fatRangeLabel')}</Text>
          </View>
          <View style={styles.rateRight}>
            <Text style={styles.rateValue}>₹{item.rate_per_litre}</Text>
            <Text style={styles.rateSub}>{t('perLitreLabel')}</Text>
          </View>
          <View style={styles.editHint}>
            <Text style={styles.editText}>{t('editActionHint')}</Text>
          </View>
        </View>
        {/* Mini visual bar */}
        <View style={styles.barBg}>
          <View style={[
            styles.barFill,
            {
              width: `${Math.min(((item.rate_per_litre - 20) / 30) * 100, 100)}%`,
              backgroundColor: item.rate_per_litre >= 40
                ? colors.primary
                : item.rate_per_litre >= 30
                  ? colors.primaryMid
                  : colors.textTertiary,
            }
          ]} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          {t('fatRateInfo')}
        </Text>
      </View>

      <FlatList
        data={rates}
        keyExtractor={r => String(r.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.sm }}>
            <Card style={styles.syncCard}>
              <View style={styles.syncRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.syncTitle}>☁️ Cloud Sync Backup</Text>
                  <Text style={styles.syncSub}>Backup members & milk entry logs to Firestore</Text>
                </View>
                <TouchableOpacity
                  style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
                  onPress={handleSync}
                  disabled={syncing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.syncBtnText}>
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card style={styles.logoutCard}>
              <View style={styles.syncRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logoutTitle}>🔑 Account Session</Text>
                  <Text style={styles.logoutSub}>Logged in as: {auth.currentUser?.email || 'Operator'}</Text>
                </View>
                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={() => signOut(auth)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.logoutBtnText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        }
      />

      {/* Edit modal */}
      <Modal visible={!!editing} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('updateRateHeader')}</Text>
            {editing && (
              <Text style={styles.modalSubtitle}>
                Fat {editing.fat_min}% – {editing.fat_max >= 99 ? t('aboveLabel') : `${editing.fat_max}%`}
              </Text>
            )}
            <Text style={styles.fieldLabel}>{t('ratePerLitreInput')}</Text>
            <TextInput
              style={styles.input}
              value={newRate}
              onChangeText={setNewRate}
              keyboardType="decimal-pad"
              autoFocus
              placeholder="e.g. 35"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.modalActions}>
              <Button
                label={t('cancelAction')}
                variant="ghost"
                onPress={() => setEditing(null)}
                style={{ flex: 1 }}
              />
              <Button
                label={t('save')}
                onPress={handleSave}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  syncCard: {
    padding: spacing.md,
    backgroundColor: '#EBF6FF',
    borderColor: '#B9E0FF',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  logoutCard: {
    padding: spacing.md,
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E11D48',
  },
  logoutSub: {
    fontSize: 12,
    color: '#E11D48',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00529B',
  },
  syncSub: {
    fontSize: 12,
    color: '#00529B',
    marginTop: 2,
  },
  syncBtn: {
    backgroundColor: '#00529B',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBtnDisabled: {
    backgroundColor: '#84B0DF',
  },
  syncBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoBox: {
    margin: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
  },
  infoText: { fontSize: 13, color: colors.primary, lineHeight: 19 },
  list: { paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: 32 },
  rateCard: { padding: spacing.sm + 4 },
  rateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  fatRange: { flex: 1 },
  fatLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  fatSub: { fontSize: 11, color: colors.textTertiary },
  rateRight: { alignItems: 'flex-end', marginRight: spacing.sm },
  rateValue: { fontSize: 22, fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  rateSub: { fontSize: 11, color: colors.textSecondary },
  editHint: { paddingLeft: 4 },
  editText: { fontSize: 13, color: colors.textTertiary },
  barBg: {
    height: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  modalActions: { flexDirection: 'row', gap: spacing.sm },
});
