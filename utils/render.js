/** Универсальная функция рендера списка */
export const render = async ({ source, container, template, options = {} }) => {
    const { clearContainer = true, afterInsert } = options
    if (!container) return

    let items = []
    if (Array.isArray(source)) {
        items = source
    } else return

    if (!Array.isArray(items) || items.length === 0) {
        if (clearContainer) container.innerHTML = ''
        return
    }

    if (clearContainer) container.innerHTML = ''

    for (const item of items) {
        const html = await template(item)
        if (!html) continue
        container.insertAdjacentHTML('beforeend', html)
        const inserted = container.lastElementChild
        if (afterInsert && inserted) afterInsert(inserted, item)
    }
}


