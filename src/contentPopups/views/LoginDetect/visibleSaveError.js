/**
 * Content-popup i18n can return '' for a string not in the compiled catalog.
 * AlertMessage then paints a blank red bar.
 *
 * @param {unknown} translated
 * @returns {string}
 */
export const visibleSaveError = (translated) => {
  if (typeof translated === 'string' && translated.trim()) {
    return translated
  }
  return 'Something went wrong, please try again'
}
