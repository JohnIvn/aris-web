import { useState, useRef, useEffect } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui";

interface PhotoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropAndUpload: (croppedFile: File) => Promise<void>;
}

export default function PhotoCropModal({
  isOpen,
  onClose,
  imageFile,
  onCropAndUpload,
}: PhotoCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const CONTAINER_SIZE = 280;
  const CROP_SIZE = 220;

  useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setImageSrc(objectUrl);
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setUploadError(null);
    setIsUploading(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  if (!isOpen || !imageFile) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isUploading) return;
    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isUploading) return;
    setOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleSave = async () => {
    const img = imgRef.current;
    if (!img) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const OUTPUT_SIZE = 512;
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Unable to create canvas context");
      }

      const k = OUTPUT_SIZE / CROP_SIZE;
      const naturalW = img.naturalWidth || 512;
      const naturalH = img.naturalHeight || 512;

      const initialScale = Math.min(CONTAINER_SIZE / naturalW, CONTAINER_SIZE / naturalH);
      const baseW = naturalW * initialScale;
      const baseH = naturalH * initialScale;

      ctx.save();
      ctx.translate(OUTPUT_SIZE / 2 + offset.x * k, OUTPUT_SIZE / 2 + offset.y * k);
      ctx.rotate((rotation * Math.PI) / 180);

      const drawW = baseW * scale * k;
      const drawH = baseH * scale * k;

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Failed to process cropped image");

      const croppedFile = new File([blob], imageFile.name.replace(/\.[^/.]+$/, ".jpg"), {
        type: "image/jpeg",
      });

      await onCropAndUpload(croppedFile);
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isUploading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crop Profile Photo"
        onClick={(event) => event.stopPropagation()}
        className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-5 flex flex-col text-left max-h-[92vh] overflow-hidden"
      >
        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-white/95 backdrop-blur-sm p-6 text-center animate-in fade-in duration-150">
            <div
              className="w-11 h-11 rounded-full border-3 border-t-transparent animate-spin mb-3.5"
              style={{
                borderLeftColor: "#3a7d4e",
                borderBottomColor: "#3a7d4e",
                borderRightColor: "#3a7d4e",
                borderTopColor: "transparent",
              }}
            />
            <p className="text-[14px] font-bold text-[#111c14]">Uploading Photo...</p>
            <p className="text-[11.5px] text-[#5a6b5e] mt-1 max-w-[220px]">
              Saving to Supabase storage. Please wait.
            </p>
          </div>
        )}

        <div className="mb-3">
          <h2 className="text-[16px] font-bold tracking-tight text-[#111c14]">
            Crop & Resize Photo
          </h2>
          <p className="text-[11.5px] text-[#8fa394]">
            Drag to reposition. Use the slider to zoom in or out.
          </p>
        </div>

        {/* Interactive Viewport */}
        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-[#0f1912] select-none touch-none flex items-center justify-center cursor-grab active:cursor-grabbing border border-[#1f2e23]"
          style={{ width: CONTAINER_SIZE, height: CONTAINER_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {imageSrc && (
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              draggable={false}
              className="max-w-none pointer-events-none select-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
                maxHeight: CONTAINER_SIZE,
                maxWidth: CONTAINER_SIZE,
              }}
            />
          )}

          {/* Vignette / Circular Crop Mask */}
          <div
            className="absolute pointer-events-none rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{
              width: CROP_SIZE,
              height: CROP_SIZE,
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="mt-3.5 flex items-center gap-2.5 px-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
            disabled={isUploading}
            className="w-7 h-7 flex items-center justify-center rounded-lg border text-[#5a6b5e] hover:bg-[#f4f6f5] transition-colors disabled:opacity-40"
            style={{ borderColor: "#e2e8e4" }}
            title="Zoom out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            disabled={isUploading}
            aria-label="Zoom level"
            className="flex-1 accent-[#3a7d4e] h-1.5 bg-[#e2e8e4] rounded-lg cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(3, Number((s + 0.1).toFixed(2))))}
            disabled={isUploading}
            className="w-7 h-7 flex items-center justify-center rounded-lg border text-[#5a6b5e] hover:bg-[#f4f6f5] transition-colors disabled:opacity-40"
            style={{ borderColor: "#e2e8e4" }}
            title="Zoom in"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>

        {/* Rotate and Reset helpers */}
        <div className="mt-2.5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleRotate}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-[#5a6b5e] hover:text-[#111c14] rounded-lg border border-[#e2e8e4] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Rotate 90°
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isUploading}
            className="px-2.5 py-1 text-[11px] font-medium text-[#5a6b5e] hover:text-[#111c14] rounded-lg border border-[#e2e8e4] hover:bg-[#f7f9f8] transition-colors disabled:opacity-40"
          >
            Reset
          </button>
        </div>

        {uploadError && (
          <p className="mt-2.5 text-[11.5px] text-[#c0392b] bg-red-50 p-2 rounded-xl text-center">
            {uploadError}
          </p>
        )}

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#eef1ef] pt-3">
          <GhostButton
            onClick={() => {
              if (!isUploading) onClose();
            }}
          >
            Cancel
          </GhostButton>
          <PrimaryButton onClick={handleSave}>
            Save Photo
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

