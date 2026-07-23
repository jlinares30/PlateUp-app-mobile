import ConfirmModal from '@/src/components/ConfirmModal';
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { useTranslation } from "@/src/lib/i18n";
import { useAuthStore } from "@/src/store/useAuth";
import { ThemeMode, usePreferencesStore } from "@/src/store/usePreferencesStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useThemeColors();
  const { logout } = useAuthStore();
  const {
    language,
    setLanguage,
    measurementSystem,
    setMeasurementSystem,
    themeMode,
    setThemeMode
  } = usePreferencesStore();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    logoutModalVisible && setLogoutModalVisible(false);
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).springify()}>

          {/* 1. General Preferences Section */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('settings.generalSection')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* Language Selector */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="language-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.language')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>{t('settings.languageDesc')}</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.pillOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  language === 'en' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setLanguage('en')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillOptionText,
                  { color: colors.text.primary },
                  language === 'en' && styles.pillOptionTextActive
                ]}>
                  🇺🇸 English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pillOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  language === 'es' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setLanguage('es')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillOptionText,
                  { color: colors.text.primary },
                  language === 'es' && styles.pillOptionTextActive
                ]}>
                  🇪🇸 Español
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Measurement Units */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="scale-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.units')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>{t('settings.unitsDesc')}</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.pillOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  measurementSystem === 'metric' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setMeasurementSystem('metric')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillOptionText,
                  { color: colors.text.primary },
                  measurementSystem === 'metric' && styles.pillOptionTextActive
                ]}>
                  {t('settings.metric')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pillOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  measurementSystem === 'imperial' && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setMeasurementSystem('imperial')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.pillOptionText,
                  { color: colors.text.primary },
                  measurementSystem === 'imperial' && styles.pillOptionTextActive
                ]}>
                  {t('settings.imperial')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Appearance Mode */}
            <View style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.theme')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>{t('settings.themeDesc')}</Text>
              </View>
            </View>
            <View style={styles.optionsRow}>
              {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.pillOption,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    themeMode === mode && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setThemeMode(mode)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.pillOptionText,
                    { color: colors.text.primary },
                    themeMode === mode && styles.pillOptionTextActive
                  ]}>
                    {mode === 'system' ? t('settings.system') : mode === 'light' ? t('settings.light') : t('settings.dark')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </View>

          {/* 2. Account & Security Section */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('settings.accountSection')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="person-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.editProfile')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>{t('settings.editProfileDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => router.push({ pathname: '/profile', params: { edit: 'true' } })}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{t('settings.resetPassword')}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>{t('settings.resetPasswordDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.light} />
            </TouchableOpacity>

          </View>

          {/* 3. About Section */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('settings.aboutSection')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>{t('settings.version')}</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>1.0.0 (PlateUp)</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text.secondary }]}>{t('settings.developer')}</Text>
              <Text style={[styles.infoValue, { color: colors.text.primary }]}>PlateUp Team</Text>
            </View>
          </View>

          {/* 4. Session Section */}
          <Text style={[styles.sectionHeader, { color: colors.text.secondary }]}>{t('settings.sessionSection')}</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: SPACING.xl }]}>
            <TouchableOpacity
              style={styles.logoutRow}
              onPress={() => setLogoutModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} style={{ marginRight: SPACING.m }} />
              <Text style={styles.logoutText}>{t('settings.logOut')}</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        title={t('settings.logOutConfirmTitle')}
        message={t('settings.logOutConfirmMessage')}
        actions={[
          {
            text: language === 'es' ? 'Cancelar' : 'Cancel',
            style: 'cancel',
            onPress: () => setLogoutModalVisible(false),
          },
          {
            text: t('settings.logOut'),
            style: 'destructive',
            onPress: handleLogout,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.m,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: FONTS.sizes.small,
    fontWeight: '700',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    padding: SPACING.m,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  settingIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONTS.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  settingSubtitle: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.s,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  pillOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SPACING.s,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  pillOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillOptionText: {
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  pillOptionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.m,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
  },
  infoValue: {
    fontSize: FONTS.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  logoutText: {
    fontSize: FONTS.sizes.body,
    fontWeight: '700',
    color: COLORS.error,
  },
});
