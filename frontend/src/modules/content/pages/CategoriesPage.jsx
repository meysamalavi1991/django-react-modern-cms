
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    createCategory,
    deleteCategory,
    getCategoryTree,
    updateCategory,
} from '../api/content.api'

const EMPTY_FORM = {
    name: '',
    slug: '',
    description: '',
    parent: '',
    is_active: true,
    sort_order: 0,
}

function flattenCategories(categories, depth = 0, result = []) {
    for (const category of categories) {
        result.push({ ...category, depth })
        flattenCategories(category.children || [], depth + 1, result)
    }

    return result
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [expandedIds, setExpandedIds] = useState(new Set())
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [fieldErrors, setFieldErrors] = useState({})

    const loadCategories = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const response = await getCategoryTree()
            setCategories(response.data)
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                'دریافت دسته‌بندی‌ها ناموفق بود. اتصال و دسترسی API را بررسی کنید.',
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function fetchCategories() {
            setLoading(true)
            setError('')

            try {
                const response = await getCategoryTree()

                if (!cancelled) {
                    setCategories(response.data)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.detail ||
                        'دریافت دسته‌بندی‌ها ناموفق بود. اتصال و دسترسی API را بررسی کنید.',
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchCategories()

        return () => {
            cancelled = true
        }
    }, [])

    const flatCategories = useMemo(
        () => flattenCategories(categories),
        [categories],
    )

    const visibleCategories = useMemo(() => {
        const query = search.trim().toLocaleLowerCase()

        if (!query) {
            return null
        }

        return flatCategories.filter((category) =>
            `${category.name} ${category.slug || ''}`
                .toLocaleLowerCase()
                .includes(query),
        )
    }, [flatCategories, search])

    function toggleCategory(id) {
        setExpandedIds((previous) => {
            const next = new Set(previous)

            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }

            return next
        })
    }

    function openCreate(parent = null) {
        setEditingId(null)
        setForm({
            ...EMPTY_FORM,
            parent: parent ? String(parent.id) : '',
        })
        setFieldErrors({})
        setError('')
        setNotice('')
        setFormOpen(true)
    }

    function openEdit(category) {
        setEditingId(category.id)
        setForm({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            parent: category.parent ? String(category.parent) : '',
            is_active: category.is_active,
            sort_order: category.sort_order ?? 0,
        })
        setFieldErrors({})
        setError('')
        setNotice('')
        setFormOpen(true)
    }

    function updateField(event) {
        const { name, value, type, checked } = event.target

        setForm((previous) => ({
            ...previous,
            [name]:
                type === 'checkbox'
                    ? checked
                    : name === 'sort_order'
                        ? value
                        : value,
        }))
    }

    function getErrorMessage(data) {
        if (typeof data === 'string') {
            return data
        }

        if (data?.detail) {
            return data.detail
        }

        if (data && typeof data === 'object') {
            return Object.entries(data)
                .map(([field, messages]) => {
                    const text = Array.isArray(messages)
                        ? messages.join(' ')
                        : String(messages)

                    return `${field}: ${text}`
                })
                .join(' | ')
        }

        return 'عملیات انجام نشد. دوباره تلاش کنید.'
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)
        setError('')
        setNotice('')
        setFieldErrors({})

        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
            parent: form.parent ? Number(form.parent) : null,
            is_active: form.is_active,
            sort_order: Number(form.sort_order) || 0,
        }

        if (!payload.name) {
            setFieldErrors({ name: 'نام دسته‌بندی الزامی است.' })
            setSaving(false)
            return
        }

        try {
            if (editingId) {
                await updateCategory(editingId, payload)
                setNotice('دسته‌بندی با موفقیت ویرایش شد.')
            } else {
                await createCategory(payload)
                setNotice('دسته‌بندی با موفقیت ایجاد شد.')
            }

            setFormOpen(false)
            await loadCategories()
        } catch (err) {
            const data = err.response?.data
            setError(getErrorMessage(data))

            if (data && typeof data === 'object' && !data.detail) {
                setFieldErrors(data)
            }
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(category) {
        const confirmed = window.confirm(
            `آیا از حذف دسته‌بندی «${category.name}» مطمئن هستید؟`,
        )

        if (!confirmed) {
            return
        }

        setError('')
        setNotice('')

        try {
            await deleteCategory(category.id)
            setNotice('دسته‌بندی حذف شد.')
            await loadCategories()
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data) ||
                'حذف دسته‌بندی ناموفق بود. ممکن است این دسته زیرمجموعه یا مقاله مرتبط داشته باشد.',
            )
        }
    }

    function renderTree(items, depth = 0) {
        return items.map((category) => {
            const hasChildren = Boolean(category.children?.length)
            const expanded = search.trim()
                ? true
                : expandedIds.has(category.id)

            return (
                <div key={category.id}>
                    <div
                        className="d-flex align-items-center gap-2 border-bottom py-3"
                        style={{ paddingRight: `${depth * 24 + 8}px` }}
                    >
                        <button
                            type="button"
                            className="btn btn-sm btn-light"
                            disabled={!hasChildren}
                            onClick={() => toggleCategory(category.id)}
                            aria-label={
                                expanded
                                    ? 'بستن زیرمجموعه‌ها'
                                    : 'نمایش زیرمجموعه‌ها'
                            }
                        >
                            <i
                                className={`bi ${
                                    hasChildren
                                        ? expanded
                                            ? 'bi-chevron-down'
                                            : 'bi-chevron-left'
                                        : 'bi-dot'
                                }`}
                                aria-hidden="true"
                            />
                        </button>

                        <i
                            className={`bi ${
                                hasChildren && expanded
                                    ? 'bi-folder2-open'
                                    : 'bi-folder'
                            } text-warning fs-5`}
                            aria-hidden="true"
                        />

                        <div className="flex-grow-1 min-w-0">
                            <div className="fw-semibold">{category.name}</div>
                            <div className="small text-muted">
                                {category.slug || 'بدون شناسه متنی'}
                                {' · '}
                                {category.is_active ? 'فعال' : 'غیرفعال'}
                                {' · '}
                                ترتیب: {category.sort_order}
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                title="افزودن زیرمجموعه"
                                onClick={() => openCreate(category)}
                            >
                                <i className="bi bi-node-plus" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="ویرایش"
                                onClick={() => openEdit(category)}
                            >
                                <i className="bi bi-pencil" aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="حذف"
                                onClick={() => handleDelete(category)}
                            >
                                <i className="bi bi-trash" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {hasChildren && expanded && (
                        <div>
                            {renderTree(category.children, depth + 1)}
                        </div>
                    )}
                </div>
            )
        })
    }

    return (
        <section className="container-fluid py-3" dir="rtl">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-1">مدیریت دسته‌بندی‌ها</h1>
                    <p className="text-muted mb-0">
                        ساختار درختی دسته‌بندی‌های محتوا
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openCreate()}
                >
                    <i className="bi bi-plus-lg ms-2" aria-hidden="true" />
                    افزودن دسته اصلی
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {notice && (
                <div className="alert alert-success" role="status">
                    {notice}
                </div>
            )}

            <div className="card">
                <div className="card-header bg-body">
                    <input
                        type="search"
                        className="form-control"
                        placeholder="جست‌وجوی نام یا شناسه دسته‌بندی..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="جست‌وجوی دسته‌بندی‌ها"
                    />
                </div>

                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center text-muted py-5">
                            در حال دریافت دسته‌بندی‌ها...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            هنوز دسته‌بندی‌ای ایجاد نشده است.
                        </div>
                    ) : visibleCategories ? (
                        visibleCategories.length ? (
                            visibleCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="d-flex align-items-center gap-2 border-bottom py-3 px-3"
                                >
                                    <i
                                        className="bi bi-folder text-warning fs-5"
                                        aria-hidden="true"
                                    />
                                    <div className="flex-grow-1">
                                        <div className="fw-semibold">
                                            {category.name}
                                        </div>
                                        <div className="small text-muted">
                                            {category.slug}
                                            {' · '}
                                            سطح {category.depth + 1}
                                            {' · '}
                                            {category.is_active
                                                ? 'فعال'
                                                : 'غیرفعال'}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => openEdit(category)}
                                    >
                                        ویرایش
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(category)}
                                    >
                                        حذف
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted py-5">
                                نتیجه‌ای برای جست‌وجو پیدا نشد.
                            </div>
                        )
                    ) : (
                        <div className="px-3">
                            {renderTree(categories)}
                        </div>
                    )}
                </div>
            </div>

            {formOpen && (
                <div
                    className="modal d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="category-form-title"
                    style={{ backgroundColor: 'rgba(0,0,0,.45)' }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h2
                                        className="modal-title fs-5"
                                        id="category-form-title"
                                    >
                                        {editingId
                                            ? 'ویرایش دسته‌بندی'
                                            : form.parent
                                                ? 'افزودن زیرمجموعه'
                                                : 'افزودن دسته اصلی'}
                                    </h2>
                                    <button
                                        type="button"
                                        className="btn-close ms-0"
                                        aria-label="بستن"
                                        onClick={() => setFormOpen(false)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label
                                            htmlFor="category-name"
                                            className="form-label"
                                        >
                                            نام دسته‌بندی *
                                        </label>
                                        <input
                                            id="category-name"
                                            name="name"
                                            className={`form-control ${
                                                fieldErrors.name
                                                    ? 'is-invalid'
                                                    : ''
                                            }`}
                                            value={form.name}
                                            onChange={updateField}
                                            required
                                            maxLength={150}
                                        />
                                        {fieldErrors.name && (
                                            <div className="invalid-feedback">
                                                {Array.isArray(fieldErrors.name)
                                                    ? fieldErrors.name.join(' ')
                                                    : fieldErrors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="category-slug"
                                            className="form-label"
                                        >
                                            شناسه متنی (Slug)
                                        </label>
                                        <input
                                            id="category-slug"
                                            name="slug"
                                            className="form-control"
                                            value={form.slug}
                                            onChange={updateField}
                                            maxLength={180}
                                            placeholder="در صورت خالی بودن، خودکار ساخته می‌شود"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="category-parent"
                                            className="form-label"
                                        >
                                            دسته والد
                                        </label>
                                        <select
                                            id="category-parent"
                                            name="parent"
                                            className="form-select"
                                            value={form.parent}
                                            onChange={updateField}
                                        >
                                            <option value="">بدون والد (دسته اصلی)</option>
                                            {flatCategories
                                                .filter(
                                                    (category) =>
                                                        category.id !== editingId &&
                                                        !(
                                                            editingId &&
                                                            category.depth >= 0 &&
                                                            (() => {
                                                                let node =
                                                                    flatCategories.find(
                                                                        (item) =>
                                                                            item.id ===
                                                                            editingId,
                                                                    )

                                                                const seen = new Set()

                                                                while (
                                                                    node?.parent
                                                                    ) {
                                                                    if (
                                                                        seen.has(
                                                                            node.parent,
                                                                        )
                                                                    ) {
                                                                        break
                                                                    }

                                                                    seen.add(
                                                                        node.parent,
                                                                    )

                                                                    if (
                                                                        node.parent ===
                                                                        category.id
                                                                    ) {
                                                                        return true
                                                                    }

                                                                    node =
                                                                        flatCategories.find(
                                                                            (item) =>
                                                                                item.id ===
                                                                                node.parent,
                                                                        )
                                                                }

                                                                return false
                                                            })()
                                                        ),
                                                )
                                                .map((category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {'— '.repeat(
                                                            category.depth,
                                                        )}
                                                        {category.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="category-description"
                                            className="form-label"
                                        >
                                            توضیحات
                                        </label>
                                        <textarea
                                            id="category-description"
                                            name="description"
                                            className="form-control"
                                            rows={3}
                                            value={form.description}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="category-sort-order"
                                            className="form-label"
                                        >
                                            ترتیب نمایش
                                        </label>
                                        <input
                                            id="category-sort-order"
                                            name="sort_order"
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            value={form.sort_order}
                                            onChange={updateField}
                                        />
                                    </div>

                                    <div className="form-check form-switch">
                                        <input
                                            id="category-active"
                                            name="is_active"
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={form.is_active}
                                            onChange={updateField}
                                        />
                                        <label
                                            htmlFor="category-active"
                                            className="form-check-label"
                                        >
                                            دسته‌بندی فعال باشد
                                        </label>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setFormOpen(false)}
                                        disabled={saving}
                                    >
                                        انصراف
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? 'در حال ذخیره...'
                                            : 'ذخیره'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
