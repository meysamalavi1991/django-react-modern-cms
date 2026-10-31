import {getPublicPosts} from "@/lib/publicApi";
import PostPreview from "@/components/PostPreview/PostPreview";
import Pagination from "@/components/Pagination/Pagination";


interface SearchPageProps {
    searchParams: {
        page?: string;
        search?: string;
        category?: string;
        ordering?: string;
    };
    params: {
        slug: string;
    }
}

export default async function Search({searchParams, params}: SearchPageProps) {
    const requestedPage = Number(searchParams.page ?? "1");

    const currentPage =
        Number.isInteger(requestedPage) && requestedPage > 0
            ? requestedPage
            : 1;

    const search = params.slug ? decodeURIComponent(params.slug) : (searchParams.search ?? "");

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

    const data = await postsPromise;

    const totalPages = Math.ceil(data.count / 20);

    return (
        <>
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
        </>
    )
}


/*
import { allPosts } from "@/.contentlayer/generated";
import styles from "./Search.module.css";
import { usePathname } from "next/navigation";
import { compareDesc } from "date-fns";
import PostPreview from "@/components/PostPreview/PostPreview";

export default function Search() {
  const pathname = usePathname();
  const keyword = pathname.replace("/search/", "");
  const decodedKeyword = decodeURIComponent(keyword);

  const posts = allPosts
    .filter((post) => {
      // convert title array to lowercase to search for matches
      const titleInLowerCase = post.title.toString().toLowerCase();
      return titleInLowerCase.includes(decodedKeyword);
    })
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));

  // generate previews of posts
  const postPreviews = posts.map((post: any, idx: any) => (
    <PostPreview key={idx} {...post} />
  ));

  return (
    <div className={styles.SearchPageContainer}>
      <h1>Search Results for &quot;{decodedKeyword}&quot;</h1>
      <div className="ListPosts">{postPreviews}</div>
    </div>
  );
}
*/
