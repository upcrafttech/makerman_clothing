import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { ShopProvider } from "@/lib/shop-store";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SearchModal } from "@/components/layout/search-modal";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <p className="eyebrow text-subtle">404 Error</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">Page Not Found</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The piece or page you are looking for has been moved, archived, or is temporarily unavailable.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-primary/90"
        >
          Return Home
        </Link>
        <Link
          to="/store"
          className="inline-flex items-center justify-center border border-border bg-background text-foreground px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-secondary"
        >
          Explore Store
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Application error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <p className="eyebrow text-subtle">Notice</p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred while loading this view. You can reload the page or return to the main store.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
        <Link
          to="/"
          className="inline-flex items-center justify-center border border-border bg-background text-foreground px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors hover:bg-secondary"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "MAKERMAN — Feeling Happiness" },
      {
        name: "description",
        content:
          "Makerman crafts refined modern essentials, tailored silhouettes, and premium fabrics. Feeling Happiness.",
      },
      { name: "author", content: "Makerman Clothing" },
      { property: "og:title", content: "MAKERMAN — Premium Clothing & Modern Essentials" },
      {
        property: "og:description",
        content: "Refined clothing crafted with precision, premium fabrics and comfortable silhouettes. Feeling Happiness.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@makermanclothing" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-ink selection:text-ink-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ShopProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>

        {/* Global modals & drawers */}
        <CartDrawer />
        <SearchModal />
        <QuickViewModal />
        <Toaster position="bottom-right" richColors />
      </ShopProvider>
    </QueryClientProvider>
  );
}
