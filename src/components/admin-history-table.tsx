"use client";

import { Alert, Button, Chip, Link, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AdminHistoryRow {
  id: string; userEmail: string | null; userSubject: string; authProvider: string; movieName: string; movieUrl: string;
  status: "SUGGESTED" | "ACCEPTED"; suggestedAt: Date; deletedAt: Date | null;
}

export function AdminHistoryTable({ rows }: { rows: AdminHistoryRow[] }) {
  const router = useRouter(); const [busy, setBusy] = useState<string>(); const [error, setError] = useState<string>();
  async function update(row: AdminHistoryRow) {
    setBusy(row.id); setError(undefined);
    const response = await fetch(`/api/admin/history/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleted: !row.deletedAt }) });
    if (!response.ok) setError("History update failed"); else router.refresh();
    setBusy(undefined);
  }
  return <Stack spacing={2}>{error && <Alert severity="error">{error}</Alert>}
    <TableContainer component={Paper}><Table><TableHead><TableRow><TableCell>Movie</TableCell><TableCell>User</TableCell><TableCell>Status</TableCell><TableCell>Suggested</TableCell><TableCell align="right">Manage</TableCell></TableRow></TableHead>
      <TableBody>{rows.map((row) => <TableRow key={row.id} sx={{ opacity: row.deletedAt ? .55 : 1 }}>
        <TableCell><Link href={row.movieUrl} rel="noreferrer" target="_blank">{row.movieName}</Link></TableCell>
        <TableCell>{row.userEmail || row.userSubject}<br /><small>{row.authProvider}</small></TableCell>
        <TableCell><Stack direction="row" spacing={1}><Chip label={row.status.toLowerCase()} size="small" />{row.deletedAt && <Chip color="error" label="deleted" size="small" />}</Stack></TableCell>
        <TableCell>{new Date(row.suggestedAt).toLocaleString()}</TableCell>
        <TableCell align="right"><Button color={row.deletedAt ? "primary" : "error"} disabled={busy === row.id} onClick={() => void update(row)}>{row.deletedAt ? "Restore" : "Delete"}</Button></TableCell>
      </TableRow>)}</TableBody></Table></TableContainer>
  </Stack>;
}
