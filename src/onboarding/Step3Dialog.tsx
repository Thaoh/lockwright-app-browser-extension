import React, { useState } from 'react'
import { Trans } from '@lingui/react/macro'
import {
  Button,
  Title,
  Text,
  Panel,
  useTheme
} from '@tetherto/pearpass-lib-ui-kit'
import { DoneAll } from '@tetherto/pearpass-lib-ui-kit/icons'
import { ONBOARDING_ICON_SIZE } from './constants'

async function tryOpenExtensionPopup(): Promise<boolean> {
  try {
    if (
      typeof chrome !== 'undefined' &&
      chrome.action &&
      typeof chrome.action.openPopup === 'function'
    ) {
      await chrome.action.openPopup()
      return true
    }
  } catch {
    // Firefox/Zen often reject openPopup outside a restricted user-gesture context
  }
  return false
}

export const Step3Dialog = () => {
  const { theme } = useTheme()
  const accentColor = theme.colors.colorLinkText
  const [showToolbarHint, setShowToolbarHint] = useState(false)

  const handleNext = () => {
    void (async () => {
      const opened = await tryOpenExtensionPopup()
      if (!opened) {
        setShowToolbarHint(true)
      }
    })()
  }

  const footer = (
    <div className="flex w-full flex-col items-end gap-[var(--spacing8)]">
      {showToolbarHint ? (
        <Text
          as="p"
          variant="caption"
          color={theme.colors.colorTextSecondary}
          data-testid="onboarding-step3-toolbar-hint"
        >
          <Trans>
            Click the PearPass icon in your browser toolbar to open the
            extension.
          </Trans>
        </Text>
      ) : null}
      <Button
        variant="primary"
        size="medium"
        onClick={handleNext}
        data-testid="onboarding-step3-open-button"
      >
        <Trans>Open PearPass Extension</Trans>
      </Button>
    </div>
  )

  return (
    <Panel
      title={<Trans>Step 3 of 3</Trans>}
      footer={footer}
      hideCloseButton
      testID="onboarding-step3-dialog"
    >
      <div className="flex flex-col gap-[var(--spacing24)] px-[var(--spacing8)] py-[var(--spacing24)]">
        <div className="bg-surface-hover border-border-primary flex h-[200px] items-center justify-center rounded-lg border">
          <img
            src="/assets/images/step3.svg"
            className="block max-h-full"
            alt="Step 3"
          />
        </div>
        <div className="flex flex-col items-center gap-[var(--spacing16)] text-center">
          <Title as="h2">
            <Trans>PearPass is Ready</Trans>
          </Title>
          <div className="flex flex-col gap-[var(--spacing12)]">
            <Text as="p">
              <Trans>Your browser is now securely connected.</Trans>
              <Trans>
                You can autofill, save, and generate passwords instantly.
              </Trans>
            </Text>
            <div className="flex flex-col gap-[var(--spacing8)]">
              <div className="flex items-center justify-center gap-[var(--spacing4)]">
                <DoneAll
                  color={accentColor}
                  width={ONBOARDING_ICON_SIZE}
                  height={ONBOARDING_ICON_SIZE}
                />
                <Text as="span" color={accentColor}>
                  <Trans>Browser connected</Trans>
                </Text>
              </div>
              <div className="flex items-center justify-center gap-[var(--spacing4)]">
                <DoneAll
                  color={accentColor}
                  width={ONBOARDING_ICON_SIZE}
                  height={ONBOARDING_ICON_SIZE}
                />
                <Text as="span" color={accentColor}>
                  <Trans>Sync activated</Trans>
                </Text>
              </div>
              <div className="flex items-center justify-center gap-[var(--spacing4)]">
                <DoneAll
                  color={accentColor}
                  width={ONBOARDING_ICON_SIZE}
                  height={ONBOARDING_ICON_SIZE}
                />
                <Text as="span" color={accentColor}>
                  <Trans>Autofill enabled</Trans>
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
