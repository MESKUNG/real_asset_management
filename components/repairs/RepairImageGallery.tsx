import Image from "next/image";

type RepairImageGalleryProps = {
  images?: readonly string[];
  label: string;
  isDark?: boolean;
};

export default function RepairImageGallery({
  images,
  label,
  isDark = false,
}: RepairImageGalleryProps) {
  if (!images?.length) return null;

  return (
    <section className="sm:col-span-2">
      <h3 className={`mb-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {label}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.slice(0, 3).map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`overflow-hidden rounded-md border ${isDark ? "border-slate-700" : "border-slate-200"}`}
          >
            <Image
              src={src}
              alt={`${label} ${index + 1}`}
              width={320}
              height={220}
              unoptimized
              className="h-28 w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
