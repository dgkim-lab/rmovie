"use client";

import { Alert, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AdminUserRow {
  id: string;
  subject: string;
  authProvider: string;
  email: string | null;
  name: string | null;
  createdAt: Date;
  lastSeenAt: Date;
  roles: Array<{ role: "ADMIN" | "USER" }>;
}

export function AdminUserTable({ currentUserId, users }: { currentUserId: string; users: AdminUserRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  async function update(user: AdminUserRow, admin: boolean) {
    setBusy(user.id); setError(undefined);
    const response = await fetch(`/api/admin/users/${user.id}/role`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ admin }) });
    if (!response.ok) setError(((await response.json().catch(() => null)) as { error?: string } | null)?.error || "Role update failed");
    else router.refresh();
    setBusy(undefined);
  }
  return <Stack spacing={2}>
    {error && <Alert severity="error">{error}</Alert>}
    <TableContainer component={Paper}><Table><TableHead><TableRow>
      <TableCell>User</TableCell><TableCell>Provider / subject</TableCell><TableCell>Roles</TableCell><TableCell>Last seen</TableCell><TableCell align="right">Admin access</TableCell>
    </TableRow></TableHead><TableBody>{users.map((user) => {
      const admin = user.roles.some(({ role }) => role === "ADMIN");
      return <TableRow key={user.id}><TableCell>{user.name || "Unnamed"}<br /><small>{user.email || "No email claim"}</small></TableCell>
        <TableCell>{user.authProvider}<br /><small>{user.subject}</small></TableCell>
        <TableCell><Stack direction="row" spacing={1}>{user.roles.map(({ role }) => <Chip key={role} label={role.toLowerCase()} size="small" />)}</Stack></TableCell>
        <TableCell>{new Date(user.lastSeenAt).toLocaleString()}</TableCell>
        <TableCell align="right"><Button disabled={busy === user.id || (admin && user.id === currentUserId)} color={admin ? "error" : "primary"} onClick={() => void update(user, !admin)}>{admin ? "Remove admin" : "Make admin"}</Button></TableCell>
      </TableRow>;
    })}</TableBody></Table></TableContainer>
  </Stack>;
}
