import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { MessageCircle, Bike, ShoppingBag, Plus, ThumbsUp, MessageSquare, BarChart2, X, Send, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  refined: { label: "REFINED", color: "#8a9ab0" },
  elite: { label: "ELITE", color: "#f1b53b" },
  ultimate: { label: "ULTIMATE", color: "#f1b53b" },
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  general: <MessageCircle size={16} />,
  rides: <Bike size={16} />,
  gear: <ShoppingBag size={16} />,
};

type PostType = "message" | "gear_listing" | "poll";

export default function Community() {
  const { user } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [postType, setPostType] = useState<PostType>("message");
  const [content, setContent] = useState("");
  const [gearTitle, setGearTitle] = useState("");
  const [gearPrice, setGearPrice] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const { data: channels } = trpc.community.channels.useQuery();
  const currentChannelId = activeChannelId ?? channels?.[0]?.id ?? 0;
  const { data: posts, refetch: refetchPosts } = trpc.community.posts.useQuery(
    { channelId: currentChannelId },
    { enabled: currentChannelId > 0 }
  );

  const utils = trpc.useUtils();

  const createPostMutation = trpc.community.createPost.useMutation({
    onSuccess: () => {
      refetchPosts();
      setShowCompose(false);
      setContent(""); setGearTitle(""); setGearPrice("");
      setPollQuestion(""); setPollOptions(["", ""]);
      toast.success("Post shared with the community!");
    },
    onError: (err) => toast.error(err.message),
  });

  const likeMutation = trpc.community.toggleLike.useMutation({
    onSuccess: () => refetchPosts(),
  });

  const handlePost = () => {
    if (!content.trim()) return;
    createPostMutation.mutate({
      channelId: currentChannelId,
      content,
      postType,
      gearTitle: postType === 'gear_listing' ? gearTitle : undefined,
      gearPrice: postType === 'gear_listing' ? gearPrice : undefined,
      pollQuestion: postType === 'poll' ? pollQuestion : undefined,
      pollOptions: postType === 'poll' ? pollOptions.filter(o => o.trim()) : undefined,
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#161d26' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-3" style={{ background: 'linear-gradient(180deg, #1e2a38 0%, #161d26 100%)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.05em' }}>
          COMMUNITY
        </h1>
        <p className="text-sm mb-4" style={{ color: '#8a9ab0' }}>The Wheelhouse member hub</p>

        {/* Channel Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {channels?.map((channel) => {
            const isActive = channel.id === currentChannelId;
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0"
                style={{
                  background: isActive ? '#f1b53b' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#161d26' : '#8a9ab0',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Oswald, sans-serif',
                }}
              >
                {CHANNEL_ICONS[channel.slug] ?? <MessageCircle size={14} />}
                {channel.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 space-y-3 pb-24">
        {posts?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>No posts yet</p>
            <p className="text-sm mt-1" style={{ color: '#8a9ab0' }}>Be the first to start a conversation!</p>
          </div>
        )}

        {posts?.map(({ post, user: postUser }) => (
          <PostCard
            key={post.id}
            post={post}
            postUser={postUser}
            currentUserId={user?.id}
            onLike={() => likeMutation.mutate({ postId: post.id })}
          />
        ))}
      </div>

      {/* Compose FAB */}
      <button
        onClick={() => setShowCompose(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 z-40"
        style={{ background: '#f1b53b', boxShadow: '0 4px 20px rgba(241,181,59,0.4)' }}
      >
        <Plus size={24} style={{ color: '#161d26' }} />
      </button>

      {/* Compose Sheet */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: '#1e2a38', border: '1px solid rgba(241,181,59,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>NEW POST</h3>
              <button onClick={() => setShowCompose(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <X size={16} style={{ color: '#ffffff' }} />
              </button>
            </div>

            {/* Post Type Selector */}
            <div className="flex gap-2 mb-4">
              {([
                { type: "message" as PostType, icon: <MessageSquare size={14} />, label: "Message" },
                { type: "poll" as PostType, icon: <BarChart2 size={14} />, label: "Poll" },
                { type: "gear_listing" as PostType, icon: <Tag size={14} />, label: "Gear" },
              ]).map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: postType === type ? '#f1b53b' : 'rgba(255,255,255,0.08)',
                    color: postType === type ? '#161d26' : '#8a9ab0',
                    fontFamily: 'Oswald, sans-serif',
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Message Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'gear_listing' ? "Describe the gear..." : postType === 'poll' ? "Add context for your poll..." : "What's on your mind?"}
              rows={3}
              className="w-full rounded-xl p-3 text-sm resize-none outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
            />

            {/* Gear Listing Fields */}
            {postType === 'gear_listing' && (
              <div className="mt-3 space-y-2">
                <input
                  value={gearTitle}
                  onChange={(e) => setGearTitle(e.target.value)}
                  placeholder="Item name (e.g. Shimano 105 groupset)"
                  className="w-full rounded-xl p-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
                />
                <input
                  value={gearPrice}
                  onChange={(e) => setGearPrice(e.target.value)}
                  placeholder="Asking price (e.g. 450)"
                  type="number"
                  className="w-full rounded-xl p-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
                />
              </div>
            )}

            {/* Poll Fields */}
            {postType === 'poll' && (
              <div className="mt-3 space-y-2">
                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question..."
                  className="w-full rounded-xl p-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
                />
                {pollOptions.map((opt, i) => (
                  <input
                    key={i}
                    value={opt}
                    onChange={(e) => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }}
                    placeholder={`Option ${i + 1}`}
                    className="w-full rounded-xl p-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
                  />
                ))}
                {pollOptions.length < 5 && (
                  <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-xs" style={{ color: '#f1b53b' }}>
                    + Add option
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handlePost}
              disabled={createPostMutation.isPending || !content.trim()}
              className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: '#f1b53b', color: '#161d26', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', opacity: !content.trim() ? 0.5 : 1 }}
            >
              <Send size={16} />
              {createPostMutation.isPending ? "POSTING..." : "POST TO COMMUNITY"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, postUser, currentUserId, onLike }: {
  post: any; postUser: any; currentUserId?: number; onLike: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: pollData } = trpc.community.getPoll.useQuery({ postId: post.id }, { enabled: post.postType === 'poll' });
  const { data: comments, refetch: refetchComments } = trpc.community.comments.useQuery({ postId: post.id }, { enabled: showComments });
  const voteMutation = trpc.community.vote.useMutation({ onSuccess: () => { } });
  const commentMutation = trpc.community.addComment.useMutation({
    onSuccess: () => { setCommentText(""); refetchComments(); },
  });

  const tierBadge = TIER_BADGE[(postUser?.membershipTier ?? 'refined') as keyof typeof TIER_BADGE];
  const totalVotes = pollData?.votes?.length ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#1a2332', border: '1px solid rgba(241,181,59,0.08)' }}>
      {/* Post Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: 'rgba(241,181,59,0.2)', color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>
            {(postUser?.name ?? "M").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{postUser?.name ?? "Member"}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: `${tierBadge?.color}20`, color: tierBadge?.color, fontSize: '9px', letterSpacing: '0.08em' }}>
                {tierBadge?.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#8a9ab0' }}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
          {post.postType === 'gear_listing' && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(241,181,59,0.12)', color: '#f1b53b' }}>FOR SALE</span>
          )}
        </div>

        {/* Gear Title */}
        {post.postType === 'gear_listing' && post.gearTitle && (
          <div className="mb-2 flex items-center justify-between">
            <p className="font-bold" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{post.gearTitle}</p>
            {post.gearPrice && <p className="font-bold text-lg" style={{ color: '#22c55e', fontFamily: 'Oswald, sans-serif' }}>${parseFloat(post.gearPrice).toFixed(2)}</p>}
          </div>
        )}

        <p className="text-sm leading-relaxed" style={{ color: '#c4cdd8' }}>{post.content}</p>

        {/* Poll */}
        {post.postType === 'poll' && pollData?.poll && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-semibold mb-2" style={{ color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}>{pollData.poll.question}</p>
            {(JSON.parse(pollData.poll.options as string) as string[]).map((option: string, i: number) => {
              const votes = pollData.votes?.filter(v => v.optionIndex === i).length ?? 0;
              const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
              return (
                <button
                  key={i}
                  onClick={() => voteMutation.mutate({ pollId: pollData.poll!.id, optionIndex: i })}
                  className="w-full rounded-xl overflow-hidden relative text-left"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(241,181,59,0.15)' }}
                >
                  <div className="absolute inset-0 rounded-xl" style={{ width: `${pct}%`, background: 'rgba(241,181,59,0.15)', transition: 'width 0.5s ease' }} />
                  <div className="relative flex items-center justify-between px-3 py-2.5">
                    <span className="text-sm" style={{ color: '#ffffff' }}>{option}</span>
                    <span className="text-xs font-bold" style={{ color: '#f1b53b' }}>{pct}%</span>
                  </div>
                </button>
              );
            })}
            <p className="text-xs" style={{ color: '#8a9ab0' }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onLike} className="flex items-center gap-1.5 transition-colors" style={{ color: '#8a9ab0' }}>
          <ThumbsUp size={14} />
          <span className="text-xs" style={{ fontFamily: 'Oswald, sans-serif' }}>{post.likesCount}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5" style={{ color: '#8a9ab0' }}>
          <MessageSquare size={14} />
          <span className="text-xs" style={{ fontFamily: 'Oswald, sans-serif' }}>{post.commentsCount}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="pt-3 space-y-3">
            {comments?.map(({ comment, user: cu }) => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(241,181,59,0.15)', color: '#f1b53b' }}>
                  {(cu?.name ?? "M").charAt(0)}
                </div>
                <div className="flex-1 rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: '#f1b53b', fontFamily: 'Oswald, sans-serif' }}>{cu?.name}</p>
                  <p className="text-xs" style={{ color: '#c4cdd8' }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(241,181,59,0.15)', color: '#ffffff', fontFamily: 'Oswald, sans-serif' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && commentText.trim()) commentMutation.mutate({ postId: post.id, content: commentText }); }}
            />
            <button onClick={() => commentText.trim() && commentMutation.mutate({ postId: post.id, content: commentText })} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#f1b53b' }}>
              <Send size={14} style={{ color: '#161d26' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
