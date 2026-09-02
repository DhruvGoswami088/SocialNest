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
  Loader2
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
    caption: "🚀 Social Nest v1.0 is shaping up fast!",
  },
  {
    id: "s2",
    username: "sarah_m",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    category: "routine",
    caption: "Morning coffee & ocean walk ☕🌊",
  },
  {
    id: "s3",
    username: "marcus_code",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
    category: "normal",
    caption: "Check out the newest Sparks clips!",
  },
];

const SAMPLE_SPARKS = [
  {
    id: "spark1",
    username: "dev_pulse",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
    caption: "Peaceful nature break between coding sessions 🍃 #nature #vibes",
    song: "Original Audio - Nature Sounds",
    likes: 1240,
    comments: 48,
  },
  {
    id: "spark2",
    username: "neon_vibes",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glowing-light-bulb-42353-large.mp4",
    caption: "When the React component finally renders with 0 errors 💡⚡ #codinglife",
    song: "Synthwave Beats - Coding Radio",
    likes: 3890,
    comments: 112,
  },
];

const INITIAL_CHATS = [
  {
    id: "chat-1",
    userId: "sarah_m",
    username: "Sarah Miller",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    online: true,
    lastMessage: "Did you push the updated story timer?",
    timestamp: "10:42 AM",
    messages: [
      { id: "m1", sender: "them", text: "Hey! Saw the new Sparks icon update 👀", time: "10:40 AM" },
      { id: "m2", sender: "me", text: "Yeah! The lightning bolt feels much snappier.", time: "10:41 AM" },
      { id: "m3", sender: "them", text: "Did you push the updated story timer?", time: "10:42 AM" },
    ],
  },
  {
    id: "chat-2",
    userId: "marcus_code",
    username: "Marcus Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    online: false,
    lastMessage: "Let's review the schema tonight.",
    timestamp: "Yesterday",
    messages: [
      { id: "m1", sender: "them", text: "Yo, let's review the schema tonight.", time: "Yesterday" }
    ],
  },
];

const USER_PROFILE = {
  name: "Alex Rivera",
  handle: "alex_dev",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
  bio: "Building Social Nest 🛠️ | Full-stack explorer & UI enthusiast | Coffee first ☕",
  stats: { posts: 24, followers: "4.2K", following: 389 },
  posts: [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredStories =
    activeFilter === "all"
      ? SAMPLE_STORIES
      : SAMPLE_STORIES.filter((s) => s.category === activeFilter);

  // Fetch real posts from Supabase
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
        userAvatar: p.user_avatar || USER_PROFILE.avatar,
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddNewPost = async (newPost) => {
    try {
      const { error } = await supabase
        .from("posts")
        .insert([
          {
            user_handle: newPost.username,
            user_avatar: newPost.userAvatar,
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
      console.error("Error creating post:", err.message);
      alert("Failed to post: " + err.message);
    }
  };

  const handleLikePost = async (postId, currentLikes, isLiked) => {
    const updatedCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: updatedCount } : p))
    );

    try {
      await supabase
        .from("posts")
        .update({ likes_count: updatedCount })
        .eq("id", postId);
    } catch (err) {
      console.error("Error syncing like:", err.message);
    }
  };

  const handleAddComment = async (postId, commentText) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            user_handle: USER_PROFILE.handle,
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
          p.id === postId
            ? { ...p, comments: [...p.comments, createdComment] }
            : p
        )
      );

      setActiveCommentPost((prev) =>
        prev && prev.id === postId
          ? { ...prev, comments: [...prev.comments, createdComment] }
          : prev
      );
    } catch (err) {
      console.error("Error posting comment:", err.message);
    }
  };

  const handleSendMessage = (chatId, text) => {
    const updatedChats = chats.map((chat) => {
      if (chat.id === chatId) {
        const newMsg = {
          id: "msg-" + Date.now(),
          sender: "me",
          text,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        return {
          ...chat,
          lastMessage: text,
          timestamp: "Just now",
          messages: [...chat.messages, newMsg],
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setActiveChat(updatedChats.find((c) => c.id === chatId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center pb-24 selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="w-full max-w-md px-4 py-3 flex items-center justify-between border-b border-slate-900 sticky top-0 bg-slate-950/90 backdrop-blur-md z-30">
        <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
          SOCIAL NEST
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("sparks")}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all hover:bg-amber-500/20"
          >
            <Zap size={13} className="fill-amber-400" /> Sparks
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className="relative p-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Mail size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* Main View Router */}
      <main className="w-full max-w-md px-3 pt-3">
        {activeTab === "home" && (
          <HomeView
            stories={filteredStories}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onSelectStory={(idx) => setSelectedStoryIndex(idx)}
            posts={posts}
            loading={loadingPosts}
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenComments={(post) => setActiveCommentPost(post)}
            onLikePost={handleLikePost}
          />
        )}

        {activeTab === "sparks" && (
          <div className="flex flex-col items-center">
            <div className="w-full h-[78vh] overflow-y-scroll snap-y snap-mandatory rounded-3xl border border-slate-800 bg-black shadow-2xl">
              {SAMPLE_SPARKS.map((spark) => (
                <SparkCard key={spark.id} spark={spark} heightClass="h-[78vh]" />
              ))}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <MessagesView
            chats={chats}
            activeChat={activeChat}
            onSelectChat={(chat) => setActiveChat(chat)}
            onBack={() => setActiveChat(null)}
            onSend={handleSendMessage}
          />
        )}

        {activeTab === "profile" && <ProfileView user={USER_PROFILE} />}
      </main>

      {/* Bottom Navigation Dock */}
      <nav className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-900 px-6 py-2.5 z-40 flex justify-center">
        <div className="w-full max-w-md flex items-center justify-around">
          <button
            onClick={() => {
              setActiveTab("home");
              setActiveChat(null);
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "home" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Home size={22} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("sparks");
              setActiveChat(null);
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "sparks" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Zap size={22} className={activeTab === "sparks" ? "fill-amber-400 text-amber-400" : ""} />
            <span className="text-[10px] font-medium">Sparks</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
          >
            <PlusSquare size={20} />
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "messages" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Mail size={22} />
            <span className="text-[10px] font-medium">Chats</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
              setActiveChat(null);
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "profile" ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <User size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Creation Modal */}
      {isCreateOpen && (
        <CreatePostModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleAddNewPost}
        />
      )}

      {/* Comments Drawer */}
      {activeCommentPost && (
        <CommentsDrawer
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onAddComment={handleAddComment}
        />
      )}

      {/* Fullscreen Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          stories={filteredStories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
}

// --- HOME VIEW ---
function HomeView({ stories, activeFilter, setActiveFilter, onSelectStory, posts, loading, onOpenCreate, onOpenComments, onLikePost }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Categorized Story Tray */}
      <div className="bg-slate-900/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex gap-2 pb-3 border-b border-slate-800/60 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full transition-all ${
              activeFilter === "all" ? "bg-amber-400 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
            }`}
          >
            All
          </button>
          {Object.entries(STORY_MODES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                activeFilter === key ? "bg-amber-400 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
              }`}
            >
              <config.icon size={12} />
              {config.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 pt-4 overflow-x-auto no-scrollbar">
          {stories.map((story, idx) => {
            const mode = STORY_MODES[story.category];
            return (
              <button
                key={story.id}
                onClick={() => onSelectStory(idx)}
                className="flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0"
              >
                <div className={`p-[2.5px] rounded-full bg-gradient-to-tr ${mode.color} transition-transform hover:scale-105`}>
                  <img
                    src={story.userAvatar}
                    alt=""
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-950"
                  />
                </div>
                <span className="text-xs text-slate-300 truncate max-w-[60px]">
                  {story.username}
                </span>
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
        <img
          src={USER_PROFILE.avatar}
          className="w-9 h-9 rounded-full object-cover border border-slate-800"
        />
        <span className="text-xs text-slate-400 flex-1">Share a thought or photo...</span>
        <div className="flex items-center gap-2 text-slate-400">
          <MessageSquare size={16} />
          <ImageIcon size={16} />
        </div>
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-3.5">
        {loading ? (
          <p className="text-xs text-slate-500 text-center py-8">Loading posts from database...</p>
        ) : posts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No posts found. Be the first to share something!</p>
        ) : (
          posts.map((post) => (
            <FeedCard
              key={post.id}
              post={post}
              onOpenComments={() => onOpenComments(post)}
              onLikePost={onLikePost}
            />
          ))
        )}
      </div>
    </div>
  );
}

// --- FEED CARD ---
function FeedCard({ post, onOpenComments, onLikePost }) {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    onLikePost(post.id, post.likes, liked);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-sm hover:border-slate-800 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img src={post.userAvatar} className="w-9 h-9 rounded-full object-cover border border-slate-800" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">@{post.username}</span>
              <span className="text-[11px] text-slate-500">· {post.timeAgo}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-medium capitalize">
              {post.type === "media" ? "Photo Post" : "Thought"}
            </span>
          </div>
        </div>
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            liked ? "text-rose-500 font-semibold" : "hover:text-rose-400"
          }`}
        >
          <Heart size={16} className={liked ? "fill-rose-500" : ""} />
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

// --- MESSAGES VIEW ---
function MessagesView({ chats, activeChat, onSelectChat, onBack, onSend }) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSend(activeChat.id, inputText.trim());
    setInputText("");
  };

  if (activeChat) {
    return (
      <div className="flex flex-col h-[78vh] bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-slate-400 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <div className="relative">
            <img src={activeChat.avatar} className="w-8 h-8 rounded-full object-cover" />
            {activeChat.online && (
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">{activeChat.username}</p>
            <p className="text-[10px] text-slate-400">{activeChat.online ? "Online" : "Offline"}</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {activeChat.messages.map((msg) => {
            const isMe = msg.sender === "me";
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
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck size={11} className="text-amber-500" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendSubmit} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
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
          placeholder="Search conversations..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/70 p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="relative">
              <img src={chat.avatar} className="w-11 h-11 rounded-full object-cover border border-slate-800" />
              {chat.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">{chat.username}</p>
                <span className="text-[10px] text-slate-500">{chat.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
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

// --- CREATE MODAL WITH DEVICE FILE UPLOAD ---
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
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post-media")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("post-media")
          .getPublicUrl(filePath);

        uploadedMediaUrl = publicUrlData.publicUrl;
      }

      await onSubmit({
        type: postType,
        username: USER_PROFILE.handle,
        userAvatar: USER_PROFILE.avatar,
        content: content.trim(),
        mediaUrl: uploadedMediaUrl,
      });
    } catch (err) {
      console.error("Upload error:", err.message);
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
            onClick={() => {
              setPostType("text");
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              postType === "text" ? "bg-white text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare size={14} /> Thought
          </button>
          <button
            type="button"
            onClick={() => setPostType("media")}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              postType === "media" ? "bg-white text-slate-950" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon size={14} /> Photo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === "text"
                ? "What's happening? Share a thought, debate, or hot take..."
                : "Write a caption for your photo..."
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
          />

          {postType === "media" && (
            <div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

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
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
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
              {isUploading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Send size={13} /> Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- PROFILE VIEW ---
function ProfileView({ user }) {
  const [profileTab, setProfileTab] = useState("posts");

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <img
            src={user.avatar}
            alt=""
            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50 p-0.5"
          />
          <div className="flex gap-6 text-center">
            <div>
              <p className="font-bold text-base">{user.stats.posts}</p>
              <p className="text-[11px] text-slate-400">Posts</p>
            </div>
            <div>
              <p className="font-bold text-base">{user.stats.followers}</p>
              <p className="text-[11px] text-slate-400">Followers</p>
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
          <button className="flex-1 bg-white text-slate-950 font-semibold text-xs py-2 rounded-xl active:scale-[0.98] transition-transform">
            Edit Profile
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 rounded-xl transition-colors">
            Share Profile
          </button>
          <button className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setProfileTab("posts")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "posts"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Grid size={16} /> Posts
        </button>
        <button
          onClick={() => setProfileTab("sparks")}
          className={`flex-1 py-2.5 flex justify-center items-center gap-2 text-xs font-semibold border-b-2 transition-all ${
            profileTab === "sparks"
              ? "border-amber-400 text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Film size={16} /> Sparks
        </button>
      </div>

      {profileTab === "posts" ? (
        <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
          {user.posts.map((imgUrl, i) => (
            <div key={i} className="aspect-square bg-slate-900 group relative overflow-hidden">
              <img
                src={imgUrl}
                alt=""
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
          ))}
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

// --- SPARK VIDEO CARD ---
function SparkCard({ spark, heightClass = "h-[580px]" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(spark.likes);

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

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div className={`relative w-full ${heightClass} snap-start bg-slate-950 flex items-center justify-center overflow-hidden`}>
      <video
        ref={videoRef}
        src={spark.videoUrl}
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/90 hover:text-white z-10"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute right-3 bottom-12 z-10 flex flex-col items-center gap-5">
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`p-2.5 rounded-full bg-black/40 backdrop-blur-md transition-transform group-hover:scale-110 ${liked ? "text-rose-500" : "text-white"}`}>
            <Heart size={22} className={liked ? "fill-rose-500" : ""} />
          </div>
          <span className="text-[11px] font-semibold text-white/90">{likeCount}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white transition-transform group-hover:scale-110">
            <MessageCircle size={22} />
          </div>
          <span className="text-[11px] font-semibold text-white/90">{spark.comments}</span>
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
          <img src={spark.userAvatar} className="w-8 h-8 rounded-full border border-white/40 object-cover" />
          <span className="font-semibold text-sm">@{spark.username}</span>
        </div>
        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{spark.caption}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <Music size={11} />
          <span className="truncate">{spark.song}</span>
        </div>
      </div>
    </div>
  );
}

// --- FULLSCREEN STORY VIEWER ---
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
                style={{
                  width: i === currentIndex ? `${progress}%` : i < currentIndex ? "100%" : "0%",
                }}
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
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex((i) => i - 1);
              setProgress(0);
            }
          }}
        />
        <div
          className="absolute right-0 top-16 bottom-0 w-2/3 z-10 cursor-pointer"
          onClick={() => {
            if (currentIndex < stories.length - 1) {
              setCurrentIndex((i) => i + 1);
              setProgress(0);
            } else {
              onClose();
            }
          }}
        />
      </div>
    </div>
  );
}