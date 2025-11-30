
import { Startup } from '../types';

export function getArchivableStartups(startups: Startup[]): string[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

  return startups
    .filter(s => new Date(s.created_at) < cutoff)
    .map(s => s.id);
}
