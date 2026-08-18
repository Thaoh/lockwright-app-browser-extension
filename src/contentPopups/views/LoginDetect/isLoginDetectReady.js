/**
 * Whether LoginDetect has a usable records snapshot to classify against.
 * Empty [] while loading is not ready (avoids false save). Empty [] when
 * not loading is ready (genuine empty vault → save). Non-empty while
 * loading stays ready (refetch must not hide/flicker).
 *
 * @param {{
 *   isInitialized?: boolean,
 *   isLoading?: boolean,
 *   recordsData?: unknown
 * }} params
 * @returns {boolean}
 */
export const isLoginDetectReady = ({
  isInitialized,
  isLoading,
  recordsData
}) => {
  if (!isInitialized) return false
  if (!Array.isArray(recordsData)) return false
  if (isLoading && recordsData.length === 0) return false
  return true
}
