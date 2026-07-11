/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Google Translate request adapted from the official Vencord Translate plugin
 * (c) 2023 Vendicated and contributors, GPL-3.0-or-later
 */

import { classNameFactory } from "@utils/css";

import { settings } from "./settings";

export const cl = classNameFactory("vc-livetrans-");

export interface TranslationValue {
    sourceCode: string;
    text: string;
}

interface GoogleData {
    translation: string;
    sourceLanguage: string;
}

const PROTECT_RE = /```[\s\S]*?```|`[^`\n]+`|https?:\/\/\S+|<a?:\w+:\d+>|<[@#][!&]?\d+>|<\/[\w -]+:\d+>|<t:-?\d+(?::[tTdDfFR])?>|@(?:everyone|here)/g;
const PLACEHOLDER_RE = /⟦\s*(\d+)\s*⟧/g;

export function protect(text: string) {
    const tokens: string[] = [];
    const masked = text.replace(PROTECT_RE, m => {
        tokens.push(m);
        return `⟦${tokens.length - 1}⟧`;
    });
    return { masked, tokens };
}

export function restore(text: string, tokens: string[]) {
    const used = new Set<number>();
    let out = text.replace(PLACEHOLDER_RE, (m, i) => {
        used.add(+i);
        return tokens[+i] ?? m;
    });

    const lost = tokens.filter((_, i) => !used.has(i));
    if (lost.length)
        out += (out.endsWith("\n") ? "" : " ") + lost.join(" ");

    return out;
}

export function hasTranslatableText(masked: string) {
    return /\p{L}/u.test(masked.replace(PLACEHOLDER_RE, ""));
}

export async function googleTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const url = "https://translate-pa.googleapis.com/v1/translate?" + new URLSearchParams({
        "params.client": "gtx",
        "dataTypes": "TRANSLATION",
        "key": "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA", //it's not mine LOL. 
        "query.sourceLanguage": sourceLang,
        "query.targetLanguage": targetLang,
        "query.text": text,
    });

    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Translation failed (${sourceLang} -> ${targetLang}): ${res.status} ${res.statusText}`);

    const { sourceLanguage, translation }: GoogleData = await res.json();

    return {
        sourceCode: sourceLanguage,
        text: translation
    };
}

export async function translateOutgoing(content: string, targetLang: string): Promise<string | null> {
    const { masked, tokens } = protect(content);
    if (!hasTranslatableText(masked)) return null;

    const trans = await googleTranslate(masked, "auto", targetLang);
    const restored = restore(trans.text, tokens);
    const sourceBase = trans.sourceCode.toLowerCase().split("-")[0];
    const targetBase = targetLang.toLowerCase().split("-")[0];
    if (sourceBase === targetBase || restored === content) return null;

    return restored;
}

const cache = new Map<string, { original: string; lang: string; value: TranslationValue | null; }>();
const CACHE_MAX = 1000;

const translationListeners = new Map<string, Set<() => void>>();
const allTranslationListeners = new Set<() => void>();

export function subscribeTranslation(id: string, cb: () => void) {
    let set = translationListeners.get(id);
    if (!set) translationListeners.set(id, set = new Set());
    set.add(cb);
    return () => {
        set.delete(cb);
        if (!set.size) translationListeners.delete(id);
    };
}

export function subscribeAnyTranslation(cb: () => void) {
    allTranslationListeners.add(cb);
    return () => void allTranslationListeners.delete(cb);
}

function cachePut(id: string, original: string, value: TranslationValue | null) {
    if (cache.size >= CACHE_MAX)
        cache.delete(cache.keys().next().value!);
    cache.set(id, { original, lang: settings.store.myLanguage, value });
    translationListeners.get(id)?.forEach(cb => cb());
    allTranslationListeners.forEach(cb => cb());
}

export function clearTranslationCache() {
    cache.clear();
    allTranslationListeners.forEach(cb => cb());
}

export function getCachedIncoming(id: string, content: string): TranslationValue | null | undefined {
    const hit = cache.get(id);
    return hit && hit.original === content && hit.lang === settings.store.myLanguage
        ? hit.value
        : undefined;
}

const MAX_CONCURRENT = 3;
let active = 0;
const waiters: (() => void)[] = [];

async function acquire() {
    while (active >= MAX_CONCURRENT)
        await new Promise<void>(r => waiters.push(r));
    active++;
}

function release() {
    active--;
    waiters.shift()?.();
}

const textCache = new Map<string, TranslationValue>();
const TEXT_CACHE_MAX = 500;

async function googleTranslateCached(masked: string, targetLang: string): Promise<TranslationValue> {
    const key = targetLang + "\0" + masked;
    const hit = textCache.get(key);
    if (hit) return hit;

    await acquire();
    try {
        const res = await googleTranslate(masked, "auto", targetLang);
        if (textCache.size >= TEXT_CACHE_MAX)
            textCache.delete(textCache.keys().next().value!);
        textCache.set(key, res);
        return res;
    } finally {
        release();
    }
}

export async function detectLanguage(text: string): Promise<string | null> {
    const { masked } = protect(text);
    if (!hasTranslatableText(masked)) return null;
    try {
        const res = await googleTranslateCached(masked, settings.store.myLanguage || "en");
        return res.sourceCode || null;
    } catch {
        return null;
    }
}

const pending = new Map<string, Promise<TranslationValue | null>>();

export function translateIncoming(id: string, content: string): Promise<TranslationValue | null> {
    if (!settings.store.myLanguage) return Promise.resolve(null);

    const cached = getCachedIncoming(id, content);
    if (cached !== undefined) return Promise.resolve(cached);

    let p = pending.get(id);
    if (!p) {
        p = doTranslateIncoming(id, content).finally(() => pending.delete(id));
        pending.set(id, p);
    }
    return p;
}

async function doTranslateIncoming(id: string, content: string): Promise<TranslationValue | null> {
    const { masked, tokens } = protect(content);
    if (!hasTranslatableText(masked)) {
        cachePut(id, content, null);
        return null;
    }

    let result: TranslationValue | null = null;
    try {
        const trans = await googleTranslateCached(masked, settings.store.myLanguage);
        const restored = restore(trans.text, tokens);

        if (trans.sourceCode !== settings.store.myLanguage && restored !== content)
            result = { sourceCode: trans.sourceCode, text: restored };
    } catch (e) {
        console.error("[LiveTranslator] incoming translation failed", e);
    }

    cachePut(id, content, result);
    return result;
}
