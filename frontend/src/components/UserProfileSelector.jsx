import { useUser } from '../context/UserContext';

export function UserProfileSelector({ users, onUserChange }) {
    const { selectedUserId, setSelectedUserId } = useUser();

    const handleChange = (userId) => {
        setSelectedUserId(userId);
        onUserChange?.(userId);
    };

    return (
        <div className="bg-[#1A1F28] border border-white/10 rounded-md p-4 shadow-sm mb-4">
            <h3 className="text-[11px] font-bold text-white/90 mb-3 uppercase tracking-[0.14em]">Profil utilisateur (Demo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {users.map((user) => (
                    <button
                        key={user.userId}
                        onClick={() => handleChange(user.userId)}
                        className={`p-3 rounded-md border transition-all text-left ${selectedUserId === user.userId
                            ? 'bg-[#2A1114] border-betclic-red shadow-sm ring-1 ring-betclic-red/30'
                            : 'bg-[#232A36] border-white/10 hover:border-betclic-red'
                            }`}
                    >
                        <div className="text-lg mb-1">{user.avatar}</div>
                        <div className="font-bold text-white text-sm mb-1">{user.name}</div>
                        <div className="text-xs text-white/65 mb-2">{user.description}</div>
                        <div className="text-xs text-betclic-yellow font-semibold">
                            {user.totalBets} paris • {Math.round(user.winRate * 100)}% gain
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
