import { Button, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ActivityTable } from "@/components/activity-table";
import { listSuggestions } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const rows = await listSuggestions(session);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Typography component="h1" variant="h4">Activity</Typography>
            <Typography color="text.secondary">Suggestions and accepted movie redirects</Typography>
          </div>
          <Button href="/">Back to rmovie</Button>
        </Stack>
        <ActivityTable rows={rows} />
      </Stack>
    </Container>
  );
}
