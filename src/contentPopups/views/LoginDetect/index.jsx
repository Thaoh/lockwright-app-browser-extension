import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import { t } from '@lingui/core/macro'
import { useForm } from '@tetherto/pear-apps-lib-ui-react-hooks'
import { Validator } from '@tetherto/pear-apps-utils-validator'
import { Button, Text } from '@tetherto/pearpass-lib-ui-kit'
import {
  RECORD_TYPES,
  useCreateRecord,
  useRecords,
  useVault
} from '@tetherto/pearpass-lib-vault'

import { FormGroup } from '../../../shared/components/FormGroup'
import { InputField } from '../../../shared/components/InputField'
import { InputFieldPassword } from '../../../shared/components/InputFieldPassword'
import { PopupCard } from '../../../shared/components/PopupCard'
import { useRouter } from '../../../shared/context/RouterContext'
import { KeyIcon } from '../../../shared/icons/KeyIcon'
import { UserIcon } from '../../../shared/icons/UserIcon'
import { appendWebsiteToLoginRecord } from '../../../shared/utils/appendWebsiteToLoginRecord'
import { classifyLoginDetectAction } from '../../../shared/utils/classifyLoginDetectAction'
import { extractNameFromDomain } from '../../../shared/utils/extractNameFromDomain'
import { closeIframe } from '../../iframeApi/closeIframe'
import { setIframeStyles } from '../../iframeApi/setIframeStyles'

export const LoginDetect = () => {
  const { state: routerState } = useRouter()

  const popupRef = useRef(null)

  const recordTitle = extractNameFromDomain(routerState?.url)
  const pageUrl = routerState?.url ?? ''
  const username = routerState?.username ?? ''
  const password = routerState?.password ?? ''

  const schema = Validator.object({
    title: Validator.string().required(t`Title is required`),
    username: Validator.string(),
    password: Validator.string(),
    websites: Validator.array().items(
      Validator.object({
        website: Validator.string().website('Wrong format of website')
      })
    )
  })

  const { createRecord, isLoading: isCreateLoading } = useCreateRecord({
    onCompleted: () =>
      closeIframe({
        iframeId: routerState?.iframeId,
        iframeType: routerState?.iframeType
      })
  })

  const { refetch: refetchVault } = useVault()

  const {
    updateRecords,
    data: recordsData,
    isLoading: isUpdateLoading
  } = useRecords()

  const { action, existingRecord } = useMemo(
    () =>
      classifyLoginDetectAction({
        records: recordsData,
        pageUrl,
        username,
        password
      }),
    [recordsData, pageUrl, username, password]
  )

  const { register, handleSubmit } = useForm({
    initialValues: {
      title: recordTitle,
      username,
      password
    },
    validate: (values) => schema.validate(values)
  })

  const dismiss = () =>
    closeIframe({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType
    })

  const onSubmit = (values) => {
    if (action === 'update' && existingRecord) {
      let updated = {
        ...existingRecord,
        data: {
          ...existingRecord.data,
          title: values.title || existingRecord.data?.title,
          username: values.username,
          password: values.password
        }
      }

      const withWebsite = appendWebsiteToLoginRecord(updated, pageUrl)
      if (withWebsite) {
        updated = withWebsite
      }

      void updateRecords([updated])
        .then(() => {
          closeIframe({
            iframeId: routerState?.iframeId,
            iframeType: routerState?.iframeType
          })
        })
        .catch(() => {})
      return
    }

    createRecord({
      type: RECORD_TYPES.LOGIN,
      data: {
        title: values.title,
        username: values.username,
        password: values.password,
        websites: pageUrl ? [pageUrl] : []
      }
    })
  }

  // Mount-once vault refresh; empty deps intentional (avoid refetch loop).
  useEffect(() => {
    void refetchVault()
  }, [])

  useLayoutEffect(() => {
    setIframeStyles({
      iframeId: routerState?.iframeId,
      iframeType: routerState?.iframeType,
      style: {
        width: `${popupRef.current?.offsetWidth || 460}px`,
        height: `${popupRef.current?.offsetHeight || 280}px`,
        borderRadius: '12px'
      }
    })
  }, [action, routerState?.iframeId, routerState?.iframeType])

  const isBusy = isCreateLoading || isUpdateLoading

  if (action === 'noop') {
    return (
      <PopupCard
        className="flex w-[460px] flex-col gap-4 overflow-auto"
        ref={popupRef}
      >
        <Text variant="body">{t`Password already saved`}</Text>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={dismiss}
            disabled={isBusy}
            data-testid="login-detect-not-now"
          >
            {t`Not now`}
          </Button>
        </div>
      </PopupCard>
    )
  }

  return (
    <PopupCard
      className="flex w-[460px] flex-col gap-4 overflow-auto"
      ref={popupRef}
    >
      <FormGroup>
        <InputField
          label={t`Title`}
          placeholder={t`Insert title`}
          variant="outline"
          {...register('title')}
        />
      </FormGroup>

      <FormGroup>
        {action === 'save' && (
          <InputField
            label={t`Email or username`}
            placeholder={t`Email or username`}
            variant="outline"
            icon={UserIcon}
            {...register('username')}
          />
        )}

        <InputFieldPassword
          label={t`Password`}
          placeholder={t`Password`}
          variant="outline"
          icon={KeyIcon}
          hasStrongness
          {...register('password')}
        />
      </FormGroup>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          size="small"
          type="button"
          onClick={dismiss}
          disabled={isBusy}
          data-testid="login-detect-not-now"
        >
          {t`Not now`}
        </Button>
        <Button
          variant="primary"
          size="small"
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isBusy}
          isLoading={isBusy}
          data-testid="login-detect-confirm"
        >
          {action === 'update' ? t`Update` : t`Save`}
        </Button>
      </div>
    </PopupCard>
  )
}
