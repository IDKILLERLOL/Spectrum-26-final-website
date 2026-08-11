import { listUsers } from "@/lib/server/firestore-users"
import { UsersAdminClient } from "./UsersAdminClient"

export default async function AdminUsersPage() {
  const rawUsers = await listUsers()
  // Firestore Timestamps are class instances and can't cross the Server -> Client
  // Component boundary as props; convert to plain ISO strings first.
  const users = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toDate().toISOString(),
    updatedAt: u.updatedAt.toDate().toISOString(),
  }))
  return <UsersAdminClient users={users} />
}
