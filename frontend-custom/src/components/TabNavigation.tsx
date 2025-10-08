import { Code2, GraduationCap, Sparkles, Keyboard, BarChart3, Settings } from "lucide-react";

export type TabType = "assistant" | "learning" | "visual" | "shortcuts" | "analytics" | "settings";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "assistant" as TabType, icon: Code2, label: "Assistente" },
  { id: "learning" as TabType, icon: GraduationCap, label: "Aprender" },
  { id: "visual" as TabType, icon: Sparkles, label: "Visual" },
  { id: "shortcuts" as TabType, icon: Keyboard, label: "Atalhos" },
  { id: "analytics" as TabType, icon: BarChart3, label: "Stats" },
  { id: "settings" as TabType, icon: Settings, label: "Config" },
];

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full border-b border-border bg-background overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
      <div className="flex min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
