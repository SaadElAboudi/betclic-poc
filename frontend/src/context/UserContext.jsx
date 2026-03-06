import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [selectedUserId, setSelectedUserId] = useState('USR001');
    const [users, setUsers] = useState([]);

    return (
        <UserContext.Provider value={{ selectedUserId, setSelectedUserId, users, setUsers }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
}
