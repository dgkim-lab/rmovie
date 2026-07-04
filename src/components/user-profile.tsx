import { Avatar, Stack, Typography } from "@mui/material";
import type { Session } from "next-auth";

export function UserProfile({ user }: { user: Session["user"] }) {
  const label = user.name || user.email || "Signed in";

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Avatar alt={label} src={user.image || undefined} sx={{ height: 32, width: 32 }}>
        {label.charAt(0).toUpperCase()}
      </Avatar>
      <div>
        <Typography sx={{ fontWeight: 600 }} variant="body2">{label}</Typography>
        {user.name && user.email && (
          <Typography color="text.secondary" variant="caption">{user.email}</Typography>
        )}
      </div>
    </Stack>
  );
}
