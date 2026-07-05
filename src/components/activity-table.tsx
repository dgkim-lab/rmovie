"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Button,
  Chip,
  IconButton,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ActivityRow {
  id: string;
  movieName: string;
  movieUrl: string;
  sheetId: string;
  sheetRange: string;
  status: "SUGGESTED" | "ACCEPTED";
  suggestedAt: Date;
  acceptedAt: Date | null;
}

export function ActivityTable({ rows }: { rows: ActivityRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function remove(url: string) {
    setBusy(true);
    setError(undefined);
    try {
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("The activity could not be deleted");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function acceptAndOpen(row: ActivityRow) {
    setBusy(true);
    setError(undefined);
    try {
      if (row.status === "SUGGESTED") {
        await fetch(`/api/activity/suggestions/${row.id}/accept`, {
          method: "POST",
          keepalive: true,
        });
      }
    } catch (reason) {
      console.error("Unable to record accepted suggestion", reason);
    } finally {
      window.location.assign(row.movieUrl);
    }
  }

  if (rows.length === 0) return <Alert severity="info">No movie activity yet.</Alert>;

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Typography color="text.secondary">Latest 100 non-deleted records</Typography>
        <Button color="error" disabled={busy} onClick={() => {
          if (window.confirm("Clear your complete visible activity history?")) {
            void remove("/api/activity/suggestions");
          }
        }}>Clear history</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Movie</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Suggested</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link href={row.movieUrl} onClick={(event) => {
                    event.preventDefault();
                    void acceptAndOpen(row);
                  }} rel="noreferrer">{row.movieName}</Link>
                </TableCell>
                <TableCell>
                  <Chip color={row.status === "ACCEPTED" ? "success" : "default"} label={row.status.toLowerCase()} size="small" />
                </TableCell>
                <TableCell>{new Date(row.suggestedAt).toLocaleString()}</TableCell>
                <TableCell>{row.sheetRange}<br /><small>{row.sheetId}</small></TableCell>
                <TableCell align="right">
                  <IconButton aria-label={`Delete ${row.movieName}`} disabled={busy} onClick={() => void remove(`/api/activity/suggestions/${row.id}`)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
