/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 Andrew-dll
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FormSwitch } from "@components/FormSwitch";
import { Margins } from "@utils/margins";
import { Forms, SearchableSelect, useMemo } from "@webpack/common";

import { currentLang, langName, t } from "./i18n";
import { GoogleLanguages } from "./languages";
import { settings } from "./settings";

type LanguageKey = "myLanguage" | "targetLanguage";
type SwitchKey = "autoTarget" | "translateBots" | "translateHistory" | "useGlobalMode";

function buildOptions() {
    return Object.entries(GoogleLanguages)
        .filter(([code]) => code !== "auto")
        .map(([code, english]) => {
            const local = langName(code);
            const label = local.toLowerCase() !== english.toLowerCase() && local !== code.toUpperCase()
                ? `${local[0].toUpperCase()}${local.slice(1)} — ${english}`
                : english;
            return { value: code, label: `${label} (${code})` };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
}

function LanguagePicker({ settingKey, disabled }: { settingKey: LanguageKey; disabled?: boolean; }) {
    const value = settings.use([settingKey])[settingKey];
    const options = useMemo(buildOptions, [currentLang()]);

    const title = settingKey === "myLanguage" ? t("title_my") : t("title_target");

    return (
        <section
            className={Margins.bottom16}
            style={disabled ? { opacity: 0.5, pointerEvents: "none" } : undefined}
        >
            <Forms.FormTitle tag="h3">
                {disabled ? `${title} (${t("auto_active")})` : title}
            </Forms.FormTitle>

            <SearchableSelect
                options={options}
                value={options.find(o => o.value === value)?.value}
                placeholder={t("pick_placeholder")}
                maxVisibleItems={7}
                closeOnSelect={true}
                onChange={v => settings.store[settingKey] = v}
            />
        </section>
    );
}

function Switch({ settingKey, title, description }: { settingKey: SwitchKey; title: string; description: string; }) {
    const value = settings.use([settingKey])[settingKey];

    return (
        <FormSwitch
            title={title}
            description={description}
            value={value}
            onChange={v => settings.store[settingKey] = v}
            hideBorder
        />
    );
}

export function LanguageSettings() {
    const { autoTarget } = settings.use(["autoTarget"]);

    return (
        <>
            <LanguagePicker settingKey="myLanguage" />
            <LanguagePicker settingKey="targetLanguage" disabled={autoTarget} />

            <Switch settingKey="autoTarget" title={t("title_auto")} description={t("set_auto")} />
            <Switch settingKey="translateBots" title={t("title_bots")} description={t("set_bots")} />
            <Switch settingKey="translateHistory" title={t("title_history")} description={t("set_history")} />
            <Switch settingKey="useGlobalMode" title={t("title_global")} description={t("set_global")} />
        </>
    );
}
