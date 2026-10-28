import {getPublicPosts} from "@/lib/publicApi";
import LatestPostsTabsClient from "@/components/LatestPostsTabs/LatestPostsTabsClient";

export default async function LatestPostsTabs() {
    const [technologyData, magazineData] = await Promise.all([
        getPublicPosts({
            page: 1,
            category: "تکنولوژی",
            ordering: "-published_at",
        }),
        getPublicPosts({
            page: 1,
            category: "مجله",
            ordering: "-published_at",
        }),
    ]);

    return(
        <LatestPostsTabsClient technologyPosts={technologyData.results} magazinePosts={magazineData.results}/>
    )
}
