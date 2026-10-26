import { useEffect, useState } from 'react'
import {
    deleteMediaFile,
    getMediaFiles,
    uploadMediaFile,
    updateMediaFile,
} from '../api/content.api'

const MEDIA_TYPES = [
    { value: '', label: 'همه رسانه‌ها' },
    { value: 'image', label: 'تصاویر' },
    { value: 'audio', label: 'صوتی' },
    { value: 'video', label: 'ویدئوها' },
    { value: 'document', label: 'اسناد و فایل‌ها' },
]

const INITIAL_FORM = {
    title: '',
    file: null,
    alt_text: '',
    caption: '',
    description: '',
}

function getErrorMessage(data) {
    if (!data) return 'عملیات ناموفق بود.'

    if (typeof data === 'string') return data

    if (data.detail) return data.detail

    return Object.entries(data)
        .map(([field, errors]) => {
            const message = Array.isArray(errors)
                ? errors.join(' ')
                : String(errors)

            return `${field}: ${message}`
        })
        .join(' | ')
}

function formatFileSize(bytes) {
    if (!bytes) return '—'

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} کیلوبایت`
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} مگابایت`
}

function formatDate(value) {
    if (!value) return '—'

    return new Date(value).toLocaleDateString('fa-IR')
}

function MediaPreview({ item }) {
    if (item.media_type === 'image' && item.url) {
        return (
            <img
                src={item.url}
                alt={item.alt_text || item.title}
                className="w-100 h-100 object-fit-contain"
                loading="lazy"
            />
        )
    }

    const icons = {
        audio: 'bi-file-earmark-music',
        video: 'bi-file-earmark-play',
        document: 'bi-file-earmark-text',
    }

    return (
        <div className="d-flex align-items-center justify-content-center h-100 text-secondary">
            <i className={`bi ${icons[item.media_type] || 'bi-file-earmark'} fs-1`} />
        </div>
    )
}

export default function MediaPage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [search, setSearch] = useState('')
    const [mediaType, setMediaType] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(INITIAL_FORM)
    const [editingItem, setEditingItem] = useState(null)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        let cancelled = false

        async function fetchMedia() {
            setLoading(true)
            setError('')

            try {
                const params = {}

                if (mediaType) params.type = mediaType
                if (search.trim()) params.search = search.trim()

                const response = await getMediaFiles(params)

                if (!cancelled) {
                    const data = response.data
                    setItems(Array.isArray(data) ? data : data.results || [])
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        getErrorMessage(err.response?.data) ||
                        'دریافت فهرست رسانه‌ها ناموفق بود.',
                    )
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        fetchMedia()

        return () => {
            cancelled = true
        }
    }, [mediaType, search, refreshKey])

    function openCreateForm() {
        setEditingItem(null)
        setForm({ ...INITIAL_FORM })
        setError('')
        setNotice('')
        setShowForm(true)
    }

    function openEditForm(item) {
        setEditingItem(item)
        setForm({
            title: item.title || '',
            file: null,
            alt_text: item.alt_text || '',
            caption: item.caption || '',
            description: item.description || '',
        })
        setError('')
        setNotice('')
        setShowForm(true)
    }

    function closeForm() {
        if (saving) return

        setShowForm(false)
        setEditingItem(null)
        setForm({ ...INITIAL_FORM })
    }

    function handleFieldChange(event) {
        const { name, value, files } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: files ? files[0] || null : value,
        }))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)
        setError('')
        setNotice('')

        try {
            if (editingItem) {
                const data = {
                    title: form.title.trim(),
                    alt_text: form.alt_text,
                    caption: form.caption,
                    description: form.description,
                }

                await updateMediaFile(editingItem.id, data)
                setNotice('اطلاعات رسانه با موفقیت ویرایش شد.')
            } else {
                if (!form.file) {
                    setError('لطفاً یک فایل انتخاب کن.')
                    return
                }

                const data = new FormData()
                data.append('title', form.title.trim())
                data.append('file', form.file)
                data.append('alt_text', form.alt_text)
                data.append('caption', form.caption)
                data.append('description', form.description)

                await uploadMediaFile(data)
                setNotice('فایل با موفقیت بارگذاری شد.')
            }

            setShowForm(false)
            setEditingItem(null)
            setForm({ ...INITIAL_FORM })
            setRefreshKey((value) => value + 1)
        } catch (err) {
            setError(getErrorMessage(err.response?.data))
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(item) {
        const confirmed = window.confirm(
            `آیا از حذف فایل «${item.title}» مطمئن هستی؟`,
        )

        if (!confirmed) return

        setDeletingId(item.id)
        setError('')
        setNotice('')

        try {
            await deleteMediaFile(item.id)
            setItems((previous) =>
                previous.filter((media) => media.id !== item.id),
            )
            setNotice('رسانه با موفقیت حذف شد.')
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data) ||
                'حذف رسانه ناموفق بود. ممکن است دسترسی مدیر سیستم لازم باشد.',
            )
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="container-fluid py-3" dir="rtl">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-1">کتابخانه رسانه‌ها</h1>
                    <p className="text-secondary mb-0">
                        مدیریت تصاویر، فایل‌های صوتی، ویدئوها و اسناد
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateForm}
                >
                    <i className="bi bi-cloud-upload ms-2" />
                    بارگذاری رسانه
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button
                        type="button"
                        className="btn-close float-start"
                        aria-label="بستن"
                        onClick={() => setError('')}
                    />
                </div>
            )}

            {notice && (
                <div className="alert alert-success" role="status">
                    {notice}
                    <button
                        type="button"
                        className="btn-close float-start"
                        aria-label="بستن"
                        onClick={() => setNotice('')}
                    />
                </div>
            )}

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12 col-md-7">
                            <label htmlFor="media-search" className="form-label">
                                جست‌وجو
                            </label>
                            <input
                                id="media-search"
                                type="search"
                                className="form-control"
                                placeholder="عنوان، نام فایل یا توضیحات..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-5">
                            <label htmlFor="media-type" className="form-label">
                                نوع رسانه
                            </label>
                            <select
                                id="media-type"
                                className="form-select"
                                value={mediaType}
                                onChange={(event) => setMediaType(event.target.value)}
                            >
                                {MEDIA_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">در حال بارگذاری...</span>
                    </div>
                </div>
            ) : items.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-images display-4 text-secondary" />
                        <h2 className="h5 mt-3">رسانه‌ای پیدا نشد</h2>
                        <p className="text-secondary mb-0">
                            می‌توانی یک فایل جدید بارگذاری کنی یا فیلتر جست‌وجو را تغییر دهی.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {items.map((item) => (
                        <div className="col-12 col-sm-6 col-xl-4 col-xxl-3" key={item.id}>
                            <div className="card h-100 border-0 shadow-sm overflow-hidden">
                                <div
                                    className="bg-body-secondary d-flex align-items-center justify-content-center"
                                    style={{ height: 180 }}
                                >
                                    <MediaPreview item={item} />
                                </div>

                                <div className="card-body">
                                    <h2 className="h6 text-break">{item.title}</h2>

                                    <div className="small text-secondary mb-2 text-break">
                                        {item.original_filename}
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        <span className="badge text-bg-secondary">
                                            {MEDIA_TYPES.find(
                                                (type) => type.value === item.media_type,
                                            )?.label || item.media_type}
                                        </span>
                                        <span className="badge text-bg-light border">
                                            {formatFileSize(item.file_size)}
                                        </span>
                                    </div>

                                    {item.alt_text && (
                                        <p className="small mb-1">
                                            <strong>متن جایگزین:</strong> {item.alt_text}
                                        </p>
                                    )}

                                    <p className="small text-secondary mb-0">
                                        تاریخ بارگذاری: {formatDate(item.created_at)}
                                    </p>
                                </div>

                                <div className="card-footer bg-transparent border-0 pt-0 pb-3">
                                    <div className="d-flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => openEditForm(item)}
                                        >
                                            <i className="bi bi-pencil ms-1" />
                                            ویرایش
                                        </button>

                                        {item.url && (
                                            <a
                                                className="btn btn-sm btn-outline-secondary"
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <i className="bi bi-box-arrow-up-left ms-1" />
                                                مشاهده فایل
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            disabled={deletingId === item.id}
                                            onClick={() => handleDelete(item)}
                                        >
                                            <i className="bi bi-trash ms-1" />
                                            {deletingId === item.id ? 'در حال حذف...' : 'حذف'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div
                    className="modal d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="media-form-title"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h2 className="modal-title fs-5" id="media-form-title">
                                        {editingItem ? 'ویرایش رسانه' : 'بارگذاری رسانه جدید'}
                                    </h2>
                                    <button
                                        type="button"
                                        className="btn-close ms-0 me-auto"
                                        aria-label="بستن"
                                        disabled={saving}
                                        onClick={closeForm}
                                    />
                                </div>

                                <div className="modal-body">
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="media-title" className="form-label">
                                            عنوان رسانه
                                        </label>
                                        <input
                                            id="media-title"
                                            name="title"
                                            type="text"
                                            className="form-control"
                                            maxLength={255}
                                            required
                                            value={form.title}
                                            onChange={handleFieldChange}
                                        />
                                    </div>

                                    {!editingItem && (
                                        <div className="mb-3">
                                            <label htmlFor="media-file" className="form-label">
                                                انتخاب فایل
                                            </label>
                                            <input
                                                id="media-file"
                                                name="file"
                                                type="file"
                                                className="form-control"
                                                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                                                required
                                                onChange={handleFieldChange}
                                            />
                                            <div className="form-text">
                                                حداکثر حجم: ۲۰ مگابایت. فرمت‌های مجاز شامل تصاویر،
                                                صوت، ویدئو و اسناد پشتیبانی‌شده هستند.
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="media-alt" className="form-label">
                                            متن جایگزین تصویر (Alt)
                                        </label>
                                        <input
                                            id="media-alt"
                                            name="alt_text"
                                            type="text"
                                            className="form-control"
                                            maxLength={255}
                                            value={form.alt_text}
                                            onChange={handleFieldChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="media-caption" className="form-label">
                                            کپشن
                                        </label>
                                        <textarea
                                            id="media-caption"
                                            name="caption"
                                            className="form-control"
                                            rows={2}
                                            value={form.caption}
                                            onChange={handleFieldChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="media-description" className="form-label">
                                            توضیحات
                                        </label>
                                        <textarea
                                            id="media-description"
                                            name="description"
                                            className="form-control"
                                            rows={3}
                                            value={form.description}
                                            onChange={handleFieldChange}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={saving}
                                        onClick={closeForm}
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
                                            : editingItem
                                                ? 'ذخیره تغییرات'
                                                : 'بارگذاری فایل'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
