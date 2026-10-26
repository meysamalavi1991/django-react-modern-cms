import {getPublicPosts} from "@/lib/publicApi";
import PostPreview from "@/components/PostPreview/PostPreview";


export default async function Home() {
    const posts = await getPublicPosts();

    let content;
    if (posts.length === 0) {
        content = <p>موردی یافت نشد!</p>;
    } else {
        content = posts.map(post => (<PostPreview key={post.slug} post={post}/>));
    }

    return (
        <main className="ListPosts">
            {content}
        </main>
    );
}
