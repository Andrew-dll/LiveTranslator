/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classes } from "@utils/misc";
import { Message } from "@vencord/discord-types";
import { MessageStore, React, UserStore, useEffect, useReducer, useRef, useState } from "@webpack/common";

import { langName, t } from "./i18n";
import { getChannelMode, settings, subscribeModeChange, TranslateMode } from "./settings";
import { cl, getCachedIncoming, subscribeAnyTranslation } from "./translator";
import { TranslatorIcon } from "./TranslatorIcon";

const REVEAL_CLASS = cl("reveal");

function getGroupItemsFromLi(li: HTMLElement | null): HTMLElement[] {
    if (!li) return [];

    const items = [li];
    let sib = li.nextElementSibling as HTMLElement | null;
    while (
        sib?.tagName === "LI"
        && sib.id.startsWith("chat-messages")
        && !sib.querySelector("h3")
        && !sib.querySelector(`.${cl("badge")}`)
    ) {
        items.push(sib);
        sib = sib.nextElementSibling as HTMLElement | null;
    }
    return items;
}

function getGroupItems(from: HTMLElement) {
    return getGroupItemsFromLi(from.closest<HTMLElement>('li[id^="chat-messages"]'));
}

function findMessageItem(message: Message) {
    const exact = document.getElementById(`chat-messages-${message.channel_id}-${message.id}`);
    if (exact instanceof HTMLElement) return exact;
    return document.querySelector<HTMLElement>(
        `li[id^="chat-messages"][id$="-${message.id}"]`
    );
}

function getGroupMessages(message: Message) {
    const items = getGroupItemsFromLi(findMessageItem(message));
    if (!items.length) return [message];

    return items.map(item => {
        const id = item.id.slice(item.id.lastIndexOf("-") + 1);
        return MessageStore.getMessage(message.channel_id, id);
    }).filter((item): item is Message => !!item);
}

function getBadgeInfo(message: Message) {
    for (const item of getGroupMessages(message)) {
        const translation = getCachedIncoming(item.id, item.content);
        if (!translation) continue;

        if (item.author.id === UserStore.getCurrentUser()?.id)
            return { displayedCode: translation.sourceCode, sourceCode: translation.sourceCode, isOwn: true };

        if (getChannelMode(item.channel_id) === TranslateMode.Both)
            return { displayedCode: settings.store.myLanguage, sourceCode: translation.sourceCode, isOwn: false };
    }
    return null;
}

function clearReveals() {
    document.querySelectorAll(`.${REVEAL_CLASS}`).forEach(el => el.classList.remove(REVEAL_CLASS));
}

export function TranslationBadge({ message }: { message: Message; }) {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [revealing, setRevealing] = useState(false);
    const leaveTimer = useRef<number | null>(null);
    useEffect(() => {
        let frame: number | null = null;
        const updateAfterCommit = () => {
            if (frame != null) window.cancelAnimationFrame(frame);
            frame = window.requestAnimationFrame(() => {
                frame = null;
                forceUpdate();
            });
        };
        const unsubscribeTranslation = subscribeAnyTranslation(updateAfterCommit);
        return () => {
            if (frame != null) window.cancelAnimationFrame(frame);
            unsubscribeTranslation();
        };
    }, []);
    useEffect(() => subscribeModeChange(forceUpdate), []);
    useEffect(() => {
        const frame = window.requestAnimationFrame(() => forceUpdate());
        return () => window.cancelAnimationFrame(frame);
    }, [message.id]);
    useEffect(() => () => {
        if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
        clearReveals();
    }, []);

    const badgeInfo = getBadgeInfo(message);

    const revealOriginal = (element: HTMLElement) => {
        if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
        leaveTimer.current = null;
        setRevealing(true);
        getGroupItems(element).forEach(li => li.classList.add(REVEAL_CLASS));
    };

    const scheduleTranslation = () => {
        if (leaveTimer.current != null) window.clearTimeout(leaveTimer.current);
        leaveTimer.current = window.setTimeout(() => {
            leaveTimer.current = null;
            setRevealing(false);
            clearReveals();
        }, 120);
    };

    if (!badgeInfo) return null;

    const { displayedCode, sourceCode, isOwn } = badgeInfo;
    const label = isOwn
        ? `${t("you")} · ${displayedCode.toUpperCase()}`
        : displayedCode.toUpperCase();

    return (
        <span
            className={classes(cl("badge"), revealing && cl("badge-revealing"))}
            title={t("badge_title", { lang: langName(sourceCode) })}
            onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => revealOriginal(e.currentTarget)}
            onMouseLeave={scheduleTranslation}
        >
            <span className={cl("badge-trans")}>
                <TranslatorIcon width={12} height={12} className={cl("badge-icon")} />
                {label}
            </span>
            <span className={cl("badge-orig")}>{t("original")}</span>
        </span>
    );
}
