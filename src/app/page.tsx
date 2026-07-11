import { Alert, Box, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RandomItemCard } from "@/components/random-item-card";
import { AccountButton, SignOutButton } from "@/components/session-button";
import { UserProfile } from "@/components/user-profile";
import { recordSuggestion } from "@/lib/activity-log";
import { getAccountUrl, getRedirectDelayMs } from "@/lib/config";
import { getRandomSheetItem } from "@/lib/google-sheets";
import type { RandomItem } from "@/lib/random-item";
import { getErrorTraceContext } from "@/lib/telemetry";
import { getAppVersion } from "@/lib/version";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const accountUrl = getAccountUrl();

  let item: RandomItem | null = null;
  let suggestionId: string | undefined;
  try {
    item = await getRandomSheetItem();
    try {
      suggestionId = (await recordSuggestion(session, item)).id;
    } catch (error) {
      console.error("Unable to record movie suggestion", {
        ...getErrorTraceContext(error),
        error,
      });
    }
  } catch (error) {
    console.error("Unable to select a random item", {
      ...getErrorTraceContext(error),
      error,
    });
  }

  const content = item
    ? <RandomItemCard delayMs={getRedirectDelayMs()} item={item} suggestionId={suggestionId} />
    : <Alert severity="error">A random item could not be loaded. Try again later.</Alert>;

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ alignItems: "center", minHeight: "100vh", py: 3 }}>
        <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", width: "100%" }}>
          <Box>
            <Typography sx={{ fontWeight: 800 }} variant="h5">rmovie</Typography>
            <Typography color="text.secondary" variant="caption">{getAppVersion()}</Typography>
          </Box>
          <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ mr: 1 }}><UserProfile user={session.user} /></Box>
            <AccountButton href="/activity" label="Activity" />
            {session.user.roles.includes("ADMIN") && <AccountButton href="/admin" label="Admin" />}
            {accountUrl && <AccountButton href={accountUrl} />}
            <SignOutButton />
          </Box>
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center", width: "100%" }}>
          {content}
        </Box>
      </Stack>
    </Container>
  );
}
