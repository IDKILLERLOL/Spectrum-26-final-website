import { listAuditLogs } from "@/lib/server/firestore-audit"

export default async function AuditLogsPage() {
  const logs = await listAuditLogs(200)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Audit Logs</h1>
      <p className="text-sm text-neutral-400">Every admin write, most recent first. Read-only.</p>
      <div className="overflow-x-auto rounded border border-neutral-800">
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Actor</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-neutral-900">
                <td className="p-3 text-neutral-400">{log.createdAt.toDate().toLocaleString("en-IN")}</td>
                <td className="p-3">{log.actorEmail}</td>
                <td className="p-3 font-mono text-amber-400">{log.action}</td>
                <td className="p-3 text-neutral-400">
                  {log.targetCollection}/{log.targetId}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-neutral-500">
                  No audit log entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
