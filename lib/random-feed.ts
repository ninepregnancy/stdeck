
import { Startup } from '../types';

export function pickWinner(candidates: any[]): any | null {
  if (!candidates || candidates.length === 0) return null;

  const now = new Date().getTime();
  const weightedPool: any[] = [];
  
  // Sort candidates by creation date (descending) to find the "newest" ones
  const sortedByAge = [...candidates].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Identify bonus eligible startups (First 3 newest that are < 48h old)
  const bonusEligibleIds = new Set<string>();
  let count = 0;
  for (const s of sortedByAge) {
    const ageHours = (now - new Date(s.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours < 48) {
       bonusEligibleIds.add(s.id);
       count++;
       if (count >= 3) break; 
    }
  }

  // Build Weighted Pool
  candidates.forEach(startup => {
    // Base weight = 1 ticket
    weightedPool.push(startup);
    
    // Bonus weight = +1 ticket (Total x2 probability)
    if (bonusEligibleIds.has(startup.id)) {
      weightedPool.push(startup);
    }
  });

  // Pick random from pool
  const randomIndex = Math.floor(Math.random() * weightedPool.length);
  return weightedPool[randomIndex];
}
