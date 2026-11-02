import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";
import {
  FollowUser,
  followService,
} from "@/services/followService";

interface ConnectionsModalProps {
  visible: boolean;
  initialTab?: "followers" | "following";
  onClose: () => void;
  onConnectionsChanged?: () => void;
}

export default function ConnectionsModal({
  visible,
  initialTab = "followers",
  onClose,
  onConnectionsChanged,
}: ConnectionsModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [users, setUsers] = useState<FollowUser[]>([]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    followService.initialize().then(() => {
      refreshData();
    });

    const unsubscribe = followService.subscribe(() => {
      refreshData();
      onConnectionsChanged?.();
    });

    return () => unsubscribe();
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === "followers") {
      setUsers(followService.getFollowers());
    } else {
      setUsers(followService.getFollowing());
    }
  };

  const handleToggleFollow = (user: FollowUser) => {
    followService.toggleFollow(user);
  };

  const renderUser = ({ item }: { item: FollowUser }) => (
    <View style={styles.userRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHandle}>@{item.username}</Text>
        <Text style={styles.userBio} numberOfLines={1}>
          {item.bio}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleToggleFollow(item)}
        activeOpacity={0.75}
        style={[styles.followBtn, item.isFollowing ? styles.followingBtn : styles.followActiveBtn]}
      >
        <Text
          style={[
            styles.followBtnText,
            item.isFollowing ? styles.followingBtnText : styles.followActiveBtnText,
          ]}
        >
          {item.isFollowing ? "Following" : "Follow"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <Text style={styles.sheetTitle}>Your Connections</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Segmented Control */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                onPress={() => setActiveTab("followers")}
                style={[styles.tabItem, activeTab === "followers" && styles.tabItemActive]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "followers" && styles.tabItemTextActive,
                  ]}
                >
                  Followers ({followService.getFollowers().length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("following")}
                style={[styles.tabItem, activeTab === "following" && styles.tabItemActive]}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "following" && styles.tabItemTextActive,
                  ]}
                >
                  Following ({followService.getFollowing().length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={40} color={Palette.borderSubtle} />
                <Text style={styles.emptyTitle}>
                  No {activeTab === "followers" ? "followers" : "following"} yet
                </Text>
                <Text style={styles.emptySub}>
                  Connect with mentors and creators across Honour Your Mentor.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  sheet: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    minHeight: "55%",
    borderTopWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: "#222222",
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  tabItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#202020",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  userHandle: {
    fontSize: 12,
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  userBio: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 84,
    alignItems: "center",
  },
  followBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  followActiveBtn: {
    backgroundColor: Palette.accentMint,
  },
  followActiveBtnText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#111111",
  },
  followingBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  followingBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySub: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
    maxWidth: 240,
  },
});
