import type { City } from '@/data/types';

/** Map budget_tier enum to a human label. */
export function mapBudgetTier(tier: City['budgetTier']): string {
  switch (tier) {
    case 'budget': return 'Budget-friendly';
    case 'moderate': return 'Moderate';
    case 'premium': return 'Premium';
    default: return 'Varies';
  }
}

/** Map walkability enum to a human label. */
export function mapWalkability(w: City['walkability']): string {
  switch (w) {
    case 'very_walkable': return 'Very walkable';
    case 'walkable': return 'Walkable';
    case 'somewhat_walkable': return 'Somewhat walkable';
    case 'car_needed': return 'Car recommended';
    default: return 'Varies';
  }
}

/** Map transit_ease enum to a human label. */
export function mapTransitEase(t: City['transitEase']): string {
  switch (t) {
    case 'excellent': return 'Excellent transit';
    case 'good': return 'Good transit';
    case 'limited': return 'Limited transit';
    case 'minimal': return 'Minimal transit';
    default: return 'Varies';
  }
}
