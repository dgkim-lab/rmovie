import { Alert, Box, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RandomItemCard } from "@/components/random-item-card";
import { SignOutButton } from "@/components/session-button";
import { getRedirectDelayMs } from "@/lib/config";
import { getRandomSheetItem } from "@/lib/google-sheets";
import type { RandomItem } from "@/lib/random-item";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let item: RandomItem | null = null;
  try {
    item = await getRandomSheetItem();
  } catch (error) {
    console.error("Unable to select a random item", error);
  }

  const content = item
    ? <RandomItemCard delayMs={getRedirectDelayMs()} item={item} />
    : <Alert severity="error">A random item could not be loaded. Try again later.</Alert>;

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ alignItems: "center", minHeight: "100vh", py: 3 }}>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Typography sx={{ fontWeight: 800 }} variant="h5">rmovie</Typography>
          <SignOutButton />
        </Box>
        <Box sx={{ alignItems: "center", display: "flex", flex: 1, justifyContent: "center", width: "100%" }}>
          {content}
        </Box>
      </Stack>
    </Container>
  );
}
