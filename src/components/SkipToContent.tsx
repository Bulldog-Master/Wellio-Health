import { Button } from "./ui/button";

export const SkipToContent = () => {
  const skipToMain = () => {
    const main = document.querySelector('main');
    if (main) {
      main.focus();
      main.scrollIntoView();
    }
  };

  return (
    <Button
      onClick={skipToMain}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50"
      variant="outline"
    >
      Skip to main content
    </Button>
  );
};
