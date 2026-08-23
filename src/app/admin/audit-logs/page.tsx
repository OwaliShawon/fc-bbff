import { getAuditLogs } from "@/services/audit-log";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          System Audit Trail & Security Logs
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Complete chronological record of all administrative modifications.
        </p>
      </div>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                    <ClipboardList className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    No audit logs recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-neutral-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-xs text-white">{log.user?.name || "System"}</p>
                        <p className="text-[10px] text-neutral-500">{log.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          log.action === "CREATE"
                            ? "bg-emerald-500/20 text-emerald-400 text-xs"
                            : log.action === "UPDATE"
                            ? "bg-blue-500/20 text-blue-400 text-xs"
                            : "bg-red-500/20 text-red-400 text-xs"
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-300 uppercase">
                      {log.module}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-300">
                      {log.description || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
