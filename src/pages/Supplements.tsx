import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, ListChecks, TrendingUp } from "lucide-react";

const Supplements = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Pill className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Supplements</h1>
          <p className="text-muted-foreground">Track and discover supplements</p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Personal List
          </TabsTrigger>
          <TabsTrigger value="popular" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">My Supplements</h3>
            <div className="text-center text-muted-foreground py-8">
              <p>No supplements added yet.</p>
              <p className="text-sm mt-2">Start adding supplements to track your intake.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4 mt-6">
          <Card className="p-6 bg-gradient-card shadow-md">
            <h3 className="text-lg font-semibold mb-4">Popular Supplements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Vitamin D3", description: "Supports bone health and immunity", category: "Vitamin" },
                { name: "Omega-3 Fish Oil", description: "Heart and brain health support", category: "Essential Fatty Acid" },
                { name: "Multivitamin", description: "Daily nutritional foundation", category: "Vitamin Complex" },
                { name: "Protein Powder", description: "Muscle recovery and growth", category: "Protein" },
                { name: "Magnesium", description: "Sleep and muscle function", category: "Mineral" },
                { name: "Vitamin B Complex", description: "Energy and metabolism support", category: "Vitamin" },
              ].map((supplement, index) => (
                <div key={index} className="p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-all cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Pill className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{supplement.name}</h4>
                      <p className="text-sm text-muted-foreground">{supplement.description}</p>
                      <span className="text-xs text-primary font-medium mt-1 inline-block">
                        {supplement.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Supplements;
