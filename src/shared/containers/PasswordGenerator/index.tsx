import { useEffect, useMemo, useState } from 'react'

import { t } from '@lingui/core/macro'
import {
  generatePassphrase,
  generatePassword
} from '@tetherto/pearpass-utils-password-generator'
import {
  checkPassphraseStrength,
  checkPasswordStrength
} from '@tetherto/pearpass-utils-password-check'
import {
  Button,
  PasswordIndicator,
  type PasswordIndicatorVariant,
  Radio,
  Slider,
  Text,
  Title,
  ToggleSwitch,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import {
  appendHistory,
  clearHistory,
  loadHistory
} from '../../utils/passwordGeneratorHistory'

const MODE_MEMORABLE = 'memorable'
const MODE_RANDOM = 'random'

type Mode = typeof MODE_MEMORABLE | typeof MODE_RANDOM

type HistoryEntry = {
  id: string
  value: string
  createdAt: number
  contextLabel?: string
  contextKind?: 'site' | 'entry'
  usedAt?: number
}

const HISTORY_DISPLAY_LIMIT = 20

const STRENGTH_TO_INDICATOR: Record<string, PasswordIndicatorVariant> = {
  vulnerable: 'vulnerable',
  weak: 'decent',
  safe: 'strong'
}

const renderHighlightedPassword = (
  text: string,
  primaryColor: string,
  secondaryColor: string
) => {
  const parts = text.split(/(\d+|[^a-zA-Z\d\s])/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (/^\d+$/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: primaryColor }}>
          {part}
        </span>
      )
    }

    if (/[^a-zA-Z\d\s]/.test(part)) {
      return (
        <span key={`${part}-${index}`} style={{ color: secondaryColor }}>
          {part}
        </span>
      )
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

export type PasswordGeneratorProps = {
  /**
   * Fired whenever the generated value changes (mode/length/settings tweak).
   * Consumers (Dialog wrapper, iframe wrapper) subscribe to read the latest
   * value when their primary action button fires.
   */
  onGeneratedChange?: (value: string) => void
}

/**
 * Chrome-less, context-agnostic body for the password generator. Renders
 * generated password, length, settings, and synced history. Consumers provide
 * the outer card / dialog header / footer buttons.
 */
export const PasswordGenerator = ({
  onGeneratedChange
}: PasswordGeneratorProps) => {
  const { theme } = useTheme()
  const { copyToClipboard } = useCopyToClipboard()

  const [mode, setMode] = useState<Mode>(MODE_RANDOM)
  const [memorable, setMemorable] = useState({
    words: 8,
    capitalLetters: true,
    symbols: true,
    numbers: true
  })
  const [random, setRandom] = useState({
    characters: 20,
    specialCharacters: true
  })
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const generated = useMemo(() => {
    if (mode === MODE_MEMORABLE) {
      return generatePassphrase(
        memorable.capitalLetters,
        memorable.symbols,
        memorable.numbers,
        memorable.words
      ).join('-')
    }
    return generatePassword(random.characters, {
      includeSpecialChars: random.specialCharacters,
      lowerCase: true,
      upperCase: true,
      numbers: true
    })
  }, [mode, memorable, random])

  useEffect(() => {
    onGeneratedChange?.(generated)
  }, [generated, onGeneratedChange])

  // appendHistory loads existing entries first, so this also hydrates history
  // on mount (and refreshes after each regenerate). Failures leave the list usable.
  useEffect(() => {
    if (!generated) return
    let cancelled = false
    void appendHistory(generated)
      .then((entries) => {
        if (!cancelled) setHistory(entries)
      })
      .catch(() => {
        if (!cancelled) {
          void loadHistory()
            .then((entries) => {
              if (!cancelled) setHistory(entries)
            })
            .catch(() => {
              if (!cancelled) setHistory([])
            })
        }
      })
    return () => {
      cancelled = true
    }
  }, [generated])

  const strength = useMemo(() => {
    if (mode === MODE_MEMORABLE) {
      return checkPassphraseStrength(generated.split('-'))
    }
    return checkPasswordStrength(generated)
  }, [generated, mode])

  const indicatorVariant: PasswordIndicatorVariant =
    STRENGTH_TO_INDICATOR[strength.type] ?? 'vulnerable'

  const allMemorableTogglesOn =
    memorable.capitalLetters && memorable.symbols && memorable.numbers

  const setAllMemorableToggles = (on: boolean) => {
    setMemorable((r) => ({
      ...r,
      capitalLetters: on,
      symbols: on,
      numbers: on
    }))
  }

  const modeOptions: { key: Mode; label: string; description: string }[] = [
    {
      key: MODE_MEMORABLE,
      label: t`Memorable Password`,
      description: t`Memorable password using random words, numbers, and symbols.`
    },
    {
      key: MODE_RANDOM,
      label: t`Random Characters`,
      description: t`A fully random mix of letters, numbers, and symbols.`
    }
  ]

  const memorableSettings = [
    {
      key: 'all',
      label: t`Select all`,
      checked: allMemorableTogglesOn,
      onChange: (next: boolean) => setAllMemorableToggles(next)
    },
    {
      key: 'capitalLetters',
      label: t`Capital letters`,
      checked: memorable.capitalLetters,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, capitalLetters: next }))
    },
    {
      key: 'symbols',
      label: t`Symbols`,
      checked: memorable.symbols,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, symbols: next }))
    },
    {
      key: 'numbers',
      label: t`Numbers`,
      checked: memorable.numbers,
      onChange: (next: boolean) =>
        setMemorable((r) => ({ ...r, numbers: next }))
    }
  ]

  const visibleHistory = history.slice(0, HISTORY_DISPLAY_LIMIT)

  const handleClearHistory = () => {
    void clearHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
  }

  return (
    <div className="flex flex-col gap-[var(--spacing16)]">
      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Generated Password`}
        </Text>

        <div className="border-border-primary flex flex-col overflow-hidden rounded-[var(--radius8)] border">
          <div className="border-border-primary flex flex-col items-center gap-[var(--spacing16)] border-b px-[var(--spacing16)] py-[var(--spacing24)]">
            <div className="w-full min-w-0 text-center break-words">
              <Title as="h3">
                {renderHighlightedPassword(
                  generated,
                  theme.colors.colorPrimary,
                  theme.colors.colorTextSecondary
                )}
              </Title>
            </div>
            <PasswordIndicator variant={indicatorVariant} />
          </div>

          {modeOptions.map((option, index) => (
            // Outer div is a styling container (padding + divider). The
            // inner Radio is the only accessible control — its built-in
            // keyboard handling drives the selection. The div onClick just
            // extends the visual hit area; clicking it bubbles into
            // Radio.onChange (calls below) so behavior stays single-source.
            <div
              key={option.key}
              className={[
                'cursor-pointer p-[var(--spacing12)]',
                index < modeOptions.length - 1
                  ? 'border-border-primary border-b'
                  : ''
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setMode(option.key)}
            >
              <Radio
                builtIn
                options={[
                  {
                    value: option.key,
                    label: option.label,
                    description: option.description
                  }
                ]}
                value={mode === option.key ? option.key : undefined}
                onChange={() => setMode(option.key)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Password Length`}
        </Text>

        <div className="border-border-primary flex min-h-[41px] items-center justify-between gap-[var(--spacing12)] rounded-[var(--radius8)] border px-[var(--spacing12)] py-[var(--spacing8)]">
          <Text as="span" variant="labelEmphasized">
            {mode === MODE_MEMORABLE
              ? `${memorable.words} ${t`Words`}`
              : `${random.characters} ${t`Chars`}`}
          </Text>
          <div className="ms-1 min-w-0 flex-1">
            <Slider
              minimumValue={mode === MODE_MEMORABLE ? 6 : 4}
              maximumValue={mode === MODE_MEMORABLE ? 36 : 50}
              step={1}
              value={
                mode === MODE_MEMORABLE ? memorable.words : random.characters
              }
              onValueChange={(value: number) => {
                if (mode === MODE_MEMORABLE) {
                  setMemorable((r) => ({ ...r, words: Math.round(value) }))
                  return
                }
                setRandom((r) => ({
                  ...r,
                  characters: Math.round(value)
                }))
              }}
              thumbTintColor={theme.colors.colorPrimary}
              aria-label={
                mode === MODE_MEMORABLE
                  ? t`Password length in words`
                  : t`Password length in characters`
              }
              maximumTrackTintColor={theme.colors.colorBorderPrimary}
              minimumTrackTintColor={theme.colors.colorPrimary}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-[var(--spacing12)]">
        <Text variant="caption" color={theme.colors.colorTextSecondary}>
          {t`Password settings`}
        </Text>

        <div className="border-border-primary flex flex-col overflow-hidden rounded-[var(--radius8)] border">
          {mode === MODE_MEMORABLE ? (
            memorableSettings.map((setting, index) => (
              <div
                key={setting.key}
                className={[
                  'flex items-center justify-between px-[var(--spacing16)] py-[var(--spacing12)]',
                  index < memorableSettings.length - 1
                    ? 'border-border-primary border-b'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Text variant="bodyEmphasized">{setting.label}</Text>
                <ToggleSwitch
                  checked={setting.checked}
                  onChange={setting.onChange}
                  aria-label={setting.label}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between px-[var(--spacing16)] py-[var(--spacing12)]">
              <Text variant="bodyEmphasized">{t`Special character (!&*)`}</Text>
              <ToggleSwitch
                checked={random.specialCharacters}
                onChange={(next) =>
                  setRandom((r) => ({ ...r, specialCharacters: next }))
                }
                aria-label={t`Special character (!&*)`}
              />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-[var(--spacing12)]">
        <div className="flex items-center justify-between gap-[var(--spacing8)]">
          <Text variant="caption" color={theme.colors.colorTextSecondary}>
            {t`History`}
          </Text>
          {history.length > 0 && (
            <Button
              variant="tertiary"
              size="small"
              type="button"
              onClick={handleClearHistory}
              data-testid="password-generator-clear-history"
            >
              {t`Clear history`}
            </Button>
          )}
        </div>

        {visibleHistory.length === 0 ? (
          <Text variant="body" color={theme.colors.colorTextTertiary}>
            {t`No generated passwords yet`}
          </Text>
        ) : (
          <div className="border-border-primary flex max-h-[220px] flex-col overflow-y-auto rounded-[var(--radius8)] border">
            {visibleHistory.map((entry, index) => (
              <div
                key={entry.id}
                className={[
                  'flex items-center justify-between gap-[var(--spacing8)] px-[var(--spacing12)] py-[var(--spacing8)]',
                  index < visibleHistory.length - 1
                    ? 'border-border-primary border-b'
                    : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="min-w-0 flex-1">
                  <Text
                    as="span"
                    variant="bodyEmphasized"
                    className="block truncate"
                  >
                    {entry.value}
                  </Text>
                  <Text
                    as="span"
                    variant="caption"
                    color={theme.colors.colorTextTertiary}
                  >
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                  {entry.contextLabel ? (
                    <Text
                      as="span"
                      variant="caption"
                      color={theme.colors.colorTextTertiary}
                      className="block truncate"
                    >
                      {entry.contextLabel}
                    </Text>
                  ) : null}
                </div>
                <Button
                  variant="tertiary"
                  size="small"
                  type="button"
                  aria-label={t`Copy password`}
                  iconBefore={<ContentCopy width={16} height={16} />}
                  onClick={() => copyToClipboard(entry.value)}
                  data-testid={`password-generator-history-copy-${entry.id}`}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
