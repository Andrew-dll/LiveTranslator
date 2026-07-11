/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Icons adapted from Material Symbols and the official Vencord Translate plugin
 * (c) 2023 Vendicated and contributors, GPL-3.0-or-later
 */

import { ChatBarButton, ChatBarButtonFactory } from "@api/ChatButtons";
import { classes } from "@utils/misc";
import { IconComponent } from "@utils/types";
import { SelectedChannelStore, useEffect, useReducer, useStateFromStores } from "@webpack/common";

import { peekAutoTarget, prefetchAutoTarget, subscribeAutoTarget } from "./autoTarget";
import { t } from "./i18n";
import { cycleChannelMode, getChannelMode, setChannelMode, settings, subscribeModeChange, TranslateMode } from "./settings";
import { cl } from "./translator";

export const TranslatorIcon: IconComponent = ({ height = 20, width = 20, className }) => (
    <svg
        viewBox="0 -960 960 960"
        height={height}
        width={width}
        className={classes(cl("icon"), className)}
    >
        <path fill="currentColor" d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-155.5t86-127Q252-817 325-848.5T480-880q83 0 155.5 31.5t127 86q54.5 54.5 86 127T880-480q0 82-31.5 155t-86 127.5q-54.5 54.5-127 86T480-80Zm0-82q26-36 45-75t31-83H404q12 44 31 83t45 75Zm-104-16q-18-33-31.5-68.5T322-320H204q29 50 72.5 87t99.5 55Zm208 0q56-18 99.5-55t72.5-87H638q-9 38-22.5 73.5T584-178ZM170-400h136q-3-20-4.5-39.5T300-480q0-21 1.5-40.5T306-560H170q-5 20-7.5 39.5T160-480q0 21 2.5 40.5T170-400Zm216 0h188q3-20 4.5-39.5T580-480q0-21-1.5-40.5T574-560H386q-3 20-4.5 39.5T380-480q0 21 1.5 40.5T386-400Zm268 0h136q5-20 7.5-39.5T800-480q0-21-2.5-40.5T790-560H654q3 20 4.5 39.5T660-480q0 21-1.5 40.5T654-400Zm-16-240h118q-29-50-72.5-87T584-782q18 33 31.5 68.5T638-640Zm-234 0h152q-12-44-31-83t-45-75q-26 36-45 75t-31 83Zm-200 0h118q9-38 22.5-73.5T376-782q-56 18-99.5 55T204-640Z" />
    </svg>
);

export const TranslateGlyphIcon: IconComponent = ({ height = 20, width = 20, className }) => (
    <svg
        viewBox="0 96 960 960"
        height={height}
        width={width}
        className={classes(cl("icon"), className)}
    >
        <path fill="currentColor" d="m475 976 181-480h82l186 480h-87l-41-126H604l-47 126h-82Zm151-196h142l-70-194h-2l-70 194Zm-466 76-55-55 204-204q-38-44-67.5-88.5T190 416h87q17 33 37.5 62.5T361 539q45-47 75-97.5T487 336H40v-80h280v-80h80v80h280v80H567q-22 69-58.5 135.5T419 598l98 99-30 81-127-122-200 200Z" />
    </svg>
);

function getTooltip(mode: TranslateMode) {
    const scope = t(settings.store.useGlobalMode ? "scope_global" : "scope_channel");
    switch (mode) {
        case TranslateMode.Send:
            return t("tip_send", { scope });
        case TranslateMode.Both:
            return t("tip_both", { scope });
        default:
            return t("tip_off", { scope });
    }
}

const MODE_CLASSES: Record<TranslateMode, string | false> = {
    [TranslateMode.Off]: false,
    [TranslateMode.Send]: cl("mode-send"),
    [TranslateMode.Both]: cl("mode-both")
};

export const TranslatorChatBarIcon: ChatBarButtonFactory = ({ isMainChat }) => {
    const channelId = useStateFromStores([SelectedChannelStore], () => SelectedChannelStore.getChannelId());
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    useEffect(() => subscribeModeChange(forceUpdate), []);
    useEffect(() => subscribeAutoTarget(forceUpdate), []);

    const isAuto = settings.store.autoTarget;
    const detected = channelId && isAuto ? peekAutoTarget(channelId) : null;

    useEffect(() => {
        if (channelId && isAuto && !detected)
            prefetchAutoTarget(channelId);
    }, [channelId, isAuto, detected]);

    if (!isMainChat || !channelId) return null;

    const mode = getChannelMode(channelId);
    const Icon = settings.store.useGlobalMode ? TranslatorIcon : TranslateGlyphIcon;
    const tag = isAuto ? detected ?? "…" : settings.store.targetLanguage;

    return (
        <ChatBarButton
            tooltip={getTooltip(mode)}
            onClick={() => cycleChannelMode(channelId)}
            onContextMenu={() => setChannelMode(channelId, TranslateMode.Off)}
        >
            <span className={cl("button-wrap")}>
                {mode !== TranslateMode.Off && (
                    <span className={classes(cl("lang-tag"), MODE_CLASSES[mode] || undefined)}>
                        {tag.toUpperCase()}
                    </span>
                )}
                <Icon className={classes(cl("chat-button"), MODE_CLASSES[mode] || undefined)} />
            </span>
        </ChatBarButton>
    );
};
