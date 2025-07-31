import { useChatStore } from "../store/useChatStore";

// 🔽 100+ sample bios
const bios = [
  "Always here to chat and vibe!",
  "Love connecting with new people.",
  "Available most of the time — say hi!",
  "Talk less, listen more 😌",
  "Coffee + Code = Me ☕💻",
  "Life is better with friends 💬",
  "Ping me anytime!",
  "Can’t talk, meme-ing 🤫",
  "New connections, new stories ✨",
  "Just another talkative soul 😄",
  "Currently online and chilling.",
  "Introvert but replies fast.",
  "DMs open, just don’t ghost 👻",
  "Let's share stories and laughs!",
  "My vibe? Good convos and real people.",
  "A good chat makes the day better ☀️",
  "Addicted to late-night convos 🌙",
  "Available, unless I’m binge-watching.",
  "Heart on sleeve, phone in hand ❤️📱",
  "Don’t just read — say hello! 👋",
];

const getFakeBio = (userId) => {
  if (!userId) return "";
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % bios.length;
  return bios[index];
};
const ProfileContainer = () => {
  const { selectedUser } = useChatStore();

  if (!selectedUser) return null;

  const fakeBio = getFakeBio(selectedUser._id);
  const memberSince = selectedUser.createdAt
    ? new Date(selectedUser.createdAt).toLocaleDateString()
    : "January 2024";

  return (
    <aside className="hidden md:block w-64 p-4 bg-base-100 border-l border-base-300">
      <div className="flex flex-col items-center text-center">
        <img
          src={selectedUser.profilePic || "/avatar.png"}
          alt={selectedUser.fullName}
          className="size-24 rounded-full object-cover mb-3 border"
        />
        <h2 className="text-lg font-semibold truncate w-full">{selectedUser.fullName}</h2>

        <p className="text-sm text-zinc-500 mt-1">{fakeBio}</p>

        {/* Member Details */}
        <div className="mt-4 text-sm text-zinc-600 w-full">
          <p>
            <strong>Status:</strong> Active
          </p>
          <p>
            <strong>Member Since:</strong> {memberSince}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ProfileContainer;
