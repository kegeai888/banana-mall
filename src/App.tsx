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
import { Settings, History, Moon, Sun } from "lucide-react";

function App() {
  // Initialize Tauri store on mount
  useTauriStore();
  const { currentStep, setCurrentStep, settings, updateSettings } =
    useAppStore();
  const { resolvedTheme, setTheme } = useTheme();

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
    <div className="h-full bg-background flex flex-col overflow-hidden">
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
      <div className="flex-1 overflow-auto">{renderPage()}</div>

      {/* Theme Toggle Button - Bottom Left (above footer) */}
      <div className="fixed bottom-16 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            const newTheme = resolvedTheme === "dark" ? "light" : "dark";
            setTheme(newTheme);
            // Also update settings
            await updateSettings({ theme: newTheme });
          }}
          className="bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-background"
          title={resolvedTheme === "dark" ? "切换到浅色模式" : "切换到暗黑模式"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Brand Footer */}
      <footer className="flex-shrink-0 border-t bg-card/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="font-medium">
            <a
              href="https://api.kegeai.top/register?aff=DjMp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              国际API中转站
            </a>
          </div>
          <div className="text-center sm:text-right">
            <span>让灵感落地，让回忆有形</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
