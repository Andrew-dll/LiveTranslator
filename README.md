# LiveTranslator

A [Vencord](https://vencord.dev) userplugin for seamless, automatic chat translation on Discord desktop/web. Write in your language, chat with anyone: outgoing messages are translated before sending, incoming messages are shown translated **in place of the original text**, with the original one hover away.

> ⚠️ Works with Vencord built from source on **desktop (Windows/macOS/Linux) or Discord Web**. Not usable inside the official iOS/Android apps.

## Features

- **Per-channel or global mode**, cycled with a chat bar button:
  - grey — translation off
  - **blue** — messages you send are translated (incoming untouched)
  - **green** — two-way: sent messages translated, received messages displayed translated
- **1:1 in-place replacement**: the translation occupies exactly the slot of the original text — reactions, embeds, attachments and reply layout stay native. Smooth fade/rise animations.
- **Language badge** next to the author name (`🌐 IT`, `YOU · EN` on your own messages). Hovering it reveals the original text of the whole message group; your own messages reveal a back-translation into your language.
- **Translated reply previews**: the quoted message above a reply is replaced with its translation; clicking it jumps to the message like the native preview.
- **Automatic send language** (optional): detects each channel's language from a random sample of 10 messages (majority vote, cached 10 minutes, warmed on channel switch). Replying to someone overrides it with *their* message's language. The current send language is shown as an ISO tag on the chat button.
- **Message edits are translated** too, through both the Vencord pre-edit API and a resilient `MessageActions.editMessage` wrapper.
- **Fully localized UI** (en, it, de, es, fr, pt — English fallback), driven by your language setting, live. Language pickers are searchable in your own language ("tedesco" finds German) and apply ISO codes automatically via `Intl.DisplayNames`.
- **Robust text handling**: mentions, URLs, custom emoji, timestamps, code blocks and inline code are masked before translation and restored after; messages with nothing translatable are skipped.
- **Efficient**: per-message cache (1000 entries, language-aware), text-level cache for identical contents, in-flight deduplication, max 3 concurrent requests, no retranslation on re-render or channel switch.
- **Safe sending**: if the translation API fails, the message is **not sent** (no accidental native-language leak). Start a message with `\` to send it untranslated.

Translation is provided by the same public Google Translate endpoint used by Vencord's official Translate plugin — no API key required.

## Installation

Vencord loads userplugins only from a source build. You need [Git](https://git-scm.com), [Node.js](https://nodejs.org) and pnpm.

```bash
git clone https://github.com/Vendicated/Vencord
cd Vencord
npm i -g pnpm
pnpm install --frozen-lockfile

mkdir -p src/userplugins
git clone https://github.com/Andrew-dll/LiveTranslator src/userplugins/liveTranslator

pnpm build
pnpm inject
```

Restart Discord and enable **LiveTranslator** in Settings → Vencord → Plugins.

To update later: `git pull` in both the Vencord folder and `src/userplugins/liveTranslator`, then `pnpm build` again.

## Settings

- **Your language** — incoming messages and the plugin UI use it
- **Send language** — target for your outgoing messages (disabled while automatic mode is on)
- **Automatic send language** — per-channel detection as described above
- **Translate bots** — include bot messages (off by default)
- **Translate history** — translate older messages while scrolling back (on by default)
- **Global mode** — one switch for all channels (globe icon) instead of per-channel (translate icon)

## License

[GPL-3.0-or-later](LICENSE). Portions adapted from the official Vencord Translate plugin, © Vendicated and contributors.
