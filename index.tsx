/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import { MessageActions, MessageStore, showToast, Toasts, UserStore } from "@webpack/common";

import { AutoTranslationAccessory } from "./AutoTranslationAccessory";
import { getAutoTargetLanguage, prefetchAutoTarget } from "./autoTarget";
import { t } from "./i18n";
import { TranslatedReplyPreview } from "./ReplyPreview";
import { getChannelMode, settings, TranslateMode } from "./settings";
import { TranslationBadge } from "./TranslationBadge";
import { detectLanguage, translateOutgoing } from "./translator";
import { TranslatorChatBarIcon, TranslatorIcon } from "./TranslatorIcon";

async function resolveTargetLanguage(channelId: string, replyToMessageId?: string): Promise<string> {
    if (!settings.store.autoTarget)
        return settings.store.targetLanguage;

    if (replyToMessageId) {
        const ref = MessageStore.getMessage(channelId, replyToMessageId);
        if (ref?.content && ref.author?.id !== UserStore.getCurrentUser()?.id) {
            const replyLang = await detectLanguage(ref.content);
            if (replyLang) return replyLang;
        }
    }

    return getAutoTargetLanguage(channelId);
}

async function translateEditPayload(channelId: string, edit: { content?: string; }): Promise<boolean> {
    if (getChannelMode(channelId) === TranslateMode.Off) return true;

    const content = edit.content;
    if (!content?.trim()) return true;

    if (content.startsWith("\\")) {
        edit.content = content.slice(1);
        return true;
    }

    try {
        const target = await resolveTargetLanguage(channelId);
        const translated = await translateOutgoing(content, target);
        if (translated != null)
            edit.content = translated;
        return true;
    } catch (e) {
        console.error("[LiveTranslator] edit translation failed", e);
        showToast(t("toast_send_failed"), Toasts.Type.FAILURE);
        return false;
    }
}

let originalEditMessage: typeof MessageActions.editMessage | undefined;

export default definePlugin({
    name: "LiveTranslator",
    description: t("desc_plugin"),
    tags: ["Chat", "Utility"],
    authors: [{ name: "andrew.html", id: 1485332926525870254n }],
    settings,

    start() {
        delete (settings.store as any).outgoingOriginals;

        originalEditMessage = MessageActions.editMessage;
        MessageActions.editMessage = async (channelId: string, messageId: string, edit: any) => {
            const ok = await translateEditPayload(channelId, edit ?? {});
            if (!ok) return;
            return originalEditMessage!.call(MessageActions, channelId, messageId, edit);
        };
    },

    stop() {
        if (originalEditMessage) {
            MessageActions.editMessage = originalEditMessage;
            originalEditMessage = undefined;
        }
    },

    renderMessageAccessory: props => <AutoTranslationAccessory message={props.message} />,

    renderMessageDecoration: props => <TranslationBadge message={props.message} />,

    chatBarButton: {
        icon: TranslatorIcon,
        render: TranslatorChatBarIcon
    },

    patches: [
        {
            find: "#{intl::REPLY_QUOTE_MESSAGE_NOT_LOADED}",
            replacement: {
                match: /\.onClickReply,.+?}\),(?=\i,\i,\i\])/,
                replace: "$&$self.TranslatedReplyPreview(arguments[0]),"
            }
        }
    ],

    TranslatedReplyPreview: ErrorBoundary.wrap(TranslatedReplyPreview, { noop: true }),

    flux: {
        CHANNEL_SELECT({ channelId }: { channelId?: string; }) {
            if (channelId && settings.store.autoTarget)
                prefetchAutoTarget(channelId);
        },
        LOAD_MESSAGES_SUCCESS({ channelId }: { channelId?: string; }) {
            if (channelId && settings.store.autoTarget)
                prefetchAutoTarget(channelId);
        }
    },

    async onBeforeMessageSend(channelId, message, options) {
        if (getChannelMode(channelId) === TranslateMode.Off) return;
        if (!message.content?.trim()) return;

        if (message.content.startsWith("\\")) {
            message.content = message.content.slice(1);
            return;
        }

        try {
            const target = await resolveTargetLanguage(channelId, options?.messageReference?.message_id);
            const translated = await translateOutgoing(message.content, target);
            if (translated != null)
                message.content = translated;
        } catch (e) {
            console.error("[LiveTranslator] outgoing translation failed", e);
            showToast(t("toast_send_failed"), Toasts.Type.FAILURE);
            message.content = "";
            return { cancel: true };
        }
    },

    async onBeforeMessageEdit(channelId, _messageId, message) {
        const ok = await translateEditPayload(channelId, message);
        if (!ok) return { cancel: true };
    }
});
