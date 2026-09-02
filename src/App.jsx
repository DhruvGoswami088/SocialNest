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
  Mail,
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
  Edit3
} from "lucide-react";

// --- STORY MODES ---
const STORY_MODES = {
  announcement: {
    label: "Important",
    color: "from-amber-500 via-red-500 to-rose-600",
    icon: Bell,
    duration: 7000,
  },
  routine: {
    label: "Daily",
    color: "from-cyan-400 via-teal-500 to-emerald-500",
    icon: Camera,
    duration: 5000,
  },
  normal: {
    label: "Sparks",
    color: "from-amber-400 via-orange-500 to-rose-500",
    icon: Zap,
    duration: 5000,
  },
};

const SAMPLE_STORIES = [
  {
    id: "s1",
    username: "alex_dev",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    category: "announcement",
    caption: "🚀 Social Nest v2.0 is live with follows & notifications!",
  },
  {
    id: "s2",
    username: "sarah_m",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    category: "routine",
    caption: "Morning coffee & ocean walk ☕🌊",
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [feedFilter, setFeedFilter] = useState("all"); // "all" or "following"
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [followingHandles, setFollowingHandles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSparks, setLoadingSparks] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUploadSparkOpen, setIsUploadSparkOpen] = useState(false);

  // Fetch full profile info from public.profiles
  const fetchUserProfile = async (userId, userMetadata, email) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        setProfile({
          id: userId,
          handle: userMetadata?.handle || email?.split("@")[0] || "user",
          full_name: userMetadata?.full_name || "SocialNest Creator",
          avatar_url: userMetadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
          bio: "Exploring Social Nest 🚀",
        });
      }
    } catch (e) {
      console.error("Profile load err:", e);
    }
  };

  // Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setCurrentUser(u);
      if (u) fetchUserProfile(u.id, u.user_metadata, u.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setCurrentUser(u);
      if (u) fetchUserProfile(u.id, u.user_metadata, u.email);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const currentHandle = profile?.handle || (currentUser ? currentUser.email.split("@")[0] : "guest");
  const currentAvatar = profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";

  // Fetch follows & notifications
  const fetchFollowsAndNotifications = async () => {
    if (!currentHandle || currentHandle === "guest") return;

    // Follows
    const { data: followData } = await supabase
      .from("follows")
      .select("following_handle")
      .eq("follower_handle", currentHandle);

    if (followData) {
      setFollowingHandles(followData.map((f) => f.following_handle));
    }

    // Notifications
    const { data: notifData } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_handle", currentHandle)
      .order("created_at", { ascending: false })
      .limit(20);

    if (notifData) {
      setNotifications(notifData);
    }
  };

  useEffect(() => {
    fetchFollowsAndNotifications();

    // Realtime notification listener
    if (!currentHandle || currentHandle === "guest") return;
    const channel = supabase
      .channel("public_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_handle=eq.${currentHandle}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentHandle]);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*, comments(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((p) => ({
        id: p.id,
        type: p.post_type,
        username: p.user_handle,
        userAvatar: p.user_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        timeAgo: new Date(p.created_at).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        content: p.content,
        mediaUrl: p.media_url,
        likes: p.likes_count || 0,
        reposts: 0,
        comments: (p.comments || []).map((c) => ({
          id: c.id,
          user: c.user_handle,
          text: c.content,
        })),
      }));

      setPosts(formatted);
    } catch (err) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch Sparks
  const fetchSparks = async () => {
    try {
      setLoadingSparks(true);
      const { data, error } = await supabase
        .from("sparks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setSparks(data);
      } else {
        setSparks([
          {
            id: "fallback-spark",
            user_handle: "nest_official",
            user_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            video_url: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
            caption: "Welcome to Sparks! Upload your short vertical clips ⚡",
            song_title: "Original Sound - Social Nest",
            likes_count: 42
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching sparks:", err.message);
    } finally {
      setLoadingSparks(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSparks();
  }, []);

  // Post Actions
  const handleAddNewPost = async (newPost) => {
    try {
      const { error } = await supabase.from("posts").insert([
        {
          user_handle: currentHandle,
          user_avatar: currentAvatar,
          content: newPost.content,
          media_url: newPost.mediaUrl,
          post_type: newPost.type,
          likes_count: 0,
        },
      ]);

      if (error) throw error;
      fetchPosts();
      setIsCreateOpen(false);
    } catch (err) {
      alert("Failed to post: " + err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert("Failed to delete post: " + err.message);
    }
  };

  const handleLikePost = async (post, isLiked) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const updatedCount = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: updatedCount } : p))
    );

    try {
      await supabase
        .from("posts")
        .update({ likes_count: updatedCount })
        .eq("id", post.id);

      if (!isLiked && post.username !== currentHandle) {
        await supabase.from("notifications").insert([
          {
            recipient_handle: post.username,
            sender_handle: currentHandle,
            type: "like",
            post_id: post.id,
          },
        ]);
      }
    } catch (err) {
      console.error("Error syncing like:", err.message);
    }
  };

  const handleAddComment = async (postId, postOwnerHandle, commentText) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_handle: currentHandle,
            content: commentText,
          },
        ])
        .select();

      if (error) throw error;

      const createdComment = {
        id: data[0].id,
        user: data[0].user_handle,
        text: data[0].content,
      };

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, createdComment] } : p
        )
      );

      setActiveCommentPost((prev) =>
        prev && prev.id === postId ? { ...prev, comments: [...prev.comments, createdComment] } : prev
      );

      if (postOwnerHandle !== currentHandle) {
        await supabase.from("notifications").insert([
          {
            recipient_handle: postOwnerHandle,
            sender_handle: currentHandle,
            type: "comment",
            post_id: postId,
          },
        ]);
      }
    } catch (err) {
      console.error("Error posting comment:", err.message);
    }
  };

  // Follow / Unfollow logic
  const handleToggleFollow = async (targetHandle) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const isFollowing = followingHandles.includes(targetHandle);

    if (isFollowing) {
      setFollowingHandles((prev) => prev.filter((h) => h !== targetHandle));
      await supabase
        .from("follows")
        .delete()
        .eq("follower_handle", currentHandle)
        .eq("following_handle", targetHandle);
    } else {
      setFollowingHandles((prev) => [...prev, targetHandle]);
      await supabase.from("follows").insert([
        { follower_handle: currentHandle, following_handle: targetHandle },
      ]);
      await supabase.from("notifications").insert([
        {
          recipient_handle: targetHandle,
          sender_handle: currentHandle,
          type: "follow",
        },
      ]);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: updatedData.full_name,
          bio: updatedData.bio,
          avatar_url: updatedData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updatedData }));
      setEditProfileOpen(false);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  const unreadNotifCount = notifications.filter((n) => !n.is_read).length;

  const displayedPosts =
    feedFilter === "following"
      ? posts.filter((p) => followingHandles.includes(p.username) || p.username === currentHandle)
      : posts;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pb-24 selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-slate-900 sticky top-0 bg-slate-950/90 backdrop-blur-md z-30">
        <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
          SOCIAL NEST
        </h1>
        <div className="flex items-center gap-2">
          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <Bell size={19} />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {currentUser ? (
            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-400 font-semibold"
            >
              <img src={currentAvatar} className="w-4 h-4 rounded-full object-cover" />
              @{currentHandle}
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
            >
              <LogIn size={13} /> Sign In
            </button>
          )}

          <button
            onClick={() => setActiveTab("messages")}
            className="p-2 text-slate-300 hover:text-white rounded-full transition-colors"
          >
            <Mail size={19} />
          </button>
        </div>
      </header>

      {/* Main Views */}
      <main className="w-full max-w-md px-3 pt-3">
        {activeTab === "home" && (
          <HomeView
            stories={SAMPLE_STORIES}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            feedFilter={feedFilter}
            setFeedFilter={setFeedFilter}
            onSelectStory={(idx) => setSelectedStoryIndex(idx)}
            posts={displayedPosts}
            loading={loadingPosts}
            profileAvatar={currentAvatar}
            currentHandle={currentHandle}
            followingHandles={followingHandles}
            onToggleFollow={handleToggleFollow}
            onDeletePost={handleDeletePost}
            onOpenCreate={() => (!currentUser ? setAuthModalOpen(true) : setIsCreateOpen(true))}
            onOpenComments={(post) => setActiveCommentPost(post)}
            onLikePost={handleLikePost}
          />
        )}

        {activeTab === "sparks" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex justify-between items-center px-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Trending Sparks</span>
              <button
                onClick={() => (!currentUser ? setAuthModalOpen(true) : setIsUploadSparkOpen(true))}
                className="px-3 py-1 bg-amber-500 text-black rounded-full text-xs font-bold flex items-center gap-1 hover:bg-amber-400 transition-colors"
              >
                <Video size={13} /> Upload Clip
              </button>
            </div>

            <div className="w-full h-[76vh] overflow-y-scroll snap-y snap-mandatory rounded-3xl border border-slate-800 bg-black shadow-2xl">
              {loadingSparks ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  <Loader2 className="animate-spin mr-2" size={16} /> Loading Sparks...
                </div>
              ) : (
                sparks.map((spark) => (
                  <SparkCard
                    key={spark.id}
                    spark={spark}
                    heightClass="h-[76vh]"
                  />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <MessagesView
            currentUser={currentUser}
            currentHandle={currentHandle}
            activeChat={activeChat}
            onSelectChat={(chat) => setActiveChat(chat)}
            onBack={() => setActiveChat(null)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView
            user={{
              name: profile?.full_name || "Creator",
              handle: currentHandle,
              avatar: currentAvatar,
              bio: profile?.bio || "Exploring Social Nest 🚀",
              stats: {
                posts: posts.filter((p) => p.username === currentHandle).length,
                following: followingHandles.length,
              }
            }}
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenEditProfile={() => setEditProfileOpen(true)}
          />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-900 px-6 py-2.5 z-40 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-around">
          <button
            onClick={() => { setActiveTab("home"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "home" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>

          <button
            onClick={() => { setActiveTab("sparks"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "sparks" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Zap size={22} className={activeTab === "sparks" ? "fill-amber-400 text-amber-400" : ""} />
            <span className="text-[10px] font-medium">Sparks</span>
          </button>

          <button
            onClick={() => (!currentUser ? setAuthModalOpen(true) : setIsCreateOpen(true))}
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            <PlusSquare size={20} />
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "messages" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Mail size={22} />
            <span className="text-[10px] font-medium">Chats</span>
          </button>

          <button
            onClick={() => { setActiveTab("profile"); setActiveChat(null); }}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Modals & Drawers */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      {editProfileOpen && (
        <EditProfileModal
          currentProfile={profile}
          onClose={() => setEditProfileOpen(false)}
          onSave={handleUpdateProfile}
        />
      )}
      {notificationsOpen && (
        <NotificationsDrawer
          notifications={notifications}
          onClose={() => setNotificationsOpen(false)}
        />
      )}
      {isCreateOpen && <CreatePostModal onClose={() => setIsCreateOpen(false)} onSubmit={handleAddNewPost} />}
      {isUploadSparkOpen && <UploadSparkModal onClose={() => setIsUploadSparkOpen(false)} onSubmit={() => { fetchSparks(); setIsUploadSparkOpen(false); }} />}
      {activeCommentPost && (
        <CommentsDrawer
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onAddComment={(postId, text) => handleAddComment(postId, activeCommentPost.username, text)}
        />
      )}
      {selectedStoryIndex !== null && <StoryViewerModal stories={SAMPLE_STORIES} initialIndex={selectedStoryIndex} onClose={() => setSelectedStoryIndex(null)} />}
    </div>
  );
}

// --- HOME VIEW WITH FEED TABS ---
function HomeView({
  stories,
  activeFilter,
  setActiveFilter,
  feedFilter,
  setFeedFilter,
  onSelectStory,
  posts,
  loading,
  profileAvatar,
  currentHandle,
  followingHandles,
  onToggleFollow,
  onDeletePost,
  onOpenCreate,
  onOpenComments,
  onLikePost
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Feed Toggle: For You vs Following */}
      <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setFeedFilter("all")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            feedFilter === "all" ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-white"
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => setFeedFilter("following")}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            feedFilter === "following" ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-white"
          }`}
        >
          Following ({followingHandles.length})
        </button>
      </div>

      {/* Story Tray */}
      <div className="bg-slate-900/60 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {stories.map((story, idx) => {
            const mode = STORY_MODES[story.category];
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(idx)}
                className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0"
              >
                <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${mode.color} transition-transform hover:scale-105`}>
                  <img src={story.userAvatar} className="w-12 h-12 rounded-full object-cover border-2 border-slate-950" />
                </div>
                <span className="text-[11px] text-slate-300 truncate max-w-[55px]">{story.username}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Text Bar */}
      <div
        onClick={onOpenCreate}
        className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-slate-700 transition-colors shadow-sm"
      >
        <img src={profileAvatar} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
        <span className="text-xs text-slate-400 flex-1">Share a thought or photo...</span>
        <div className="flex items-center gap-2 text-slate-400">
          <MessageSquare size={16} />
          <ImageIcon size={16} />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <p className="text-xs text-slate-500 text-center py-8">Loading posts from database...</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {feedFilter === "following"
              ? "You aren't following anyone with posts yet! Switch to Explore to discover creators."
              : "No posts yet. Be the first to share something!"}
          </div>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              currentHandle={currentHandle}
              isFollowing={followingHandles.includes(post.username)}
              onToggleFollow={() => onToggleFollow(post.username)}
              onDeletePost={() => onDeletePost(post.id)}
              onOpenComments={() => onOpenComments(post)}
              onLikePost={() => onLikePost(post, false)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- FEED CARD WITH FOLLOW BUTTON & DELETE MENU ---
function FeedCard({ post, currentHandle, isFollowing, onToggleFollow, onDeletePost, onOpenComments, onLikePost }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = post.username === currentHandle;

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-800 transition-all relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img src={post.userAvatar} className="w-9 h-9 rounded-full object-cover border border-slate-800" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">@{post.username}</span>
              {!isOwner && (
                <button
                  onClick={onToggleFollow}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1 ${
                    isFollowing
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
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

        {/* Dropdown Options */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-slate-500 hover:text-white rounded-lg"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-xl z-20 w-28">
                <button
                  onClick={() => { setMenuOpen(false); onDeletePost(); }}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.content && (
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-3">
          {post.content}
        </p>
      )}

      {post.type === "media" && post.mediaUrl && (
        <div className="rounded-xl overflow-hidden mb-3 border border-slate-800 max-h-96 bg-slate-950 flex items-center justify-center">
          <img src={post.mediaUrl} className="w-full h-full object-cover max-h-96" alt="" />
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400">
        <button
          onClick={onLikePost}
          className="flex items-center gap-1.5 text-xs hover:text-rose-400 transition-colors"
        >
          <Heart size={16} />
          <span>{post.likes}</span>
        </button>

        <button
          onClick={onOpenComments}
          className="flex items-center gap-1.5 text-xs hover:text-amber-400 transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs hover:text-emerald-400 transition-colors">
          <Repeat size={16} />
          <span>{post.reposts || 0}</span>
        </button>

        <button className="hover:text-white transition-colors">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}

// --- NOTIFICATIONS DRAWER ---
function NotificationsDrawer({ notifications, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-5 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-amber-400" />
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-16">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center gap-3 text-xs"
              >
                <div className="p-2 rounded-full bg-amber-500/10 text-amber-400">
                  {n.type === "like" && <Heart size={14} className="fill-amber-400" />}
                  {n.type === "comment" && <MessageCircle size={14} />}
                  {n.type === "follow" && <UserPlus size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200">
                    <span className="font-bold text-amber-400">@{n.sender_handle}</span>{" "}
                    {n.type === "like" && "liked your post."}
                    {n.type === "comment" && "commented on your post."}
                    {n.type === "follow" && "started following you."}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- EDIT PROFILE MODAL WITH DEVICE AVATAR UPLOAD ---
function EditProfileModal({ currentProfile, onClose, onSave }) {
  const [fullName, setFullName] = useState(currentProfile?.full_name || "");
  const [bio, setBio] = useState(currentProfile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatar-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("avatars").upload(filePath, file);
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err) {
      alert("Failed to upload avatar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    onSave({
      full_name: fullName.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Edit3 size={16} className="text-amber-400" /> Edit Profile
        </h3>

        <form onSubmit={handleSaveSubmit} className="flex flex-col gap-4">
          {/* Avatar Preview & Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <img
                src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-500"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <span className="text-[11px] text-slate-400">
              {uploading ? "Uploading image..." : "Tap photo to change avatar"}
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you're building or thinking..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

// --- PROFILE VIEW ---
function ProfileView({ user, currentUser, onOpenAuth, onOpenEditProfile }) {
  const [profileTab, setProfileTab] = useState("posts");

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <img
            src={user.avatar}
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 p-0.5"
          />
          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-base">{user.stats.posts}</p>
              <p className="text-[11px] text-slate-400">Posts</p>
            </div>
            <div>
              <p className="font-bold text-base">{user.stats.following}</p>
              <p className="text-[11px] text-slate-400">Following</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-bold text-sm">{user.name}</h2>
          <p className="text-xs text-amber-400">@{user.handle}</p>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{user.bio}</p>
        </div>

        <div className="flex gap-2.5 mt-4">
          {currentUser ? (
            <>
              <button
                onClick={onOpenEditProfile}
                className="flex-1 bg-white hover:bg-slate-200 text-slate-950 font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="px-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <LogOut size={14} /> Log Out
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              Sign In to Your Account
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setProfileTab("posts")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "posts" ? "border-amber-400 text-amber-400" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Grid size={16} /> Posts
        </button>
        <button
          onClick={() => setProfileTab("sparks")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "sparks" ? "border-amber-400 text-amber-400" : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Film size={16} /> Sparks
        </button>
      </div>

      {profileTab === "posts" ? (
        <div className="py-8 text-center text-slate-500 text-xs">
          Your shared posts are displayed directly on the main feed.
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-xs">
          <Zap size={32} className="mx-auto mb-2 opacity-40 text-amber-400" />
          No Sparks uploaded yet.
        </div>
      )}
    </div>
  );
}

// --- MESSAGES VIEW WITH DYNAMIC SEARCH ---
function MessagesView({ currentUser, currentHandle, activeChat, onSelectChat, onBack, onOpenAuth }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentConversations, setRecentConversations] = useState([]);
  const messagesEndRef = useRef(null);

  const getConversationId = (userA, userB) => [userA, userB].sort().join("_");

  const fetchRecentConversations = async () => {
    if (!currentUser || !currentHandle) return;

    const { data, error } = await supabase
      .from("messages")
      .select("sender_handle, recipient_handle, created_at, content")
      .or(`sender_handle.eq.${currentHandle},recipient_handle.eq.${currentHandle}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const distinctUsers = new Set();
      const recents = [];

      for (const m of data) {
        const partner = m.sender_handle === currentHandle ? m.recipient_handle : m.sender_handle;
        if (!distinctUsers.has(partner)) {
          distinctUsers.add(partner);
          recents.push({
            userId: partner,
            username: partner,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            lastMessage: m.content,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          });
        }
      }
      setRecentConversations(recents);
    }
  };

  useEffect(() => {
    fetchRecentConversations();
  }, [currentUser, currentHandle, activeChat]);

  useEffect(() => {
    const handleSearch = async () => {
      const cleanQuery = searchQuery.trim().toLowerCase().replace("@", "");
      if (!cleanQuery) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("handle, full_name, avatar_url")
        .ilike("handle", `%${cleanQuery}%`)
        .neq("handle", currentHandle)
        .limit(8);

      if (!error && data) {
        setSearchResults(
          data.map((p) => ({
            userId: p.handle,
            username: p.full_name || p.handle,
            avatar: p.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            online: true,
          }))
        );
      }
      setIsSearching(false);
    };

    const debounceTimer = setTimeout(handleSearch, 250);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, currentHandle]);

  useEffect(() => {
    if (!activeChat || !currentUser) return;

    const convId = getConversationId(currentHandle, activeChat.userId);
    setLoadingChat(true);

    const fetchChatMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
      setLoadingChat(false);
    };

    fetchChatMessages();

    const channel = supabase
      .channel(`chat_${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeChat, currentUser, currentHandle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !activeChat) return;

    const messageText = inputText.trim();
    setInputText("");
    const convId = getConversationId(currentHandle, activeChat.userId);

    await supabase.from("messages").insert([
      {
        conversation_id: convId,
        sender_handle: currentHandle,
        recipient_handle: activeChat.userId,
        content: messageText,
      },
    ]);
  };

  if (!currentUser) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <Mail size={36} className="text-amber-400 opacity-60" />
        <h3 className="text-sm font-bold">Sign In to Send Messages</h3>
        <p className="text-xs text-slate-400 max-w-xs">Search creators and chat in real-time.</p>
        <button
          onClick={onOpenAuth}
          className="mt-2 px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (activeChat) {
    return (
      <div className="flex flex-col h-[78vh] bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <img src={activeChat.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-tight truncate">{activeChat.username}</p>
            <p className="text-[10px] text-amber-400 font-medium">@{activeChat.userId}</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {loadingChat ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              <Loader2 size={16} className="animate-spin mr-2" /> Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12">
              Start a new conversation with @{activeChat.userId}!
            </p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_handle === currentHandle;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                >
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black font-medium rounded-tr-none"
                        : "bg-slate-800 text-white rounded-tl-none border border-slate-700/60"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMe && <CheckCheck size={11} className="text-amber-500" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message @${activeChat.userId}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-xl transition-all"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by @handle to start a DM..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
        {isSearching && <Loader2 size={15} className="absolute right-3.5 top-3 animate-spin text-amber-400" />}
      </div>

      {searchQuery.trim() ? (
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[11px] font-semibold text-slate-400 px-1">Search Results</span>
          {searchResults.length === 0 && !isSearching ? (
            <p className="text-xs text-slate-500 py-6 text-center">No creator found with that handle.</p>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.userId}
                onClick={() => { onSelectChat(user); setSearchQuery(""); }}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all active:scale-[0.99]"
              >
                <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.username}</p>
                  <p className="text-[11px] text-amber-400">@{user.userId}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Chat
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[11px] font-semibold text-slate-400 px-1">Recent Chats</span>
          {recentConversations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No conversations yet. Type your friend's handle in the search bar above to start talking!
            </div>
          ) : (
            recentConversations.map((chat) => (
              <div
                key={chat.userId}
                onClick={() => onSelectChat(chat)}
                className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/70 p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all active:scale-[0.99]"
              >
                <img src={chat.avatar} className="w-11 h-11 rounded-full object-cover border border-slate-800" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">@{chat.userId}</p>
                    <span className="text-[10px] text-slate-500">{chat.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- SPARK CARD ---
function SparkCard({ spark, heightClass = "h-[580px]" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className={`relative w-full ${heightClass} snap-start bg-slate-950 flex items-center justify-center overflow-hidden`}>
      <video
        ref={videoRef}
        src={spark.video_url}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      <button
        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/90 hover:text-white z-10"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute right-3 bottom-12 z-10 flex flex-col items-center gap-5">
        <button onClick={() => setLiked(!liked)} className="flex flex-col items-center gap-1 group">
          <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md transition-transform group-hover:scale-110 ${liked ? "text-rose-500" : "text-white"}`}>
            <Heart size={22} className={liked ? "fill-rose-500" : ""} />
          </div>
          <span className="text-[11px] font-semibold text-white/90">{spark.likes_count || 0}</span>
        </button>

        <button className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white transition-transform hover:scale-110">
          <Bookmark size={22} />
        </button>

        <button className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white transition-transform hover:scale-110">
          <Share2 size={22} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-16 z-10 text-white flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <img src={spark.user_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} className="w-8 h-8 rounded-full border border-white/40 object-cover" />
          <span className="font-semibold text-sm">@{spark.user_handle}</span>
        </div>
        {spark.caption && <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{spark.caption}</p>}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Music size={11} />
          <span className="truncate">{spark.song_title || "Original Audio"}</span>
        </div>
      </div>
    </div>
  );
}

// --- UPLOAD SPARK MODAL ---
function UploadSparkModal({ onClose, onSubmit }) {
  const [caption, setCaption] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("sparks-media").upload(fileName, selectedFile);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("sparks-media").getPublicUrl(fileName);

      await onSubmit({
        videoUrl: publicUrlData.publicUrl,
        caption: caption.trim(),
        songTitle: songTitle.trim() || "Original Audio",
      });
    } catch (err) {
      alert("Failed to upload video: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="fill-amber-400 text-amber-400" size={18} /> Upload a Spark Clip
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/50"
            >
              <UploadCloud size={32} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-medium">Select a short vertical video (.mp4, .mov, .webm)</span>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-800 h-44 bg-slate-950 flex items-center justify-center">
              <video src={previewUrl} className="w-full h-full object-cover" muted loop autoPlay />
              <button
                type="button"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption / hashtags..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />

          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="Audio track name (optional)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              {isUploading ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : <><Video size={13} /> Publish Spark</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- COMMENTS DRAWER ---
function CommentsDrawer({ post, onClose, onAddComment }) {
  const [commentInput, setCommentInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0 sm:p-4">
      <div className="w-full max-w-md mx-auto h-[65vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Comments</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {post.comments?.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No comments yet. Start the conversation!</p>
          ) : (
            post.comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                  {c.user.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] font-bold text-amber-400">@{c.user}</p>
                  <p className="text-xs text-slate-200 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="p-2 bg-amber-500 text-black font-semibold rounded-xl disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- CREATE POST MODAL ---
function CreatePostModal({ onClose, onSubmit }) {
  const [postType, setPostType] = useState("text");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setIsUploading(true);
    let uploadedMediaUrl = null;

    try {
      if (postType === "media" && selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from("post-media").upload(fileName, selectedFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from("post-media").getPublicUrl(fileName);
        uploadedMediaUrl = publicUrlData.publicUrl;
      }

      await onSubmit({
        type: postType,
        content: content.trim(),
        mediaUrl: uploadedMediaUrl,
      });
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-base font-bold text-white mb-4">Create a Post</h3>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => { setPostType("text"); setSelectedFile(null); setPreviewUrl(null); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${postType === "text" ? "bg-white text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            <MessageSquare size={14} /> Thought
          </button>
          <button
            type="button"
            onClick={() => setPostType("media")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${postType === "media" ? "bg-white text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            <ImageIcon size={14} /> Photo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={postType === "text" ? "What's happening? Share a thought..." : "Write a caption for your photo..."}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          {postType === "media" && (
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/50"
                >
                  <UploadCloud size={28} className="text-slate-500" />
                  <span className="text-xs text-slate-400">Click to browse photo from device</span>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-48 bg-slate-950 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover max-h-48" />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">{content.length}/280 chars</span>
            <button
              type="submit"
              disabled={isUploading || (!content.trim() && !selectedFile)}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              {isUploading ? <><Loader2 size={13} className="animate-spin" /> Uploading...</> : <><Send size={13} /> Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- AUTH MODAL ---
function AuthModal({ onClose }) {
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
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {isSignUp ? "Sign up to post, like, comment, and chat." : "Sign in with your email and password to continue."}
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
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g. alex_rivera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
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

  const activeStory = stories[currentIndex];
  const mode = STORY_MODES[activeStory.category];

  useEffect(() => {
    if (isPaused) return;
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
        return prev + (step / mode.duration) * 100;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, mode.duration]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div
        className="relative w-full max-w-md h-full sm:h-[85vh] bg-slate-950 sm:rounded-2xl overflow-hidden flex flex-col"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1.5 px-3">
          {stories.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{ width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 inset-x-0 z-20 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src={activeStory.userAvatar} className="w-8 h-8 rounded-full object-cover" />
            <span className="font-semibold text-sm">{activeStory.username}</span>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <img src={activeStory.mediaUrl} alt="" className="w-full h-full object-cover" />

        {activeStory.caption && (
          <div className="absolute bottom-6 inset-x-4 bg-black/60 p-3 rounded-xl backdrop-blur-sm text-sm">
            {activeStory.caption}
          </div>
        )}

        <div
          className="absolute left-0 top-16 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={() => { if (currentIndex > 0) { setCurrentIndex((i) => i - 1); setProgress(0); } }}
        />
        <div
          className="absolute right-0 top-16 bottom-0 w-2/3 z-10 cursor-pointer"
          onClick={() => { if (currentIndex < stories.length - 1) { setCurrentIndex((i) => i + 1); setProgress(0); } else { onClose(); } }}
        />
      </div>
    </div>
  );
}