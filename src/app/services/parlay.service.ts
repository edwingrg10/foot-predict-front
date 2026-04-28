import { Injectable, signal, computed } from '@angular/core';
import { ParlayPick } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ParlayService {
  picks = signal<ParlayPick[]>([]);
  isOpen = signal(false);
  stake = signal<number>(10);

  combinedOdds = computed(() => {
    const ps = this.picks();
    if (!ps.length) return 1;
    return Math.round(ps.reduce((acc, p) => acc * p.estimatedOdds, 1) * 100) / 100;
  });

  combinedProb = computed(() => {
    const ps = this.picks();
    if (!ps.length) return 0;
    return ps.reduce((acc, p) => acc * p.probability, 1);
  });

  potentialReturn = computed(() =>
    Math.round(this.stake() * this.combinedOdds() * 100) / 100
  );

  hasPick(matchId: number, marketKey: string): boolean {
    return this.picks().some(p => p.matchId === matchId && p.marketKey === marketKey);
  }

  togglePick(pick: ParlayPick): void {
    if (this.hasPick(pick.matchId, pick.marketKey)) {
      this.removePick(pick.matchId, pick.marketKey);
    } else {
      this.picks.update(ps => [...ps, pick]);
      this.isOpen.set(true);
    }
  }

  removePick(matchId: number, marketKey: string): void {
    this.picks.update(ps =>
      ps.filter(p => !(p.matchId === matchId && p.marketKey === marketKey))
    );
  }

  clear(): void {
    this.picks.set([]);
  }

  static oddsFromProb(prob: number): number {
    if (prob <= 0.05) return 20;
    return Math.round((1 / prob) * 0.92 * 100) / 100;
  }
}
