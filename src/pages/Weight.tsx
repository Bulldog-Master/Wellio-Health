import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Weight = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Weight Tracking</h1>
        <p className="text-muted-foreground">Safari test - if you see this, navigation works without Layout</p>
      </div>
    </div>
  );
};

export default Weight;
