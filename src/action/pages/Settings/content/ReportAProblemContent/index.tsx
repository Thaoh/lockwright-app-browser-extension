import { t } from '@lingui/core/macro'
import { PEARPASS_WEBSITE } from '@tetherto/pearpass-lib-constants'
import { Button, PageHeader } from '@tetherto/pearpass-lib-ui-kit'
import { Send } from '@tetherto/pearpass-lib-ui-kit/icons'

const FEEDBACK_URL = `${PEARPASS_WEBSITE}/contact/`

const TEST_IDS = {
  root: 'settings-report-a-problem',
  open: 'settings-report-a-problem-open'
} as const

export const ReportAProblemContent = () => {
  return (
    <div
      data-testid={TEST_IDS.root}
      className="flex w-full flex-col gap-[24px]"
    >
      <PageHeader
        as="h1"
        title={t`Report a problem`}
        subtitle={t`Opens the Lockwright contact form. Leave an email if you want a reply.`}
      />

      <div className="flex justify-end">
        <Button
          data-testid={TEST_IDS.open}
          type="button"
          variant="primary"
          size="small"
          iconBefore={<Send />}
          onClick={() => {
            void chrome.tabs.create({ url: FEEDBACK_URL })
          }}
        >
          {t`Open contact form`}
        </Button>
      </div>
    </div>
  )
}
