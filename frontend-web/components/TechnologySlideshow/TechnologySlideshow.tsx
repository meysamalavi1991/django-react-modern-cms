import {getPublicPosts} from "@/lib/publicApi";
import TechnologySlideshowClient from "@/components/TechnologySlideshow/TechnologySlideshowClient";

export default async function TechnologySlideshow() {
    const data = await getPublicPosts({
        page: 1,
        category: "تکنولوژی",
        ordering: "-published_at",
    });

    const posts = data.results;

    return (
        <TechnologySlideshowClient posts={posts}/>
    );
}