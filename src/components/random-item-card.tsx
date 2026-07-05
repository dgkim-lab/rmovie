"use client";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import StopIcon from "@mui/icons-material/Stop";
import { Alert, Button, Card, CardActions, CardContent, Link, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import type { RandomItem } from "@/lib/random-item";

export function RandomItemCard({
  item,
  delayMs,
  suggestionId,
}: {
  item: RandomItem;
  delayMs: number;
  suggestionId?: string;
}) {
  const [remaining, setRemaining] = useState(delayMs);
  const [stopped, setStopped] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const acceptAndNavigate = useCallback(async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      if (suggestionId) {
        await fetch(`/api/activity/suggestions/${suggestionId}/accept`, {
          method: "POST",
          keepalive: true,
        });
      }
    } catch (error) {
      console.error("Unable to record accepted suggestion", error);
    } finally {
      window.location.assign(item.url);
    }
  }, [item.url, navigating, suggestionId]);

  useEffect(() => {
    if (stopped) return;
    const started = Date.now();
    const ticker = window.setInterval(
      () => setRemaining(Math.max(0, delayMs - (Date.now() - started))),
      100,
    );
    const redirect = window.setTimeout(() => void acceptAndNavigate(), delayMs);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(redirect);
    };
  }, [acceptAndNavigate, delayMs, stopped]);

  return (
    <Card sx={{ width: "min(680px, 100%)", p: { xs: 1, sm: 2 } }}>
      <CardContent>
        <Typography color="primary" sx={{ fontWeight: 700, letterSpacing: 2 }} variant="overline">
          YOUR RANDOM PICK
        </Typography>
        <Typography component="h1" sx={{ my: 2, overflowWrap: "anywhere" }} variant="h3">
          {item.name || "Untitled"}
        </Typography>
        <Link href={item.url} onClick={(event) => {
          event.preventDefault();
          void acceptAndNavigate();
        }} rel="noreferrer" sx={{ overflowWrap: "anywhere" }}>
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
        <Button disabled={stopped || navigating} onClick={() => setStopped(true)} startIcon={<StopIcon />}>
          Stop
        </Button>
      </CardActions>
    </Card>
  );
}
