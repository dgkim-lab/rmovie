import { Card, CardContent, Container, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignInButton } from "@/components/session-button";
import { getAuthConfig } from "@/lib/config";

export default async function LoginPage() {
  if ((await auth())?.user) redirect("/");
  const { provider } = getAuthConfig();
  return (
    <Container maxWidth="sm">
      <Stack sx={{ justifyContent: "center", minHeight: "100vh" }}>
        <Card>
          <CardContent sx={{ p: 5, textAlign: "center" }}>
            <Typography gutterBottom variant="h3">rmovie</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              Sign in to get a random destination.
            </Typography>
            <SignInButton provider={provider} />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
