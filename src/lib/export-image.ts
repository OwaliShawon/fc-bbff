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

  const toastId = toast.loading("Generating high-res card image...");

  try {
    const width = Math.round(node.getBoundingClientRect().width || node.offsetWidth);
    const height = Math.round(node.getBoundingClientRect().height || node.offsetHeight);

    // Convert DOM element to crisp, perfectly cropped JPEG
    const dataUrl = await toJpeg(node, {
      quality: 0.98,
      backgroundColor: "#09090b",
      width,
      height,
      style: {
        margin: "0",
        marginLeft: "0",
        marginRight: "0",
        marginTop: "0",
        marginBottom: "0",
        transform: "none",
        left: "0",
        top: "0",
        position: "relative",
        width: `${width}px`,
        height: `${height}px`,
      },
      pixelRatio: 2,
      cacheBust: false,
      skipFonts: true,
      filter: (domNode: HTMLElement) => {
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

    toast.success("Card downloaded successfully (JPG)!", { id: toastId });
  } catch (error) {
    console.error("Failed primary export, attempting fallback:", error);
    try {
      const width = Math.round(node.getBoundingClientRect().width || node.offsetWidth);
      const height = Math.round(node.getBoundingClientRect().height || node.offsetHeight);

      // Fallback: 1x ratio for max compatibility
      const fallbackUrl = await toJpeg(node, {
        quality: 0.9,
        backgroundColor: "#0a0a0a",
        width,
        height,
        style: {
          margin: "0",
          marginLeft: "0",
          marginRight: "0",
          marginTop: "0",
          marginBottom: "0",
          transform: "none",
          left: "0",
          top: "0",
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
        },
        skipFonts: true,
      });
      const link = document.createElement("a");
      link.download = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? fileName : `${fileName}.jpg`;
      link.href = fallbackUrl;
      link.click();
      toast.success("Card downloaded successfully (JPG)!", { id: toastId });
    } catch (fallbackErr) {
      console.error("Failed to export image:", fallbackErr);
      toast.error("Failed to generate image. Please try again.", { id: toastId });
    }
  }
}
