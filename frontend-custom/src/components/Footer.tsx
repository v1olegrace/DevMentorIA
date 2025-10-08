import { Settings, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card/30 backdrop-blur-sm mt-auto">
      <div className="flex items-center justify-between px-3 py-1.5 text-[10px] text-muted-foreground">
        <button className="flex items-center gap-1 hover:text-foreground transition-smooth">
          <Settings className="w-2.5 h-2.5" />
          <span>Config</span>
        </button>
        <div className="flex items-center gap-1">
          <Heart className="w-2.5 h-2.5 text-primary fill-primary" />
          <span>DevMentorAI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
