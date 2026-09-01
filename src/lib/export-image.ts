import { toJpeg } from "html-to-image";
import { toast } from "sonner";

export async function exportElementAsJpeg(
  elementId: string,
  fileName = "fc-bbff-card.jpg",
  quality = 0.95
) {
  const node = document.getElementById(elementId);
  if (!node) {
    toast.error("Card element not found for export");
    return;
  }

  const toastId = toast.loading("Generating high-resolution card image...");

  try {
    // Convert DOM element to high-res JPEG data URL
    const dataUrl = await toJpeg(node, {
      quality,
      backgroundColor: "#0a0a0a",
      pixelRatio: 2, // 2x retina clarity
      cacheBust: true,
      filter: (domNode: HTMLElement) => {
        // Exclude elements marked with data-no-export
        if (domNode.classList && domNode.classList.contains("no-export")) {
          return false;
        }
        return true;
      },
    });

    // Create trigger anchor to save
    const link = document.createElement("a");
    link.download = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? fileName : `${fileName}.jpg`;
    link.href = dataUrl;
    link.click();

    toast.success("Card downloaded successfully as JPG!", { id: toastId });
  } catch (error) {
    console.error("Failed to export image:", error);
    toast.error("Failed to generate image. Please try again.", { id: toastId });
  }
}
