import { useState } from 'react'

import { t } from '@lingui/core/macro'
import { Button, PageHeader } from '@tetherto/pearpass-lib-ui-kit'
import { ContentCopy } from '@tetherto/pearpass-lib-ui-kit/icons'

import { PasswordGenerator } from '../../../shared/containers/PasswordGenerator'
import { useToast } from '../../../shared/context/ToastContext'
import { useCopyToClipboard } from '../../../shared/hooks/useCopyToClipboard'

export const Generator = () => {
  const { setToast } = useToast()
  const [generated, setGenerated] = useState('')

  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => {
      setToast({ message: t`Copied to clipboard`, icon: null })
    }
  })

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col gap-[var(--spacing24)] overflow-y-auto p-[var(--spacing24)]"
      data-testid="generator-page"
    >
      <PageHeader as="h1" title={t`Generator`} />

      <PasswordGenerator onGeneratedChange={setGenerated} />

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="small"
          type="button"
          disabled={!generated}
          iconBefore={<ContentCopy width={16} height={16} />}
          onClick={() => copyToClipboard(generated)}
          data-testid="generator-copy-password"
        >
          {t`Copy Password`}
        </Button>
      </div>
    </div>
  )
}
