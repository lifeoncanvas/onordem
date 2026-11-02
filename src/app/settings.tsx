import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppFonts, Palette } from "@/constants/theme";
import { deleteAccount, signOut } from "@/services/auth";

type SettingsIcon = keyof typeof Ionicons.glyphMap;

export default function SettingsScreen() {
  // Modal states for settings
  const [activeModal, setActiveModal] = useState<
    "privacy" | "notifications" | "autocorrect" | "blocked" | "help" | null
  >(null);

  // Preference switches
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  const [grammarCheckEnabled, setGrammarCheckEnabled] = useState(true);
  const [writingSuggestionsEnabled, setWritingSuggestionsEnabled] = useState(true);

  const [tributeReminders, setTributeReminders] = useState(true);
  const [mentorMilestones, setMentorMilestones] = useState(true);
  const [weeklyReflections, setWeeklyReflections] = useState(false);

  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [allowConnectionsOnly, setAllowConnectionsOnly] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState<string[]>([
    "spammer_bot_99",
    "unwanted_contact",
  ]);

  const confirmSignOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Honour Your Mentor?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/login");
            } catch {
              router.replace("/login");
            }
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? All your keepsakes, tributes, and profile data will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This action cannot be undone. Confirm permanent account deletion.",
              [
                { text: "Keep Account", style: "cancel" },
                {
                  text: "Permanently Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      router.replace("/login");
                    } catch {
                      router.replace("/login");
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleUnblock = (username: string) => {
    setBlockedUsers((prev) => prev.filter((u) => u !== username));
    Alert.alert("User Unblocked", `@${username} has been unblocked.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Customize your experience, privacy, and account security.
        </Text>

        {/* Section 1: Account & Core Preferences */}
        <Text style={styles.groupTitle}>ACCOUNT & PREFERENCES</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="person-circle-outline"
            iconColor={Palette.accentSky}
            title="Account Information"
            subtitle="Name, username, photograph and bio"
            onPress={() => router.push("/profile-edit")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            iconColor={Palette.accentMint}
            title="Privacy Settings"
            subtitle="Manage story visibility and profile access"
            onPress={() => setActiveModal("privacy")}
          />
          <SettingsRow
            icon="notifications-outline"
            iconColor={Palette.accentPink}
            title="Notification Preferences"
            subtitle="Tribute reminders and milestone alerts"
            onPress={() => setActiveModal("notifications")}
          />
          <SettingsRow
            icon="color-wand-outline"
            iconColor={Palette.accentLavender}
            title="Auto-correction Settings"
            subtitle="Auto-correct, grammar checks, writing aids"
            onPress={() => setActiveModal("autocorrect")}
          />
          <SettingsRow
            icon="ban-outline"
            iconColor={Palette.accentCoral}
            title="Blocked Users"
            subtitle={`${blockedUsers.length} blocked profiles`}
            onPress={() => setActiveModal("blocked")}
            last
          />
        </View>

        {/* Section 2: Support & Danger Zone */}
        <Text style={styles.groupTitle}>SUPPORT & ACCOUNT ACTIONS</Text>
        <View style={styles.group}>
          <SettingsRow
            icon="help-circle-outline"
            iconColor={Palette.accentSky}
            title="Help and Support"
            subtitle="FAQs, writing guides, and contact support"
            onPress={() => setActiveModal("help")}
          />
          <SettingsRow
            icon="log-out-outline"
            iconColor={Palette.accentCoral}
            title="Log Out"
            subtitle="Sign out from this device"
            onPress={confirmSignOut}
          />
          <SettingsRow
            icon="trash-outline"
            iconColor="#FF4D4D"
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            titleColor="#FF4D4D"
            onPress={confirmDeleteAccount}
            last
          />
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* 1. Privacy Settings Modal                                */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "privacy"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Privacy Settings</Text>
            <Text style={styles.modalSubtitle}>Control who can read your tributes and profile</Text>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Public Tribute Wall</Text>
                <Text style={styles.settingItemSub}>Anyone on Honour Your Mentor can read your tributes</Text>
              </View>
              <Switch
                value={isProfilePublic}
                onValueChange={setIsProfilePublic}
                trackColor={{ false: "#333333", true: Palette.accentMint }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Connections-Only Stories</Text>
                <Text style={styles.settingItemSub}>Limit personal notes to people you follow</Text>
              </View>
              <Switch
                value={allowConnectionsOnly}
                onValueChange={setAllowConnectionsOnly}
                trackColor={{ false: "#333333", true: Palette.accentSky }}
              />
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 2. Notification Preferences Modal                        */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "notifications"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Notification Preferences</Text>
            <Text style={styles.modalSubtitle}>Choose which memories and alerts reach you</Text>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Tribute Reminders</Text>
                <Text style={styles.settingItemSub}>Gentle nudges to celebrate someone meaningful</Text>
              </View>
              <Switch
                value={tributeReminders}
                onValueChange={setTributeReminders}
                trackColor={{ false: "#333333", true: Palette.accentPink }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Mentor Milestones</Text>
                <Text style={styles.settingItemSub}>Celebrate anniversary of guidance and lessons</Text>
              </View>
              <Switch
                value={mentorMilestones}
                onValueChange={setMentorMilestones}
                trackColor={{ false: "#333333", true: Palette.accentSky }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Weekly Reflections</Text>
                <Text style={styles.settingItemSub}>Weekly digest of wisdom lessons you saved</Text>
              </View>
              <Switch
                value={weeklyReflections}
                onValueChange={setWeeklyReflections}
                trackColor={{ false: "#333333", true: Palette.accentMint }}
              />
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 3. Auto-correction Settings Modal                        */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "autocorrect"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Auto-correction Settings</Text>
            <Text style={styles.modalSubtitle}>AI Writing Assistant and Grammar Tools</Text>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Auto-correct: {autoCorrectEnabled ? "ON" : "OFF"}</Text>
                <Text style={styles.settingItemSub}>Automatically fix common spelling typos</Text>
              </View>
              <Switch
                value={autoCorrectEnabled}
                onValueChange={setAutoCorrectEnabled}
                trackColor={{ false: "#333333", true: Palette.accentMint }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Grammar Check</Text>
                <Text style={styles.settingItemSub}>Detect capitalization, punctuation, and phrasing</Text>
              </View>
              <Switch
                value={grammarCheckEnabled}
                onValueChange={setGrammarCheckEnabled}
                trackColor={{ false: "#333333", true: Palette.accentSky }}
              />
            </View>

            <View style={styles.settingItemRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingItemTitle}>Improve My Writing</Text>
                <Text style={styles.settingItemSub}>Elevate gratitude reflections with heartfelt tone suggestions</Text>
              </View>
              <Switch
                value={writingSuggestionsEnabled}
                onValueChange={setWritingSuggestionsEnabled}
                trackColor={{ false: "#333333", true: Palette.accentLavender }}
              />
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 4. Blocked Users Modal                                   */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "blocked"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Blocked Users</Text>
            <Text style={styles.modalSubtitle}>Accounts you have prevented from interacting with you</Text>

            {blockedUsers.length === 0 ? (
              <View style={styles.emptyBlocked}>
                <Ionicons name="checkmark-circle-outline" size={36} color={Palette.accentMint} />
                <Text style={styles.emptyBlockedTitle}>No Blocked Users</Text>
                <Text style={styles.emptyBlockedSub}>You haven&apos;t blocked anyone.</Text>
              </View>
            ) : (
              blockedUsers.map((username) => (
                <View key={username} style={styles.blockedRow}>
                  <View style={styles.blockedUserMeta}>
                    <Ionicons name="person-circle" size={32} color={Palette.textSecondary} />
                    <Text style={styles.blockedUsername}>@{username}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnblock(username)}
                    style={styles.unblockBtn}
                  >
                    <Text style={styles.unblockBtnText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 5. Help and Support Modal                                */}
      {/* ======================================================== */}
      <Modal visible={activeModal === "help"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Help and Support</Text>
            <Text style={styles.modalSubtitle}>How can we assist your gratitude journey?</Text>

            <View style={styles.helpList}>
              <View style={styles.helpCard}>
                <Ionicons name="book-outline" size={20} color={Palette.accentSky} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Writing Guide</Text>
                  <Text style={styles.helpCardText}>Learn tips on framing heartfelt tributes and memories.</Text>
                </View>
              </View>

              <View style={styles.helpCard}>
                <Ionicons name="shield-outline" size={20} color={Palette.accentMint} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Keepsake Safety</Text>
                  <Text style={styles.helpCardText}>Your tributes are encrypted and stored safely on this device.</Text>
                </View>
              </View>

              <View style={styles.helpCard}>
                <Ionicons name="mail-outline" size={20} color={Palette.accentPink} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpCardTitle}>Contact Team</Text>
                  <Text style={styles.helpCardText}>support@honouryourmentor.com</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalPrimaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  iconColor = "#FFFFFF",
  title,
  subtitle,
  titleColor = "#FFFFFF",
  onPress,
  last = false,
}: {
  icon: SettingsIcon;
  iconColor?: string;
  title: string;
  subtitle: string;
  titleColor?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: "rgba(255, 255, 255, 0.05)" }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: titleColor }]}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={Palette.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  intro: {
    fontSize: 13.5,
    color: Palette.textSecondary,
    marginBottom: 20,
    lineHeight: 19,
    fontFamily: AppFonts.body,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Palette.textMuted,
    marginBottom: 10,
    fontFamily: AppFonts.body,
  },
  group: {
    backgroundColor: "#161616",
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  modalSheet: {
    backgroundColor: "#181818",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    marginBottom: 6,
    fontFamily: AppFonts.body,
  },
  settingItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  settingTextCol: {
    flex: 1,
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  settingItemSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  modalPrimaryBtn: {
    backgroundColor: Palette.accentMint,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modalPrimaryBtnText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#111111",
    fontFamily: AppFonts.body,
  },
  emptyBlocked: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyBlockedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyBlockedSub: {
    fontSize: 12.5,
    color: Palette.textSecondary,
  },
  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  blockedUserMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  blockedUsername: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  unblockBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.accentSky,
  },
  helpList: {
    gap: 10,
    marginVertical: 4,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    padding: 12,
    borderRadius: 14,
  },
  helpCardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  helpCardText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
});
