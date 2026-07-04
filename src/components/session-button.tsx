import { Button } from "@mui/material";
import { signIn, signOut } from "@/auth";
import { getFederatedLogoutUrl, type AuthProvider } from "@/lib/config";

export function SignInButton({ provider }: { provider: AuthProvider }) {
  return (
    <form action={async () => { "use server"; await signIn(provider, { redirectTo: "/" }); }}>
      <Button type="submit" variant="contained">Sign in</Button>
    </form>
  );
}

export function SignOutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: getFederatedLogoutUrl() }); }}>
      <Button color="inherit" size="small" type="submit">Sign out</Button>
    </form>
  );
}

export function AccountButton({ href, label = "Manage account" }: { href: string; label?: string }) {
  return <Button color="inherit" href={href} size="small">{label}</Button>;
}
