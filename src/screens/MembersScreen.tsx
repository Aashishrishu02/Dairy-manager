import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, Alert, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllMembers, insertMember, updateMember, deactivateMember, Member } from '../db/database';
import { useDairyStore } from '../store/useDairyStore';
import { Button, Card, EmptyState } from '../components/UI';
import { colors, spacing, radius, shadow } from '../utils/theme';
import { useTranslation } from '../utils/i18n';

const emptyForm = { name: '', phone: '', village: '', cattle_count: '0', advance_balance: '0' };

export default function MembersScreen() {
  const { refreshMembers } = useDairyStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { t } = useTranslation();

  const load = () => {
    const all = getAllMembers();
    setMembers(all);
    refreshMembers();
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = search
    ? members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.village?.toLowerCase().includes(search.toLowerCase())
      )
    : members;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (m: Member) => {
    setEditing(m);
    setForm({
      name: m.name,
      phone: m.phone ?? '',
      village: m.village ?? '',
      cattle_count: String(m.cattle_count ?? 0),
      advance_balance: String(m.advance_balance ?? 0),
    });
    setModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      Alert.alert(t('nameRequiredAlert'), t('nameRequiredAlertMsg'));
      return;
    }
    if (editing) {
      updateMember({
        ...editing,
        name: form.name.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        cattle_count: parseInt(form.cattle_count) || 0,
        advance_balance: parseFloat(form.advance_balance) || 0,
      });
    } else {
      insertMember({
        name: form.name.trim(),
        phone: form.phone.trim(),
        village: form.village.trim(),
        cattle_count: parseInt(form.cattle_count) || 0,
        advance_balance: parseFloat(form.advance_balance) || 0,
      });
    }
    setModal(false);
    load();
  };

  const handleDelete = (m: Member) => {
    Alert.alert(
      t('removeMemberAlert'),
      t('removeMemberConfirm', { name: m.name }),
      [
        { text: t('cancelAction'), style: 'cancel' },
        {
          text: t('removeAction'), style: 'destructive',
          onPress: () => { deactivateMember(m.id); load(); },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Member }) => (
    <TouchableOpacity onPress={() => openEdit(item)} activeOpacity={0.85}>
      <Card style={styles.memberCard}>
        <View style={styles.memberRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberSub}>
              {[item.village, item.phone, item.cattle_count ? `${item.cattle_count} cattle` : null]
                .filter(Boolean).join(' · ')}
            </Text>
            {item.advance_balance > 0 && (
              <Text style={styles.advance}>{t('advanceLabel', { balance: item.advance_balance })}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search + Add */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchMembersPlaceholder')}
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ {t('addMemberAction').replace(' member', '').replace('सदस्य ', '')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>{t('membersCountLabel', { count: filtered.length })}</Text>

      <FlatList
        data={filtered}
        keyExtractor={m => String(m.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title={t('noMembersYet')}
            subtitle={t('addFirstSupplier')}
          />
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? t('editMemberHeader') : t('newMemberHeader')}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { label: t('nameFieldLabel'), key: 'name', placeholder: t('nameFieldPlaceholder'), type: 'default' },
              { label: t('phoneFieldLabel'), key: 'phone', placeholder: t('phoneFieldPlaceholder'), type: 'phone-pad' },
              { label: t('villageFieldLabel'), key: 'village', placeholder: t('villageFieldPlaceholder'), type: 'default' },
              { label: t('cattleFieldLabel'), key: 'cattle_count', placeholder: t('cattleFieldPlaceholder'), type: 'numeric' },
              { label: t('advanceFieldLabel'), key: 'advance_balance', placeholder: t('advanceFieldPlaceholder'), type: 'decimal-pad' },
            ].map(({ label, key, placeholder, type }) => (
              <View key={key} style={styles.formField}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={colors.textTertiary}
                  value={(form as any)[key]}
                  onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                  keyboardType={type as any}
                  autoCapitalize={key === 'name' || key === 'village' ? 'words' : 'none'}
                />
              </View>
            ))}

            <Button
              label={editing ? t('saveChangesAction') : t('addMemberAction')}
              onPress={handleSave}
              style={{ marginTop: spacing.md }}
            />
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: 0,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  count: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    marginTop: 8,
    marginBottom: 4,
  },
  list: { padding: spacing.md, gap: spacing.sm, paddingTop: spacing.sm },
  memberCard: { padding: spacing.sm + 4 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  memberName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  memberSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  advance: { fontSize: 12, color: colors.accent, fontWeight: '600', marginTop: 2 },
  deleteBtn: { padding: 6 },
  modal: { flex: 1, backgroundColor: colors.bg },
  modalContent: { padding: spacing.md },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  closeBtn: { fontSize: 20, color: colors.textSecondary, padding: 4 },
  formField: { marginBottom: spacing.md },
  fieldLabel: {
    fontSize: 12,
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
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
});
