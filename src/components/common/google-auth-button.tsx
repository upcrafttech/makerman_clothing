import React, { useEffect, useRef, useState } from "react";
import { loadGoogleScript } from "@/lib/google-auth";
import { useGoogleAuthConfig } from "@/hooks/use-api";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  mode: "login" | "signup";
  onCredential: (credential: string) => void | Promise<void>;
  disabled?: boolean;
}

export function GoogleAuthButton({ mode, onCredential, disabled }: GoogleAuthButtonProps) {
  const { data: config, isLoading: isConfigLoading } = useGoogleAuthConfig();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!config?.enabled || !config.clientId) return;

    let isMounted = true;
    loadGoogleScript().then((loaded) => {
      if (isMounted) setScriptLoaded(loaded);
    });

    return () => {
      isMounted = false;
    };
  }, [config?.enabled, config?.clientId]);

  // Initialize GIS once when script and client ID are available
  useEffect(() => {
    if (!scriptLoaded || !config?.clientId) return;
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: async (response) => {
          if (response?.credential) {
            setIsProcessing(true);
            try {
              await onCredentialRef.current(response.credential);
            } finally {
              setIsProcessing(false);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (err) {
      console.error("Failed to initialize Google Auth", err);
    }
  }, [scriptLoaded, config?.clientId]);

  // Dynamically render Google button to fit container width exactly
  useEffect(() => {
    if (!scriptLoaded || !config?.clientId || !buttonContainerRef.current) return;
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    const container = buttonContainerRef.current;

    const renderButton = () => {
      if (!container || !window.google?.accounts?.id) return;
      const availableWidth = container.clientWidth || container.parentElement?.clientWidth || 280;
      // Google GIS requires width between 200px and 400px
      const buttonWidth = Math.max(200, Math.min(400, Math.floor(availableWidth)));

      container.innerHTML = "";
      try {
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: mode === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: buttonWidth,
        });
      } catch (err) {
        console.error("Failed to render Google button", err);
      }
    };

    renderButton();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderButton, 100);
    });
    observer.observe(container);

    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [scriptLoaded, config?.clientId, mode]);

  // If Google auth is not configured or disabled by Makerman admin, hide completely
  if (!isConfigLoading && (!config?.enabled || !config?.clientId)) {
    return null;
  }

  return (
    <div className="w-full space-y-3">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-medium">
          <span className="bg-background px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <div className="w-full flex justify-center relative overflow-hidden">
        {isConfigLoading ? (
          <div className="w-full h-11 bg-muted/40 animate-pulse rounded border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
            Loading Google Sign-In...
          </div>
        ) : (
          <div
            ref={buttonContainerRef}
            className={`w-full flex justify-center min-h-[44px] overflow-hidden max-w-full [&>div]:!max-w-full [&_iframe]:!max-w-full ${
              disabled || isProcessing ? "opacity-50 pointer-events-none" : ""
            }`}
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center gap-2 rounded">
            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
            <span className="text-xs font-medium">Authenticating...</span>
          </div>
        )}
      </div>
    </div>
  );
}
