import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce';
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

const animationClasses = {
  fadeIn: 'animate-in fade-in',
  slideUp: 'animate-in slide-in-from-bottom-4',
  slideDown: 'animate-in slide-in-from-top-4',
  slideLeft: 'animate-in slide-in-from-right-4',
  slideRight: 'animate-in slide-in-from-left-4',
  scale: 'animate-in zoom-in-95',
  bounce: 'animate-bounce',
};

export const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ className, animation = 'fadeIn', delay = 0, duration = 300, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          animationClasses[animation],
          'fill-mode-both',
          className
        )}
        style={{
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedContainer.displayName = "AnimatedContainer";

// Staggered list animation
interface StaggeredListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: AnimatedContainerProps['animation'];
}

export const StaggeredList = React.forwardRef<HTMLDivElement, StaggeredListProps>(
  ({ children, staggerDelay = 50, animation = 'slideUp', className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {React.Children.map(children, (child, index) => (
          <AnimatedContainer animation={animation} delay={index * staggerDelay}>
            {child}
          </AnimatedContainer>
        ))}
      </div>
    );
  }
);

StaggeredList.displayName = "StaggeredList";

// Hover scale effect wrapper
interface HoverScaleProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: number;
  children: React.ReactNode;
}

export const HoverScale = React.forwardRef<HTMLDivElement, HoverScaleProps>(
  ({ scale = 1.02, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'transition-transform duration-200 ease-out',
          className
        )}
        style={{
          '--hover-scale': scale,
          ...style,
        } as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = `scale(${scale})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HoverScale.displayName = "HoverScale";

// Pulse animation for loading states
export const Pulse = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('animate-pulse', className)} {...props} />
);

// Shimmer effect for skeleton loading
export const Shimmer = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative overflow-hidden bg-muted',
      'before:absolute before:inset-0',
      'before:translate-x-[-100%]',
      'before:animate-[shimmer_2s_infinite]',
      'before:bg-gradient-to-r',
      'before:from-transparent before:via-white/20 before:to-transparent',
      className
    )}
    {...props}
  />
);
