import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMonthlySummary, getCollectionsByMember, getMemberById, MemberSummary } from '../db/database';
import { Card, StatCard, SectionHeader, EmptyState } from '../components/UI';
import { colors, spacing, radius } from '../utils/theme';
import { format, subMonths, addMonths, parseISO } from 'date-fns';
import { generateMonthlyBillPDF } from '../utils/pdfGenerator';
import { useTranslation } from '../utils/i18n';

export default function ReportsScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7));
  const [summary, setSummary] = useState<MemberSummary[]>([]);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
  const { t } = useTranslation();

  const load = useCallback(() => {
    setSummary(getMonthlySummary(currentMonth));
  }, [currentMonth]);

  const handleSharePdf = async (item: MemberSummary) => {
    setGeneratingPdfId(item.member_id);
    try {
      const member = getMemberById(item.member_id);
      if (!member) {
        Alert.alert('Error', t('detailsNotFound'));
        return;
      }
      const collections = getCollectionsByMember(item.member_id, currentMonth);
      await generateMonthlyBillPDF(member, currentMonth, collections);
    } catch (e: any) {
      Alert.alert(t('generatingPdfAlert'), e.message || 'Something went wrong');
    } finally {
      setGeneratingPdfId(null);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalLitres = summary.reduce((s, r) => s + r.total_litres, 0);
  const totalAmount = summary.reduce((s, r) => s + r.total_amount, 0);
  const avgFat = summary.length
    ? (summary.reduce((s, r) => s + r.avg_fat, 0) / summary.length).toFixed(2)
    : '0';

  const prevMonth = () => {
    const d = parseISO(currentMonth + '-01');
    setCurrentMonth(format(subMonths(d, 1), 'yyyy-MM'));
  };

  const nextMonth = () => {
    const d = parseISO(currentMonth + '-01');
    const next = addMonths(d, 1);
    if (next <= new Date()) {
      setCurrentMonth(format(next, 'yyyy-MM'));
    }
  };

  const monthLabel = format(parseISO(currentMonth + '-01'), 'MMMM yyyy');

  const renderItem = ({ item, index }: { item: MemberSummary; index: number }) => (
    <Card style={styles.row}>
      <View style={styles.rowInner}>
        <View style={[styles.rank, index < 3 && styles.rankTop]}>
          <Text style={[styles.rankText, index < 3 && { color: '#fff' }]}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.memberName}>{item.member_name}</Text>
          <Text style={styles.memberSub}>
            {t('daysCountLabel', { days: item.days_count })} · {t('avgFatLabel', { fat: item.avg_fat })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.litres}>{item.total_litres} L</Text>
            <Text style={styles.amount}>₹{item.total_amount}</Text>
          </View>
          {generatingPdfId === item.member_id ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ padding: 4 }} />
          ) : (
            <TouchableOpacity
              onPress={() => handleSharePdf(item)}
              style={styles.pdfBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.pdfIcon}>📄</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Bar indicator */}
      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          { width: `${(item.total_litres / Math.max(...summary.map(r => r.total_litres))) * 100}%` }
        ]} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Summary stats */}
      <View style={styles.statsRow}>
        <StatCard label={t('totalMilk')} value={`${totalLitres.toFixed(1)} L`} accent />
        <View style={{ width: spacing.sm }} />
        <StatCard label={t('totalPayout')} value={`₹${totalAmount.toFixed(0)}`} />
        <View style={{ width: spacing.sm }} />
        <StatCard label={t('avgFat')} value={`${avgFat}%`} />
      </View>

      <View style={styles.subheader}>
        <Text style={styles.subheaderText}>
          {t('suppliersCountLabel', { count: summary.length })} · {t('sortedByPayout')}
        </Text>
      </View>

      <FlatList
        data={summary}
        keyExtractor={r => String(r.member_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📊"
            title={t('noDataForMonth')}
            subtitle={t('addCollectionsToSee')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: colors.primary, fontWeight: '300' },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  subheader: { paddingHorizontal: spacing.md, marginBottom: 4 },
  subheaderText: { fontSize: 12, color: colors.textTertiary },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
  row: { padding: spacing.sm + 4 },
  rowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 8 },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankTop: { backgroundColor: colors.primary },
  rankText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  memberName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  memberSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  litres: { fontSize: 12, color: colors.textSecondary },
  amount: { fontSize: 16, fontWeight: '700', color: colors.primary },
  pdfBtn: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfIcon: { fontSize: 16 },
  barBg: {
    height: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
