import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, ArrowLeft } from "lucide-react";
import { Platform, Style } from "@/stores/useAppStore";

export function SettingsPage() {
  const { settings, updateSettings, setCurrentStep } = useAppStore();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      alert("设置已保存");
    } catch (err) {
      console.error("Save error:", err);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep("upload")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              设置
            </h1>
            <p className="text-muted-foreground mt-1">
              配置 API 和偏好设置
            </p>
          </div>
        </div>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API 配置</CardTitle>
            <CardDescription>
              配置 NanoBanana API 密钥和服务器地址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                placeholder="输入你的 API Key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseURL">Base URL</Label>
              <Input
                id="baseURL"
                value={formData.baseURL}
                onChange={(e) =>
                  setFormData({ ...formData, baseURL: e.target.value })
                }
                placeholder="https://api.nanobanana.com"
              />
              <p className="text-xs text-muted-foreground">
                支持自定义代理地址，默认: https://api.nanobanana.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>偏好设置</CardTitle>
            <CardDescription>
              设置默认平台和风格
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultPlatform">默认平台</Label>
              <Select
                value={formData.defaultPlatform}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    defaultPlatform: value as Platform,
                  })
                }
              >
                <SelectTrigger id="defaultPlatform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="taobao">淘宝</SelectItem>
                  <SelectItem value="jd">京东</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultStyle">默认风格</Label>
              <Select
                value={formData.defaultStyle}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    defaultStyle: value as Style,
                  })
                }
              >
                <SelectTrigger id="defaultStyle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">极简风格</SelectItem>
                  <SelectItem value="cyber">赛博风格</SelectItem>
                  <SelectItem value="chinese">国潮风格</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setFormData(settings)}>
            重置
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "保存中..." : "保存设置"}
          </Button>
        </div>
      </div>
    </div>
  );
}
