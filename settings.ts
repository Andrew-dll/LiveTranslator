/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { LanguageSettings } from "./LanguageSelect";

export const enum TranslateMode {
    Off = 0,
    Send = 1,
    Both = 2
}

export interface ChannelState {
    mode: TranslateMode;
    since: number;
}

export const settings = definePluginSettings({
    languages: {
        type: OptionType.COMPONENT,
        component: LanguageSettings
    },
    targetLanguage: {
        type: OptionType.STRING,
        description: "",
        default: "en",
        hidden: true,
        onChange: () => notifyModeChange()
    },
    myLanguage: {
        type: OptionType.STRING,
        description: "",
        default: "en",
        hidden: true,
        onChange: () => notifyModeChange()
    },
    autoTarget: {
        type: OptionType.BOOLEAN,
        description: "",
        default: false,
        hidden: true,
        onChange: () => notifyModeChange()
    },
    translateBots: {
        type: OptionType.BOOLEAN,
        description: "",
        default: false,
        hidden: true
    },
    translateHistory: {
        type: OptionType.BOOLEAN,
        description: "",
        default: true,
        hidden: true
    },
    useGlobalMode: {
        type: OptionType.BOOLEAN,
        description: "",
        default: true,
        hidden: true,
        onChange: () => notifyModeChange()
    }
}).withPrivateSettings<{
    globalMode?: TranslateMode;
    globalSince?: number;
    channelModes?: Record<string, ChannelState>;
}>();

const modeListeners = new Set<() => void>();

export function subscribeModeChange(cb: () => void) {
    modeListeners.add(cb);
    return () => void modeListeners.delete(cb);
}

function notifyModeChange() {
    modeListeners.forEach(cb => cb());
}

export function getChannelState(channelId: string): ChannelState {
    if (settings.store.useGlobalMode)
        return {
            mode: settings.store.globalMode ?? TranslateMode.Off,
            since: settings.store.globalSince ?? 0
        };

    return settings.store.channelModes?.[channelId] ?? { mode: TranslateMode.Off, since: 0 };
}

export function getChannelMode(channelId: string): TranslateMode {
    return getChannelState(channelId).mode;
}

export function setChannelMode(channelId: string, mode: TranslateMode) {
    if (settings.store.useGlobalMode) {
        settings.store.globalMode = mode;
        settings.store.globalSince = Date.now();
    } else {
        settings.store.channelModes ??= {};
        settings.store.channelModes[channelId] = { mode, since: Date.now() };
    }
    notifyModeChange();
}

export function cycleChannelMode(channelId: string): TranslateMode {
    const next = ((getChannelMode(channelId) + 1) % 3) as TranslateMode;
    setChannelMode(channelId, next);
    return next;
}
