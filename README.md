# LiveTranslator

LiveTranslator is an unofficial Vencord userplugin for automatic message translation in Discord. It translates outgoing messages before they are sent and can display incoming messages in your preferred language without changing the original message stored by Discord.

> [!IMPORTANT]
> LiveTranslator must be added to a **source build of Vencord**. It cannot be installed as a standalone plugin through the standard Vencord installer.

> [!WARNING]
> Vencord is a third-party Discord client modification and its use may violate Discord's Terms of Service. LiveTranslator is not affiliated with or endorsed by Discord, Vencord, or Google.

## Compatibility

| Platform                                     | Support                                           |
| -------------------------------------------- | ------------------------------------------------- |
| Discord Desktop on Windows, macOS, and Linux | Yes, through a Vencord source build               |
| Discord Web                                  | Yes, through a source-built Vencord browser build |
| Official Discord apps for iOS and Android    | No                                                |

## Features

* Translates outgoing messages before Discord sends them.
* Displays incoming translations in place while preserving surrounding Discord UI such as replies, reactions, embeds, and attachments.
* Provides disabled, outgoing-only, and two-way translation modes from the chat bar.
* Supports either one global mode or separate modes for individual channels.
* Can detect a channel's dominant language from a random sample of up to 10 recent messages and use it as the outgoing target language.
* Can prioritize the language of a replied-to message when automatic detection is enabled.
* Translates edited messages through Vencord's edit hook and a fallback wrapper around Discord's edit action.
* Displays translated reply previews while preserving click-to-jump behavior.
* Adds language badges beside translated message groups. Hovering reveals incoming originals; for your own messages, it shows a back-translation into your language.
* Protects mentions, URLs, custom emoji, timestamps, fenced code blocks, and inline code with placeholders during translation.
* Skips messages that contain no translatable text.
* Uses per-message and text-level caches, deduplicates in-flight incoming requests, and limits translation work to three concurrent requests.
* Includes interface translations for English, Italian, German, Spanish, French, and Portuguese, with English fallback.
* Cancels an outgoing message when translation fails, preventing the untranslated text from being sent accidentally.
* Allows a one-message bypass by prefixing the message with a backslash (`\`).

No user-provided API key is required. The Google Translate request logic is adapted from Vencord's official Translate plugin.

## Translation modes

Click the translation button in the chat bar to cycle through the available modes.

| Mode | Indicator | Outgoing messages         | Incoming messages    |
| ---- | --------- | ------------------------- | -------------------- |
| Off  | Neutral   | Unchanged                 | Unchanged            |
| Send | Blue      | Translated before sending | Unchanged            |
| Both | Green     | Translated before sending | Displayed translated |

Right-click the translation button to return directly to **Off**.

When **Global mode** is enabled, the selected mode applies to every channel. When it is disabled, each channel keeps its own mode.

## Installation

### Requirements

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) 22 or newer
* [pnpm](https://pnpm.io/)
* Discord Desktop or a supported desktop browser

### 1. Clone Vencord and install its dependencies

The following commands work in PowerShell, Command Prompt, and most Unix-like shells:

```bash
git clone https://github.com/Vendicated/Vencord.git
cd Vencord
npm install --global pnpm
pnpm install --frozen-lockfile
```

### 2. Add LiveTranslator as a userplugin

```bash
node -e "require('node:fs').mkdirSync('src/userplugins', { recursive: true })"
git clone https://github.com/Andrew-dll/LiveTranslator.git src/userplugins/liveTranslator
```

### 3A. Discord Desktop

```bash
pnpm build
pnpm inject
```

Restart Discord, then open:

**User Settings → Vencord → Plugins → LiveTranslator**

Enable the plugin and configure its languages before activating translation from the chat bar.

### 3B. Discord Web

```bash
pnpm buildWeb
```

The web build creates the following unpacked browser-extension directories:

* `dist/chromium-unpacked`
* `dist/firefox-unpacked`

Load the appropriate directory through your browser's extension-development page, then open or reload Discord Web.

## Usage

> [!IMPORTANT]
> **Your language** has no default: set it first in the plugin settings. It is the language incoming messages are translated into (and the language of the plugin interface). Until it is set, incoming translation stays inactive — only outgoing translation works.

1. Open the LiveTranslator settings.
2. Select **Your language**.
3. Select a fixed **Send language**, or enable **Automatic send language**.
4. Use the translation button beside the chat box to choose the active mode.
5. Send messages normally.


## Settings

| Setting                 | Default        | Description                                                                      |
| ----------------------- | -------------- | -------------------------------------------------------------------------------- |
| Your language           | none		   | Language used for incoming translations and the plugin interface                 |
| Send language           | English (`en`) | Fixed target language for outgoing messages                                      |
| Automatic send language | On             | Detects the channel language and disables the fixed send-language picker         |
| Translate bots          | Off            | Includes messages authored by bots                                               |
| Translate history       | On             | Translates older messages when scrolling through history                         |
| Global mode             | On             | Uses one translation mode for all channels instead of storing a mode per channel |

## Automatic language detection

Automatic detection excludes your own messages and bot messages, samples up to 10 recent candidates, and selects the language with the most votes. Results are cached for up to 10 minutes and prefetched when channels are selected or their messages are loaded.

If no channel language can be determined, LiveTranslator falls back to the configured **Send language**. When replying to another user, the detected language of the referenced message takes priority when available.

## Privacy and behavior

Text that requires translation is sent to Google's translation service. Mentions, URLs, custom emoji, Discord timestamps, fenced code blocks, and inline code are replaced with placeholders before the request and restored afterward, but the remaining message text leaves the Discord client.

Do not use automatic translation for confidential, regulated, or otherwise sensitive information.

Incoming translation is display-only: the original Discord message remains unchanged. Outgoing translation is different—the translated result becomes the message that Discord receives and sends.

If outgoing translation fails, the send operation is cancelled and an error toast is displayed. If incoming translation fails, the original message remains visible.

## Known limitations

* Automatic detection can be inaccurate for short, mixed-language, slang-heavy, or low-context conversations.
* A back-translation of your own sent message is not guaranteed to reproduce the exact text typed before translation.
* Discord updates can temporarily break DOM-based message replacement or reply-preview patches.
* Formatting protection cannot guarantee perfect preservation for every possible message structure.
* Google's translation endpoint may reject, rate-limit, or temporarily fail requests.
* Mobile Discord clients are not supported.

## Updating

From the Vencord repository:

```bash
git pull
git -C src/userplugins/liveTranslator pull
pnpm install --frozen-lockfile
```

For Discord Desktop, rebuild and restart Discord:

```bash
pnpm build
```

For Discord Web, rebuild and reload the browser extension:

```bash
pnpm buildWeb
```

Run `pnpm inject` again if the desktop installation no longer loads Vencord after a Discord or Vencord update.

## License

LiveTranslator is licensed under the [GNU General Public License v3.0 or later](LICENSE).

Portions of the translation request and icon implementation are adapted from Vencord's official Translate plugin, © Vendicated and contributors, under GPL-3.0-or-later.
