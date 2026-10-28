"use client"

import styles from "./PostPreview.module.css";
import {PublicPost} from "@/lib/publicApi";
import {useRouter} from "next/navigation";
import {format, parseISO} from "date-fns";
import Image from "next/image";
import Link from "next/link";


interface PostPreviewProps {
    post: PublicPost
}

export default function PostPreview({post}: PostPreviewProps) {
    const router = useRouter();
    const formattedDate = format(parseISO(post.published_at), "yyyy/MM/dd");

    return (
        <article className={styles.PostPreviewContainer}
                 onClick={() => router.push(`/${encodeURIComponent(post.slug)}`)}>
            <div className={styles.ImageWrapper}>
                {
                    post.featured_image_url ?
                        (
                            <Image className={styles.Image}
                                   src={post.featured_image_url}
                                   alt={post.title}
                                   fill
                                   sizes="(max-width: 768px) 100vw, 50vw"
                                   style={{objectFit: "cover"}}
                            />
                        ) : (
                            <div className={styles.ImagePlaceholder} aria-hidden="true">
                                <span>مجله</span>
                            </div>
                        )
                }
            </div>

            <div className={styles.ArticleTextInfo}>
                {post.categories.length > 0 && (
                    post.categories.map(category => (
                        <span key={category.slug} className={styles.Topic}>{category.name}</span>
                    ))
                )}
                <h2 className={styles.Title}>{post.title}</h2>
                {post.excerpt && <p>{post.excerpt}</p>}

                <time className={styles.Date} dateTime={post.published_at}>{formattedDate}</time>

                <Link href={`/${encodeURIComponent(post.slug)}`} onClick={e => e.stopPropagation()}
                      aria-label={` مطالعه مقاله ${post.title}`} className={styles.LnkMore}>
                    ادامه مطلب
                </Link>
            </div>
        </article>
    );
}
