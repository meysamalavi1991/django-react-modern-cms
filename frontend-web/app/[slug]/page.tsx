import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import DOMPurify from "isomorphic-dompurify";

import { getPublicPostBySlug } from "@/lib/publicApi";
import styles from "./Article.module.css";

interface PostPageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({
                                           params,
                                       }: PostPageProps): Promise<Metadata> {
    const post = await getPublicPostBySlug(params.slug);

    if (!post) {
        return {
            title: "مقاله پیدا نشد",
        };
    }

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || undefined,
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const post = await getPublicPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const safeBody = DOMPurify.sanitize(post.body || "");

    const formattedDate = post.published_at
        ? format(parseISO(post.published_at), "yyyy/MM/dd")
        : "";

    return (
        <main className={styles.Article} dir="rtl">
            {post.categories.length > 0 && (
                <div className={styles.ArticleTopics}>
                    {post.categories.map((category) => (
                        <span className={styles.ArticleTopic} key={category.slug}>
              {category.name}
            </span>
                    ))}
                </div>
            )}

            <h1 className={styles.ArticleTitle}>{post.title}</h1>

            {post.excerpt && (
                <p className={styles.ArticleSubtitle}>{post.excerpt}</p>
            )}

            {post.featured_image_url && (
                <div className={styles.FeaturedImage}>
                    <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        width={1200}
                        height={720}
                        priority
                        sizes="(max-width: 768px) 100vw, 900px"
                        style={{
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                        }}
                    />
                </div>
            )}

            {formattedDate && (
                <div className={styles.Byline}>
                    <time dateTime={post.published_at}>{formattedDate}</time>
                </div>
            )}

            <article
                className={styles.ArticleBody}
                dangerouslySetInnerHTML={{ __html: safeBody }}
            />

            <div className={styles.BackToHome}>
                <Link href="/">بازگشت به صفحه اصلی</Link>
            </div>
        </main>
    );
}
