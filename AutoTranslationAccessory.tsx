/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { classes } from "@utils/misc";
import { Message } from "@vencord/discord-types";
import { Parser, ReactDOM, SnowflakeUtils, UserStore, useEffect, useLayoutEffect, useReducer, useRef, useState } from "@webpack/common";

import { langName, t } from "./i18n";
import { getChannelState, settings, subscribeModeChange, TranslateMode } from "./settings";
import { cl, getCachedIncoming, translateIncoming, TranslationValue } from "./translator";

export function AutoTranslationAccessory({ message }: { message: Message; }) {
    const isOwn = message.author.id === UserStore.getCurrentUser()?.id;

    const [translation, setTranslation] = useState<TranslationValue | null>(
        () => getCachedIncoming(message.id, message.content) ?? null
    );

    const [modeVersion, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => subscribeModeChange(forceUpdate), []);

    const [appearing, setAppearing] = useState(false);
    const hadTranslation = useRef(false);
    useEffect(() => {
        if (translation && !hadTranslation.current) {
            hadTranslation.current = true;
            setAppearing(true);
            const timeout = window.setTimeout(() => setAppearing(false), 350);
            return () => window.clearTimeout(timeout);
        }
        if (!translation) hadTranslation.current = false;
    }, [translation]);

    useEffect(() => {
        const cached = getCachedIncoming(message.id, message.content);
        if (cached !== undefined) {
            setTranslation(cached);
            return;
        }
        setTranslation(null);

        if ((message as any).vencordEmbeddedBy) return;
        if (!message.content) return;

        const { mode, since } = getChannelState(message.channel_id);
        if (!isOwn && mode !== TranslateMode.Both) return;

        if (message.author.bot && !settings.store.translateBots) return;

        if (!isOwn && !settings.store.translateHistory && SnowflakeUtils.extractTimestamp(message.id) < since) return;

        let cancelled = false;
        translateIncoming(message.id, message.content).then(t => {
            if (!cancelled && t) setTranslation(t);
        });

        return () => { cancelled = true; };
    }, [message.id, message.content, modeVersion]);

    const show = !!translation && (isOwn || getChannelState(message.channel_id).mode === TranslateMode.Both);

    const anchorRef = useRef<HTMLSpanElement>(null);
    const [host, setHost] = useState<HTMLElement | null>(null);

    useLayoutEffect(() => {
        const el = anchorRef.current;
        if (!el || !show) return;

        const li = el.closest<HTMLElement>('li[id^="chat-messages"]');
        if (!li) return;
        const contentDiv = Array.from(li.querySelectorAll<HTMLElement>('div[class*="messageContent"]'))
            .filter(node =>
                !node.closest('[class*="repliedMessage"]')
                && !node.closest(`.${cl("content-host")}`)
                && !node.closest('[id^="message-accessories"]')
            )
            .at(-1);
        if (!contentDiv) return;

        const markClass = isOwn ? cl("msg-own") : cl("msg-original");
        contentDiv.classList.add(markClass);

        const h = document.createElement("span");
        h.className = cl("content-host");
        contentDiv.before(h);
        setHost(h);

        return () => {
            setHost(null);
            contentDiv.classList.remove(markClass);
            h.remove();
        };
    }, [show, isOwn, message.id]);

    if (!show || !translation) return null;

    const body = isOwn ? (
        <span className={cl("outgoing-original")}>
            {Parser.parse(translation.text)}
        </span>
    ) : (
        <span
            className={classes(cl("accessory"), appearing && cl("appear"))}
            title={t("accessory_title", { lang: langName(translation.sourceCode) })}
        >
            {Parser.parse(translation.text)}
        </span>
    );

    return (
        <>
            <span ref={anchorRef} className={cl("content-anchor")} aria-hidden="true" />
            {host ? ReactDOM.createPortal(body, host) : body}
        </>
    );
}
