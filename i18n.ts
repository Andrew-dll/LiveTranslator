/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PlainSettings } from "@api/Settings";

const en = {
    desc_plugin: "Automatic chat translation: messages you send are translated before sending, received messages are shown translated (hover the badge next to the name for the original). Click the chat button to switch mode: off / send only / two-way.",
    tip_off: "Translation off ({scope}) — click to translate sent messages",
    tip_send: "Translating sent messages ({scope}) — click for two-way mode",
    tip_both: "Two-way translation active ({scope}) — click to turn off",
    scope_channel: "this channel",
    scope_global: "all channels",
    original: "ORIGINAL",
    you: "YOU",
    badge_title: "Translated from {lang} — keep the cursor here to see the original",
    accessory_title: "Translated from {lang} — hover the badge next to the name to see the original",
    reply_title: "Translated from {lang} — click to jump to the message",
    toast_send_failed: "LiveTranslator: translation failed, message NOT sent. Try again or start with \\ to send the original.",
    set_target: "Language your sent messages are translated to",
    set_my: "Your language: received messages and the plugin interface use it",
    set_bots: "Also translate bot messages",
    set_history: "Also translate older messages when scrolling back",
    set_global: "The chat button controls ALL channels (globe icon). Turn off to manage each channel separately (translate icon)",
    set_auto: "Detects each channel's language from a random sample of 10 messages and translates what you send into it (the send language picker is disabled)",
    title_my: "Your language",
    title_target: "Send language",
    title_bots: "Translate bots",
    title_history: "Translate history",
    title_global: "Global mode",
    title_auto: "Automatic send language",
    auto_active: "automatic",
    pick_placeholder: "Type a language…"
};

type Strings = typeof en;

const translations: Record<string, Partial<Strings>> = {
    en,
    it: {
        desc_plugin: "Traduzione automatica della chat: i messaggi che invii vengono tradotti prima dell'invio, quelli ricevuti sono mostrati tradotti (cursore sul badge accanto al nome per l'originale). Clic sul pulsante in chat per cambiare modalità: spento / solo invio / bidirezionale.",
        tip_off: "Traduzione disattivata ({scope}) — clic per tradurre i messaggi inviati",
        tip_send: "Traduco i messaggi che invii ({scope}) — clic per modalità bidirezionale",
        tip_both: "Traduzione bidirezionale attiva ({scope}) — clic per disattivare",
        scope_channel: "questo canale",
        scope_global: "tutti i canali",
        original: "ORIGINALE",
        you: "YOU",
        badge_title: "Tradotto da {lang} — tieni il cursore qui per vedere l'originale",
        accessory_title: "Tradotto da {lang} — cursore sul badge accanto al nome per l'originale",
        reply_title: "Tradotto da {lang} — clic per andare al messaggio",
        toast_send_failed: "LiveTranslator: traduzione fallita, messaggio NON inviato. Riprova o inizia con \\ per inviare l'originale.",
        set_target: "Lingua in cui tradurre i messaggi che invii",
        set_my: "La tua lingua: messaggi ricevuti e interfaccia del plugin la usano",
        set_bots: "Traduci anche i messaggi dei bot",
        set_history: "Traduci anche i messaggi più vecchi scorrendo la cronologia",
        set_global: "Il pulsante in chat controlla TUTTI i canali (mappamondo). Disattiva per gestire canale per canale (simbolo traduzione)",
        set_auto: "Rileva la lingua di ogni canale da un campione casuale di 10 messaggi e traduce ciò che invii in quella lingua (il selettore della lingua di invio si disattiva)",
        title_my: "La tua lingua",
        title_target: "Lingua di invio",
        title_bots: "Traduci bot",
        title_history: "Traduci cronologia",
        title_global: "Modalità globale",
        title_auto: "Lingua di invio automatica",
        auto_active: "automatica",
        pick_placeholder: "Scrivi una lingua…"
    },
    de: {
        desc_plugin: "Automatische Chat-Übersetzung: gesendete Nachrichten werden vor dem Senden übersetzt, empfangene Nachrichten werden übersetzt angezeigt (Cursor auf das Badge neben dem Namen für das Original). Klick auf den Chat-Button wechselt den Modus: aus / nur senden / beidseitig.",
        tip_off: "Übersetzung aus ({scope}) — Klick übersetzt gesendete Nachrichten",
        tip_send: "Gesendete Nachrichten werden übersetzt ({scope}) — Klick für beidseitigen Modus",
        tip_both: "Beidseitige Übersetzung aktiv ({scope}) — Klick zum Ausschalten",
        scope_channel: "dieser Kanal",
        scope_global: "alle Kanäle",
        original: "ORIGINAL",
        you: "YOU",
        badge_title: "Übersetzt aus {lang} — Cursor hier halten, um das Original zu sehen",
        accessory_title: "Übersetzt aus {lang} — Cursor auf das Badge neben dem Namen für das Original",
        reply_title: "Übersetzt aus {lang} — Klick springt zur Nachricht",
        toast_send_failed: "LiveTranslator: Übersetzung fehlgeschlagen, Nachricht NICHT gesendet. Erneut versuchen oder mit \\ beginnen, um das Original zu senden.",
        set_target: "Sprache, in die deine gesendeten Nachrichten übersetzt werden",
        set_my: "Deine Sprache: empfangene Nachrichten und die Plugin-Oberfläche verwenden sie",
        set_bots: "Auch Bot-Nachrichten übersetzen",
        set_history: "Auch ältere Nachrichten beim Zurückscrollen übersetzen",
        set_global: "Der Chat-Button steuert ALLE Kanäle (Globus). Ausschalten, um jeden Kanal einzeln zu verwalten (Übersetzungssymbol)",
        set_auto: "Erkennt die Sprache jedes Kanals aus einer zufälligen Stichprobe von 10 Nachrichten und übersetzt Gesendetes in diese Sprache (die Sendesprachen-Auswahl wird deaktiviert)",
        title_my: "Deine Sprache",
        title_target: "Sendesprache",
        title_bots: "Bots übersetzen",
        title_history: "Verlauf übersetzen",
        title_global: "Globaler Modus",
        title_auto: "Automatische Sendesprache",
        auto_active: "automatisch",
        pick_placeholder: "Sprache eingeben…"
    },
    es: {
        desc_plugin: "Traducción automática del chat: los mensajes que envías se traducen antes de enviarse, los recibidos se muestran traducidos (cursor sobre la insignia junto al nombre para ver el original). Clic en el botón del chat para cambiar de modo: apagado / solo envío / bidireccional.",
        tip_off: "Traducción desactivada ({scope}) — clic para traducir los mensajes enviados",
        tip_send: "Traduciendo los mensajes que envías ({scope}) — clic para modo bidireccional",
        tip_both: "Traducción bidireccional activa ({scope}) — clic para desactivar",
        scope_channel: "este canal",
        scope_global: "todos los canales",
        original: "ORIGINAL",
        you: "YOU",
        badge_title: "Traducido del {lang} — mantén el cursor aquí para ver el original",
        accessory_title: "Traducido del {lang} — cursor sobre la insignia junto al nombre para el original",
        reply_title: "Traducido del {lang} — clic para ir al mensaje",
        toast_send_failed: "LiveTranslator: traducción fallida, mensaje NO enviado. Reintenta o empieza con \\ para enviar el original.",
        set_target: "Idioma al que se traducen los mensajes que envías",
        set_my: "Tu idioma: los mensajes recibidos y la interfaz del plugin lo usan",
        set_bots: "Traducir también los mensajes de bots",
        set_history: "Traducir también mensajes antiguos al desplazarse hacia atrás",
        set_global: "El botón del chat controla TODOS los canales (globo). Desactívalo para gestionar cada canal por separado (símbolo de traducción)",
        set_auto: "Detecta el idioma de cada canal a partir de una muestra aleatoria de 10 mensajes y traduce lo que envías a ese idioma (el selector de idioma de envío se desactiva)",
        title_my: "Tu idioma",
        title_target: "Idioma de envío",
        title_bots: "Traducir bots",
        title_history: "Traducir historial",
        title_global: "Modo global",
        title_auto: "Idioma de envío automático",
        auto_active: "automático",
        pick_placeholder: "Escribe un idioma…"
    },
    fr: {
        desc_plugin: "Traduction automatique du chat : les messages envoyés sont traduits avant l'envoi, les messages reçus sont affichés traduits (curseur sur le badge à côté du nom pour l'original). Clic sur le bouton du chat pour changer de mode : désactivé / envoi seul / bidirectionnel.",
        tip_off: "Traduction désactivée ({scope}) — clic pour traduire les messages envoyés",
        tip_send: "Traduction des messages envoyés ({scope}) — clic pour le mode bidirectionnel",
        tip_both: "Traduction bidirectionnelle active ({scope}) — clic pour désactiver",
        scope_channel: "ce salon",
        scope_global: "tous les salons",
        original: "ORIGINAL",
        you: "YOU",
        badge_title: "Traduit du {lang} — gardez le curseur ici pour voir l'original",
        accessory_title: "Traduit du {lang} — curseur sur le badge à côté du nom pour l'original",
        reply_title: "Traduit du {lang} — clic pour aller au message",
        toast_send_failed: "LiveTranslator : traduction échouée, message NON envoyé. Réessayez ou commencez par \\ pour envoyer l'original.",
        set_target: "Langue vers laquelle vos messages envoyés sont traduits",
        set_my: "Votre langue : les messages reçus et l'interface du plugin l'utilisent",
        set_bots: "Traduire aussi les messages des bots",
        set_history: "Traduire aussi les anciens messages en remontant l'historique",
        set_global: "Le bouton du chat contrôle TOUS les salons (globe). Désactivez pour gérer chaque salon séparément (symbole de traduction)",
        set_auto: "Détecte la langue de chaque salon à partir d'un échantillon aléatoire de 10 messages et traduit vos envois dans cette langue (le sélecteur de langue d'envoi est désactivé)",
        title_my: "Votre langue",
        title_target: "Langue d'envoi",
        title_bots: "Traduire les bots",
        title_history: "Traduire l'historique",
        title_global: "Mode global",
        title_auto: "Langue d'envoi automatique",
        auto_active: "automatique",
        pick_placeholder: "Tapez une langue…"
    },
    pt: {
        desc_plugin: "Tradução automática do chat: as mensagens que você envia são traduzidas antes do envio, as recebidas são exibidas traduzidas (cursor sobre o selo ao lado do nome para ver o original). Clique no botão do chat para trocar o modo: desligado / só envio / bidirecional.",
        tip_off: "Tradução desativada ({scope}) — clique para traduzir as mensagens enviadas",
        tip_send: "Traduzindo as mensagens que você envia ({scope}) — clique para o modo bidirecional",
        tip_both: "Tradução bidirecional ativa ({scope}) — clique para desativar",
        scope_channel: "este canal",
        scope_global: "todos os canais",
        original: "ORIGINAL",
        you: "YOU",
        badge_title: "Traduzido do {lang} — mantenha o cursor aqui para ver o original",
        accessory_title: "Traduzido do {lang} — cursor sobre o selo ao lado do nome para o original",
        reply_title: "Traduzido do {lang} — clique para ir à mensagem",
        toast_send_failed: "LiveTranslator: tradução falhou, mensagem NÃO enviada. Tente novamente ou comece com \\ para enviar o original.",
        set_target: "Idioma para o qual suas mensagens enviadas são traduzidas",
        set_my: "Seu idioma: as mensagens recebidas e a interface do plugin o usam",
        set_bots: "Traduzir também mensagens de bots",
        set_history: "Traduzir também mensagens antigas ao rolar para trás",
        set_global: "O botão do chat controla TODOS os canais (globo). Desative para gerenciar canal por canal (símbolo de tradução)",
        set_auto: "Detecta o idioma de cada canal a partir de uma amostra aleatória de 10 mensagens e traduz o que você envia para esse idioma (o seletor de idioma de envio é desativado)",
        title_my: "Seu idioma",
        title_target: "Idioma de envio",
        title_bots: "Traduzir bots",
        title_history: "Traduzir histórico",
        title_global: "Modo global",
        title_auto: "Idioma de envio automático",
        auto_active: "automático",
        pick_placeholder: "Digite um idioma…"
    }
};
export function currentLang(): string {
    try {
        const lang = PlainSettings.plugins?.LiveTranslator?.myLanguage as string | undefined;
        return (lang || "en").split("-")[0].toLowerCase();
    } catch {
        return "en";
    }
}

export function t(key: keyof Strings, vars?: Record<string, string>): string {
    let s = translations[currentLang()]?.[key] ?? en[key];
    if (vars)
        for (const [k, v] of Object.entries(vars))
            s = s.replace(`{${k}}`, v);
    return s;
}
export function langName(code: string): string {
    try {
        const name = new Intl.DisplayNames([currentLang()], { type: "language" }).of(code);
        if (name && name !== code) return name;
    } catch { /* unknown/grandfathered code */ }
    return code.toUpperCase();
}
