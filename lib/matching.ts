import type { LokaUserProfile } from '@/types/loka';

function normalizeLocation(text: string) {
    return text.trim().toLowerCase();
}

function parseISODate(date?: string) {
    if (!date) return null;
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? null : d;
}

function datesOverlap(aStart?: string, aEnd?: string, bStart?: string, bEnd?: string) {
    const as = parseISODate(aStart);
    const ae = parseISODate(aEnd);
    const bs = parseISODate(bStart);
    const be = parseISODate(bEnd);
    if (!as || !ae || !bs || !be) return null;

    const start = Math.max(as.getTime(), bs.getTime());
    const end = Math.min(ae.getTime(), be.getTime());
    return end >= start;
}

function sharedInterestsPercent(a: LokaUserProfile, b: LokaUserProfile) {
    const aSet = new Set(a.interests);
    const shared = b.interests.filter((t) => aSet.has(t));
    const denom = Math.max(a.interests.length, b.interests.length, 1);
    return shared.length / denom;
}

function locationSimilarity(a: LokaUserProfile, b: LokaUserProfile) {
    const la = normalizeLocation(a.locationText);
    const lb = normalizeLocation(b.locationText);
    if (!la || !lb) return 0;
    if (la === lb) return 1;
    if (la.includes(lb) || lb.includes(la)) return 0.7;
    return 0;
}

export function computeMatchPercent(me: LokaUserProfile, other: LokaUserProfile) {
    // Lightweight client-side scoring for MVP.
    // For production, move this server-side and incorporate real geolocation.
    const interests = sharedInterestsPercent(me, other); // 0..1
    const style = me.travelStyle === other.travelStyle ? 1 : 0;
    const dates = datesOverlap(
        me.travelStartDate,
        me.travelEndDate,
        other.travelStartDate,
        other.travelEndDate
    );
    const dateScore = dates === null ? 0.25 : dates ? 1 : 0;
    const location = locationSimilarity(me, other);

    const weighted = interests * 0.5 + dateScore * 0.2 + location * 0.15 + style * 0.15;
    return Math.max(0, Math.min(100, Math.round(weighted * 100)));
}
