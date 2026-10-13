import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName: string;
}

export function ProductImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  productName,
}: ProductImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isOsFullscreen, setIsOsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialIndex whenever lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const toggleZoom = useCallback(() => {
    setIsZoomed((prev) => !prev);
  }, []);

  const toggleOsFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsOsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsOsFullscreen(false);
    }
  }, []);

  // Listen to OS fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsOsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "z" || e.key === "Z") {
        toggleZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isZoomed, handlePrev, handleNext, toggleZoom, onClose]);

  if (!mounted || !isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex] || images[0];

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Full screen image viewer for ${productName}`}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* Top Controls Bar */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 text-white">
          <p className="font-display text-sm sm:text-base font-medium truncate max-w-[200px] sm:max-w-md">
            {productName}
          </p>
          <span className="text-white/40">·</span>
          <span className="text-xs sm:text-sm font-mono text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Toggle Button */}
          <button
            type="button"
            onClick={toggleZoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-xs font-medium backdrop-blur-xs transition-colors"
            title={isZoomed ? "Reset zoom (Z)" : "Zoom in (Z)"}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </>
            ) : (
              <>
                <ZoomIn className="h-4 w-4" />
                <span className="hidden sm:inline">Zoom</span>
              </>
            )}
          </button>

          {/* Native OS Fullscreen Button */}
          {typeof document !== "undefined" && "requestFullscreen" in document.documentElement && (
            <button
              type="button"
              onClick={toggleOsFullscreen}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-xs transition-colors"
              title={isOsFullscreen ? "Exit full screen" : "Full screen"}
              aria-label={isOsFullscreen ? "Exit full screen" : "Full screen"}
            >
              {isOsFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white/90 hover:text-white backdrop-blur-xs transition-colors ml-1"
            title="Close (Esc)"
            aria-label="Close full screen view"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden cursor-default"
        onClick={(e) => {
          // If clicked the background area outside the image, close
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
            title="Previous (Left arrow)"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white backdrop-blur-md grid place-items-center transition-all shadow-xl cursor-pointer"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}

        {/* Central Display Image */}
        <div
          className={cn(
            "relative max-w-full max-h-full flex items-center justify-center transition-transform duration-300 ease-out select-none",
            isZoomed
              ? "scale-[1.8] sm:scale-[2.2] cursor-zoom-out"
              : "scale-100 cursor-zoom-in",
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          title={isZoomed ? "Click to reset zoom" : "Click to zoom into garment details"}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={`${productName} — View ${currentIndex + 1}`}
            className="max-h-[75vh] sm:max-h-[82vh] max-w-[90vw] w-auto h-auto object-contain rounded-xs shadow-2xl animate-in zoom-in-95 duration-200"
            draggable={false}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
            title="Next (Right arrow)"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white backdrop-blur-md grid place-items-center transition-all shadow-xl cursor-pointer"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails Dock */}
      <div className="relative z-30 px-4 py-3 sm:py-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col items-center gap-2">
        {images.length > 1 ? (
          <div className="flex items-center gap-2.5 max-w-full overflow-x-auto no-scrollbar py-1 px-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                aria-label={`Jump to image ${idx + 1}`}
                className={cn(
                  "relative h-14 w-12 sm:h-16 sm:w-14 rounded-xs overflow-hidden shrink-0 transition-all border cursor-pointer",
                  currentIndex === idx
                    ? "border-amber-500 ring-2 ring-amber-500 scale-105 opacity-100"
                    : "border-white/20 opacity-50 hover:opacity-90 hover:border-white/60",
                )}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/50 font-mono tracking-wider uppercase">
            Click image to zoom · Press Esc to exit
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
