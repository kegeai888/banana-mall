import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function HistoryPage() {
  const { histories, setGeneratedContent, setCurrentStep, updateSettings } = useAppStore();

  const handleLoadHistory = (history: typeof histories[0]) => {
    setGeneratedContent(history);
    setCurrentStep("editing");
  };

  const handleDeleteHistory = async (id: string) => {
    const { store, histories: currentHistories } = useAppStore.getState();
    const updated = currentHistories.filter((h) => h.id !== id);
    useAppStore.setState({ histories: updated });
    if (store) {
      await store.set("histories", updated);
      await store.save();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("upload")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <h1 className="text-xl font-semibold">历史记录</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {histories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">暂无历史记录</p>
              <Button
                onClick={() => setCurrentStep("upload")}
                className="mt-4"
                variant="outline"
              >
                开始创建
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {histories.map((history) => (
              <Card key={history.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {history.texts.title}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(history.createdAt), "yyyy-MM-dd HH:mm")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteHistory(history.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.images.length > 0 && (
                      <img
                        src={history.images[0].url}
                        alt={history.texts.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="text-sm text-muted-foreground">
                      <p>平台: {history.platform === "amazon" ? "Amazon" : history.platform === "taobao" ? "淘宝" : "京东"}</p>
                      <p>风格: {history.style === "minimal" ? "极简" : history.style === "cyber" ? "赛博" : "国潮"}</p>
                      <p>图片: {history.images.length} 张</p>
                    </div>
                    <Button
                      onClick={() => handleLoadHistory(history)}
                      className="w-full"
                      variant="outline"
                    >
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
