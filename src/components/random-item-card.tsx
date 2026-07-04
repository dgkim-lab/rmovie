"use client";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import { Alert, Button, Card, CardActions, CardContent, Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { RandomItem } from "@/lib/random-item";

export function RandomItemCard({ item, delayMs }: { item: RandomItem; delayMs: number }) {
  const [remaining, setRemaining] = useState(delayMs);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped) return;
    const started = Date.now();
    const ticker = window.setInterval(
      () => setRemaining(Math.max(0, delayMs - (Date.now() - started))),
      100,
    );
    const redirect = window.setTimeout(() => window.location.assign(item.url), delayMs);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(redirect);
    };
  }, [delayMs, item.url, stopped]);

  return (
    <Card sx={{ width: "min(680px, 100%)", p: { xs: 1, sm: 2 } }}>
      <CardContent>
        <Typography color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }} variant="overline">
          YOUR RANDOM PICK
        </Typography>
        <Typography component="h1" sx={{ my: 2, overflowWrap: "anywhere" }} variant="h3">
          {item.name || "Untitled"}
        </Typography>
        <Link href={item.url} rel="noreferrer" target="_blank" sx={{ overflowWrap: "anywhere" }}>
          {item.url} <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Link>
        <Alert severity={stopped ? "info" : "warning"} sx={{ mt: 3 }}>
          {stopped
            ? "Automatic redirect stopped."
            : `Redirecting in ${(remaining / 1000).toFixed(1)} seconds.`}
        </Alert>
      </CardContent>
      <CardActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button href="/" startIcon={<RefreshIcon />} variant="contained">
          Next
        </Button>
        <Button disabled={stopped} onClick={() => setStopped(true)} startIcon={<StopIcon />}>
          Stop
        </Button>
      </CardActions>
    </Card>
  );
}
