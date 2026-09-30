"use client";
import { useUsers } from "../hooks/useUsers";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";

export default function UsersPage() {
  const usersHook = useUsers();
  const allUsersHook = useUsers({ all: true });

  const handleCreated = () => {
    usersHook.addUser();
    allUsersHook.refresh();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Team & Hierarchy</h1>
        <p>Configure agents, managers, and multi-level reporting relationships</p>
      </div>
      <div className="users-page-layout">
        <div style={{ minWidth: 0 }}>
          <UserForm users={allUsersHook.users} onCreated={handleCreated} />
        </div>
        <div style={{ minWidth: 0 }}>
          <UserList hook={usersHook} />
        </div>
      </div>
    </div>
  );
}
