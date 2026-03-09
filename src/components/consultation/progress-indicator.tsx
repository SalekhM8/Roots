import { cn } from "@/lib/utils";

const STEP_LABELS = ["Process", "Medication", "Medical", "Safety"] as const;

interface ProgressIndicatorProps {
  currentStep: number; // 1-4
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-center">
        {STEP_LABELS.map((label, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={label} className="flex items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200",
                    (isCompleted || isActive) && "bg-roots-green text-white",
                    isFuture && "border-2 border-roots-green/20 text-roots-navy/40",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    (isActive || isCompleted) && "text-roots-green",
                    isFuture && "text-roots-navy/40",
                  )}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-6 h-0.5 w-10 sm:mx-4 sm:w-16",
                    stepNumber < currentStep ? "bg-roots-green" : "bg-roots-green/15",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
