import { listUsers } from "@/lib/server/firestore-users"
import { UsersAdminClient } from "./UsersAdminClient"

export default async function AdminUsersPage() {
  const rawUsers = await listUsers()
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to plain ISO strings first.
  const users = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt ? (typeof u.createdAt.toDate === "function" ? u.createdAt.toDate().toISOString() : new Date(u.createdAt).toISOString()) : new Date().toISOString(),
    updatedAt: u.updatedAt ? (typeof u.updatedAt.toDate === "function" ? u.updatedAt.toDate().toISOString() : new Date(u.updatedAt).toISOString()) : null,
  }))
  return <UsersAdminClient users={users} />
}
