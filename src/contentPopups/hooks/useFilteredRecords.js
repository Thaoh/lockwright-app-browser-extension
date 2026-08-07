import { useMemo } from 'react'

import { useRecords } from '@tetherto/pearpass-lib-vault'

import { useRouter } from '../../shared/context/RouterContext'
import { doesWebsiteMatchPage } from '../../shared/utils/doesWebsiteMatchPage'

export const useFilteredRecords = () => {
  const { state: routerState } = useRouter()

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

  const filteredRecords = useMemo(() => {
    if (routerState.recordType === 'login' && routerState?.url) {
      return recordsData?.filter((record) =>
        record?.data?.websites?.some((website) =>
          doesWebsiteMatchPage(routerState.url, website)
        )
      )
    }

    return recordsData
  }, [recordsData, routerState?.url, routerState?.recordType])

  return {
    filteredRecords,
    isInitialized,
    isLoading
  }
}
