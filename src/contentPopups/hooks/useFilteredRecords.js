import { useEffect, useMemo, useState } from 'react'

import { useRecords } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../shared/context/RouterContext'
import { doesWebsiteMatchPage } from '../../shared/utils/doesWebsiteMatchPage'
import {
  hydrateUriMatchSettings,
  onUriMatchSettingsChanged,
  resolveUriMatchType
} from '../../shared/utils/uriMatchSetting'

export const useFilteredRecords = () => {
  const { state: routerState } = useRouter()
  const [uriMatchEpoch, setUriMatchEpoch] = useState(0)

  const {
    data: recordsData,
    isInitialized,
    isLoading
  } = useRecords({
    variables: {
      filters: {
        type: routerState.recordType
      }
    }
  })

  useEffect(() => {
    let alive = true
    void hydrateUriMatchSettings().then(() => {
      if (alive) setUriMatchEpoch((n) => n + 1)
    })
    const unsubscribe = onUriMatchSettingsChanged(() => {
      setUriMatchEpoch((n) => n + 1)
    })
    return () => {
      alive = false
      unsubscribe()
    }
  }, [])

  const filteredRecords = useMemo(() => {
    if (routerState.recordType === 'login' && routerState?.url) {
      return recordsData?.filter((record) =>
        record?.data?.websites?.some((website) =>
          doesWebsiteMatchPage(
            routerState.url,
            website,
            resolveUriMatchType(record, website)
          )
        )
      )
    }

    return recordsData
  }, [recordsData, routerState?.url, routerState?.recordType, uriMatchEpoch])

  return {
    filteredRecords,
    isInitialized,
    isLoading
  }
}
