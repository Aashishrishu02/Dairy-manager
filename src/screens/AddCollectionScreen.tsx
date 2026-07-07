import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDairyStore } from '../store/useDairyStore';
import { insertCollection, getAllMembers, Member } from '../db/database';
import { Button, Card, Badge } from '../components/UI';
import { colors, spacing, radius, shadow } from '../utils/theme';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '../utils/i18n';
import { printCollectionReceipt } from '../utils/pdfGenerator';

export default function AddCollectionScreen() {
  const navigation = useNavigation<any>();
  const { members, refreshMembers, selectedDate, selectedSession, computeAmount } = useDairyStore();
  const { t } = useTranslation();

  const [memberId, setMemberId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberList, setShowMemberList] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [fat, setFat] = useState('');
  const [session, setSession] = useState<'AM' | 'PM'>(selectedSession);
  const [date, setDate] = useState(selectedDate);
  const [saving, setSaving] = useState(false);

  useEffect(() => { refreshMembers(); }, []);

  const selectedMember = members.find(m => m.id === memberId);
  const filteredMembers = memberSearch.length > 0
    ? members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
    : members;

  const qty = parseFloat(quantity) || 0;
  const fatPct = parseFloat(fat) || 0;
  const { rate, amount } = computeAmount(qty, fatPct);
  const isValid = memberId && qty > 0 && fatPct >= 3 && fatPct <= 15;

  const handleSave = () => {
    if (!isValid) {
      Alert.alert(t('missingInfoAlert'), t('missingInfoAlertMsg'));
      return;
    }
    setSaving(true);
    try {
      insertCollection({
        member_id: memberId!,
        collection_date: date,
        session,
        quantity_litres: qty,
        fat_percent: fatPct,
        rate_per_litre: rate,
        amount_due: amount,
      });
      Alert.alert(
        t('savedAlert'),
        `${selectedMember?.name} — ${qty}L @ ₹${rate}/L = ₹${amount}`,
        [
          {
            text: '🖨️ Print',
            onPress: async () => {
              if (selectedMember) {
                try {
                  await printCollectionReceipt(selectedMember, date, session, qty, fatPct, rate, amount);
                } catch (err: any) {
                  Alert.alert('Print Error', err.message);
                }
              }
              resetForm();
            }
          },
          {
            text: t('addAnotherAction'),
            onPress: resetForm
          },
          {
            text: t('doneAction'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setMemberId(null);
    setMemberSearch('');
    setQuantity('');
    setFat('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Date & Session */}
        <Card style={{ marginBottom: spacing.sm }}>
          <Text style={styles.fieldLabel}>{t('dateLabel')}</Text>
          <Text style={styles.dateDisplay}>{format(parseISO(date), 'EEEE, d MMM yyyy')}</Text>
          <View style={styles.sessionToggle}>
            {(['AM', 'PM'] as const).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.sessionBtn, session === s && styles.sessionActive]}
                onPress={() => setSession(s)}
              >
                <Text style={[styles.sessionText, session === s && styles.sessionActiveText]}>
                  {s === 'AM' ? t('sessionAM') : t('sessionPM')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Member selection */}
        <Card style={{ marginBottom: spacing.sm }}>
          <Text style={styles.fieldLabel}>{t('memberSelectLabel')}</Text>
          {selectedMember ? (
            <TouchableOpacity
              style={styles.selectedMember}
              onPress={() => { setMemberId(null); setMemberSearch(''); }}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{selectedMember.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{selectedMember.name}</Text>
                {selectedMember.village ? (
                  <Text style={styles.memberSub}>{selectedMember.village}</Text>
                ) : null}
              </View>
              <Text style={styles.changeBtn}>{t('changeLabel')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder={t('searchMemberPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                value={memberSearch}
                onChangeText={val => { setMemberSearch(val); setShowMemberList(true); }}
                onFocus={() => setShowMemberList(true)}
              />
              {showMemberList && filteredMembers.length > 0 && (
                <View style={styles.memberDropdown}>
                  {filteredMembers.slice(0, 8).map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.memberItem}
                      onPress={() => {
                        setMemberId(m.id);
                        setMemberSearch(m.name);
                        setShowMemberList(false);
                      }}
                    >
                      <View style={styles.memberAvatarSm}>
                        <Text style={styles.memberAvatarTextSm}>{m.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.memberItemName}>{m.name}</Text>
                        {m.village ? <Text style={styles.memberItemSub}>{m.village}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </Card>

        {/* Quantity & Fat */}
        <Card style={{ marginBottom: spacing.sm }}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('quantityLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('quantityPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>{t('fatLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('fatPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>

          {/* Fat presets */}
          <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>{t('quickFatLabel')}</Text>
          <View style={styles.presetRow}>
            {[4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.preset, fat === String(v) && styles.presetActive]}
                onPress={() => setFat(String(v))}
              >
                <Text style={[styles.presetText, fat === String(v) && styles.presetActiveText]}>
                  {v}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Live price preview */}
        {qty > 0 && fatPct >= 3 ? (
          <Card style={styles.previewCard}>
            <View style={styles.previewRow}>
              <View>
                <Text style={styles.previewLabel}>{t('rateForFatLabel', { fat: fatPct })}</Text>
                <Text style={styles.previewRate}>₹{rate} / {t('perLitreLabel')}</Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.previewLabel}>{t('amountDueToday')}</Text>
                <Text style={styles.previewAmount}>₹{amount}</Text>
              </View>
            </View>
            <Text style={styles.previewFormula}>
              {t('previewFormulaLabel', { qty, rate, amount })}
            </Text>
          </Card>
        ) : null}

        {/* Save */}
        <Button
          label={t('saveEntryAction')}
          onPress={handleSave}
          loading={saving}
          disabled={!isValid}
          style={{ marginTop: spacing.md }}
        />

        <View style={{ height: 48 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  dateDisplay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sessionToggle: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4,
  },
  sessionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  sessionActive: { backgroundColor: colors.surface, ...shadow.subtle },
  sessionText: { fontSize: 14, color: colors.textSecondary },
  sessionActiveText: { fontWeight: '700', color: colors.primary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.bg,
  },
  selectedMember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  memberName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  memberSub: { fontSize: 13, color: colors.textSecondary },
  changeBtn: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  memberDropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatarSm: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarTextSm: { fontSize: 14, fontWeight: '700', color: colors.primary },
  memberItemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  memberItemSub: { fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: 'row' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  preset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  presetActiveText: { color: '#fff', fontWeight: '700' },
  previewCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#B8DFC9',
    marginTop: spacing.sm,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  previewLabel: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  previewRate: { fontSize: 20, fontWeight: '700', color: colors.primary },
  previewDivider: { flex: 1 },
  previewAmount: { fontSize: 28, fontWeight: '800', color: colors.primary, letterSpacing: -1 },
  previewFormula: { fontSize: 13, color: colors.primaryMid, textAlign: 'center', marginTop: 4 },
});
