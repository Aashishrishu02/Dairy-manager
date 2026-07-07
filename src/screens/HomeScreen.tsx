import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDailyTotal, getMonthlySummary, getAllMembers } from '../db/database';
import { useDairyStore } from '../store/useDairyStore';
import { StatCard, Card, SectionHeader, EmptyState } from '../components/UI';
import { colors, spacing, radius, shadow } from '../utils/theme';
import { format, parseISO } from 'date-fns';
import { useTranslation } from '../utils/i18n';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { selectedDate, setDate, selectedSession, setSession, language, setLanguage } = useDairyStore();
  const [daily, setDaily] = useState({ total_litres: 0, total_amount: 0 });
  const [monthSummary, setMonthSummary] = useState<any[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const load = useCallback(() => {
    const d = getDailyTotal(selectedDate);
    setDaily(d);
    const month = selectedDate.substring(0, 7);
    setMonthSummary(getMonthlySummary(month).slice(0, 5));
    setMemberCount(getAllMembers().length);
  }, [selectedDate]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); setRefreshing(false); };

  const dateLabel = format(parseISO(selectedDate), 'EEEE, d MMM yyyy');
  const monthLabel = format(parseISO(selectedDate.substring(0, 7) + '-01'), 'MMMM yyyy');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>🐄 {t('appTitle')}</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            activeOpacity={0.8}
          >
            <Text style={styles.langBtnText}>{language === 'en' ? 'हिन्दी' : 'EN'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddCollection')}
          >
            <Text style={styles.addBtnText}>+ {t('newEntryAction')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Session toggle */}
      <View style={styles.sessionRow}>
        {(['AM', 'PM'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sessionBtn, selectedSession === s && styles.sessionBtnActive]}
            onPress={() => setSession(s)}
          >
            <Text style={[styles.sessionText, selectedSession === s && styles.sessionTextActive]}>
              {s === 'AM' ? `🌅 ${t('morning')}` : `🌆 ${t('evening')}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's stats */}
      <SectionHeader title={t('todaysCollectionHeader')} />
      <View style={styles.statsRow}>
        <StatCard
          label={t('litresCollected')}
          value={`${daily.total_litres ?? 0} L`}
          accent
        />
        <View style={{ width: spacing.sm }} />
        <StatCard
          label={t('amountDueToday')}
          value={`₹${daily.total_amount ?? 0}`}
          sub={t('todayLabel')}
        />
      </View>

      <View style={styles.statsRow}>
        <StatCard
          label={t('activeMembers')}
          value={`${memberCount}`}
          sub={t('registeredLabel')}
        />
        <View style={{ width: spacing.sm }} />
        <TouchableOpacity
          style={[styles.quickCard]}
          onPress={() => navigation.navigate('AddCollection')}
          activeOpacity={0.85}
        >
          <Text style={styles.quickIcon}>📝</Text>
          <Text style={styles.quickLabel}>{t('newEntryAction')}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      <SectionHeader title={t('quickActions')} />
      <View style={styles.actionsGrid}>
        {[
          { icon: '👥', label: t('membersTitle'), screen: 'Members' },
          { icon: '📋', label: t('todayTitle'), screen: 'TodayCollection' },
          { icon: '📊', label: t('reportsTitle'), screen: 'Reports' },
          { icon: '⚙️', label: t('ratesTitle'), screen: 'FatRates' },
        ].map(({ icon, label, screen }) => (
          <TouchableOpacity
            key={screen}
            style={styles.actionBtn}
            onPress={() => navigation.navigate(screen)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{icon}</Text>
            <Text style={styles.actionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Monthly top members */}
      <SectionHeader
        title={`${monthLabel} ${t('topSuppliers')}`}
        action={t('fullReport')}
        onAction={() => navigation.navigate('Reports')}
      />
      {monthSummary.length === 0 ? (
        <EmptyState
          icon="🥛"
          title={t('noCollectionsThisMonth')}
          subtitle={t('startAddingSummary')}
        />
      ) : (
        <Card>
          {monthSummary.map((row, i) => (
            <View key={row.member_id}>
              <View style={styles.summaryRow}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryName}>{row.member_name}</Text>
                  <Text style={styles.summarySub}>
                    {row.total_litres} L · {t('avgFatLabel', { fat: row.avg_fat })}
                  </Text>
                </View>
                <Text style={styles.summaryAmount}>₹{row.total_amount}</Text>
              </View>
              {i < monthSummary.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 },
  dateText: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  langBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sessionRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm,
  },
  sessionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  sessionBtnActive: { backgroundColor: colors.surface, ...shadow.subtle },
  sessionText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  sessionTextActive: { color: colors.textPrimary, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginBottom: spacing.sm },
  quickCard: {
    flex: 1,
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5DFA8',
  },
  quickIcon: { fontSize: 24, marginBottom: 4 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: colors.accent },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.subtle,
  },
  actionIcon: { fontSize: 22, marginBottom: 4 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  summaryName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  summarySub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  summaryAmount: { fontSize: 15, fontWeight: '700', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border },
});
