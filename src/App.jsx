import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import {
  X,
  Bell,
  Camera,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Music,
  Volume2,
  VolumeX,
  Home,
  Zap,
  PlusSquare,
  User,
  Grid,
  Film,
  Settings,
  Send,
  Image as ImageIcon,
  MessageSquare,
  Repeat,
  ArrowLeft,
  Search,
  CheckCheck,
  UploadCloud,
  Loader2,
  LogOut,
  LogIn,
  Video,
  Trash2,
  MoreVertical,
  UserPlus,
  UserCheck,
  Edit3,
  Hash,
  MessageSquareText,
  Sun,
  Moon,
  ChevronDown,
  Lock,
  Globe,
  Eye,
  Sparkles,
  Play,
  Pause,
  Users,
  Radio,
  Sliders,
  AlertCircle,
  RefreshCw,
  Disc,
  Copy,
  Check,
  Wifi,
  ShieldCheck,
  Info,
  Layers,
  Award
} from "lucide-react";

// --- WEB AUDIO API CHIMES ---
function playHapticSFX(type, enabled = true) {
  if (!enabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "send") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "receive") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "upload") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "like") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  } catch (e) {}
}

// --- APP LOGO ---
function BrandLogo({ className = "w-8 h-8", animated = false }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={`${className} ${animated ? "animate-pulse" : ""} transition-transform drop-shadow-[0_2px_8px_rgba(245,143,124,0.3)]`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="snGradMono" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F58F7C" />
          <stop offset="55%" stopColor="#F2C4CE" />
          <stop offset="100%" stopColor="#D6D6D6" />
        </linearGradient>
      </defs>
      <path
        d="M36 14C36 9.58172 32.4183 6 28 6C23.5817 6 20 9.58172 20 14V34C20 38.4183 16.4183 42 12 42C7.58172 42 4 38.4183 4 34"
        stroke="url(#snGradMono)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M28 20V34C28 38.4183 31.5817 42 36 42C40.4183 42 44 38.4183 44 34C44 29.5817 40.4183 26 36 26H20"
        stroke="url(#snGradMono)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// --- INSTAGRAM-STYLE DEFAULT USER PROFILE AVATAR ---
function DefaultAvatar({ className = "w-10 h-10" }) {
  return (
    <div className={`${className} rounded-full bg-[#3D3C42] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner select-none`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3/5 h-3/5 text-[#A0A0A5] translate-y-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
      </svg>
    </div>
  );
}

function UserAvatar({ src, className = "w-10 h-10", alt = "" }) {
  if (!src || src.trim() === "" || src.includes("placeholder") || src.includes("unsplash")) {
    return <DefaultAvatar className={className} />;
  }
  return <img src={src} className={`${className} rounded-full object-cover shrink-0`} alt={alt} />;
}

function BrandLoader({ message = "Loading Social Nest..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <BrandLogo className="w-12 h-12" animated />
      <span className="text-xs font-semibold text-[#D6D6D6] tracking-wider animate-pulse">
        {message}
      </span>
    </div>
  );
}

// --- FLOATING HEARTS COMPONENT ---
function FloatingHeartsOverlay({ trigger }) {
  if (!trigger) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex items-center justify-center">
      <div className="animate-ping">
        <Heart size={82} className="fill-[#F58F7C] text-[#F58F7C] drop-shadow-[0_0_20px_rgba(245,143,124,0.8)]" />
      </div>
      <div className="absolute bottom-1/4 animate-bounce">
        <Heart size={36} className="fill-[#F2C4CE] text-[#F2C4CE] drop-shadow-lg opacity-80" />
      </div>
    </div>
  );
}

const FILTER_STYLES = {
  normal: { label: "Normal", filter: "none" },
  warm: { label: "Tokyo Warm", filter: "contrast(115%) sepia(28%) saturate(140%)" },
  cyber: { label: "Neo Cyan", filter: "contrast(130%) hue-rotate(190deg) brightness(95%)" },
  blush: { label: "Soft Blush", filter: "contrast(105%) saturate(125%) brightness(105%)" },
  noir: { label: "Onyx B&W", filter: "grayscale(100%) contrast(140%)" },
};

const SAMPLE_VIRAL_TRACKS = [
  { id: "t1", title: "Lofi Study Beats", artist: "Nest Sounds", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" },
  { id: "t2", title: "Chill Urban Sunset", artist: "RetroWave", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3" },
  { id: "t3", title: "Neon Cyber Pulse", artist: "ElectroNest", url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3" },
];

const STORY_MODES = {
  announcement: { label: "Important", color: "from-[#F58F7C] via-[#F2C4CE] to-[#D6D6D6]", icon: Bell, duration: 7000 },
  routine: { label: "Daily", color: "from-[#F2C4CE] via-[#4F4F51] to-[#2C2B30]", icon: Camera, duration: 5000 },
  normal: { label: "Sparks", color: "from-[#F58F7C] via-[#F2C4CE] to-[#4F4F51]", icon: Zap, duration: 5000 },
};

const OFFICIAL_TEST_STORIES = [
  {
    id: "s1",
    username: "test_creator_1",
    userAvatar: null,
    mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
    audioTitle: "Lofi Study Beats • Nest Sounds",
    category: "announcement",
    caption: "🚀 Official Test Account #1: Instant Optimistic UI & Spark Previews live!",
  },
  {
    id: "s2",
    username: "test_creator_2",
    userAvatar: null,
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3",
    audioTitle: "Chill Urban Sunset • RetroWave",
    category: "routine",
    caption: "Official Test Account #2: Tap any shared Spark in chat to watch fullscreen! ☕🌊",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState(null);

  // Settings & Engine State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSaverEnabled, setDataSaverEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [viewedUserProfile, setViewedUserProfile] = useState(null);
  const [fullscreenSparkUrl, setFullscreenSparkUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Views & Filters
  const [activeTab, setActiveTab] = useState("home");
  const [feedFilter, setFeedFilter] = useState("all");
  const [feedDropdownOpen, setFeedDropdownOpen] = useState(false);
  const [searchFilterTag, setSearchFilterTag] = useState("");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");

  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set());
  const [sparks, setSparks] = useState([]);
  const [followingHandles, setFollowingHandles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSparks, setLoadingSparks] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [activeCommentTarget, setActiveCommentTarget] = useState(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isUploadSparkOpen, setIsUploadSparkOpen] = useState(false);

  // Spark Sharing Drawers
  const [sparkForwardTarget, setSparkForwardTarget] = useState(null);
  const [sparkShareModal, setSparkShareModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const fetchUserProfile = async (userId, userMetadata, email) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          handle: userMetadata?.handle || email?.split("@")[0] || "user",
          full_name: userMetadata?.full_name || "SocialNest Creator",
          avatar_url: null,
          banner_url: null,
          bio: "Exploring Social Nest 🚀",
          is_private: false,
          account_type: "creator"
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setCurrentUser(u);
      if (u) fetchUserProfile(u.id, u.user_metadata, u.email);
      setTimeout(() => setAuthChecked(true), 800);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setCurrentUser(u);
      if (u) fetchUserProfile(u.id, u.user_metadata, u.email);
      else setProfile(null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentHandle = profile?.handle || (currentUser ? currentUser.email.split("@")[0] : "guest");
  const currentAvatar = profile?.avatar_url || null;
  const currentBanner = profile?.banner_url || null;

  const fetchUserEngagements = async () => {
    if (!currentHandle || currentHandle === "guest") return;
    const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_handle", currentHandle);
    if (likes) setLikedPostIds(new Set(likes.map((l) => l.post_id)));

    const { data: bms } = await supabase.from("bookmarks").select("post_id").eq("user_handle", currentHandle);
    if (bms) setBookmarkedPostIds(new Set(bms.map((b) => b.post_id)));
  };

  const fetchMetaData = async () => {
    if (!currentHandle || currentHandle === "guest") return;

    const { data: followData } = await supabase.from("follows").select("following_handle").eq("follower_handle", currentHandle);
    if (followData) setFollowingHandles(followData.map((f) => f.following_handle));

    const { data: notifData } = await supabase.from("notifications").select("*").eq("recipient_handle", currentHandle).order("created_at", { ascending: false }).limit(20);
    if (notifData) setNotifications(notifData);

    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("recipient_handle", currentHandle).eq("is_read", false);
    setUnreadMsgCount(count || 0);
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchUserEngagements();
    fetchMetaData();

    const channel = supabase
      .channel("notif_msg_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_handle=eq.${currentHandle}` }, (p) => {
        playHapticSFX("receive", soundEnabled);
        setNotifications((prev) => [p.new, ...prev]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `recipient_handle=eq.${currentHandle}` }, () => {
        playHapticSFX("receive", soundEnabled);
        setUnreadMsgCount((c) => c + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [currentHandle, currentUser, soundEnabled]);

  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase.from("posts").select("*, comments(*)").order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = (data || []).map((p) => ({
        id: p.id,
        type: p.post_type,
        username: p.user_handle,
        userAvatar: p.user_avatar,
        timeAgo: new Date(p.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
        content: p.content,
        mediaUrl: p.media_url,
        likes: p.likes_count || 0,
        visibility: p.visibility || "public",
        audioTitle: p.audio_title,
        audioUrl: p.audio_url,
        filterStyle: p.filter_style,
        comments: (p.comments || []).map((c) => ({ id: c.id, user: c.user_handle, text: c.content })),
      }));
      setPosts(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchSparks = async () => {
    try {
      setLoadingSparks(true);
      const { data: sparkData, error } = await supabase.from("sparks").select("*").order("created_at", { ascending: false });
      if (error) throw error;

      const { data: commentData } = await supabase.from("spark_comments").select("*");

      const enriched = (sparkData || []).map((s) => ({
        ...s,
        visibility: s.visibility || "public",
        comments: (commentData || []).filter((c) => c.spark_id === String(s.id)).map((c) => ({
          id: c.id,
          user: c.user_handle,
          text: c.content,
        })),
      }));

      setSparks(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSparks(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchPosts();
      fetchSparks();
    }
  }, [currentUser]);

  // --- OPTIMISTIC POST CREATION ---
  const handleAddNewPost = async (newPost) => {
    playHapticSFX("upload", soundEnabled);
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      type: newPost.type,
      username: currentHandle,
      userAvatar: currentAvatar,
      timeAgo: "Just now",
      content: newPost.content,
      mediaUrl: newPost.mediaUrl,
      likes: 0,
      visibility: newPost.visibility || "public",
      audioTitle: newPost.audioTitle || null,
      audioUrl: newPost.audioUrl || null,
      filterStyle: newPost.filterStyle || "normal",
      comments: [],
    };

    setPosts((prev) => [optimistic, ...prev]);
    setIsStudioOpen(false);
    showToast(newPost.visibility === "followers" ? "🔒 Posted to Vault!" : "🌐 Broadcasted to Explore!");

    try {
      const { error } = await supabase.from("posts").insert([
        {
          user_handle: currentHandle,
          user_avatar: currentAvatar,
          content: newPost.content,
          media_url: newPost.mediaUrl,
          post_type: newPost.type,
          visibility: newPost.visibility || "public",
          audio_title: newPost.audioTitle || null,
          audio_url: newPost.audioUrl || null,
          filter_style: newPost.filterStyle || "normal",
          likes_count: 0,
        },
      ]);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      alert("Failed to post: " + err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    } catch (err) {
      fetchPosts();
      alert("Failed to delete post: " + err.message);
    }
  };

  // --- 0MS OPTIMISTIC LIKE TOGGLE ---
  const handleLikePost = async (post) => {
    const isAlreadyLiked = likedPostIds.has(post.id);
    const updatedCount = isAlreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (isAlreadyLiked) next.delete(post.id);
      else next.add(post.id);
      return next;
    });

    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes: updatedCount } : p)));
    playHapticSFX("like", soundEnabled);

    try {
      if (isAlreadyLiked) {
        await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_handle", currentHandle);
      } else {
        await supabase.from("post_likes").insert([{ post_id: post.id, user_handle: currentHandle }]);
        if (post.username !== currentHandle) {
          await supabase.from("notifications").insert([{
            recipient_handle: post.username,
            sender_handle: currentHandle,
            type: "like",
            post_id: post.id,
          }]);
        }
      }
      await supabase.from("posts").update({ likes_count: updatedCount }).eq("id", post.id);
    } catch (err) {
      console.error("Like error:", err.message);
    }
  };

  const handleToggleBookmark = async (postId) => {
    const isBookmarked = bookmarkedPostIds.has(postId);
    setBookmarkedPostIds((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_handle", currentHandle);
      } else {
        await supabase.from("bookmarks").insert([{ post_id: postId, user_handle: currentHandle }]);
      }
    } catch (e) {
      console.error("Bookmark error:", e);
    }
  };

  // --- 0MS OPTIMISTIC COMMENT ---
  const handleAddComment = async (target, commentText) => {
    const tempComment = { id: `tc_${Date.now()}`, user: currentHandle, text: commentText };
    playHapticSFX("send", soundEnabled);

    if (target.type === "post") {
      setPosts((prev) => prev.map((p) => (p.id === target.item.id ? { ...p, comments: [...p.comments, tempComment] } : p)));
      setActiveCommentTarget((prev) => prev ? { ...prev, item: { ...prev.item, comments: [...prev.item.comments, tempComment] } } : null);
      try {
        const { data, error } = await supabase.from("comments").insert([
          { post_id: target.item.id, user_handle: currentHandle, content: commentText }
        ]).select();
        if (error) throw error;
        if (target.item.username !== currentHandle) {
          await supabase.from("notifications").insert([{
            recipient_handle: target.item.username,
            sender_handle: currentHandle,
            type: "comment",
            post_id: target.item.id,
          }]);
        }
      } catch (err) {
        console.error("Comment err:", err);
      }
    } else if (target.type === "spark") {
      setSparks((prev) => prev.map((s) => (s.id === target.item.id ? { ...s, comments: [...(s.comments || []), tempComment] } : s)));
      setActiveCommentTarget((prev) => prev ? { ...prev, item: { ...prev.item, comments: [...(prev.item.comments || []), tempComment] } } : null);
      try {
        await supabase.from("spark_comments").insert([
          { spark_id: String(target.item.id), user_handle: currentHandle, content: commentText }
        ]);
      } catch (err) {
        console.error("Spark comment err:", err);
      }
    }
  };

  const handleToggleFollow = async (targetHandle) => {
    const isFollowing = followingHandles.includes(targetHandle);
    if (isFollowing) {
      setFollowingHandles((prev) => prev.filter((h) => h !== targetHandle));
      await supabase.from("follows").delete().eq("follower_handle", currentHandle).eq("following_handle", targetHandle);
    } else {
      setFollowingHandles((prev) => [...prev, targetHandle]);
      await supabase.from("follows").insert([{ follower_handle: currentHandle, following_handle: targetHandle }]);
      await supabase.from("notifications").insert([{ recipient_handle: targetHandle, sender_handle: currentHandle, type: "follow" }]);
    }
  };

  const handleInitiateDirectMessage = (targetHandle) => {
    if (targetHandle === currentHandle) {
      showToast("You cannot message yourself.");
      return;
    }

    if (!followingHandles.includes(targetHandle)) {
      showToast(`Follow @${targetHandle} to send a direct message!`);
      return;
    }

    setViewedUserProfile(null);
    setActiveChat({
      userId: targetHandle,
      username: targetHandle,
      avatar: null,
    });
    setActiveTab("messages");
  };

  const handleForwardSparkToFriend = async (friendHandle, sparkItem) => {
    const convId = [currentHandle, friendHandle].sort().join("_");
    const payload = `🔥 Shared a Spark: ${sparkItem.caption || "Watch clip"} - ${sparkItem.video_url}`;

    await supabase.from("messages").insert([
      { conversation_id: convId, sender_handle: currentHandle, recipient_handle: friendHandle, content: payload, is_read: false }
    ]);
    playHapticSFX("send", soundEnabled);
    setSparkForwardTarget(null);
    showToast(`Sent to @${friendHandle}!`);
  };

  const handleOpenUserProfile = async (targetHandle) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("handle", targetHandle).single();
      const targetPosts = posts.filter((p) => p.username === targetHandle);

      if (data) {
        setViewedUserProfile({ ...data, posts: targetPosts });
      } else {
        setViewedUserProfile({
          handle: targetHandle,
          full_name: targetHandle.startsWith("test_") ? `Official Test Account (${targetHandle})` : targetHandle,
          avatar_url: null,
          banner_url: null,
          bio: targetHandle.startsWith("test_") ? "Official Social Nest Sandbox Creator" : "Creator on Social Nest",
          is_private: false,
          account_type: "creator",
          posts: targetPosts,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayedPosts = posts.filter((p) => {
    const isOwner = p.username === currentHandle;
    const isFollower = followingHandles.includes(p.username);

    if (p.visibility === "followers" && !isOwner && !isFollower) {
      return false;
    }

    if (feedFilter === "following" && !isFollower && !isOwner) {
      return false;
    }
    if (searchFilterTag && !p.content?.toLowerCase().includes(`#${searchFilterTag.toLowerCase()}`)) {
      return false;
    }
    if (feedSearchQuery.trim() && !p.content?.toLowerCase().includes(feedSearchQuery.toLowerCase()) && !p.username.toLowerCase().includes(feedSearchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#2C2B30] flex flex-col items-center justify-center gap-4">
        <BrandLogo className="w-20 h-20" animated />
        <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#D6D6D6] bg-clip-text text-transparent">
          SOCIAL NEST
        </h1>
      </div>
    );
  }

  if (!currentUser) {
    return <VisitorWelcomeView isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#2C2B30] text-[#D6D6D6]" : "bg-[#FAF7F8] text-[#2C2B30]"} flex flex-col items-center pb-20 transition-colors duration-200`}>
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto max-w-xs z-50 px-4 py-2.5 rounded-2xl bg-[#F58F7C] text-[#2C2B30] font-bold text-xs shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
          <AlertCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className={`w-full max-w-md px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? "border-[#4F4F51] bg-[#2C2B30]/90" : "border-[#D6D6D6] bg-white/90"} sticky top-0 backdrop-blur-md z-30`}>
        <div className="relative flex items-center gap-2">
          <BrandLogo className="w-6 h-6" />
          <button
            onClick={() => setFeedDropdownOpen(!feedDropdownOpen)}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#D6D6D6] bg-clip-text text-transparent">
              SOCIAL NEST
            </h1>
            <ChevronDown size={15} className={`transition-transform text-[#D6D6D6] ${feedDropdownOpen ? "rotate-180 text-[#F58F7C]" : ""}`} />
          </button>

          {feedDropdownOpen && (
            <div className={`absolute left-0 top-8 mt-2 w-36 rounded-2xl p-1.5 border shadow-2xl z-40 ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-[#D6D6D6]"}`}>
              <button
                onClick={() => { setFeedFilter("all"); setFeedDropdownOpen(false); setActiveTab("home"); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${feedFilter === "all" ? "text-[#F58F7C] bg-[#F58F7C]/15 font-bold" : isDarkMode ? "text-[#D6D6D6] hover:bg-[#4F4F51]" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Explore
              </button>
              <button
                onClick={() => { setFeedFilter("following"); setFeedDropdownOpen(false); setActiveTab("home"); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${feedFilter === "following" ? "text-[#F2C4CE] bg-[#F2C4CE]/15 font-bold" : isDarkMode ? "text-[#D6D6D6] hover:bg-[#4F4F51]" : "text-slate-700 hover:bg-slate-100"}`}
              >
                Following ({followingHandles.length})
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudioOpen(true)}
            className="p-1.5 rounded-xl text-[#F58F7C] hover:bg-[#F58F7C]/15 transition-colors"
            title="Open Studio Creator"
          >
            <Camera size={21} />
          </button>

          <button
            onClick={() => setNotificationsOpen(true)}
            className={`relative p-1.5 rounded-xl transition-colors ${isDarkMode ? "text-[#D6D6D6] hover:bg-[#4F4F51]" : "text-slate-600 hover:bg-slate-200"}`}
          >
            <Bell size={20} />
            {notifications.filter((n) => !n.is_read).length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F58F7C] rounded-full animate-pulse shadow-sm shadow-[#F58F7C]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md px-3 pt-2">
        {activeTab === "home" && (
          <HomeView
            isDarkMode={isDarkMode}
            stories={OFFICIAL_TEST_STORIES}
            feedFilter={feedFilter}
            searchFilterTag={searchFilterTag}
            setSearchFilterTag={setSearchFilterTag}
            onSelectStory={(idx) => setSelectedStoryIndex(idx)}
            posts={displayedPosts}
            likedPostIds={likedPostIds}
            bookmarkedPostIds={bookmarkedPostIds}
            loading={loadingPosts}
            currentHandle={currentHandle}
            followingHandles={followingHandles}
            onToggleFollow={handleToggleFollow}
            onDeletePost={handleDeletePost}
            onOpenComments={(post) => setActiveCommentTarget({ type: "post", item: post })}
            onLikePost={handleLikePost}
            onToggleBookmark={handleToggleBookmark}
            onOpenUserProfile={handleOpenUserProfile}
          />
        )}

        {activeTab === "search" && (
          <SearchView
            isDarkMode={isDarkMode}
            posts={posts}
            followingHandles={followingHandles}
            currentHandle={currentHandle}
            searchQuery={feedSearchQuery}
            setSearchQuery={setFeedSearchQuery}
            searchTag={searchFilterTag}
            setSearchTag={setSearchFilterTag}
            onSelectPost={(post) => setActiveCommentTarget({ type: "post", item: post })}
            onOpenUserProfile={handleOpenUserProfile}
          />
        )}

        {activeTab === "sparks" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-500"}`}>
                Trending Sparks
              </span>
              <button
                onClick={() => setIsUploadSparkOpen(true)}
                className="px-3 py-1 bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] rounded-full text-xs font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
              >
                <Video size={13} /> Upload Clip
              </button>
            </div>
            <div className="w-full h-[76vh] overflow-y-scroll snap-y snap-mandatory rounded-3xl border border-[#4F4F51] bg-[#2C2B30] shadow-2xl">
              {loadingSparks ? (
                <BrandLoader message="Fetching Sparks..." />
              ) : (
                sparks.map((spark) => (
                  <SparkCard
                    key={spark.id}
                    spark={spark}
                    heightClass="h-[76vh]"
                    onOpenComments={(s) => setActiveCommentTarget({ type: "spark", item: s })}
                    onOpenUserProfile={handleOpenUserProfile}
                    onOpenForwardModal={(s) => setSparkForwardTarget(s)}
                    onOpenMoreMenu={(s) => setSparkShareModal(s)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <MessagesView
            isDarkMode={isDarkMode}
            currentUser={currentUser}
            currentHandle={currentHandle}
            activeChat={activeChat}
            followingHandles={followingHandles}
            soundEnabled={soundEnabled}
            onSelectChat={(chat) => {
              setActiveChat(chat);
              setUnreadMsgCount(0);
            }}
            onWatchFullscreenSpark={(url) => setFullscreenSparkUrl(url)}
            onBack={() => setActiveChat(null)}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            isDarkMode={isDarkMode}
            user={{
              name: profile?.full_name || "Creator",
              handle: currentHandle,
              avatar: currentAvatar,
              banner: currentBanner,
              bio: profile?.bio || "Exploring Social Nest 🚀",
              is_private: profile?.is_private || false,
              account_type: profile?.account_type || "creator",
              stats: {
                posts: posts.filter((p) => p.username === currentHandle).length,
                following: followingHandles.length,
              }
            }}
            posts={posts}
            bookmarkedPostIds={bookmarkedPostIds}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenEditProfile={() => setEditProfileOpen(true)}
          />
        )}
      </main>

      {/* Symmetrical 5-Item Bottom Nav */}
      <nav className={`fixed bottom-0 inset-x-0 backdrop-blur-xl border-t px-4 py-2 z-40 flex justify-center ${isDarkMode ? "bg-[#2C2B30]/95 border-[#4F4F51]" : "bg-white/95 border-[#D6D6D6]"}`}>
        <div className="w-full max-w-md flex items-center justify-around">
          <button
            onClick={() => { setActiveTab("home"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "home" ? "text-[#F58F7C]" : isDarkMode ? "text-[#D6D6D6]/60 hover:text-[#D6D6D6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>

          <button
            onClick={() => { setActiveTab("search"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "search" ? "text-[#F58F7C]" : isDarkMode ? "text-[#D6D6D6]/60 hover:text-[#D6D6D6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Search size={22} />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <button
            onClick={() => { setActiveTab("sparks"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "sparks" ? "text-[#F58F7C]" : isDarkMode ? "text-[#D6D6D6]/60 hover:text-[#D6D6D6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Zap size={22} className={activeTab === "sparks" ? "fill-[#F58F7C]" : ""} />
            <span className="text-[10px] font-medium">Sparks</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`relative flex flex-col items-center gap-1 transition-colors ${activeTab === "messages" ? "text-[#F58F7C]" : isDarkMode ? "text-[#D6D6D6]/60 hover:text-[#D6D6D6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <MessageSquareText size={22} />
            {unreadMsgCount > 0 && <span className="absolute top-0 right-1 w-2 h-2 bg-[#F58F7C] rounded-full" />}
            <span className="text-[10px] font-medium">Chats</span>
          </button>

          <button
            onClick={() => { setActiveTab("profile"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-[#F58F7C]" : isDarkMode ? "text-[#D6D6D6]/60 hover:text-[#D6D6D6]" : "text-slate-400 hover:text-slate-600"}`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* FULLSCREEN CLICKED SPARK PLAYER */}
      {fullscreenSparkUrl && (
        <FullscreenSparkModal
          videoUrl={fullscreenSparkUrl}
          onClose={() => setFullscreenSparkUrl(null)}
        />
      )}

      {/* USER PROFILE MODAL */}
      {viewedUserProfile && (
        <UserProfileModal
          isDarkMode={isDarkMode}
          profile={viewedUserProfile}
          isFollowing={followingHandles.includes(viewedUserProfile.handle)}
          currentHandle={currentHandle}
          onToggleFollow={() => handleToggleFollow(viewedUserProfile.handle)}
          onDirectMessage={() => handleInitiateDirectMessage(viewedUserProfile.handle)}
          onClose={() => setViewedUserProfile(null)}
          onSelectPost={(post) => {
            setViewedUserProfile(null);
            setActiveCommentTarget({ type: "post", item: post });
          }}
        />
      )}

      {/* Spark 1-Tap DM Forward Drawer */}
      {sparkForwardTarget && (
        <SparkForwardDrawer
          spark={sparkForwardTarget}
          followingHandles={followingHandles}
          isDarkMode={isDarkMode}
          onClose={() => setSparkForwardTarget(null)}
          onSend={(handle) => handleForwardSparkToFriend(handle, sparkForwardTarget)}
        />
      )}

      {/* Spark 3-Dots Share Drawer */}
      {sparkShareModal && (
        <SparkShareDrawer
          spark={sparkShareModal}
          isDarkMode={isDarkMode}
          onClose={() => setSparkShareModal(null)}
          showToast={showToast}
        />
      )}

      {/* Studio Camera Modal */}
      {isStudioOpen && (
        <StudioCreatorModal
          isDarkMode={isDarkMode}
          onClose={() => setIsStudioOpen(false)}
          onSubmit={handleAddNewPost}
        />
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          dataSaverEnabled={dataSaverEnabled}
          setDataSaverEnabled={setDataSaverEnabled}
          currentProfile={profile}
          onUpdateProfileSetting={async (key, val) => {
            await supabase.from("profiles").update({ [key]: val }).eq("id", currentUser.id);
            setProfile((p) => ({ ...p, [key]: val }));
            showToast("Setting updated!");
          }}
          onClose={() => setSettingsOpen(false)}
          onOpenEditProfile={() => { setSettingsOpen(false); setEditProfileOpen(true); }}
        />
      )}

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <EditProfileModal
          isDarkMode={isDarkMode}
          currentProfile={profile}
          onClose={() => setEditProfileOpen(false)}
          onSave={async (up) => {
            await supabase.from("profiles").update(up).eq("id", currentUser.id);
            setProfile((p) => ({ ...p, ...up }));
            setEditProfileOpen(false);
            showToast("Profile & banner updated!");
          }}
        />
      )}

      {notificationsOpen && (
        <NotificationsDrawer
          isDarkMode={isDarkMode}
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
          onOpenUserProfile={handleOpenUserProfile}
        />
      )}

      {isUploadSparkOpen && (
        <UploadSparkModal
          isDarkMode={isDarkMode}
          onClose={() => setIsUploadSparkOpen(false)}
          onSubmit={() => { fetchSparks(); setIsUploadSparkOpen(false); }}
        />
      )}

      {activeCommentTarget && (
        <CommentsDrawer
          isDarkMode={isDarkMode}
          target={activeCommentTarget}
          onClose={() => setActiveCommentTarget(null)}
          onAddComment={(text) => handleAddComment(activeCommentTarget, text)}
          onOpenUserProfile={handleOpenUserProfile}
        />
      )}

      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={OFFICIAL_TEST_STORIES}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
}

// --- FULLSCREEN SPARK MODAL (FROM CHAT EMBEDS) ---
function FullscreenSparkModal({ videoUrl, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play(); setIsPlaying(true); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-sm h-full sm:h-[85vh] bg-black sm:rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
          <button onClick={onClose} className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
            <X size={20} />
          </button>
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-black/60 text-white backdrop-blur-md">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {!isPlaying && (
          <div onClick={togglePlay} className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer">
            <div className="p-4 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-[#F2C4CE]/40 text-[#F58F7C]">
              <Play size={26} className="fill-[#F58F7C] translate-x-0.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- VISITOR SIGN-IN GATEWAY ---
function VisitorWelcomeView({ isDarkMode }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, "") || email.split("@")[0],
              full_name: fullName || "Social Nest User",
            },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-6 ${isDarkMode ? "bg-[#2C2B30] text-[#D6D6D6]" : "bg-[#FAF7F8] text-[#2C2B30]"}`}>
      <div className="w-full max-w-sm flex flex-col items-center text-center mb-6">
        <BrandLogo className="w-16 h-16 mb-2" animated />
        <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#D6D6D6] bg-clip-text text-transparent">
          SOCIAL NEST
        </h1>
        <p className="text-xs mt-1.5 text-[#D6D6D6]/80">
          Connect with creators, share sparks, and chat in real-time.
        </p>
      </div>

      <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-[#D6D6D6]"}`}>
        <h2 className="text-base font-bold mb-1">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h2>
        <p className="text-xs text-[#D6D6D6]/70 mb-5">
          {isSignUp ? "Sign up to enter your social feed." : "Sign in to enter your social feed."}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
          {isSignUp && (
            <>
              <div>
                <label className="text-[11px] font-semibold text-[#D6D6D6]/80 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#D6D6D6]/80 block mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. alex_rivera"
                  className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#D6D6D6]/80 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#D6D6D6]/80 block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-bold text-xs rounded-xl shadow-md shadow-[#F58F7C]/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <BrandLogo className="w-5 h-5" animated />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
            className="text-xs text-[#D6D6D6]/70 hover:text-[#F58F7C] transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- HOME FEED VIEW ---
function HomeView({
  isDarkMode,
  stories,
  feedFilter,
  searchFilterTag,
  setSearchFilterTag,
  onSelectStory,
  posts,
  likedPostIds,
  bookmarkedPostIds,
  loading,
  currentHandle,
  followingHandles,
  onToggleFollow,
  onDeletePost,
  onOpenComments,
  onLikePost,
  onToggleBookmark,
  onOpenUserProfile
}) {
  return (
    <div className="flex flex-col gap-3">
      {searchFilterTag && (
        <div className="flex items-center justify-between bg-[#F58F7C]/15 border border-[#F58F7C]/30 px-3 py-1.5 rounded-xl">
          <span className="text-xs text-[#F58F7C] font-bold flex items-center gap-1">
            <Hash size={13} /> #{searchFilterTag}
          </span>
          <button onClick={() => setSearchFilterTag("")} className="text-[#F58F7C] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stories Tray */}
      <div className={`p-3 rounded-2xl border ${isDarkMode ? "border-[#4F4F51] bg-[#2C2B30]/40" : "border-slate-200 bg-white/70"} shadow-sm`}>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {stories.map((story, idx) => {
            const mode = STORY_MODES[story.category];
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(idx)}
                className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0 group"
              >
                <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${mode.color} transition-all duration-300 group-hover:scale-105`}>
                  <UserAvatar src={story.userAvatar} className="w-12 h-12 border-2 border-[#2C2B30]" />
                </div>
                <span className={`text-[11px] truncate max-w-[65px] ${isDarkMode ? "text-[#D6D6D6] group-hover:text-[#F58F7C]" : "text-slate-700 group-hover:text-[#F58F7C]"}`}>
                  {story.username}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col">
        {loading ? (
          <BrandLoader message="Fetching posts..." />
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {feedFilter === "following" ? "No posts from creators you follow." : "No posts found."}
          </div>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              isDarkMode={isDarkMode}
              isLiked={likedPostIds.has(post.id)}
              isBookmarked={bookmarkedPostIds.has(post.id)}
              currentHandle={currentHandle}
              isFollowing={followingHandles.includes(post.username)}
              onToggleFollow={() => onToggleFollow(post.username)}
              onDeletePost={() => onDeletePost(post.id)}
              onOpenComments={() => onOpenComments(post)}
              onLikePost={() => onLikePost(post)}
              onToggleBookmark={() => onToggleBookmark(post.id)}
              onSelectTag={(tag) => setSearchFilterTag(tag)}
              onOpenUserProfile={() => onOpenUserProfile(post.username)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- GLASS VIDEO PLAYER WITH FLOATING HEARTS ON DOUBLE TAP ---
function GlassVideoPlayer({ src, audioUrl, isDarkMode, onDoubleTap }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const lastTapRef = useRef(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        if (audioRef.current) {
          audioRef.current.currentTime = videoRef.current.currentTime;
          audioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
    }
  };

  const handleVideoTouch = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      setShowHearts(true);
      if (onDoubleTap) onDoubleTap();
      setTimeout(() => setShowHearts(false), 800);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden group bg-black max-h-96 flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoTouch}
        className="w-full max-h-96 object-cover cursor-pointer"
      />

      {audioUrl && <audio ref={audioRef} src={audioUrl} loop muted={isMuted} />}
      <FloatingHeartsOverlay trigger={showHearts} />

      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all"
        >
          <div className="p-4 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-[#F2C4CE]/40 text-[#F58F7C] shadow-lg shadow-black/40">
            <Play size={24} className="fill-[#F58F7C] translate-x-0.5" />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 inset-x-2 px-3 py-1.5 rounded-xl bg-[#2C2B30]/60 backdrop-blur-md border border-white/10 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={togglePlay} className="text-[#F2C4CE] hover:text-[#F58F7C]">
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>

        <div className="flex-1 h-1.5 bg-[#4F4F51] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE]" style={{ width: `${progress}%` }} />
        </div>

        <button onClick={() => setIsMuted(!isMuted)} className="text-[#D6D6D6] hover:text-white">
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
}

// --- SEARCH VIEW ---
function SearchView({ isDarkMode, posts, followingHandles, currentHandle, searchQuery, setSearchQuery, searchTag, setSearchTag, onSelectPost, onOpenUserProfile }) {
  const [searchMode, setSearchMode] = useState("media");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const mediaPosts = posts.filter((p) => {
    if (!p.mediaUrl || p.mediaUrl.trim() === "") return false;
    const isOwner = p.username === currentHandle;
    const isFollower = followingHandles.includes(p.username);
    if (p.visibility === "followers" && !isOwner && !isFollower) return false;
    return true;
  });

  const filteredMedia = mediaPosts.filter((p) => {
    if (!searchQuery.trim() && !searchTag) return true;
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || p.content?.toLowerCase().includes(q) || p.username.toLowerCase().includes(q);
    const matchTag = !searchTag || p.content?.toLowerCase().includes(`#${searchTag.toLowerCase()}`);
    return matchQuery && matchTag;
  });

  useEffect(() => {
    if (searchMode !== "users" || !searchQuery.trim()) {
      setSearchedUsers([]);
      return;
    }

    const searchDBUsers = async () => {
      setLoadingUsers(true);
      const clean = searchQuery.trim().toLowerCase().replace("@", "");
      const { data } = await supabase
        .from("profiles")
        .select("handle, full_name, avatar_url, banner_url, bio, is_private, account_type")
        .or(`handle.ilike.%${clean}%,full_name.ilike.%${clean}%`)
        .limit(10);

      setSearchedUsers(data || []);
      setLoadingUsers(false);
    };

    const debounce = setTimeout(searchDBUsers, 250);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchMode]);

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex p-1 rounded-xl border text-xs font-semibold ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-slate-100 border-[#D6D6D6]"}`}>
        <button
          onClick={() => setSearchMode("media")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            searchMode === "media" ? "bg-[#F58F7C] text-[#2C2B30] font-bold" : "text-[#D6D6D6]/70 hover:text-white"
          }`}
        >
          <Film size={14} /> Explore Media
        </button>
        <button
          onClick={() => setSearchMode("users")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            searchMode === "users" ? "bg-[#F58F7C] text-[#2C2B30] font-bold" : "text-[#D6D6D6]/70 hover:text-white"
          }`}
        >
          <Users size={14} /> Find Creators
        </button>
      </div>

      <div className="relative">
        <Search size={16} className={`absolute left-3.5 top-3 ${isDarkMode ? "text-[#D6D6D6]/60" : "text-slate-400"}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchMode === "users" ? "Search creators by handle or name..." : "Search media by #tag or username..."}
          className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#F58F7C] border ${
            isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-[#D6D6D6]" : "bg-white border-[#D6D6D6] text-[#2C2B30]"
          }`}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3 text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {searchMode === "users" ? (
        <div className="flex flex-col gap-2 mt-1">
          {loadingUsers ? (
            <BrandLoader message="Searching creators..." />
          ) : searchedUsers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">
              {searchQuery.trim() ? "No creator found." : "Type a handle or name to find people."}
            </p>
          ) : (
            searchedUsers.map((u) => (
              <div
                key={u.handle}
                onClick={() => onOpenUserProfile(u.handle)}
                className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  isDarkMode ? "bg-[#2C2B30] hover:bg-[#4F4F51]/40 border-[#4F4F51]" : "bg-white hover:bg-slate-100 border-[#D6D6D6]"
                }`}
              >
                <UserAvatar src={u.avatar_url} className="w-10 h-10 border border-[#F2C4CE]/50" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold truncate text-[#D6D6D6]">{u.full_name || u.handle}</p>
                    {u.is_private && <Lock size={11} className="text-amber-400" />}
                    {u.handle.startsWith("test_") && <Award size={11} className="text-[#F58F7C]" title="Official Test Account" />}
                  </div>
                  <p className="text-[11px] text-[#F58F7C]">@{u.handle}</p>
                </div>
                <button className="px-3 py-1 rounded-xl bg-[#F58F7C]/15 border border-[#F58F7C]/30 text-[#F58F7C] text-xs font-bold">
                  View
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden mt-1">
          {filteredMedia.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-xs text-slate-500">
              No public media found matching "{searchQuery}".
            </div>
          ) : (
            filteredMedia.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className={`aspect-square relative group cursor-pointer overflow-hidden ${isDarkMode ? "bg-[#4F4F51]" : "bg-slate-200"}`}
              >
                {post.type === "video" || post.mediaUrl.endsWith(".mp4") ? (
                  <div className="w-full h-full relative">
                    <video src={post.mediaUrl} className="w-full h-full object-cover" />
                    <Video size={13} className="absolute top-1.5 right-1.5 text-white drop-shadow" />
                  </div>
                ) : (
                  <img src={post.mediaUrl} style={{ filter: FILTER_STYLES[post.filterStyle]?.filter || "none" }} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                  <span className="flex items-center gap-1"><Heart size={12} className="fill-white" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} className="fill-white" /> {post.comments?.length || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FormattedPostText({ text, onSelectTag, onOpenUserProfile, isDarkMode }) {
  if (!text) return null;
  const parts = text.split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g);
  return (
    <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-3 ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-800"}`}>
      {parts.map((part, i) => {
        if (part.startsWith("#")) {
          const rawTag = part.slice(1);
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); onSelectTag(rawTag); }}
              className="text-[#F58F7C] font-bold hover:underline cursor-pointer"
            >
              {part}{" "}
            </span>
          );
        }
        if (part.startsWith("@")) {
          const rawUser = part.slice(1);
          return (
            <span
              key={i}
              onClick={(e) => { e.stopPropagation(); onOpenUserProfile(rawUser); }}
              className="text-[#F2C4CE] font-bold hover:underline cursor-pointer"
            >
              {part}{" "}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}

// --- FEED CARD ---
function FeedCard({ post, isDarkMode, isLiked, isBookmarked, currentHandle, isFollowing, onToggleFollow, onDeletePost, onOpenComments, onLikePost, onToggleBookmark, onSelectTag, onOpenUserProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const lastTapRef = useRef(0);
  const isOwner = post.username === currentHandle;
  const isVideo = post.mediaUrl && (post.mediaUrl.endsWith(".mp4") || post.mediaUrl.endsWith(".webm") || post.mediaUrl.endsWith(".mov") || post.type === "video");

  const handleMediaTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLikePost();
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 800);
    }
    lastTapRef.current = now;
  };

  return (
    <div className={`py-4 border-b ${isDarkMode ? "border-[#4F4F51]" : "border-slate-200"} relative`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenUserProfile}>
          <UserAvatar src={post.userAvatar} className="w-9 h-9 border border-[#F2C4CE]/40" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold hover:underline ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-900"}`}>@{post.username}</span>
              {post.visibility === "followers" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5" title="Followers Only Vault">
                  <Lock size={9} /> Vault
                </span>
              )}
              {!isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFollow(); }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                    isFollowing
                      ? "bg-[#4F4F51] text-[#D6D6D6]"
                      : "bg-[#F58F7C]/15 text-[#F58F7C] border border-[#F58F7C]/30 hover:bg-[#F58F7C]/25"
                  }`}
                >
                  {isFollowing ? <UserCheck size={10} /> : <UserPlus size={10} />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-500">{post.timeAgo}</span>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-[#D6D6D6]/60 hover:text-[#F58F7C] rounded-lg">
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className={`absolute right-0 top-6 rounded-xl p-1 shadow-xl z-20 w-28 border ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
                <button onClick={() => { setMenuOpen(false); onDeletePost(); }} className="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <FormattedPostText text={post.content} onSelectTag={onSelectTag} onOpenUserProfile={onOpenUserProfile} isDarkMode={isDarkMode} />

      {post.audioTitle && (
        <div className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold text-[#F2C4CE] bg-[#4F4F51]/40 border border-[#4F4F51] px-3 py-1 rounded-full w-fit">
          <Disc size={13} className="animate-spin text-[#F58F7C]" />
          <span>{post.audioTitle}</span>
        </div>
      )}

      {post.mediaUrl && (
        <div className="mb-3 relative" onClick={handleMediaTap}>
          <FloatingHeartsOverlay trigger={showHearts} />

          {isVideo ? (
            <GlassVideoPlayer src={post.mediaUrl} audioUrl={post.audioUrl} isDarkMode={isDarkMode} onDoubleTap={() => { if (!isLiked) onLikePost(); }} />
          ) : (
            <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? "border-[#4F4F51] bg-black" : "border-slate-200 bg-slate-100"} flex items-center justify-center max-h-96 cursor-pointer`}>
              <img
                src={post.mediaUrl}
                style={{ filter: FILTER_STYLES[post.filterStyle]?.filter || "none" }}
                className="w-full h-full object-cover max-h-96"
                alt=""
              />
            </div>
          )}
        </div>
      )}

      <div className={`flex items-center justify-between pt-1 ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-500"}`}>
        <button onClick={onLikePost} className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? "text-[#F58F7C] font-bold" : "hover:text-[#F58F7C]"}`}>
          <Heart size={18} className={isLiked ? "fill-[#F58F7C]" : ""} />
          <span>{post.likes}</span>
        </button>

        <button onClick={onOpenComments} className="flex items-center gap-1.5 text-xs hover:text-[#F2C4CE] transition-colors">
          <MessageCircle size={18} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button onClick={onToggleBookmark} className={`flex items-center gap-1.5 text-xs transition-colors ${isBookmarked ? "text-[#F58F7C] font-bold" : "hover:text-[#F58F7C]"}`}>
          <Bookmark size={18} className={isBookmarked ? "fill-[#F58F7C]" : ""} />
        </button>

        <button className="hover:text-[#F58F7C] transition-colors">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}

// --- USER PROFILE MODAL ---
function UserProfileModal({ isDarkMode, profile, isFollowing, currentHandle, onToggleFollow, onDirectMessage, onClose, onSelectPost }) {
  const isOwner = profile.handle === currentHandle;
  const isPrivateLocked = profile.is_private && !isFollowing && !isOwner;

  const visiblePosts = (profile.posts || []).filter((p) => {
    if (isOwner || isFollowing) return true;
    return p.visibility === "public";
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 isolate">
      <div className={`w-full max-w-sm rounded-3xl relative border shadow-2xl flex flex-col ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-[#D6D6D6]" : "bg-white border-[#D6D6D6] text-[#2C2B30]"}`}>
        
        {/* Banner with Rounded Top Corners */}
        <div className="h-32 w-full relative bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#4F4F51] rounded-t-3xl overflow-hidden shrink-0 z-0">
          {profile.banner_url && (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="Banner" />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 z-20">
            <X size={16} />
          </button>
        </div>

        {/* Profile Info Container */}
        <div className="px-5 pb-5 pt-0 overflow-visible">
          <div className="flex justify-between items-end -mt-12 mb-3 relative z-30">
            <div className="p-1 rounded-full bg-[#2C2B30] ring-4 ring-[#2C2B30] shadow-2xl">
              <UserAvatar src={profile.avatar_url} className="w-20 h-20 border-2 border-[#F58F7C]" />
            </div>

            <div className="flex gap-2 mb-1">
              {!isOwner && (
                <button
                  onClick={onToggleFollow}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    isFollowing
                      ? "bg-[#4F4F51] text-[#D6D6D6]"
                      : "bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30]"
                  }`}
                >
                  {isFollowing ? <UserCheck size={13} /> : <UserPlus size={13} />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}

              <button
                onClick={onDirectMessage}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] hover:bg-[#F58F7C]/30 transition-all flex items-center gap-1"
              >
                <MessageSquareText size={13} /> Message
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-white">{profile.full_name || profile.handle}</h3>
              {profile.is_private && <Lock size={13} className="text-amber-400" title="Private Vault Account" />}
              {profile.account_type && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#4F4F51]/40 text-[#F2C4CE]">
                  {profile.account_type}
                </span>
              )}
            </div>
            <p className="text-xs text-[#F58F7C]">@{profile.handle}</p>
          </div>

          <p className="text-xs text-[#D6D6D6]/80 mt-2 leading-relaxed">{profile.bio || "Exploring Social Nest 🚀"}</p>

          <div className="border-t border-[#4F4F51] mt-4 pt-3 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isPrivateLocked ? "Public Broadcasts" : "All Posts"}
              </span>
              {isPrivateLocked && (
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <Lock size={12} /> Vault Locked
                </span>
              )}
            </div>

            {visiblePosts.length === 0 ? (
              <div className="py-6 text-center flex flex-col items-center gap-1.5">
                {isPrivateLocked ? (
                  <>
                    <Lock size={20} className="text-amber-400/80 mb-1" />
                    <p className="text-xs text-white font-bold">This Account is Private</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">Follow @{profile.handle} to see their Vault posts.</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">No posts shared yet.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                {visiblePosts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPost(p)}
                    className="aspect-square relative group cursor-pointer bg-black/40 overflow-hidden"
                  >
                    {p.mediaUrl ? (
                      <img src={p.mediaUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] p-1 text-center font-bold text-[#F58F7C]">
                        Aa
                      </div>
                    )}
                    {p.visibility === "followers" && (
                      <div className="absolute bottom-1 right-1 p-0.5 rounded bg-black/60 text-amber-400">
                        <Lock size={10} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PROFILE VIEW ---
function ProfileView({ isDarkMode, user, posts, bookmarkedPostIds, onOpenSettings, onOpenEditProfile }) {
  const [profileTab, setProfileTab] = useState("posts");
  const savedPosts = posts.filter((p) => bookmarkedPostIds.has(p.id));

  return (
    <div className="flex flex-col gap-4">
      <div className={`border rounded-3xl overflow-hidden shadow-sm relative ${isDarkMode ? "border-[#4F4F51] bg-[#2C2B30]/40" : "border-slate-200 bg-white"}`}>
        <div className="h-32 w-full relative bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#4F4F51] z-0">
          {user.banner ? (
            <img src={user.banner} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-semibold">
              Default Social Nest Banner
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-colors z-20"
            title="Account & App Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="p-5 pt-0">
          <div className="flex items-end justify-between -mt-11 mb-3 relative z-30">
            <div className="p-1 rounded-full bg-[#2C2B30] ring-4 ring-[#2C2B30] shadow-xl">
              <UserAvatar src={user.avatar} className="w-20 h-20 border border-[#F58F7C]" />
            </div>

            <div className="flex gap-5 text-center pr-2">
              <div><p className="font-bold text-base">{user.stats.posts}</p><p className="text-[11px] text-slate-400">Posts</p></div>
              <div><p className="font-bold text-base">{user.stats.following}</p><p className="text-[11px] text-slate-400">Following</p></div>
              <div><p className="font-bold text-base">{bookmarkedPostIds.size}</p><p className="text-[11px] text-slate-400">Saved</p></div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>{user.name}</h2>
              {user.is_private && <Lock size={12} className="text-amber-400" title="Vault Enabled" />}
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#4F4F51]/40 text-[#F2C4CE]">
                {user.account_type}
              </span>
            </div>
            <p className="text-xs text-[#F58F7C] font-semibold">@{user.handle}</p>
            <p className={`text-xs mt-1.5 leading-relaxed ${isDarkMode ? "text-[#D6D6D6]/80" : "text-slate-600"}`}>{user.bio}</p>
          </div>

          <div className="flex gap-2.5 mt-4">
            <button
              onClick={onOpenEditProfile}
              className={`flex-1 font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors border ${
                isDarkMode ? "bg-[#4F4F51] border-[#4F4F51] text-white hover:bg-[#4F4F51]/80" : "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
              }`}
            >
              <Edit3 size={13} /> Edit Profile & Banner
            </button>
          </div>
        </div>
      </div>

      <div className={`flex border-b ${isDarkMode ? "border-[#4F4F51]" : "border-slate-200"}`}>
        <button
          onClick={() => setProfileTab("posts")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "posts" ? "border-[#F58F7C] text-[#F58F7C]" : "border-transparent text-[#D6D6D6]/60 hover:text-white"
          }`}
        >
          <Grid size={16} /> Posts
        </button>
        <button
          onClick={() => setProfileTab("saved")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "saved" ? "border-[#F2C4CE] text-[#F2C4CE]" : "border-transparent text-[#D6D6D6]/60 hover:text-white"
          }`}
        >
          <Bookmark size={16} /> Saved ({bookmarkedPostIds.size})
        </button>
        <button
          onClick={() => setProfileTab("sparks")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "sparks" ? "border-[#F58F7C] text-[#F58F7C]" : "border-transparent text-[#D6D6D6]/60 hover:text-white"
          }`}
        >
          <Film size={16} /> Sparks
        </button>
      </div>

      {profileTab === "posts" && (
        <div className="py-8 text-center text-slate-500 text-xs">Shared posts are shown directly on the public timeline.</div>
      )}

      {profileTab === "saved" && (
        <div className="flex flex-col gap-2.5">
          {savedPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No saved posts yet.</div>
          ) : (
            savedPosts.map((p) => (
              <div key={p.id} className={`border p-3 rounded-2xl flex items-center gap-3 ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
                {p.mediaUrl ? (
                  <img src={p.mediaUrl} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#F58F7C]/15 text-[#F58F7C] font-bold flex items-center justify-center">Aa</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-800"}`}>@{p.username}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{p.content || "Media post"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {profileTab === "sparks" && (
        <div className="py-12 text-center text-slate-500 text-xs">Clips are accessible through the Sparks tab.</div>
      )}
    </div>
  );
}

// --- STUDIO CREATOR MODAL ---
function StudioCreatorModal({ isDarkMode, onClose, onSubmit }) {
  const [studioMode, setStudioMode] = useState("video");
  const [activeFilter, setActiveFilter] = useState("normal");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [audioPickerOpen, setAudioPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const videoStreamRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera fallback triggered:", err.message);
    }
  };

  useEffect(() => {
    if (!capturedMedia) startCamera();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode, capturedMedia]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSnapPhoto = () => {
    if (!videoStreamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoStreamRef.current.videoWidth || 720;
    canvas.height = videoStreamRef.current.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    ctx.filter = FILTER_STYLES[activeFilter]?.filter || "none";
    ctx.drawImage(videoStreamRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedMedia({ type: "photo", url: dataUrl });
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
  };

  const handleStartRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? { mimeType: "video/webm;codecs=vp9,opus" }
        : MediaRecorder.isTypeSupported("video/webm")
        ? { mimeType: "video/webm" }
        : { mimeType: "video/mp4" };

      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedMedia({ type: "video", url: videoUrl, blob });
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() && !capturedMedia) return;
    setIsUploading(true);

    try {
      let finalMediaUrl = null;

      if (capturedMedia?.file) {
        const fileExt = capturedMedia.file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from("post-media").upload(fileName, capturedMedia.file);
        if (error) throw error;
        const { data } = supabase.storage.from("post-media").getPublicUrl(fileName);
        finalMediaUrl = data.publicUrl;
      } else if (capturedMedia?.blob) {
        const fileName = `${Date.now()}.webm`;
        const { error } = await supabase.storage.from("post-media").upload(fileName, capturedMedia.blob);
        if (error) throw error;
        const { data } = supabase.storage.from("post-media").getPublicUrl(fileName);
        finalMediaUrl = data.publicUrl;
      } else if (capturedMedia?.url) {
        finalMediaUrl = capturedMedia.url;
      }

      await onSubmit({
        type: capturedMedia?.type === "video" ? "video" : "media",
        content: caption.trim(),
        mediaUrl: finalMediaUrl,
        visibility: visibility,
        audioTitle: selectedTrack ? `${selectedTrack.title} • ${selectedTrack.artist}` : null,
        audioUrl: selectedTrack ? selectedTrack.url : null,
        filterStyle: activeFilter,
      });
    } catch (err) {
      alert("Publish failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between">
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/20 to-transparent">
        <button onClick={onClose} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10">
          <X size={20} />
        </button>

        {isRecording && (
          <div className="px-3 py-1 rounded-full bg-red-500/80 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span>00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}</span>
          </div>
        )}

        <button
          onClick={() => setAudioPickerOpen(!audioPickerOpen)}
          className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center gap-1.5 text-xs font-semibold"
        >
          <Music size={14} className={selectedTrack ? "text-[#F58F7C] animate-spin" : ""} />
          <span>{selectedTrack ? selectedTrack.title : "Add Music"}</span>
        </button>

        {capturedMedia && (
          <button
            onClick={handlePublish}
            disabled={isUploading}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-bold text-xs shadow-lg"
          >
            {isUploading ? "Sharing..." : "Post"}
          </button>
        )}
      </div>

      {!capturedMedia && !isRecording && (
        <div className="absolute right-4 top-20 z-30 flex flex-col gap-4">
          <button
            onClick={toggleFacingMode}
            className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 shadow-md hover:bg-black/60"
            title="Flip camera"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}

      <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
        {!capturedMedia ? (
          <video
            ref={videoStreamRef}
            autoPlay
            playsInline
            muted
            style={{ filter: FILTER_STYLES[activeFilter]?.filter || "none" }}
            className="w-full h-full object-cover"
          />
        ) : capturedMedia.type === "video" ? (
          <video
            src={capturedMedia.url}
            autoPlay
            loop
            playsInline
            controls
            style={{ filter: FILTER_STYLES[activeFilter]?.filter || "none" }}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={capturedMedia.url}
            style={{ filter: FILTER_STYLES[activeFilter]?.filter || "none" }}
            className="w-full h-full object-cover"
          />
        )}

        {audioPickerOpen && (
          <div className="absolute top-16 inset-x-4 p-4 rounded-2xl bg-[#2C2B30]/95 backdrop-blur-xl border border-[#4F4F51] z-40 flex flex-col gap-2 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#4F4F51]">
              <span className="text-xs font-bold text-[#D6D6D6] flex items-center gap-1.5">
                <Disc size={14} className="text-[#F58F7C]" /> Select Music Track
              </span>
              <button onClick={() => setAudioPickerOpen(false)}><X size={14} className="text-slate-400" /></button>
            </div>
            {SAMPLE_VIRAL_TRACKS.map((t) => (
              <div
                key={t.id}
                onClick={() => { setSelectedTrack(t); setAudioPickerOpen(false); }}
                className={`p-2 rounded-xl flex items-center justify-between cursor-pointer ${selectedTrack?.id === t.id ? "bg-[#F58F7C]/20 border border-[#F58F7C]/50" : "hover:bg-[#4F4F51]/30"}`}
              >
                <div>
                  <p className="text-xs font-bold text-white">{t.title}</p>
                  <p className="text-[10px] text-slate-400">{t.artist}</p>
                </div>
                <Play size={12} className="text-[#F58F7C]" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 pb-8 z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-3">
        {capturedMedia && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 self-start bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Audience:</span>
              <button
                onClick={() => setVisibility("public")}
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all ${visibility === "public" ? "bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30]" : "text-white/60 hover:text-white"}`}
              >
                <Globe size={11} /> Public Explore
              </button>
              <button
                onClick={() => setVisibility("followers")}
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all ${visibility === "followers" ? "bg-amber-400 text-[#2C2B30]" : "text-white/60 hover:text-white"}`}
              >
                <Lock size={11} /> Followers Vault
              </button>
            </div>

            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write caption with #tags or @mentions..."
              className="w-full rounded-2xl px-4 py-2.5 text-xs bg-black/60 backdrop-blur-md border border-[#4F4F51] text-white focus:outline-none focus:border-[#F58F7C]"
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          {Object.entries(FILTER_STYLES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                activeFilter === key
                  ? "bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] shadow-md shadow-[#F58F7C]/30 scale-105"
                  : "bg-black/50 text-[#D6D6D6] backdrop-blur-md border border-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!capturedMedia && (
          <div className="flex flex-col items-center gap-4 pt-1">
            <div className="flex items-center justify-around w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:scale-105 transition-transform"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const isVid = file.type.startsWith("video");
                    setCapturedMedia({ type: isVid ? "video" : "photo", url: URL.createObjectURL(file), file });
                  }
                }}
              />

              {studioMode === "video" ? (
                <button
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`w-20 h-20 rounded-full border-4 ${isRecording ? "border-red-500 animate-pulse" : "border-white"} p-1 flex items-center justify-center hover:scale-105 transition-transform active:scale-95`}
                >
                  <div className={`w-full h-full ${isRecording ? "rounded-lg bg-red-500 scale-75" : "rounded-full bg-red-500"} transition-all`} />
                </button>
              ) : (
                <button
                  onClick={handleSnapPhoto}
                  className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#F58F7C] to-[#F2C4CE]" />
                </button>
              )}

              <button
                onClick={() => setCapturedMedia(null)}
                className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 opacity-0 pointer-events-none"
              >
                <Sliders size={20} />
              </button>
            </div>

            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              <button
                onClick={() => setStudioMode("video")}
                className={studioMode === "video" ? "text-[#F58F7C] border-b-2 border-[#F58F7C] pb-0.5" : "hover:text-white"}
              >
                Video
              </button>
              <button
                onClick={() => setStudioMode("photo")}
                className={studioMode === "photo" ? "text-[#F58F7C] border-b-2 border-[#F58F7C] pb-0.5" : "hover:text-white"}
              >
                Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- AUTOPLAYING & LOOPING SPARK CARD ---
function SparkCard({ spark, heightClass = "h-[580px]", onOpenComments, onOpenUserProfile, onOpenForwardModal, onOpenMoreMenu }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current?.pause();
        setIsPlaying(false);
      }
    }, { threshold: 0.65 });

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
      else { videoRef.current.play(); setIsPlaying(true); }
    }
  };

  const handleSparkTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      setLiked(true);
      playHapticSFX("like");
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 800);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} snap-start bg-black flex items-center justify-center overflow-hidden group`}>
      <video
        ref={videoRef}
        src={spark.video_url}
        loop
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={handleSparkTap}
        className="w-full h-full object-cover cursor-pointer"
      />

      <FloatingHeartsOverlay trigger={showHearts} />

      {!isPlaying && (
        <div onClick={togglePlay} className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px] flex items-center justify-center cursor-pointer">
          <div className="p-4 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-[#F2C4CE]/40 text-[#F58F7C]">
            <Play size={26} className="fill-[#F58F7C] translate-x-0.5" />
          </div>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute top-4 right-4 p-2 bg-[#2C2B30]/60 backdrop-blur-md rounded-full text-[#D6D6D6] hover:text-white z-10 border border-white/10"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute right-3 bottom-14 z-10 flex flex-col items-center gap-5">
        <button onClick={() => { setLiked(!liked); playHapticSFX("like"); }} className="flex flex-col items-center gap-1 group/btn">
          <div className={`p-2.5 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-white/10 transition-transform group-hover/btn:scale-110 ${liked ? "text-[#F58F7C]" : "text-white"}`}>
            <Heart size={22} className={liked ? "fill-[#F58F7C]" : ""} />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow">{spark.likes_count || 0}</span>
        </button>

        <button onClick={() => onOpenComments(spark)} className="flex flex-col items-center gap-1 group/btn">
          <div className="p-2.5 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-white/10 text-white transition-transform group-hover/btn:scale-110">
            <MessageCircle size={22} />
          </div>
          <span className="text-[11px] font-semibold text-white drop-shadow">{spark.comments?.length || 0}</span>
        </button>

        <button onClick={() => onOpenForwardModal(spark)} className="flex flex-col items-center gap-1 group/btn">
          <div className="p-2.5 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-white/10 text-white transition-transform group-hover/btn:scale-110 hover:text-[#F58F7C]">
            <Send size={20} className="-rotate-12" />
          </div>
        </button>

        <button onClick={() => onOpenMoreMenu(spark)} className="p-2 rounded-full bg-[#2C2B30]/60 backdrop-blur-md border border-white/10 text-white transition-transform hover:scale-110">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-16 z-10 text-white flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto cursor-pointer" onClick={() => onOpenUserProfile(spark.user_handle)}>
          <UserAvatar src={spark.user_avatar} className="w-8 h-8 border border-[#F2C4CE]/50" />
          <span className="font-semibold text-sm hover:underline">@{spark.user_handle}</span>
        </div>
        {spark.caption && <p className="text-xs text-[#D6D6D6] line-clamp-2 leading-relaxed">{spark.caption}</p>}

        <div className="w-full h-1 bg-[#4F4F51]/70 backdrop-blur-md rounded-full overflow-hidden mt-1">
          <div className="h-full bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// --- SPARK 1-TAP DM FORWARD DRAWER ---
function SparkForwardDrawer({ spark, followingHandles, isDarkMode, onClose, onSend }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
      <div className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl max-h-[70vh] flex flex-col ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white border-[#D6D6D6] text-slate-900"}`}>
        <div className="flex justify-between items-center pb-3 border-b border-[#4F4F51]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F58F7C] flex items-center gap-1.5">
            <Send size={14} /> Send Spark to Followed Creators
          </span>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
          {followingHandles.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Follow creators to directly send them Sparks!</p>
          ) : (
            followingHandles.map((handle) => (
              <div
                key={handle}
                className={`p-3 rounded-2xl flex items-center justify-between border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51]" : "bg-slate-50 border-slate-200"}`}
              >
                <div className="flex items-center gap-3">
                  <DefaultAvatar className="w-9 h-9" />
                  <span className="text-xs font-bold">@{handle}</span>
                </div>
                <button
                  onClick={() => onSend(handle)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] text-xs font-bold flex items-center gap-1 hover:opacity-90"
                >
                  <Send size={12} /> Send
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- SPARKS SHARE DRAWER ---
function SparkShareDrawer({ spark, isDarkMode, onClose, showToast }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(spark.video_url || window.location.href);
    setCopied(true);
    showToast("Link copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Social Nest Spark",
          text: spark.caption || "Watch this Spark on Social Nest!",
          url: spark.video_url || window.location.href,
        });
        onClose();
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:p-4">
      <div className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 border shadow-2xl ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white border-[#D6D6D6] text-slate-900"}`}>
        <div className="flex justify-between items-center pb-3 border-b border-[#4F4F51]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F58F7C]">Share Spark</span>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleCopyLink}
            className="w-full p-3 rounded-2xl bg-[#4F4F51]/30 hover:bg-[#4F4F51]/60 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Copy size={16} className="text-[#F2C4CE]" />
              <span>Copy Link</span>
            </div>
            {copied ? <Check size={16} className="text-green-400" /> : null}
          </button>

          <button
            onClick={handleNativeShare}
            className="w-full p-3 rounded-2xl bg-[#4F4F51]/30 hover:bg-[#4F4F51]/60 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-semibold">
              <Share2 size={16} className="text-[#F58F7C]" />
              <span>Share via other apps...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STORY VIEWER MODAL ---
function StoryViewerModal({ stories, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const audioRef = useRef(null);
  const activeStory = stories[currentIndex];

  useEffect(() => {
    if (activeStory?.audioUrl) {
      if (!audioRef.current) audioRef.current = new Audio(activeStory.audioUrl);
      else audioRef.current.src = activeStory.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentIndex]);

  useEffect(() => {
    if (isPaused) {
      if (audioRef.current) audioRef.current.pause();
      return;
    } else {
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }

    const step = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + (step / 5000) * 100;
      });
    }, step);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center">
      <div
        className="relative w-full max-w-md h-full sm:h-[85vh] bg-black sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1.5 px-3">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] rounded-full transition-all duration-75 ease-linear" style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%" }} />
            </div>
          ))}
        </div>

        <div className="absolute top-6 inset-x-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <UserAvatar src={activeStory.userAvatar} className="w-8 h-8 border border-[#F2C4CE]/50" />
            <div>
              <span className="font-semibold text-sm text-white block">{activeStory.username}</span>
              {activeStory.audioTitle && (
                <span className="text-[10px] text-[#F2C4CE] flex items-center gap-1">
                  <Music size={10} className="animate-spin" /> {activeStory.audioTitle}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-full bg-black/30">
            <X size={20} />
          </button>
        </div>

        <img key={activeStory.id} src={activeStory.mediaUrl} className="w-full h-full object-cover select-none" />

        {activeStory.caption && (
          <div className="absolute bottom-6 inset-x-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-xs sm:text-sm text-white border border-white/10">
            {activeStory.caption}
          </div>
        )}

        <div className="absolute left-0 top-16 bottom-0 w-1/3 z-10 cursor-pointer" onClick={() => { if (currentIndex > 0) { setCurrentIndex((i) => i - 1); setProgress(0); } }} />
        <div className="absolute right-0 top-16 bottom-0 w-2/3 z-10 cursor-pointer" onClick={() => { if (currentIndex < stories.length - 1) { setCurrentIndex((i) => i + 1); setProgress(0); } else { onClose(); } }} />
      </div>
    </div>
  );
}

// --- UNIVERSAL COMMENTS DRAWER ---
function CommentsDrawer({ isDarkMode, target, onClose, onAddComment, onOpenUserProfile }) {
  const [commentInput, setCommentInput] = useState("");
  const comments = target?.item?.comments || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0 sm:p-4">
      <div className={`w-full max-w-md mx-auto h-[65vh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? "border-[#4F4F51]" : "border-slate-200"}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#D6D6D6]">
            Comments ({target.type === "spark" ? "Sparks" : "Post"})
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">No comments yet. Start the conversation!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 items-start">
                <DefaultAvatar className="w-7 h-7" />
                <div className={`flex-1 p-2.5 rounded-xl border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51]" : "bg-slate-100 border-slate-200"}`}>
                  <p
                    onClick={() => onOpenUserProfile(c.user)}
                    className="text-[11px] font-bold text-[#F58F7C] cursor-pointer hover:underline inline-block"
                  >
                    @{c.user}
                  </p>
                  <p className={`text-xs mt-0.5 ${isDarkMode ? "text-[#D6D6D6]" : "text-slate-800"}`}>{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className={`p-3 border-t flex gap-2 ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-100 border-slate-200 text-slate-900"}`}
          />
          <button type="submit" disabled={!commentInput.trim()} className="p-2 bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-bold rounded-xl disabled:opacity-40">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- EDIT PROFILE MODAL ---
function EditProfileModal({ isDarkMode, currentProfile, onClose, onSave }) {
  const [fullName, setFullName] = useState(currentProfile?.full_name || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || "");
  const [bannerUrl, setBannerUrl] = useState(currentProfile?.banner_url || "");
  const [uploading, setUploading] = useState(false);

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleUploadFile = async (file, bucket) => {
    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await handleUploadFile(file, "avatars");
      setAvatarUrl(url);
    } catch (err) {
      alert("Avatar upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await handleUploadFile(file, "profile-banners");
      setBannerUrl(url);
    } catch (err) {
      alert("Banner upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <div
          onClick={() => bannerInputRef.current?.click()}
          className="h-28 w-full relative bg-[#4F4F51] cursor-pointer group flex items-center justify-center border-b border-[#4F4F51]"
        >
          {bannerUrl ? (
            <img src={bannerUrl} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-slate-300 flex items-center gap-1.5"><Camera size={14} /> Tap to set custom banner</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
            Change Banner
          </div>
          <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white"><X size={16} /></button>

        <div className="p-6 pt-0">
          <div className="flex items-end justify-between -mt-10 mb-4 relative z-30">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative group cursor-pointer p-1 rounded-full bg-[#2C2B30] ring-4 ring-[#2C2B30]"
            >
              <UserAvatar src={avatarUrl} className="w-18 h-18 border-2 border-[#F58F7C]" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <span className="text-[11px] text-slate-400">{uploading ? "Uploading..." : "Tap to customize avatar"}</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave({ full_name: fullName.trim(), bio: bio.trim(), avatar_url: avatarUrl, banner_url: bannerUrl }); }} className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border bg-black/40 border-[#4F4F51] text-white" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Bio</label>
              <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full rounded-xl p-3 text-xs focus:outline-none focus:border-[#F58F7C] resize-none border bg-black/40 border-[#4F4F51] text-white" />
            </div>
            <button type="submit" disabled={uploading} className="w-full py-2.5 bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-bold text-xs rounded-xl shadow-sm mt-1">
              Save Profile & Banner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- MESSAGES VIEW WITH INTERACTIVE CLICKABLE SPARK CARDS ---
function MessagesView({ isDarkMode, currentUser, currentHandle, activeChat, followingHandles, soundEnabled, onSelectChat, onWatchFullscreenSpark, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentConversations, setRecentConversations] = useState([]);
  const [searchedFollowedUsers, setSearchedFollowedUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const messagesEndRef = useRef(null);

  const getConversationId = (userA, userB) => [userA, userB].sort().join("_");

  const fetchRecentConversations = async () => {
    if (!currentUser || !currentHandle) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_handle.eq.${currentHandle},recipient_handle.eq.${currentHandle}`)
      .order("created_at", { ascending: false });

    if (data) {
      const convMap = new Map();
      for (const m of data) {
        const partner = m.sender_handle === currentHandle ? m.recipient_handle : m.sender_handle;
        if (!convMap.has(partner)) {
          convMap.set(partner, {
            userId: partner,
            username: partner,
            avatar: null,
            lastMessage: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            unread: m.recipient_handle === currentHandle && !m.is_read
          });
        }
      }
      setRecentConversations(Array.from(convMap.values()));
    }
  };

  useEffect(() => {
    fetchRecentConversations();
  }, [currentUser, currentHandle, activeChat]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedFollowedUsers([]);
      setIsSearchingUsers(false);
      return;
    }

    const searchUsers = async () => {
      setIsSearchingUsers(true);
      const clean = searchQuery.trim().toLowerCase().replace("@", "");
      const { data } = await supabase
        .from("profiles")
        .select("handle, full_name, avatar_url")
        .neq("handle", currentHandle)
        .or(`handle.ilike.%${clean}%,full_name.ilike.%${clean}%`)
        .limit(8);

      setSearchedFollowedUsers(data || []);
      setIsSearchingUsers(false);
    };

    const debounce = setTimeout(searchUsers, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentHandle]);

  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const convId = getConversationId(currentHandle, activeChat.userId);
    setLoadingChat(true);

    const loadMessages = async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
      if (data) setMessages(data);
      setLoadingChat(false);
      await supabase.from("messages").update({ is_read: true }).eq("conversation_id", convId).eq("recipient_handle", currentHandle);
    };

    loadMessages();

    const channel = supabase
      .channel(`chat_${convId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${convId}` }, (payload) => {
        setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        if (payload.new.sender_handle !== currentHandle) {
          playHapticSFX("receive", soundEnabled);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChat, currentUser, currentHandle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 0ms Optimistic Message Send
  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChat) return;
    const text = inputText.trim();
    setInputText("");
    const convId = getConversationId(currentHandle, activeChat.userId);
    const tempId = `tmsg_${Date.now()}`;

    const optimisticMsg = {
      id: tempId,
      conversation_id: convId,
      sender_handle: currentHandle,
      recipient_handle: activeChat.userId,
      content: text,
      created_at: new Date().toISOString(),
      is_read: false
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    playHapticSFX("send", soundEnabled);

    try {
      await supabase.from("messages").insert([
        { conversation_id: convId, sender_handle: currentHandle, recipient_handle: activeChat.userId, content: text, is_read: false }
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (activeChat) {
    return (
      <div className={`flex flex-col h-[78vh] rounded-3xl overflow-hidden border shadow-2xl ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
        <div className={`px-4 py-3 border-b flex items-center gap-3 ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51]" : "bg-slate-100 border-slate-200"}`}>
          <button onClick={onBack} className="p-1 text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
          <UserAvatar src={activeChat.avatar} className="w-8 h-8" />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-bold leading-tight truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>{activeChat.username}</p>
            <p className="text-[10px] text-[#F58F7C] font-medium">@{activeChat.userId}</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {loadingChat ? (
            <BrandLoader message="Loading conversation..." />
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_handle === currentHandle;
              const isSparkShare = msg.content?.includes("storage/v1/object/public/sparks-media");

              let videoUrl = null;
              let sparkCaption = "Shared Spark";
              if (isSparkShare) {
                const match = msg.content.match(/(https?:\/\/[^\s]+)/);
                if (match) videoUrl = match[0];
                const textPart = msg.content.replace("🔥 Shared a Spark:", "").replace(videoUrl || "", "").replace("-", "").trim();
                if (textPart) sparkCaption = textPart;
              }

              return (
                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                  {isSparkShare && videoUrl ? (
                    <div
                      onClick={() => onWatchFullscreenSpark(videoUrl)}
                      className={`p-2.5 rounded-2xl border shadow-lg flex flex-col gap-2 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                        isMe
                          ? "bg-gradient-to-br from-[#F58F7C]/20 to-[#F2C4CE]/10 border-[#F58F7C]/40"
                          : isDarkMode
                          ? "bg-[#4F4F51]/40 border-[#4F4F51]"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#F58F7C]">
                        <span className="flex items-center gap-1.5"><Zap size={14} className="fill-[#F58F7C]" /> Spark Clip</span>
                        <span className="text-[10px] text-white/70">Tap to watch</span>
                      </div>

                      <div className="relative w-48 h-64 rounded-xl overflow-hidden bg-black flex items-center justify-center group/card">
                        <video src={videoUrl} className="w-full h-full object-cover" playsInline muted loop autoPlay />
                        <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/10 flex items-center justify-center transition-colors">
                          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#F58F7C]">
                            <Play size={20} className="fill-[#F58F7C] translate-x-0.5" />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-white font-medium line-clamp-1">{sparkCaption}</p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isMe ? "bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-bold rounded-tr-none" : isDarkMode ? "bg-[#4F4F51] text-[#D6D6D6] rounded-tl-none" : "bg-slate-200 text-slate-900 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  )}
                  <span className="text-[9px] text-slate-500 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendSubmit} className={`p-3 border-t flex items-center gap-2 ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message @${activeChat.userId}...`}
            className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51] text-white" : "bg-slate-100 border-slate-200 text-slate-900"}`}
          />
          <button type="submit" disabled={!inputText.trim()} className="p-2 bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] hover:opacity-90 disabled:opacity-40 text-[#2C2B30] font-bold rounded-xl transition-all"><Send size={15} /></button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className={`absolute left-3.5 top-3 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search followed creators or by @handle to chat..."
          className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-[#D6D6D6]" : "bg-white border-slate-200 text-slate-900"}`}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3 text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {searchQuery.trim() && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-[#F58F7C] px-1">Creators Matching Search</span>
          {isSearchingUsers ? (
            <p className="text-xs text-slate-500 py-4 text-center">Searching creators...</p>
          ) : searchedFollowedUsers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No creator found.</p>
          ) : (
            searchedFollowedUsers.map((u) => {
              const isFollowed = followingHandles.includes(u.handle);
              return (
                <div
                  key={u.handle}
                  onClick={() => onSelectChat({ userId: u.handle, username: u.full_name || u.handle, avatar: u.avatar_url })}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer border transition-all ${isDarkMode ? "bg-[#4F4F51]/30 hover:bg-[#4F4F51]/60 border-[#4F4F51]" : "bg-white hover:bg-slate-100 border-slate-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar src={u.avatar_url} className="w-9 h-9" />
                    <div>
                      <p className="text-xs font-bold text-white">{u.full_name || u.handle}</p>
                      <p className="text-[10px] text-[#F58F7C]">@{u.handle}</p>
                    </div>
                  </div>
                  {isFollowed && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F58F7C]/20 text-[#F58F7C] border border-[#F58F7C]/30">
                      Following
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[11px] font-semibold text-slate-400 px-1">Recent Chats</span>
          {recentConversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No conversations yet.</div>
          ) : (
            recentConversations.map((chat) => (
              <div
                key={chat.userId}
                onClick={() => onSelectChat(chat)}
                className={`p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer border transition-all ${
                  isDarkMode ? "bg-[#2C2B30] hover:bg-[#4F4F51]/40 border-[#4F4F51]" : "bg-white hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="relative">
                  <UserAvatar src={chat.avatar} className="w-11 h-11" />
                  {chat.unread && <span className="absolute top-0 right-0 w-3 h-3 bg-[#F58F7C] rounded-full border-2 border-black" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-slate-900"}`}>@{chat.userId}</p>
                    <span className="text-[10px] text-slate-500">{chat.time}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${chat.unread ? "text-[#F58F7C] font-bold" : "text-slate-400"}`}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- SETTINGS MODAL ---
function SettingsModal({ isDarkMode, setIsDarkMode, soundEnabled, setSoundEnabled, dataSaverEnabled, setDataSaverEnabled, currentProfile, onUpdateProfileSetting, onClose, onOpenEditProfile }) {
  const [aboutDrawerOpen, setAboutDrawerOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-[#D6D6D6]" : "bg-white border-slate-200 text-slate-900"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <Settings size={18} className="text-[#F58F7C]" /> Settings & Preferences
        </h3>

        <div className="flex flex-col gap-4">
          <div className={`p-3.5 rounded-2xl border flex flex-col gap-3 ${isDarkMode ? "bg-black/40 border-[#4F4F51]" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] font-bold text-[#F58F7C] uppercase tracking-wider">Account Privacy & Category</span>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Lock size={13} className="text-amber-400" /> Private Account (Vault)
                </p>
                <p className="text-[10px] text-slate-400">Lock posts from strangers; public broadcasts remain discoverable.</p>
              </div>
              <input
                type="checkbox"
                checked={currentProfile?.is_private || false}
                onChange={(e) => onUpdateProfileSetting("is_private", e.target.checked)}
                className="accent-[#F58F7C] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium">Account Category</span>
              <select
                value={currentProfile?.account_type || "creator"}
                onChange={(e) => onUpdateProfileSetting("account_type", e.target.value)}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold border focus:outline-none ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white border-slate-200"}`}
              >
                <option value="creator">Creator</option>
                <option value="personal">Personal</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex flex-col gap-3 ${isDarkMode ? "bg-black/40 border-[#4F4F51]" : "bg-slate-50 border-slate-200"}`}>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience & Engine</span>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon size={15} className="text-[#F58F7C]" /> : <Sun size={15} className="text-[#F58F7C]" />}
                <span className="text-xs font-medium">Night Theme</span>
              </div>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
                className="accent-[#F58F7C] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={15} className="text-[#F2C4CE]" />
                <div>
                  <span className="text-xs font-medium block">Sound & Haptics</span>
                  <span className="text-[9px] text-slate-400">Play chimes for sends, likes & uploads</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={() => setSoundEnabled(!soundEnabled)}
                className="accent-[#F58F7C] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi size={15} className="text-emerald-400" />
                <div>
                  <span className="text-xs font-medium block">Data Saver</span>
                  <span className="text-[9px] text-slate-400">Cap video playback to 720p</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={dataSaverEnabled}
                onChange={() => setDataSaverEnabled(!dataSaverEnabled)}
                className="accent-[#F58F7C] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 ${isDarkMode ? "bg-black/40 border-[#4F4F51]" : "bg-slate-50 border-slate-200"}`}>
            <button
              onClick={() => setAboutDrawerOpen(true)}
              className="w-full text-left flex items-center justify-between text-xs font-bold text-[#D6D6D6] hover:text-[#F58F7C]"
            >
              <div className="flex items-center gap-2">
                <Info size={15} className="text-[#F58F7C]" />
                <span>About Social Nest & Guidelines</span>
              </div>
              <span className="text-[10px] text-slate-500">v1.3.0 Hybrid</span>
            </button>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {aboutDrawerOpen && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl relative ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white text-black"}`}>
              <button onClick={() => setAboutDrawerOpen(false)} className="absolute top-4 right-4"><X size={18} /></button>
              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <BrandLogo className="w-12 h-12" animated />
                <h4 className="text-sm font-black tracking-widest text-[#F58F7C]">SOCIAL NEST v1.3.0</h4>
                <p className="text-[11px] text-slate-400">Next-generation creator network with selective privacy vaults and in-app studio media creation.</p>
              </div>
              <div className="text-[11px] text-slate-300 space-y-2 border-t border-white/10 pt-3">
                <p><strong>Vault Privacy:</strong> Keep personal memories locked away for followers only while publishing viral Sparks to the world.</p>
                <p><strong>Community Rules:</strong> Authentic expression, creator respect, and zero spam.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- NOTIFICATIONS DRAWER ---
function NotificationsDrawer({ isDarkMode, notifications, onClose, onOpenUserProfile }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className={`w-full max-w-sm h-full p-5 flex flex-col shadow-2xl border-l ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51]" : "bg-white border-slate-200"}`}>
        <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? "border-[#4F4F51]" : "border-slate-200"}`}>
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#F58F7C]" />
            <h3 className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Notifications</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-16">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => { onClose(); onOpenUserProfile(n.sender_handle); }}
                className={`p-3 rounded-xl flex items-center gap-3 text-xs border cursor-pointer hover:border-[#F58F7C] transition-all ${
                  isDarkMode ? "bg-[#4F4F51]/30 border-[#4F4F51]" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="p-2 rounded-full bg-[#F58F7C]/15 text-[#F58F7C]">
                  {n.type === "like" && <Heart size={14} className="fill-[#F58F7C]" />}
                  {n.type === "comment" && <MessageCircle size={14} />}
                  {n.type === "follow" && <UserPlus size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={isDarkMode ? "text-[#D6D6D6]" : "text-slate-800"}>
                    <span className="font-bold text-[#F58F7C] hover:underline">@{n.sender_handle}</span>{" "}
                    {n.type === "like" && "liked your post."}
                    {n.type === "comment" && "commented on your post."}
                    {n.type === "follow" && "started following you."}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- UPLOAD SPARK MODAL ---
function UploadSparkModal({ isDarkMode, onClose, onSubmit }) {
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from("sparks-media").upload(fileName, selectedFile);
      if (error) throw error;
      const { data } = supabase.storage.from("sparks-media").getPublicUrl(fileName);
      await supabase.from("sparks").insert([{ user_handle: "guest", video_url: data.publicUrl, caption: caption.trim(), visibility: visibility }]);
      playHapticSFX("upload");
      onSubmit();
    } catch (err) {
      alert("Spark upload error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-2xl p-5 shadow-2xl relative border ${isDarkMode ? "bg-[#2C2B30] border-[#4F4F51] text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
        <h3 className="text-base font-bold mb-3 flex items-center gap-2"><Zap className="fill-[#F58F7C] text-[#F58F7C]" size={18} /> Upload Spark Clip</h3>
        
        <div className="flex items-center gap-2 mb-3 bg-black/40 p-1.5 rounded-xl border border-[#4F4F51]">
          <span className="text-[10px] text-slate-400 font-bold uppercase pl-1">Audience:</span>
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${visibility === "public" ? "bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30]" : "text-slate-400"}`}
          >
            <Globe size={11} /> Public Explore
          </button>
          <button
            type="button"
            onClick={() => setVisibility("followers")}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${visibility === "followers" ? "bg-amber-400 text-[#2C2B30]" : "text-slate-400"}`}
          >
            <Lock size={11} /> Followers Vault
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          {!previewUrl ? (
            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer ${isDarkMode ? "border-[#4F4F51] hover:border-[#F58F7C] bg-black/40" : "border-slate-300 hover:border-[#F58F7C] bg-slate-50"}`}>
              <UploadCloud size={32} className="text-slate-500" />
              <span className="text-xs text-slate-400">Select short video (.mp4, .mov)</span>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border h-44 flex items-center justify-center">
              <video src={previewUrl} className="w-full h-full object-cover" muted loop autoPlay />
              <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full"><X size={14} /></button>
            </div>
          )}
          <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add caption and #hashtags..." className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#F58F7C] border ${isDarkMode ? "bg-black/40 border-[#4F4F51] text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`} />
          <button type="submit" disabled={isUploading || !selectedFile} className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50">
            {isUploading ? <><BrandLogo className="w-4 h-4 mr-1" animated /> Uploading...</> : <><Video size={13} /> Publish Spark</>}
          </button>
        </form>
      </div>
    </div>
  );
}