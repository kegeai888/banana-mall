import type { GeneratedContent } from "@/stores/useAppStore";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_IPC__" in window;

/**
 * Export generated content to files
 */
export async function exportContent(
  content: GeneratedContent,
  exportPath?: string
): Promise<void> {
  if (isTauri()) {
    await exportTauri(content, exportPath);
  } else {
    await exportWeb(content);
  }
}

/**
 * Export for Tauri (desktop)
 */
async function exportTauri(
  content: GeneratedContent,
  exportPath?: string
): Promise<void> {
  const { writeTextFile, writeBinaryFile, createDir } = await import(
    "@tauri-apps/plugin-fs"
  );
  const { open } = await import("@tauri-apps/plugin-dialog");

  // Get export directory
  let targetDir = exportPath;
  if (!targetDir) {
    const selected = await open({
      directory: true,
      title: "选择导出目录",
    });
    if (!selected || Array.isArray(selected)) {
      throw new Error("未选择导出目录");
    }
    targetDir = selected;
  }

  // Create timestamped folder
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const folderName = `banana-mall-export-${timestamp}`;
  const exportDir = `${targetDir}/${folderName}`;
  await createDir(exportDir, { recursive: true });

  // Export JSON content
  const jsonContent = {
    product: {
      category: content.product.category,
      tags: content.product.tags,
    },
    platform: content.platform,
    style: content.style,
    texts: content.texts,
    detailPage: content.detailPage,
  };
  const jsonPath = `${exportDir}/content.json`;
  await writeTextFile(jsonPath, JSON.stringify(jsonContent, null, 2));

  // Export Markdown
  const markdown = generateMarkdown(content);
  const mdPath = `${exportDir}/detail.md`;
  await writeTextFile(mdPath, markdown);

  // Export images
  for (let i = 0; i < content.images.length; i++) {
    const image = content.images[i];
    const imageData = await fetch(image.url).then((r) => r.arrayBuffer());
    const extension = image.type === "main" ? "main" : "detail";
    const imagePath = `${exportDir}/${i + 1}_${extension}_${image.id}.png`;
    await writeBinaryFile(imagePath, new Uint8Array(imageData));
  }

  alert(`导出成功！文件保存在：${exportDir}`);
}

/**
 * Export for Web (browser download)
 */
async function exportWeb(content: GeneratedContent): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Export JSON
  const jsonContent = {
    product: {
      category: content.product.category,
      tags: content.product.tags,
    },
    platform: content.platform,
    style: content.style,
    texts: content.texts,
    detailPage: content.detailPage,
  };
  downloadFile(
    JSON.stringify(jsonContent, null, 2),
    `${timestamp}_content.json`,
    "application/json"
  );

  // Export Markdown
  const markdown = generateMarkdown(content);
  downloadFile(markdown, `${timestamp}_detail.md`, "text/markdown");

  // Export images
  for (let i = 0; i < content.images.length; i++) {
    const image = content.images[i];
    const response = await fetch(image.url);
    const blob = await response.blob();
    const extension = image.type === "main" ? "main" : "detail";
    downloadBlob(blob, `${timestamp}_${i + 1}_${extension}_${image.id}.png`);
  }

  alert("导出成功！文件已开始下载");
}

/**
 * Generate Markdown from detail page content
 */
function generateMarkdown(content: GeneratedContent): string {
  const { texts, detailPage } = content;
  let md = `# ${texts.title}\n\n`;
  md += `${texts.description}\n\n`;

  // Buy Box
  if (detailPage.buyBox) {
    md += `## 商品信息\n\n`;
    md += `**价格**: ${detailPage.buyBox.price}\n\n`;
    if (detailPage.buyBox.originalPrice) {
      md += `**原价**: ${detailPage.buyBox.originalPrice}\n\n`;
    }
  }

  // Value Proposition
  if (detailPage.valueProposition) {
    md += `## 产品卖点\n\n`;
    if (detailPage.valueProposition.painPoints) {
      md += `### 用户痛点\n\n`;
      detailPage.valueProposition.painPoints.forEach(
        (point: string) => (md += `- ${point}\n`)
      );
      md += `\n`;
    }
    if (detailPage.valueProposition.solutions) {
      md += `### 解决方案\n\n`;
      detailPage.valueProposition.solutions.forEach(
        (solution: string) => (md += `- ${solution}\n`)
      );
      md += `\n`;
    }
  }

  // Social Proof
  if (detailPage.socialProof) {
    md += `## 用户评价\n\n`;
    if (detailPage.socialProof.reviews) {
      detailPage.socialProof.reviews.forEach((review: { text: string; rating: number }) => {
        md += `**${"⭐".repeat(review.rating)}** ${review.text}\n\n`;
      });
    }
  }

  // Service Guarantee
  if (detailPage.serviceGuarantee) {
    md += `## 服务保障\n\n`;
    if (detailPage.serviceGuarantee.shipping) {
      md += `**物流**: ${detailPage.serviceGuarantee.shipping}\n\n`;
    }
    if (detailPage.serviceGuarantee.returnPolicy) {
      md += `**退换货**: ${detailPage.serviceGuarantee.returnPolicy}\n\n`;
    }
    if (detailPage.serviceGuarantee.faq) {
      md += `### 常见问题\n\n`;
      detailPage.serviceGuarantee.faq.forEach(
        (faq: { question: string; answer: string }) => {
          md += `**Q**: ${faq.question}\n\n`;
          md += `**A**: ${faq.answer}\n\n`;
        }
      );
    }
  }

  // Specifications
  if (texts.specifications && texts.specifications.length > 0) {
    md += `## 商品规格\n\n`;
    texts.specifications.forEach((spec: string) => {
      md += `- ${spec}\n`;
    });
  }

  return md;
}

/**
 * Download file helper for web
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
