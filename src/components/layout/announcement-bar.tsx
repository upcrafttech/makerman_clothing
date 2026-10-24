import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

interface Banner {
  id: string;
  businessId: string;
  text: string;
  linkUrl: string | null;
  backgroundColor: string;
  textColor: string;
  position: string;
  startTime: string | null;
  endTime: string | null;
  active: boolean;
}

const DEFAULT_ANNOUNCEMENT = "Complimentary Pan-India Shipping on orders above ₹1,999 · Feeling Happiness";

export function AnnouncementBar() {
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchBanners() {
      try {
        const banners = await apiFetch<Banner[]>("/storefront/banners");
        if (mounted && Array.isArray(banners) && banners.length > 0) {
          const banner = banners[0];
          // Check 24-hour suppression
          const dismissedAt = localStorage.getItem(`dismissed_banner_${banner.id}`);
          if (dismissedAt) {
            const age = Date.now() - parseInt(dismissedAt, 10);
            if (age < 24 * 60 * 60 * 1000) {
              setDismissed(true);
              return;
            }
          }
          setActiveBanner(banner);
        }
      } catch (e) {
        // Fallback silently to default text
      }
    }

    fetchBanners();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDismiss = () => {
    if (activeBanner) {
      localStorage.setItem(`dismissed_banner_${activeBanner.id}`, Date.now().toString());
    }
    setDismissed(true);
  };

  if (dismissed && !activeBanner) {
    return (
      <div className="bg-[#171717] text-[#FAF8F5] py-2 px-4 text-center text-[0.6875rem] font-medium tracking-[0.18em] uppercase border-b border-[#282828] select-none">
        <span>{DEFAULT_ANNOUNCEMENT}</span>
      </div>
    );
  }

  if (activeBanner && !dismissed) {
    return (
      <div
        className="py-2 px-4 text-center text-[0.6875rem] sm:text-xs font-medium tracking-[0.12em] uppercase border-b border-black/10 select-none relative flex items-center justify-center transition-colors duration-200"
        style={{
          backgroundColor: activeBanner.backgroundColor || "#171717",
          color: activeBanner.textColor || "#FAF8F5",
        }}
      >
        <div className="flex items-center gap-2 max-w-4xl mx-auto px-6 truncate">
          <span className="truncate">{activeBanner.text}</span>
          {activeBanner.linkUrl && (
            <a
              href={activeBanner.linkUrl}
              className="underline underline-offset-2 opacity-90 hover:opacity-100 flex items-center gap-1 font-bold shrink-0 ml-1"
            >
              Shop Now <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] text-[#FAF8F5] py-2 px-4 text-center text-[0.6875rem] font-medium tracking-[0.18em] uppercase border-b border-[#282828] select-none">
      <span>{DEFAULT_ANNOUNCEMENT}</span>
    </div>
  );
}
