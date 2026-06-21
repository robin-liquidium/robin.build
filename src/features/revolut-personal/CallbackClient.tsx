"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type CallbackState = {
  code: string;
  error: string;
  state: string;
};

const CLI_PATH_PLACEHOLDER = "/path/to/revolut_personal.py";
const COPY_RESET_DELAY_MS = 1600;

/** Reads Enable Banking callback parameters and renders a local exchange command. */
export function CallbackClient() {
  const [callbackState, setCallbackState] = useState<CallbackState>({
    code: "",
    error: "",
    state: "",
  });
  const [copied, setCopied] = useState(false);
  const [hasReadParams, setHasReadParams] = useState(false);
  const { code, error, state } = callbackState;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackState({
      code: params.get("code") ?? "",
      error: params.get("error") ?? "",
      state: params.get("state") ?? "",
    });
    setHasReadParams(true);
  }, []);

  const command = useMemo(() => {
    if (!code) {
      return "";
    }
    const params = new URLSearchParams({ code });
    if (state) {
      params.set("state", state);
    }
    const callbackUrl = `https://robin.build/revolut-personal/callback?${params.toString()}`;
    return `python3 ${CLI_PATH_PLACEHOLDER} exchange-code "${callbackUrl}"`;
  }, [code, state]);

  const copyCommand = async () => {
    if (!command) {
      return;
    }
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_RESET_DELAY_MS);
  };

  return (
    <main className="min-h-screen px-5 py-16 sm:px-8">
      <section className="mx-auto max-w-3xl">
        <p className="font-mono text-sm text-muted-foreground">
          Enable Banking callback
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
          Revolut Personal CLI
        </h1>

        {error ? (
          <div className="mt-10 border border-destructive/40 bg-destructive/10 p-5">
            <h2 className="font-semibold">Authorization returned an error</h2>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        ) : null}

        {code ? (
          <div className="mt-10 space-y-6">
            <p className="text-muted-foreground">
              Copy this command into Codex or a local terminal to exchange the
              one-time authorization code. Do not share this URL or command.
            </p>
            <pre className="overflow-x-auto border bg-background p-4 font-mono text-sm">
              <code>{command}</code>
            </pre>
            <Button type="button" className="gap-2" onClick={copyCommand}>
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy command"}
            </Button>
          </div>
        ) : null}

        {!hasReadParams ? (
          <p className="mt-10 text-muted-foreground">Reading callback URL...</p>
        ) : null}

        {hasReadParams && !code && !error ? (
          <p className="mt-10 text-muted-foreground">
            No authorization code was found in this callback URL.
          </p>
        ) : null}
      </section>
    </main>
  );
}
