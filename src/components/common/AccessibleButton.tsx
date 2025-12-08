import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel: string;
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ ariaLabel, loading, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">{loadingText || "Loading..."}</span>
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";
