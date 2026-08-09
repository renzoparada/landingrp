import type { VideoSource } from "@/lib/types";

interface VideoEmbedProps {
  source: VideoSource;
  url: string;
  className?: string;
}

function toEmbedUrl(source: VideoSource, url: string): string | null {
  if (!url) return null;
  if (source === "youtube") {
    // Accept both watch?v= and already-embed URLs.
    if (url.includes("/embed/")) return url;
    const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
    const id = idMatch?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  if (source === "vimeo") {
    if (url.includes("player.vimeo.com")) return url;
    const idMatch = url.match(/vimeo\.com\/(\d+)/);
    const id = idMatch?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }
  return url;
}

export default function VideoEmbed({ source, url, className }: VideoEmbedProps) {
  if (source === "none" || !url) return null;

  if (source === "mp4") {
    return (
      <video
        className={className}
        src={url}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  const embedUrl = toEmbedUrl(source, url);
  if (!embedUrl) return null;

  return (
    <iframe
      className={className}
      src={embedUrl}
      title="Video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
