/**
 * Central registry of localStorage keys.
 *
 * KEY RULE (see CLAUDE.md): NEVER change these string values once shipped.
 * Renaming a key orphans every user's offline data. Add new keys; don't edit
 * existing ones. The constant *names* on the left can be refactored freely —
 * only the string values are the contract with the browser.
 */
export const STORAGE_KEYS = {
  activeCampaignId: "aelthar.activeCampaignId",
  character: (characterId: string) => `aelthar.character.${characterId}`,
  inventory: (characterId: string) => `aelthar.inventory.${characterId}`,
  spells: (characterId: string) => `aelthar.spells.${characterId}`,
  sessionDraft: (sessionId: string) => `aelthar.session.draft.${sessionId}`,
} as const;
