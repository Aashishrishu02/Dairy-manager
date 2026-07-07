import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCollectionsByDate, deleteCollection, getDailyTotal, Collection } from '../db/database';
import { useDairyStore } from '../store/useDairyStore';
import { StatCard, Card, Badge, EmptyState } from '../components/UI';
import { colors, spacing, radius } from '../utils/theme';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '../utils/i18n';

export default function TodayCollectionScreen() {
  const navigation = useNavigation<any>();
  const { selectedDate } = useDairyStore();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [totals, setTotals] = useState({ total_litres: 0, total_amount: 0 });
  const [filterSession, setFilterSession] = useState<'ALL' | 'AM' | 'PM'>('ALL');
  const { t } = useTranslation();

  const load = useCallback(() => {
    const data = getCollectionsByDate(selectedDate);
    setCollections(data);
    const t = getDailyTotal(selectedDate);
    setTotals(t);
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = filterSession === 'ALL'
    ? collections
    : collections.filter(c => c.session === filterSession);

  const handleDelete = (c: Collection) => {
    Alert.alert(
      t('deleteEntryAlert'),
      t('deleteEntryConfirm', { name: c.member_name ?? '?', session: c.session === 'AM' ? t('sessionAM') : t('sessionPM'), qty: c.quantity_litres }),
      [
        { text: t('cancelAction'), style: 'cancel' },
        {
          text: t('deleteAction'), style: 'destructive',
          onPress: () => { deleteCollection(c.id); load(); },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Collection }) => (
    <Card style={styles.entryCard}>
      <View style={styles.entryRow}>
        <View style={styles.entryLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.member_name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.entryName}>{item.member_name}</Text>
            <View style={styles.entryTags}>
              <Badge
                label={item.session === 'AM' ? t('sessionAMBadge') : t('sessionPMBadge')}
                color={item.session === 'AM' ? colors.amText : colors.pmText}
                bg={item.session === 'AM' ? colors.amBadge : colors.pmBadge}
              />
              <Text style={styles.entryFat}>{item.fat_percent}% {t('fatRangeLabel').split(' ')[0]}</Text>
            </View>
          </View>
        </View>
        <View style={styles.entryRight}>
          <Text style={styles.entryQty}>{item.quantity_litres} L</Text>
          <Text style={styles.entryAmount}>₹{item.amount_due}</Text>
          <TouchableOpacity onPress={() => handleDelete(item)} style={{ padding: 4 }}>
            <Text style={{ fontSize: 14, color: colors.textTertiary }}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{format(parseISO(selectedDate), 'EEEE, d MMM yyyy')}</Text>
      </View>

      {/* Totals */}
      <View style={styles.statsRow}>
        <StatCard label={t('litresCollected')} value={`${totals.total_litres ?? 0} L`} accent />
        <View style={{ width: spacing.sm }} />
        <StatCard label={t('amountDueToday')} value={`₹${totals.total_amount ?? 0}`} />
        <View style={{ width: spacing.sm }} />
        <StatCard label={t('entriesCountLabel')} value={`${collections.length}`} />
      </View>

      {/* Session filter */}
      <View style={styles.filterRow}>
        {(['ALL', 'AM', 'PM'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterBtn, filterSession === s && styles.filterActive]}
            onPress={() => setFilterSession(s)}
          >
            <Text style={[styles.filterText, filterSession === s && styles.filterActiveText]}>
              {s === 'ALL' ? t('sessionAllLabel') : s === 'AM' ? t('sessionAMBadge') : t('sessionPMBadge')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => String(c.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="🥛"
            title={t('noEntriesFound')}
            subtitle={t('noEntriesFoundSub', { session: filterSession === 'ALL' ? '' : (filterSession === 'AM' ? t('sessionAM') : t('sessionPM')) })}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCollection')}
      >
        <Text style={styles.fabText}>+ {t('newEntryAction')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  dateHeader: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateLabel: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterActiveText: { color: '#fff' },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 },
  entryCard: { padding: spacing.sm + 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  entryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary },
  entryName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  entryTags: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  entryFat: { fontSize: 12, color: colors.textSecondary },
  entryRight: { alignItems: 'flex-end', gap: 2 },
  entryQty: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  entryAmount: { fontSize: 16, fontWeight: '700', color: colors.primary },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
