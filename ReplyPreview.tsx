/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Message } from "@vencord/discord-types";
import { MessageActions, ReactDOM, useEffect, useLayoutEffect, useReducer, useRef, useState } from "@webpack/common";

import { langName, t } from "./i18n";
import { getChannelMode, settings, subscribeModeChange, TranslateMode } from "./settings";
import { cl, getCachedIncoming, translateIncoming, TranslationValue } from "./translator";

const enum ReferencedMessageState {
    LOADED = 0
}

interface Props {
    referencedMessage: { state: ReferencedMessageState; message?: Message; };
    baseMessage: Message;
}

const ORIGINAL_REPLY_CLASS = cl("reply-original");

function comparableText(text: string) {
    return text
        .replace(/[​-‍﻿]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase();
}

function messageTextScore(candidate: string, content: string) {
    const text = comparableText(candidate);
    const message = comparableText(content);
    if (!text || !message) return 0;
    if (text === message) return 2;

    const plainMessage = comparableText(content.replace(/[*_~`|]/g, ""));
    if (text === plainMessage) return 2;

    const expected = text.startsWith(message) || message.startsWith(text)
        ? message
        : text.startsWith(plainMessage) || plainMessage.startsWith(text)
            ? plainMessage
            : null;
    if (!expected) return 0;

    const ratio = Math.min(text.length, expected.length) / Math.max(text.length, expected.length);
    return Math.min(text.length, expected.length) >= 12 && ratio >= 0.5 ? ratio : 0;
}

function findQuoteByText(el: HTMLElement, content: string): HTMLElement | null {
    let root = el.parentElement;
    let original: HTMLElement | undefined;

    for (let depth = 0; root && depth < 5; depth++, root = root.parentElement) {
        const scored = Array.from(root.querySelectorAll<HTMLElement>("span, div"))
            .filter(node => !node.contains(el) && !el.contains(node))
            .map(node => ({ node, score: messageTextScore(node.textContent ?? "", content) }))
            .filter(match => match.score > 0);

        const bestScore = Math.max(0, ...scored.map(match => match.score));
        const matches = scored.filter(match => match.score === bestScore).map(match => match.node);

        original = matches.findLast(node =>
            !Array.from(node.querySelectorAll<HTMLElement>("span, div"))
                .some(child => messageTextScore(child.textContent ?? "", content) === bestScore)
        ) ?? matches.at(-1);

        if (original) break;
        if (root.tagName === "LI") break;
    }

    return original ?? null;
}

function mountReplyReplacement(el: HTMLElement, content: string) {
    const original = findQuoteByText(el, content);
    if (!original) return;

    original.classList.add(ORIGINAL_REPLY_CLASS);

    const host = document.createElement("span");
    host.className = cl("reply-host");
    original.before(host);

    return {
        host,
        cleanup: () => {
            original.classList.remove(ORIGINAL_REPLY_CLASS);
            host.remove();
        }
    };
}

export function TranslatedReplyPreview({ referencedMessage }: Props) {
    const msg = referencedMessage?.state === ReferencedMessageState.LOADED
        ? referencedMessage.message
        : undefined;

    const [translation, setTranslation] = useState<TranslationValue | null>(
        () => msg ? getCachedIncoming(msg.id, msg.content) ?? null : null
    );

    const [modeVersion, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => subscribeModeChange(forceUpdate), []);

    useEffect(() => {
        if (!msg) return;

        const cached = getCachedIncoming(msg.id, msg.content);
        if (cached !== undefined) {
            setTranslation(cached);
            return;
        }
        setTranslation(null);

        if (!msg.content) return;
        if (getChannelMode(msg.channel_id) !== TranslateMode.Both) return;
        if (msg.author.bot && !settings.store.translateBots) return;

        let cancelled = false;
        translateIncoming(msg.id, msg.content).then(t => {
            if (!cancelled && t) setTranslation(t);
        });

        return () => { cancelled = true; };
    }, [msg?.id, msg?.content, modeVersion]);

    const anchorRef = useRef<HTMLSpanElement>(null);
    const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

    const show = !!translation && !!msg && getChannelMode(msg!.channel_id) === TranslateMode.Both;

    useLayoutEffect(() => {
        const el = anchorRef.current;
        if (!el || !show) return;
        const replacement = mountReplyReplacement(el, msg!.content);
        if (!replacement) return;
        setPortalHost(replacement.host);
        return () => {
            setPortalHost(null);
            replacement.cleanup();
        };
    }, [show, msg?.id, msg?.content]);

    if (!show || !translation || !msg) return null;

    const jump = () => MessageActions.jumpToMessage({
        channelId: msg.channel_id,
        messageId: msg.id,
        flash: true
    });

    const translated = (
        <span
            className={cl("reply")}
            title={t("reply_title", { lang: langName(translation.sourceCode) })}
            onClick={jump}
            role="button"
        >
            {translation.text}
        </span>
    );

    return (
        <>
            <span ref={anchorRef} className={cl("reply-anchor")} aria-hidden="true" />
            {portalHost && ReactDOM.createPortal(translated, portalHost)}
        </>
    );
}
