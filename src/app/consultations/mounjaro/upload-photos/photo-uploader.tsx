"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UploadType = "body_photo_front" | "body_photo_side" | "photo_id";

interface UploadSlot {
  type: UploadType;
  label: string;
  description: string;
}

type SlotStatus = "idle" | "uploading" | "confirming" | "done" | "error";

interface SlotState {
  status: SlotStatus;
  fileName: string | null;
  progress: number; // 0-100
  error: string | null;
}

const UPLOAD_SLOTS: UploadSlot[] = [
  {
    type: "body_photo_front",
    label: "Front-facing body photo",
    description: "Full body, facing the camera",
  },
  {
    type: "body_photo_side",
    label: "Side-facing body photo",
    description: "Full body, side profile",
  },
  {
    type: "photo_id",
    label: "Photo ID",
    description: "Passport, driving licence, or national ID",
  },
];

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PhotoUploaderProps {
  consultationId: string;
}

export function PhotoUploader({ consultationId }: PhotoUploaderProps) {
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [slots, setSlots] = useState<Record<UploadType, SlotState>>({
    body_photo_front: { status: "idle", fileName: null, progress: 0, error: null },
    body_photo_side: { status: "idle", fileName: null, progress: 0, error: null },
    photo_id: { status: "idle", fileName: null, progress: 0, error: null },
  });

  const allDone =
    slots.body_photo_front.status === "done" &&
    slots.body_photo_side.status === "done" &&
    slots.photo_id.status === "done";

  const anyUploading =
    slots.body_photo_front.status === "uploading" ||
    slots.body_photo_front.status === "confirming" ||
    slots.body_photo_side.status === "uploading" ||
    slots.body_photo_side.status === "confirming" ||
    slots.photo_id.status === "uploading" ||
    slots.photo_id.status === "confirming";

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const updateSlot = useCallback(
    (type: UploadType, patch: Partial<SlotState>) => {
      setSlots((prev) => ({
        ...prev,
        [type]: { ...prev[type], ...patch },
      }));
    },
    [],
  );

  const handleFileSelect = useCallback(
    async (file: File, uploadType: UploadType) => {
      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        updateSlot(uploadType, {
          status: "error",
          error: "Please select a JPEG, PNG, or WebP image.",
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        updateSlot(uploadType, {
          status: "error",
          error: "File must be under 10 MB.",
        });
        return;
      }

      updateSlot(uploadType, {
        status: "uploading",
        fileName: file.name,
        progress: 0,
        error: null,
      });

      try {
        // Step 1: Get presigned URL
        const presignRes = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId,
            fileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
            uploadType,
          }),
        });

        if (!presignRes.ok) {
          const body = await presignRes.json().catch(() => ({}));
          throw new Error(body.error || "Failed to prepare upload.");
        }

        const { uploadUrl, uploadId } = await presignRes.json();

        updateSlot(uploadType, { progress: 30 });

        // Step 2: Upload file to presigned URL
        const uploadRes = await new Promise<boolean>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              // Map upload progress to 30-80 range
              const pct = Math.round(30 + (e.loaded / e.total) * 50);
              updateSlot(uploadType, { progress: pct });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error("Upload failed. Please try again."));
            }
          });

          xhr.addEventListener("error", () =>
            reject(new Error("Upload failed. Please check your connection.")),
          );

          xhr.send(file);
        });

        updateSlot(uploadType, { status: "confirming", progress: 85 });

        // Step 3: Confirm upload
        const confirmRes = await fetch("/api/uploads/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
        });

        if (!confirmRes.ok) {
          throw new Error("Failed to confirm upload.");
        }

        updateSlot(uploadType, { status: "done", progress: 100 });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        updateSlot(uploadType, { status: "error", error: message, progress: 0 });
      }
    },
    [consultationId, updateSlot],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, uploadType: UploadType) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file, uploadType);
      }
      // Reset input so the same file can be re-selected if needed
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const handleContinue = () => {
    router.push(
      `/consultations/mounjaro/select-dose?consultation=${consultationId}`,
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Upload cards */}
      {UPLOAD_SLOTS.map((slot, idx) => {
        const state = slots[slot.type];
        const isDone = state.status === "done";
        const isUploading =
          state.status === "uploading" || state.status === "confirming";
        const isError = state.status === "error";

        return (
          <div
            key={slot.type}
            className={cn(
              "relative overflow-hidden rounded-[16px] border-2 bg-white p-6 transition-colors",
              isDone
                ? "border-roots-green"
                : isError
                  ? "border-red-300"
                  : "border-dashed border-roots-green/20",
            )}
          >
            {/* Progress bar (background fill) */}
            {isUploading && (
              <div
                className="absolute inset-y-0 left-0 bg-roots-green/5 transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            )}

            <div className="relative flex items-start gap-4">
              {/* Icon / status indicator */}
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]",
                  isDone
                    ? "bg-roots-green text-roots-cream"
                    : "bg-roots-green/10 text-roots-green",
                )}
              >
                {isDone ? (
                  // Checkmark
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isUploading ? (
                  // Spinner
                  <svg
                    className="h-6 w-6 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  // Camera / upload icon
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                    />
                  </svg>
                )}
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-roots-navy">
                  {slot.label}
                </p>
                <p className="mt-0.5 text-sm text-roots-navy/60">
                  {slot.description}
                </p>

                {/* File name on success */}
                {isDone && state.fileName && (
                  <p className="mt-2 text-sm font-medium text-roots-green">
                    {state.fileName}
                  </p>
                )}

                {/* Uploading state */}
                {isUploading && (
                  <p className="mt-2 text-sm text-roots-navy/60">
                    Uploading{state.fileName ? ` ${state.fileName}` : ""}...
                  </p>
                )}

                {/* Error message */}
                {isError && state.error && (
                  <p className="mt-2 text-sm text-red-600">{state.error}</p>
                )}
              </div>

              {/* Upload / replace button */}
              <div className="shrink-0">
                <input
                  ref={(el) => {
                    fileInputRefs.current[idx] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleInputChange(e, slot.type)}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRefs.current[idx]?.click()}
                  className={cn(
                    "rounded-[10px] px-4 py-2 text-sm font-medium transition-colors",
                    isDone
                      ? "bg-roots-green/10 text-roots-green hover:bg-roots-green/20"
                      : isUploading
                        ? "cursor-not-allowed bg-roots-green/5 text-roots-navy/40"
                        : "bg-roots-green text-roots-cream hover:bg-roots-navy",
                  )}
                >
                  {isDone ? "Replace" : isUploading ? "Uploading..." : "Choose File"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Continue button */}
      <div className="pt-4">
        <Button
          variant="secondary"
          disabled={!allDone || anyUploading}
          onClick={handleContinue}
          className="w-full"
        >
          Continue
        </Button>
      </div>

      {/* Skip link */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleContinue}
          className="text-sm text-roots-navy/50 underline underline-offset-2 transition-colors hover:text-roots-navy/70"
        >
          Skip for now — your prescriber can request photos later
        </button>
      </div>
    </div>
  );
}
