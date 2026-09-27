export function formatSecondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatViewCount(views?: number): string {
  if (!views && views !== 0) return '0 lượt xem';
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M lượt xem`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K lượt xem`;
  }
  return `${views} lượt xem`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getCleanServerName(name: string): string {
  return name.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getValidImageUrl(url?: unknown): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return '';
}

