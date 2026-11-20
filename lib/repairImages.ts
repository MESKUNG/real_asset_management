export const MAX_REPAIR_IMAGES = 3;
export const MAX_REPAIR_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_REPAIR_IMAGE_DIMENSION = 1024;
const repairSampleCount = 12;

export function getRepairSampleImage(requestId: string): string {
  let hash = 2166136261;
  for (let index = 0; index < requestId.length; index += 1) {
    hash = Math.imul(hash ^ requestId.charCodeAt(index), 16777619);
  }
  const imageNumber = ((hash >>> 0) % repairSampleCount) + 1;
  return `/repair-samples/sample-${String(imageNumber).padStart(2, "0")}.jpg`;
}

export function prepareRepairImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("รองรับไฟล์รูปภาพเท่านั้น"));
  }
  if (file.size > MAX_REPAIR_IMAGE_SIZE) {
    return Promise.reject(new Error("ไฟล์ภาพต้องมีขนาดไม่เกิน 10 MB"));
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      try {
        const scale = Math.min(
          1,
          MAX_REPAIR_IMAGE_DIMENSION /
            Math.max(image.naturalWidth, image.naturalHeight),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองอีกครั้ง");

        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error("ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองอีกครั้ง"),
        );
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("ไม่สามารถอ่านไฟล์ภาพได้ กรุณาเลือกไฟล์อื่น"));
    };

    image.src = objectUrl;
  });
}
