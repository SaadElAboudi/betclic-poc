import { useUser } from '../context/UserContext';

export function UserProfileSelector({ users, onUserChange }) {
    const { selectedUserId, setSelectedUserId } = useUser();

    const handleChange = (userId) => {
        setSelectedUserId(userId);
        onUserChange?.(userId);
    };

    return (
        <div className="bg-white border border-betclic-grayBorder rounded-md p-4 shadow-sm mb-4">
            <h3 className="text-[11px] font-bold text-gray-900 mb-3 uppercase tracking-[0.14em]">Profil utilisateur (Demo)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {users.map((user) => (
                    <button
                        key={user.userId}
                        onClick={() => handleChange(user.userId)}
                        className={`p-3 rounded-md border transition-all text-left ${selectedUserId === user.userId
                            ? 'bg-betclic-redLight border-betclic-red shadow-sm ring-1 ring-betclic-red/20'
                            : 'bg-white border-betclic-grayBorder hover:border-betclic-red'
                            }`}
                    >
                        <div className="text-lg mb-1">{user.avatar}</div>
                        <div className="font-bold text-gray-900 text-sm mb-1">{user.name}</div>
                        <div className="text-xs text-betclic-grayText mb-2">{user.description}</div>
                        <div className="text-xs text-betclic-red font-semibold">
                            {user.totalBets} paris • {Math.round(user.winRate * 100)}% gain
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
