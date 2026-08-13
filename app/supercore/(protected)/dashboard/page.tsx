export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p className="text-sm text-neutral-400">
        You&apos;re signed in and whitelisted. Use the nav above to manage registrations, events, schedule,
        winners, users, the admin whitelist, audit logs, and global settings.
      </p>
    </div>
  )
}
