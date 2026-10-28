import styles from "./PostFilters.module.css";
import type {PublicCategory} from "@/lib/publicApi";

interface PostFiltersProps {
    categories: PublicCategory[];
    search: string;
    category: string;
    ordering: string;
}

export default function PostFilters(props) {
    const {categories, search, category, ordering,}: PostFiltersProps = props;

    return (
        <form className={styles.Filters} action="/" method="get" dir="rtl">
            <div className={styles.Field}>
                <label htmlFor="search">جستجوی مقالات</label>
                <input
                    id="search"
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="عنوان یا عبارت موردنظر..."
                />
            </div>

            <div className={styles.Field}>
                <label htmlFor="category">دسته‌بندی</label>
                <select id="category" name="category" defaultValue={category}>
                    <option value="">همه دسته‌بندی‌ها</option>
                    {categories?.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                </select>
            </div>

            <div className={styles.Field}>
                <label htmlFor="ordering">مرتب‌سازی</label>
                <select id="ordering" name="ordering" defaultValue={ordering}>
                    <option value="-published_at">جدیدترین</option>
                    <option value="published_at">قدیمی‌ترین</option>
                    <option value="title">عنوان: صعودی</option>
                    <option value="-title">عنوان: نزولی</option>
                </select>
            </div>

            <button type="submit" className={styles.Submit}>
                اعمال فیلترها
            </button>
        </form>
    );
}
