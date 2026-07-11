import { Button, Container, Stack, Typography } from "@mui/material";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHistoryTable } from "@/components/admin-history-table";
import { listAllSuggestions } from "@/lib/admin";
import { isAdmin } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdmin(session)) notFound();
  const rows = await listAllSuggestions(session);
  return <Container maxWidth="xl" sx={{ py: 4 }}><Stack spacing={3}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}><div><Typography component="h1" variant="h4">History management</Typography><Typography color="text.secondary">Latest 500 records, including deleted history</Typography></div><Stack direction="row"><Button href="/admin/users">Users</Button><Button href="/">Back to rmovie</Button></Stack></Stack>
    <AdminHistoryTable rows={rows} />
  </Stack></Container>;
}
