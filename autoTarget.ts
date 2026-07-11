/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageStore, UserStore } from "@webpack/common";

import { settings } from "./settings";
import { detectLanguage } from "./translator";

const SAMPLE_SIZE = 10;
const TTL = 10 * 60_000;

const channelLang = new Map<string, { lang: string; at: number; }>();
const inFlight = new Map<string, Promise<string>>();
const listeners = new Set<() => void>();

export function subscribeAutoTarget(cb: () => void) {
    listeners.add(cb);
    return () => void listeners.delete(cb);
}

export function peekAutoTarget(channelId: string): string | null {
    const hit = channelLang.get(channelId);
    return hit && Date.now() - hit.at < TTL ? hit.lang : null;
}

function sample<T>(arr: T[], n: number): T[] {
    const a = [...arr];
    const count = Math.min(n, a.length);
    for (let i = 0; i < count; i++) {
        const j = i + Math.floor(Math.random() * (a.length - i));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, count);
}

async function detectChannelLanguage(channelId: string): Promise<string | null> {
    const messages: any[] = MessageStore.getMessages(channelId)?.toArray?.() ?? [];
    const me = UserStore.getCurrentUser()?.id;

    const candidates = messages.filter(m =>
        m?.content?.trim()
        && m.author?.id !== me
        && !m.author?.bot
    );
    if (!candidates.length) return null;

    const votes = new Map<string, number>();
    await Promise.all(sample(candidates, SAMPLE_SIZE).map(async m => {
        const code = await detectLanguage(m.content);
        if (code) votes.set(code, (votes.get(code) ?? 0) + 1);
    }));

    let best: string | null = null;
    let bestCount = 0;
    for (const [code, count] of votes)
        if (count > bestCount) { best = code; bestCount = count; }

    return best;
}

export function getAutoTargetLanguage(channelId: string): Promise<string> {
    const hit = channelLang.get(channelId);
    if (hit && Date.now() - hit.at < TTL) return Promise.resolve(hit.lang);

    let p = inFlight.get(channelId);
    if (!p) {
        p = detectChannelLanguage(channelId)
            .then(lang => {
                if (lang) {
                    channelLang.set(channelId, { lang, at: Date.now() });
                    listeners.forEach(cb => cb());
                    return lang;
                }
                return settings.store.targetLanguage;
            })
            .finally(() => inFlight.delete(channelId));
        inFlight.set(channelId, p);
    }
    return p;
}

export function prefetchAutoTarget(channelId: string) {
    void getAutoTargetLanguage(channelId).catch(() => { });
}
