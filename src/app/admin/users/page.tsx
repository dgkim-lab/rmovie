import { Button, Container, Stack, Typography } from "@mui/material";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminUserTable } from "@/components/admin-user-table";
import { isAdmin, listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isAdmin(session)) notFound();
  const users = await listUsers(session);
  return <Container maxWidth="xl" sx={{ py: 4 }}><Stack spacing={3}>
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}><div><Typography component="h1" variant="h4">User management</Typography><Typography color="text.secondary">Local OIDC users and application roles</Typography></div><Stack direction="row"><Button href="/admin/history">History</Button><Button href="/">Back to rmovie</Button></Stack></Stack>
    <AdminUserTable currentUserId={session.user.localId} users={users} />
  </Stack></Container>;
}
