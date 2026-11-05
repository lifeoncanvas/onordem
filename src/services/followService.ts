import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserConnection {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  bio?: string;
  isFollowing: boolean;
}

export type FollowUser = UserConnection;

const STORAGE_KEY_FOLLOWING = "@hym_following_ids";

const DEFAULT_FOLLOWERS: UserConnection[] = [
  {
    id: "f1",
    name: "Aarav Patel",
    username: "aarav_p",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    role: "Computer Science Graduate",
    bio: "Honouring professors who inspired my journey in engineering.",
    isFollowing: true,
  },
  {
    id: "f2",
    name: "Elena Rostova",
    username: "elena_r",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Visual Artist & Designer",
    bio: "Documenting timeless advice from art directors and teachers.",
    isFollowing: false,
  },
  {
    id: "f3",
    name: "Kavita Rao",
    username: "kavita_r",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    role: "Literature Fellow",
    bio: "Stories of kindness and patience that outlived school halls.",
    isFollowing: true,
  },
  {
    id: "f4",
    name: "David Kim",
    username: "david_k",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    role: "Biotech Researcher",
    bio: "Honouring Dr. Mitchell and the lab family.",
    isFollowing: true,
  },
];

const DEFAULT_FOLLOWING: UserConnection[] = [
  {
    id: "m1",
    name: "Mrs. Anita Sharma",
    username: "anita_sharma",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    role: "Literature Teacher",
    bio: "Believe in your voice before asking the world to listen.",
    isFollowing: true,
  },
  {
    id: "m2",
    name: "Dr. David Mitchell",
    username: "david_mitchell",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    role: "Research Advisor",
    bio: "True mastery is quiet patience with difficult problems.",
    isFollowing: true,
  },
  {
    id: "m3",
    name: "Vikram Rao",
    username: "vikram_rao",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    role: "Engineering Director",
    bio: "Build things that outlive your tenure and elevate people.",
    isFollowing: true,
  },
  {
    id: "f1",
    name: "Aarav Patel",
    username: "aarav_p",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    role: "Computer Science Graduate",
    bio: "Honouring professors who inspired my journey in engineering.",
    isFollowing: true,
  },
  {
    id: "f3",
    name: "Kavita Rao",
    username: "kavita_r",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    role: "Literature Fellow",
    bio: "Stories of kindness and patience that outlived school halls.",
    isFollowing: true,
  },
];

class FollowService {
  private followingMap: Map<string, boolean> = new Map();
  private followers: UserConnection[] = [...DEFAULT_FOLLOWERS];
  private following: UserConnection[] = [...DEFAULT_FOLLOWING];
  private listeners: Array<() => void> = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_FOLLOWING);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        this.followingMap = new Map(ids.map((id) => [id, true]));
      } else {
        DEFAULT_FOLLOWING.forEach((item) => this.followingMap.set(item.id, true));
        await this.persist();
      }
    } catch {
      DEFAULT_FOLLOWING.forEach((item) => this.followingMap.set(item.id, true));
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      const ids = Array.from(this.followingMap.entries())
        .filter(([_, isFollowing]) => isFollowing)
        .map(([id]) => id);
      await AsyncStorage.setItem(STORAGE_KEY_FOLLOWING, JSON.stringify(ids));
    } catch {
      // non-fatal
    }
    this.notify();
  }

  isFollowing(id: string): boolean {
    return this.followingMap.get(id) ?? false;
  }

  toggleFollow(user: { id: string; name: string; username?: string; avatar?: string; role?: string }): boolean {
    const currentState = this.isFollowing(user.id);
    const newState = !currentState;
    this.followingMap.set(user.id, newState);

    if (newState) {
      if (!this.following.some((f) => f.id === user.id)) {
        this.following.push({
          id: user.id,
          name: user.name,
          username: user.username || user.name.toLowerCase().replace(/\s+/g, "_"),
          avatar: user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          role: user.role || "Mentor",
          isFollowing: true,
        });
      }
    } else {
      this.following = this.following.filter((f) => f.id !== user.id);
    }

    this.persist();
    return newState;
  }

  getFollowersCount(): number {
    return this.followers.length;
  }

  getFollowingCount(): number {
    return Array.from(this.followingMap.values()).filter(Boolean).length;
  }

  getFollowers(): UserConnection[] {
    return this.followers.map((f) => ({
      ...f,
      isFollowing: this.isFollowing(f.id),
    }));
  }

  getFollowing(): UserConnection[] {
    return this.following.filter((f) => this.isFollowing(f.id));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const followService = new FollowService();
