/**
 *
 * @param {Object} [params]
 * @param {Object} [params.styles]
 * @param {string} [params.styles.width='300px']
 * @param {string} [params.styles.height='200px']
 * @param {string} [params.styles.top='20px']
 * @param {string} [params.styles.right='']
 * @param {string} [params.styles.left='']
 * @param {string} [params.styles.borderRadius='0px']
 * @param {string} [params.styles.overflow='hidden']
 * @param {Object} [params.options]
 * @param {string} [params.options.id]
 * @param {string} [params.options.type]
 * @returns {HTMLIFrameElement}
 */
export const createIframe = ({ styles, options } = {}) => {
  const {
    width = '300px',
    height = '200px',
    top = '20px',
    right = '',
    left = '',
    borderRadius = '0px',
    overflow = 'hidden'
  } = styles || {}

  const uiUrl = chrome.runtime.getURL(
    `content-popups.html?id=${options?.id || ''}&type=${options?.type || ''}`
  )
  const iframe = document.createElement('iframe')
  iframe.src = uiUrl
  iframe.tabIndex = -1
  iframe.addEventListener('mousedown', (event) => {
    event.preventDefault()
  })

  iframe.style.cssText = `
    position: fixed;
    top: ${top}; 
    right : ${right};
    left: ${left};
    width: ${width}; 
    height: ${height};
    border-radius: ${borderRadius};
    overflow: ${overflow};
    border: none;
    z-index: 2147483647;
  `
  return iframe
}
