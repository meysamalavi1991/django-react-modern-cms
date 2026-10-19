import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deletePost, getPosts } from '../api/content.api'

const statusLabels = {
    draft: 'پیش‌نویس',
    published: 'منتشرشده',
    archived: 'بایگانی‌شده',
}

function getErrorMessage(error) {
    const data = error.response?.data

    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.message === 'string') return data.message

    return 'دریافت اطلاعات مقاله‌ها ناموفق بود. اتصال API و ورود کاربر را بررسی کنید.'
}

function formatDate(value) {
    if (!value) return '—'

    return new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

export default function PostsPage() {
    const navigate = useNavigate()

    const [posts, setPosts] = useState([])
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [actionError, setActionError] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function loadPosts() {
            setLoading(true)
            setError('')

            try {
                const params = { page }

                if (search) params.search = search
                if (status) params.status = status

                const response = await getPosts(params)
                const data = response.data

                if (cancelled) return

                setPosts(Array.isArray(data.results) ? data.results : [])
                setPagination({
                    count: data.count ?? 0,
                    next: data.next ?? null,
                    previous: data.previous ?? null,
                })
            } catch (requestError) {
                if (!cancelled) {
                    setError(getErrorMessage(requestError))
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadPosts()

        return () => {
            cancelled = true
        }
    }, [page, search, status, reloadKey])

    function handleSearch(event) {
        event.preventDefault()
        setPage(1)
        setSearch(searchInput.trim())
    }

    function handleStatusChange(event) {
        setStatus(event.target.value)
        setPage(1)
    }

    async function handleDelete(post) {
        const confirmed = window.confirm(
            `آیا از حذف مقاله «${post.title}» مطمئن هستید؟`,
        )

        if (!confirmed) return

        setDeletingId(post.id)
        setActionError('')

        try {
            await deletePost(post.id)

            if (posts.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1)
            } else {
                const response = await getPosts({
                    page,
                    ...(search ? { search } : {}),
                    ...(status ? { status } : {}),
                })

                setPosts(response.data.results ?? [])
                setPagination({
                    count: response.data.count ?? 0,
                    next: response.data.next ?? null,
                    previous: response.data.previous ?? null,
                })
            }
        } catch (deleteError) {
            const data = deleteError.response?.data
            setActionError(
                data?.detail ||
                data?.message ||
                'حذف مقاله انجام نشد. ممکن است دسترسی لازم را نداشته باشید.',
            )
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <section className="content-page">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-2">مدیریت مطالب</h1>
                    <p className="text-secondary mb-0">
                        فهرست مقاله‌ها، جست‌وجو و مدیریت وضعیت انتشار
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/content/new')}
                >
                    <i className="bi bi-plus-lg ms-2" />
                    افزودن مقاله
                </button>
            </div>

            <div className="panel-card p-3 p-lg-4">
                <form
                    onSubmit={handleSearch}
                    className="row g-3 align-items-end mb-4"
                >
                    <div className="col-12 col-lg-6">
                        <label htmlFor="post-search" className="form-label">
                            جست‌وجوی مقاله
                        </label>
                        <input
                            id="post-search"
                            className="form-control"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="عنوان، خلاصه یا متن مقاله..."
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <label htmlFor="post-status" className="form-label">
                            وضعیت انتشار
                        </label>
                        <select
                            id="post-status"
                            className="form-select"
                            value={status}
                            onChange={handleStatusChange}
                        >
                            <option value="">همه وضعیت‌ها</option>
                            <option value="draft">پیش‌نویس</option>
                            <option value="published">منتشرشده</option>
                            <option value="archived">بایگانی‌شده</option>
                        </select>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <button type="submit" className="btn btn-outline-primary w-100">
                            <i className="bi bi-search ms-2" />
                            جست‌وجو
                        </button>
                    </div>
                </form>

                {actionError && (
                    <div className="alert alert-danger" role="alert">
                        {actionError}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger me-3"
                            onClick={() => setReloadKey((value) => value + 1)}
                        >
                            تلاش مجدد
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5" role="status">
                        <div className="spinner-border spinner-border-sm ms-2" />
                        در حال دریافت مقاله‌ها...
                    </div>
                ) : !error && posts.length === 0 ? (
                    <div className="text-center text-secondary py-5">
                        <i className="bi bi-file-earmark-text fs-2 d-block mb-3" />
                        مقاله‌ای برای نمایش وجود ندارد.
                    </div>
                ) : !error ? (
                    <>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                <tr>
                                    <th scope="col">عنوان</th>
                                    <th scope="col">نویسنده</th>
                                    <th scope="col">وضعیت</th>
                                    <th scope="col">تاریخ ایجاد</th>
                                    <th scope="col" className="text-nowrap">عملیات</th>
                                </tr>
                                </thead>
                                <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <div className="fw-semibold">{post.title}</div>
                                            <small className="text-secondary">
                                                {post.slug}
                                            </small>
                                        </td>
                                        <td>{post.author_username || '—'}</td>
                                        <td>
                        <span
                            className={`badge ${
                                post.status === 'published'
                                    ? 'text-bg-success'
                                    : post.status === 'archived'
                                        ? 'text-bg-secondary'
                                        : 'text-bg-warning'
                            }`}
                        >
                          {statusLabels[post.status] || post.status}
                        </span>
                                        </td>
                                        <td className="text-nowrap">
                                            {formatDate(post.created_at)}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="ویرایش مقاله"
                                                    aria-label={`ویرایش ${post.title}`}
                                                    onClick={() => navigate(`/content/${post.id}/edit`)}
                                                >
                                                    <i className="bi bi-pencil" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="حذف مقاله"
                                                    aria-label={`حذف ${post.title}`}
                                                    disabled={deletingId === post.id}
                                                    onClick={() => handleDelete(post)}
                                                >
                                                    {deletingId === post.id ? (
                                                        <span className="spinner-border spinner-border-sm" />
                                                    ) : (
                                                        <i className="bi bi-trash" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
              <span className="text-secondary small">
                تعداد کل: {pagination.count.toLocaleString('fa-IR')} مقاله
              </span>

                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={!pagination.previous || loading}
                                    onClick={() => setPage((currentPage) => currentPage - 1)}
                                >
                                    <i className="bi bi-chevron-right ms-1" />
                                    قبلی
                                </button>
                                <span className="btn btn-light btn-sm disabled">
                  صفحه {page.toLocaleString('fa-IR')}
                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={!pagination.next || loading}
                                    onClick={() => setPage((currentPage) => currentPage + 1)}
                                >
                                    بعدی
                                    <i className="bi bi-chevron-left me-1" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </section>
    )
}
