import { getPublicCategories, getPublicPosts } from "@/lib/publicApi";
import PostPreview from "@/components/PostPreview/PostPreview";
import Pagination from "@/components/Pagination/Pagination";
import PostFilters from "@/components/PostFilters/PostFilters";
import PageLayout from "@/components/PageLayout/PageLayout";
import LatestPostsTabs from "@/components/LatestPostsTabs/LatestPostsTabs";
import TechnologySlideshow from "@/components/TechnologySlideshow/TechnologySlideshow";

interface HomeProps {
    searchParams: {
        page?: string;
        search?: string;
        category?: string;
        ordering?: string;
    };
}

export default async function Home({ searchParams }: HomeProps) {
    const requestedPage = Number(searchParams.page ?? "1");

    const currentPage =
        Number.isInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const search = searchParams.search ?? "";
    const category = searchParams.category ?? "";

    const allowedOrderings = [
        "-published_at",
        "published_at",
        "title",
        "-title",
    ];

    const requestedOrdering = searchParams.ordering ?? "-published_at";

    const ordering = allowedOrderings.includes(requestedOrdering)
        ? requestedOrdering
        : "-published_at";

    const postsPromise = getPublicPosts({
        page: currentPage,
        search,
        category,
        ordering,
    });

    const categoriesPromise = getPublicCategories();

    const data = await postsPromise;
    const categories = await categoriesPromise;

    const totalPages = Math.ceil(data.count / 20);

    return (
       <>
           <PageLayout sidebar={<LatestPostsTabs/>}>
               <PostFilters
                   categories={categories}
                   search={search}
                   category={category}
                   ordering={ordering}
               />

               <main className="ListPosts">
                   {data.results.length === 0 ? (
                       <p>موردی یافت نشد!</p>
                   ) : (
                       data.results.map((post) => (
                           <PostPreview key={post.slug} post={post} />
                       ))
                   )}
               </main>

               <Pagination
                   currentPage={currentPage}
                   totalPages={totalPages}
                   search={search}
                   category={category}
                   ordering={ordering}
               />
           </PageLayout>

           <TechnologySlideshow />
       </>
    );
}
