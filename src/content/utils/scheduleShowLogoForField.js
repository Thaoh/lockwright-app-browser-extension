/**
 * Nextcloud (and similar) dialogs focus the password field on mount,
 * often before layout. Retry until the field has a box, then show the logo.
 *
 * @param {HTMLElement} field
 * @param {{
 *   isUsable: (field: HTMLElement) => boolean,
 *   show: (field: HTMLElement) => void,
 *   schedule?: (cb: () => void) => void,
 *   attempts?: number
 * }} options
 */
export const scheduleShowLogoForField = (
  field,
  { isUsable, show, schedule = requestAnimationFrame, attempts = 8 }
) => {
  const run = (left) => {
    if (!field || field.isConnected === false) {
      return
    }
    if (isUsable(field)) {
      show(field)
      return
    }
    if (left <= 1) {
      return
    }
    schedule(() => run(left - 1))
  }

  run(attempts)
}
