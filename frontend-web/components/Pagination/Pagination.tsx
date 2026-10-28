import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    search?: string;
    category?: string;
    ordering?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    search = "",
    category = "",
    ordering = "-published_at",
}: PaginationProps) {
    if (totalPages <= 1) return null;

    function getPageUrl(page: number) {
        const params = new URLSearchParams();

        params.set("page", String(page));

        if (search.trim()) {
            params.set("search", search.trim());
        }

        if (category) {
            params.set("category", category);
        }

        if (ordering) {
            params.set("ordering", ordering);
        }

        return `/?${params.toString()}`;
    }

    const previousPage = currentPage - 1;
    const nextPage = currentPage + 1;

    return (
        <nav
            aria-label="صفحه‌بندی مقالات"
            dir="rtl"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                margin: "2rem 0",
            }}
        >
            {currentPage > 1 ? (
                <Link href={getPageUrl(previousPage)}>
                    صفحه قبل
                </Link>
            ) : (
                <span aria-disabled="true">صفحه قبل</span>
            )}

            <span>
                صفحه {currentPage} از {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link href={getPageUrl(nextPage)}>
                    صفحه بعد
                </Link>
            ) : (
                <span aria-disabled="true">صفحه بعد</span>
            )}
        </nav>
    );
}
