import { useEffect } from "react";
import { useTauriStore } from "@/hooks/useTauriStore";
import { useAppStore } from "@/stores/useAppStore";
import { useTheme } from "@/hooks/useTheme";
import { setLanguage } from "@/lib/i18n";
import { UploadPage } from "@/pages/UploadPage";
import { ConfigPage } from "@/pages/ConfigPage";
import { GeneratingPage } from "@/pages/GeneratingPage";
import { EditorPage } from "@/pages/EditorPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { Button } from "@/components/ui/button";
import { Settings, History } from "lucide-react";

function App() {
  // Initialize Tauri store on mount
  useTauriStore();
  const { currentStep, setCurrentStep, settings } = useAppStore();
  const { setTheme } = useTheme();

  // Initialize language and theme from settings
  useEffect(() => {
    if (settings.selectedLanguage) {
      setLanguage(settings.selectedLanguage);
    }
    if (settings.theme) {
      setTheme(settings.theme);
    }
  }, [settings.selectedLanguage, settings.theme, setTheme]);

  // Render page based on current step
  const renderPage = () => {
    switch (currentStep) {
      case "upload":
        return <UploadPage />;
      case "config":
        return <ConfigPage />;
      case "generating":
        return <GeneratingPage />;
      case "editing":
        return <EditorPage />;
      case "settings":
        return <SettingsPage />;
      case "history":
        return <HistoryPage />;
      default:
        return <UploadPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Settings Button */}
      {currentStep !== "generating" &&
        currentStep !== "settings" &&
        currentStep !== "history" && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("history")}
              className="bg-background/80 backdrop-blur-sm border"
              title="历史记录"
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep("settings")}
              className="bg-background/80 backdrop-blur-sm border"
              title="设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}

      {/* Main Content */}
      <div className="flex-1">{renderPage()}</div>

      {/* Brand Footer */}
      <footer className="border-t bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="font-medium">
            灵矩绘境 <span className="text-[10px] uppercase tracking-wide">MatrixInspire</span>
          </div>
          <div className="text-center sm:text-right">
            <span>让灵感落地，让回忆有形</span>
            <span className="mx-2">·</span>
            <span className="font-mono">mxinspire</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
