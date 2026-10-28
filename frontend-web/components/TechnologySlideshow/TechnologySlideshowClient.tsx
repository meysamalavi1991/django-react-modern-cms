"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PublicPost } from "@/lib/publicApi";
import styles from "./TechnologySlideshow.module.css";

interface TechnologySlideshowClientProps {
    posts: PublicPost[];
}

const ITEMS_PER_SLIDE = 5;

export default function TechnologySlideshowClient({
                                                      posts,
                                                  }: TechnologySlideshowClientProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const totalSlides = Math.ceil(posts.length / ITEMS_PER_SLIDE);

    const startIndex = currentSlide * ITEMS_PER_SLIDE;
    const visiblePosts = posts.slice(
        startIndex,
        startIndex + ITEMS_PER_SLIDE
    );

    function showPreviousSlide() {
        setCurrentSlide((previous) =>
            previous === 0 ? totalSlides - 1 : previous - 1
        );
    }

    function showNextSlide() {
        setCurrentSlide((previous) =>
            previous === totalSlides - 1 ? 0 : previous + 1
        );
    }

    if (posts.length === 0) {
        return (
            <section className={styles.Slideshow} aria-label="آخرین مطالب تکنولوژی">
                <h2 className={styles.Heading}>آخرین مطالب تکنولوژی</h2>
                <p>مقاله‌ای در این دسته‌بندی وجود ندارد.</p>
            </section>
        );
    }

    return (
        <section
            className={styles.Slideshow}
            aria-label="آخرین مطالب تکنولوژی"
        >
            <div className={styles.Header}>
                <h2 className={styles.Heading}>آخرین مطالب تکنولوژی</h2>

                <div className={styles.Controls}>
                    <button
                        type="button"
                        onClick={showPreviousSlide}
                        disabled={totalSlides <= 1}
                        aria-label="اسلاید قبلی"
                    >
                        ›
                    </button>

                    <span className={styles.Counter}>
                        {currentSlide + 1} / {totalSlides}
                    </span>

                    <button
                        type="button"
                        onClick={showNextSlide}
                        disabled={totalSlides <= 1}
                        aria-label="اسلاید بعدی"
                    >
                        ‹
                    </button>
                </div>
            </div>

            <div className={styles.PostGrid}>
                {visiblePosts.map((post) => (
                    <article className={styles.PostCard} key={post.slug}>
                        <Link
                            className={styles.PostLink}
                            href={`/${encodeURIComponent(post.slug)}`}
                        >
                            <div className={styles.ImageWrapper}>
                                {post.featured_image_url ? (
                                    <Image
                                        src={post.featured_image_url}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        className={styles.ImagePlaceholder}
                                        aria-hidden="true"
                                    >
                                        تکنولوژی
                                    </div>
                                )}
                            </div>

                            <h3 className={styles.PostTitle}>
                                {post.title}
                            </h3>
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}
