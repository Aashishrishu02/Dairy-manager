import { useDairyStore } from '../store/useDairyStore';

export const translations = {
  en: {
    // Navigation titles
    dashboardTitle: 'Dashboard',
    todayTitle: 'Today',
    membersTitle: 'Members',
    reportsTitle: 'Reports',
    ratesTitle: 'Rates',
    newMilkEntryTitle: 'New Milk Entry',
    
    // HomeScreen strings
    appTitle: 'Dairy Manager',
    morning: 'Morning',
    evening: 'Evening',
    litresCollected: 'Litres collected',
    amountDueToday: 'Amount due',
    todayLabel: 'today',
    activeMembers: 'Active members',
    registeredLabel: 'registered',
    newEntryAction: 'New entry',
    quickActions: 'Quick actions',
    topSuppliers: 'top suppliers',
    fullReport: 'Full report',
    noCollectionsThisMonth: 'No collections this month',
    startAddingSummary: 'Start adding daily entries to see monthly summaries here.',
    daysCountLabel: '{days} days',
    avgFatLabel: 'avg {fat}% fat',
    
    // AddCollectionScreen strings
    dateLabel: 'Date',
    sessionAM: 'Morning (AM)',
    sessionPM: 'Evening (PM)',
    memberSelectLabel: 'Member *',
    changeLabel: 'Change',
    searchMemberPlaceholder: 'Search member name...',
    quantityLabel: 'Quantity (Litres) *',
    quantityPlaceholder: 'e.g. 4.5',
    fatLabel: 'Fat % *',
    fatPlaceholder: 'e.g. 6.2',
    quickFatLabel: 'Quick fat %',
    rateForFatLabel: 'Rate for {fat}% fat',
    ratePerLitreLabel: 'rate / litre',
    previewFormulaLabel: '{qty} L × ₹{rate} = ₹{amount}',
    saveEntryAction: 'Save Entry',
    missingInfoAlert: 'Missing info',
    missingInfoAlertMsg: 'Please select a member and enter valid quantity (>0) and fat % (3–10).',
    savedAlert: '✅ Saved!',
    addAnotherAction: 'Add another',
    doneAction: 'Done',
    
    // TodayCollectionScreen strings
    todaysCollectionHeader: "Today's Collection",
    entriesCountLabel: 'Entries',
    sessionAllLabel: 'All',
    sessionAMBadge: '🌅 AM',
    sessionPMBadge: '🌆 PM',
    deleteEntryAlert: 'Delete entry',
    deleteEntryConfirm: "Delete {name}'s {session} entry ({qty}L)?",
    deleteAction: 'Delete',
    cancelAction: 'Cancel',
    noEntriesFound: 'No entries yet',
    noEntriesFoundSub: 'No {session} collections for this date.',
    
    // MembersScreen strings
    searchMembersPlaceholder: '🔍 Search members...',
    membersCountLabel: '{count} members',
    noMembersYet: 'No members yet',
    addFirstSupplier: 'Add your first milk supplier to get started.',
    removeMemberAlert: 'Remove member',
    removeMemberConfirm: 'Remove {name} from active list? Past records will be kept.',
    removeAction: 'Remove',
    editMemberHeader: 'Edit member',
    newMemberHeader: 'New member',
    nameFieldLabel: 'Full name *',
    nameFieldPlaceholder: 'e.g. Ramesh Kumar',
    phoneFieldLabel: 'Phone number',
    phoneFieldPlaceholder: 'e.g. 9876543210',
    villageFieldLabel: 'Village / area',
    villageFieldPlaceholder: 'e.g. Khargapur',
    cattleFieldLabel: 'Number of cattle',
    cattleFieldPlaceholder: '0',
    advanceFieldLabel: 'Advance balance (₹)',
    advanceFieldPlaceholder: '0',
    saveChangesAction: 'Save changes',
    addMemberAction: 'Add member',
    nameRequiredAlert: 'Name required',
    nameRequiredAlertMsg: 'Please enter the member name.',
    advanceLabel: 'Advance: ₹{balance}',
    
    // ReportsScreen strings
    reportsHeader: 'Reports',
    totalMilk: 'Total milk',
    totalPayout: 'Total payout',
    avgFat: 'Avg fat %',
    noDataForMonth: 'No data for this month',
    addCollectionsToSee: 'Add daily collections to see monthly reports.',
    suppliersCountLabel: '{count} suppliers',
    sortedByPayout: 'suppliers · sorted by payout',
    generatingPdfAlert: 'Error generating bill',
    detailsNotFound: 'Member details not found.',
    
    // FatRatesScreen strings
    fatRatesHeader: 'Fat Rate Table',
    fatRateInfo: '💡 Tap any row to update the rate. Changes apply to new entries only — past records are not affected.',
    fatRangeLabel: 'fat range',
    perLitreLabel: 'per litre',
    editActionHint: 'Edit ›',
    aboveLabel: 'above',
    updateRateHeader: 'Update rate',
    ratePerLitreInput: 'Rate per litre (₹)',
    invalidRateAlert: 'Invalid rate',
    invalidRateAlertMsg: 'Enter a valid rate (greater than 0).',
    save: 'Save',
  },
  hi: {
    // Navigation titles
    dashboardTitle: 'डैशबोर्ड',
    todayTitle: 'आज',
    membersTitle: 'सदस्य',
    reportsTitle: 'रिपोर्ट्स',
    ratesTitle: 'दरें',
    newMilkEntryTitle: 'दूध की नई एंट्री',
    
    // HomeScreen strings
    appTitle: 'डेयरी मैनेजर',
    morning: 'सुबह',
    evening: 'शाम',
    litresCollected: 'कुल दूध (लीटर)',
    amountDueToday: 'देय राशि',
    todayLabel: 'आज की',
    activeMembers: 'सक्रिय सदस्य',
    registeredLabel: 'पंजीकृत',
    newEntryAction: 'नई एंट्री',
    quickActions: 'त्वरित कार्य',
    topSuppliers: 'शीर्ष आपूर्तिकर्ता',
    fullReport: 'पूरी रिपोर्ट',
    noCollectionsThisMonth: 'इस महीने कोई कलेक्शन नहीं है',
    startAddingSummary: 'यहाँ मासिक सारांश देखने के लिए दैनिक प्रविष्टियाँ जोड़ना शुरू करें।',
    daysCountLabel: '{days} दिन',
    avgFatLabel: 'औसत {fat}% फैट',
    
    // AddCollectionScreen strings
    dateLabel: 'तारीख',
    sessionAM: 'सुबह (AM)',
    sessionPM: 'शाम (PM)',
    memberSelectLabel: 'सदस्य *',
    changeLabel: 'बदलें',
    searchMemberPlaceholder: 'सदस्य का नाम खोजें...',
    quantityLabel: 'दूध की मात्रा (लीटर) *',
    quantityPlaceholder: 'जैसे: 4.5',
    fatLabel: 'फैट % *',
    fatPlaceholder: 'जैसे: 6.2',
    quickFatLabel: 'त्वरित फैट %',
    rateForFatLabel: '{fat}% फैट के लिए दर',
    ratePerLitreLabel: 'दर / लीटर',
    previewFormulaLabel: '{qty} L × ₹{rate} = ₹{amount}',
    saveEntryAction: 'एंट्री सुरक्षित करें',
    missingInfoAlert: 'जानकारी अधूरी है',
    missingInfoAlertMsg: 'कृपया सदस्य चुनें और सही मात्रा (>0) व फैट % (3–10) दर्ज करें।',
    savedAlert: '✅ सुरक्षित हो गया!',
    addAnotherAction: 'एक और जोड़ें',
    doneAction: 'पूरा हुआ',
    
    // TodayCollectionScreen strings
    todaysCollectionHeader: "आज का कलेक्शन",
    entriesCountLabel: 'कुल एंट्री',
    sessionAllLabel: 'सभी',
    sessionAMBadge: '🌅 सुबह',
    sessionPMBadge: '🌆 शाम',
    deleteEntryAlert: 'एंट्री हटाएं',
    deleteEntryConfirm: "क्या आप {name} की {session} की एंट्री ({qty}L) हटाना चाहते हैं?",
    deleteAction: 'हटाएं',
    cancelAction: 'रद्द करें',
    noEntriesFound: 'कोई एंट्री नहीं मिली',
    noEntriesFoundSub: 'इस तारीख के लिए कोई {session} कलेक्शन नहीं मिला।',
    
    // MembersScreen strings
    searchMembersPlaceholder: '🔍 सदस्य खोजें...',
    membersCountLabel: '{count} सदस्य',
    noMembersYet: 'कोई सदस्य नहीं है',
    addFirstSupplier: 'शुरू करने के लिए अपना पहला दूध आपूर्तिकर्ता जोड़ें।',
    removeMemberAlert: 'सदस्य हटाएं',
    removeMemberConfirm: 'क्या आप {name} को सक्रिय सूची से हटाना चाहते हैं? पुराना रिकॉर्ड सुरक्षित रहेगा।',
    removeAction: 'हटाएं',
    editMemberHeader: 'सदस्य संपादित करें',
    newMemberHeader: 'नया सदस्य',
    nameFieldLabel: 'पूरा नाम *',
    nameFieldPlaceholder: 'जैसे: रमेश कुमार',
    phoneFieldLabel: 'फ़ोन नंबर',
    phoneFieldPlaceholder: 'जैसे: 9876543210',
    villageFieldLabel: 'गाँव / क्षेत्र',
    villageFieldPlaceholder: 'जैसे: खरगापुर',
    cattleFieldLabel: 'पशुओं की संख्या',
    cattleFieldPlaceholder: '0',
    advanceFieldLabel: 'अग्रिम राशि (₹)',
    advanceFieldPlaceholder: '0',
    saveChangesAction: 'बदलाव सुरक्षित करें',
    addMemberAction: 'सदस्य जोड़ें',
    nameRequiredAlert: 'नाम आवश्यक है',
    nameRequiredAlertMsg: 'कृपया सदस्य का नाम दर्ज करें।',
    advanceLabel: 'अग्रिम: ₹{balance}',
    
    // ReportsScreen strings
    reportsHeader: 'रिपोर्ट्स',
    totalMilk: 'कुल दूध',
    totalPayout: 'कुल भुगतान',
    avgFat: 'औसत फैट %',
    noDataForMonth: 'इस महीने कोई डेटा नहीं है',
    addCollectionsToSee: 'मासिक रिपोर्ट देखने के लिए दैनिक कलेक्शन जोड़ें।',
    suppliersCountLabel: '{count} आपूर्तिकर्ता',
    sortedByPayout: 'आपूर्तिकर्ता · भुगतान के अनुसार क्रमित',
    generatingPdfAlert: 'बिल पीडीएफ बनाने में त्रुटि',
    detailsNotFound: 'सदस्य का विवरण नहीं मिला।',
    
    // FatRatesScreen strings
    fatRatesHeader: 'फैट दर तालिका',
    fatRateInfo: '💡 दर को अपडेट करने के लिए किसी भी पंक्ति पर टैप करें। बदलाव केवल नई एंट्री पर लागू होंगे — पुराने रिकॉर्ड प्रभावित नहीं होंगे।',
    fatRangeLabel: 'फैट रेंज',
    perLitreLabel: 'प्रति लीटर',
    editActionHint: 'बदलें ›',
    aboveLabel: 'ऊपर',
    updateRateHeader: 'दर अपडेट करें',
    ratePerLitreInput: 'प्रति लीटर दर (₹)',
    invalidRateAlert: 'अमान्य दर',
    invalidRateAlertMsg: 'कृपया सही दर (0 से अधिक) दर्ज करें।',
    save: 'सुरक्षित करें',
  }
};

export function useTranslation() {
  const language = useDairyStore(state => state.language || 'en');
  
  const t = (key: keyof typeof translations['en'], replaces?: Record<string, string | number>) => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (replaces) {
      Object.keys(replaces).forEach(k => {
        text = text.replace(`{${k}}`, String(replaces[k]));
      });
    }
    return text;
  };

  return { t, language };
}
