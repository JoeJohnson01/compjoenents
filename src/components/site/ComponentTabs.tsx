import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ComponentProp } from "../types";

interface ComponentTabsProps {
  propsList: ComponentProp[];
  componentCode: string;
  installCommand: string;
  slug: string;
  aboutContent: React.ReactNode;
  propsContent: React.ReactNode;
  codeContent: React.ReactNode;
}

export function ComponentTabs({
  installCommand,
  aboutContent,
  propsContent,
  codeContent,
}: ComponentTabsProps) {
  const [activeTab, setActiveTab] = React.useState("about");

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof (window as any).Prism !== "undefined"
    ) {
      setTimeout(() => {
        (window as any).Prism.highlightAll();
      }, 10);
    }
  }, [activeTab]);

  return (
    <div className="mb-8">
      <Tabs
        defaultValue="about"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="prose mdx-content">{aboutContent}</div>
        </TabsContent>

        <TabsContent value="props">{propsContent}</TabsContent>

        <TabsContent value="code">{codeContent}</TabsContent>
      </Tabs>
    </div>
  );
}
