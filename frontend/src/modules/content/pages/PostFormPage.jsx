
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    createPost,
    getCategoryTree,
    getPost,
    updatePost,
} from '../api/content.api'
import RichTextEditor from '../components/RichTextEditor'
import MediaPicker from '../../media/components/MediaPicker'

function getList(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.results)) return payload.results
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.results)) return payload.data.results
    return []
}

function getObject(payload) {
    return payload?.data?.data ?? payload?.data ?? payload
}

function CategoryTree({
                          categories,
                          selectedIds,
                          onToggle,
                      }) {
    if (!categories.length) {
        return <p className="text-muted mb-0">دسته‌بندی‌ای وجود ندارد.</p>
    }

    return (
        <ul className="list-unstyled mb-0">
            {categories.map((category) => (
                <li key={category.id} className="mb-2">
                    <label className="d-flex align-items-center gap-2">
                        <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={selectedIds.includes(Number(category.id))}
                            onChange={() => onToggle(Number(category.id))}
                        />
                        <span>{category.name}</span>
                    </label>

                    {Array.isArray(category.children) &&
                        category.children.length > 0 && (
                            <div className="me-4 mt-2">
                                <CategoryTree
                                    categories={category.children}
                                    selectedIds={selectedIds}
                                    onToggle={onToggle}
                                />
                            </div>
                        )}
                </li>
            ))}
        </ul>
    )
}

const initialForm = {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    status: 'draft',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
}

export default function PostFormPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = Boolean(id)

    const [form, setForm] = useState(initialForm)
    const [categories, setCategories] = useState([])
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})

    useEffect(() => {
        let active = true

        async function loadForm() {
            setLoading(true)
            setError('')

            try {
                const categoryResponse = await getCategoryTree()

                if (active) {
                    setCategories(getList(categoryResponse.data))
                }

                if (isEditing) {
                    const postResponse = await getPost(id)
                    const post = getObject(postResponse.data)

                    if (!active) return

                    setForm({
                        title: post.title || '',
                        slug: post.slug || '',
                        excerpt: post.excerpt || '',
                        body: post.body || '',
                        status: post.status || 'draft',
                        meta_title: post.meta_title || '',
                        meta_description: post.meta_description || '',
                        focus_keyword: post.focus_keyword || '',
                    })

                    setSelectedCategoryIds(
                        Array.isArray(post.categories)
                            ? post.categories.map(Number)
                            : [],
                    )

                    if (post.featured_image) {
                        setSelectedImage({
                            id: post.featured_image,
                            url: post.featured_image_url || '',
                            title: 'تصویر شاخص فعلی',
                            alt_text: '',
                        })
                    }
                }
            } catch {
                if (active) {
                    setError(
                        isEditing
                            ? 'دریافت اطلاعات مطلب با خطا مواجه شد.'
                            : 'دریافت دسته‌بندی‌ها با خطا مواجه شد.',
                    )
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        loadForm()

        return () => {
            active = false
        }
    }, [id, isEditing])

    const updateField = (event) => {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))

        setFieldErrors((current) => ({
            ...current,
            [name]: undefined,
        }))
    }

    const toggleCategory = (categoryId) => {
        setSelectedCategoryIds((current) =>
            current.includes(categoryId)
                ? current.filter((item) => item !== categoryId)
                : [...current, categoryId],
        )
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setFieldErrors({})

        if (!form.title.trim()) {
            setFieldErrors({ title: 'عنوان مطلب الزامی است.' })
            return
        }

        setSaving(true)

        const payload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            excerpt: form.excerpt,
            body: form.body,
            status: form.status,
            categories: selectedCategoryIds,
            featured_image: selectedImage?.id ?? null,
            meta_title: form.meta_title,
            meta_description: form.meta_description,
            focus_keyword: form.focus_keyword,
        }

        try {
            if (isEditing) {
                await updatePost(id, payload)
            } else {
                await createPost(payload)
            }

            navigate('/content')
        } catch (requestError) {
            const responseData = requestError.response?.data
            const apiErrors = responseData?.errors || responseData

            if (
                apiErrors &&
                typeof apiErrors === 'object' &&
                !Array.isArray(apiErrors)
            ) {
                const normalizedErrors = {}

                Object.entries(apiErrors).forEach(([key, value]) => {
                    normalizedErrors[key] = Array.isArray(value)
                        ? value.join(' ')
                        : String(value)
                })

                setFieldErrors(normalizedErrors)
            }

            setError(
                responseData?.detail ||
                responseData?.message ||
                'ذخیره مطلب انجام نشد. اطلاعات واردشده را بررسی کن.',
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5" role="status">
                در حال بارگذاری فرم مطلب...
            </div>
        )
    }

    return (
        <div className="container-fluid px-0" dir="rtl">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                <div>
                    <h1 className="h4 mb-1">
                        {isEditing ? 'ویرایش مطلب' : 'ایجاد مطلب جدید'}
                    </h1>
                    <p className="text-muted mb-0">
                        اطلاعات محتوا، دسته‌بندی، تصویر شاخص و تنظیمات SEO
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/content')}
                >
                    بازگشت به مطالب
                </button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-4">
                    <div className="col-12 col-xl-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 p-lg-4">
                                <h2 className="h6 mb-3">محتوای مطلب</h2>

                                <div className="mb-3">
                                    <label htmlFor="post-title" className="form-label">
                                        عنوان مطلب *
                                    </label>
                                    <input
                                        id="post-title"
                                        name="title"
                                        className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
                                        value={form.title}
                                        onChange={updateField}
                                        required
                                        maxLength={255}
                                    />
                                    {fieldErrors.title && (
                                        <div className="invalid-feedback">
                                            {fieldErrors.title}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="post-slug" className="form-label">
                                        نامک (Slug)
                                    </label>
                                    <input
                                        id="post-slug"
                                        name="slug"
                                        className={`form-control ${fieldErrors.slug ? 'is-invalid' : ''}`}
                                        value={form.slug}
                                        onChange={updateField}
                                        dir="ltr"
                                        placeholder="leave-empty-for-auto-generation"
                                    />
                                    <div className="form-text">
                                        اگر خالی بماند، بک‌اند نامک را تولید می‌کند.
                                    </div>
                                    {fieldErrors.slug && (
                                        <div className="invalid-feedback">
                                            {fieldErrors.slug}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="post-excerpt" className="form-label">
                                        خلاصه مطلب
                                    </label>
                                    <textarea
                                        id="post-excerpt"
                                        name="excerpt"
                                        className="form-control"
                                        rows={3}
                                        value={form.excerpt}
                                        onChange={updateField}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">متن کامل مطلب</label>
                                    <RichTextEditor
                                        value={form.body}
                                        onChange={(body) =>
                                            setForm((current) => ({ ...current, body }))
                                        }
                                    />
                                    {fieldErrors.body && (
                                        <div className="text-danger small mt-2">
                                            {fieldErrors.body}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 p-lg-4">
                                <h2 className="h6 mb-3">بهینه‌سازی موتور جست‌وجو (SEO)</h2>

                                <div className="mb-3">
                                    <label htmlFor="meta-title" className="form-label">
                                        عنوان SEO
                                    </label>
                                    <input
                                        id="meta-title"
                                        name="meta_title"
                                        className="form-control"
                                        value={form.meta_title}
                                        onChange={updateField}
                                        maxLength={255}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="meta-description" className="form-label">
                                        توضیحات SEO
                                    </label>
                                    <textarea
                                        id="meta-description"
                                        name="meta_description"
                                        className="form-control"
                                        rows={3}
                                        value={form.meta_description}
                                        onChange={updateField}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="focus-keyword" className="form-label">
                                        کلمه کلیدی اصلی
                                    </label>
                                    <input
                                        id="focus-keyword"
                                        name="focus_keyword"
                                        className="form-control"
                                        value={form.focus_keyword}
                                        onChange={updateField}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 p-lg-4">
                                <h2 className="h6 mb-3">انتشار</h2>

                                <label htmlFor="post-status" className="form-label">
                                    وضعیت مطلب
                                </label>
                                <select
                                    id="post-status"
                                    name="status"
                                    className="form-select mb-3"
                                    value={form.status}
                                    onChange={updateField}
                                >
                                    <option value="draft">پیش‌نویس</option>
                                    <option value="published">منتشرشده</option>
                                    <option value="archived">بایگانی‌شده</option>
                                </select>

                                {fieldErrors.status && (
                                    <div className="text-danger small mb-3">
                                        {fieldErrors.status}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'در حال ذخیره...'
                                        : isEditing
                                            ? 'ذخیره تغییرات'
                                            : 'ایجاد مطلب'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 mt-2"
                                    onClick={() => navigate('/content')}
                                    disabled={saving}
                                >
                                    انصراف
                                </button>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 p-lg-4">
                                <h2 className="h6 mb-3">دسته‌بندی‌ها</h2>

                                {fieldErrors.categories && (
                                    <div className="text-danger small mb-2">
                                        {fieldErrors.categories}
                                    </div>
                                )}

                                <CategoryTree
                                    categories={categories}
                                    selectedIds={selectedCategoryIds}
                                    onToggle={toggleCategory}
                                />
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-3 p-lg-4">
                                <h2 className="h6 mb-3">تصویر شاخص</h2>

                                {selectedImage?.url ? (
                                    <img
                                        src={selectedImage.url}
                                        alt={selectedImage.alt_text || selectedImage.title || ''}
                                        className="img-fluid rounded mb-3 w-100"
                                        style={{ maxHeight: '220px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="border rounded bg-light text-muted text-center p-4 mb-3">
                                        تصویری انتخاب نشده است.
                                    </div>
                                )}

                                {selectedImage && (
                                    <p className="small text-muted">
                                        {selectedImage.title || `شناسه تصویر: ${selectedImage.id}`}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    onClick={() => setShowMediaPicker((current) => !current)}
                                >
                                    {showMediaPicker ? 'بستن کتابخانه رسانه' : 'انتخاب تصویر'}
                                </button>

                                {selectedImage && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger w-100 mt-2"
                                        onClick={() => setSelectedImage(null)}
                                    >
                                        حذف تصویر شاخص
                                    </button>
                                )}

                                {fieldErrors.featured_image && (
                                    <div className="text-danger small mt-2">
                                        {fieldErrors.featured_image}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showMediaPicker && (
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-body p-3 p-lg-4">
                            <MediaPicker
                                selectedId={selectedImage?.id ?? null}
                                onSelect={(image) => {
                                    setSelectedImage(image)
                                    setShowMediaPicker(false)
                                }}
                                onClose={() => setShowMediaPicker(false)}
                            />
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
