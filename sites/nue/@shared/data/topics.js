/**
 * This template data manipulation script translate the contents of any `topics` property in the 
 * template data. It also adds a getTopicCategory function to the data.
 * @param {object} data Template data - all source data that is loaded for rendering. Becomes the
 * template context.
 */
export default function(data) {
  /* NOTE: Because the Docs site all contains an archive of older Docs version, the code in this
   * global manipulation script must remain backwards compatible with all archived Docs versions.
   */
  const topics = (!data.topics || typeof data.topics !== 'object' || Array.isArray(data.topics))
    ? {} : data.topics

  /**
   * Gets the category name for a given topic slug. The function name would better be getTopicCategoryName,
   * but we'll keep the current name for backwards compatibility reasons.
   * @param {string} slug 
   * @returns {string|undefined} The name of the category, or undefined if not found.
   */
  data.getTopicCategory = function(slug) {
    return getCategory(topics, slug)
  }

  /* Note, this function was originally written for future use, to provide a more robust way of
   * accessing the items within a category. For instance, the code in a template could use the
   * following approach:
   * ```html
   * <a :each="{ slug, desc, title } in getCategoryItems(slug)" href="{ slug }">
   *   <!-- code here... -->
   * </a>
   * ```
   */
  /**
   * Gets the category items for a given topic slug.
   * @param {string} slug 
   * @returns {Array} The items in the category, or an empty array if not found.
   */
  data.getCategoryItems = function(slug) {
    const cat = getCategory(topics, slug)
    return cat ? topics[cat] : []
  }

  // translate topic entries
  for (const [cat, items] of Object.entries(topics)) {
    if (!topics[cat][0]?.title) topics[cat] = items.map(parseEntry)
  }
}

export function getCategory(topics, slug) {
  if (!topics || typeof topics !== 'object' || Array.isArray(topics)) return
  for (const category in topics) {
    for (const item of topics[category]) {
      if (slug == item.slug) return category
    }
  }
}

export function parseEntry(el) {
  const [content, explicitSlug] = el.split(' | ')

  // Split content by / to separate title and desc
  const [title, desc = ''] = content.split(' / ')

  // Use explicit slug or generate from title
  const slug = explicitSlug || title.toLowerCase().replaceAll(' ', '-')

  return { title: title.trim(), desc: desc.trim(), slug: slug.trim() }
}


