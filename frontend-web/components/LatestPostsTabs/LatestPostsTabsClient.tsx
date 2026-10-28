"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicPost } from "@/lib/publicApi";
import styles from "./LatestPostsTabs.module.css";

interface LatestPostsTabsClientProps {
    technologyPosts: PublicPost[];
    magazinePosts: PublicPost[];
}

type ActiveTab = "technology" | "magazine";

export default function LatestPostsTabsClient({
                                                  technologyPosts,
                                                  magazinePosts,
                                              }: LatestPostsTabsClientProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>("technology");

    const posts =
        activeTab === "technology" ? technologyPosts : magazinePosts;

    return (
        <section className={styles.Tabs} aria-label="آخرین مقالات">
            <div
                className={styles.TabList}
                role="tablist"
                aria-label="دسته‌بندی مقالات"
            >
                <button
                    type="button"
                    role="tab"
                    id="technology-tab"
                    aria-selected={activeTab === "technology"}
                    aria-controls="latest-posts-panel"
                    onClick={() => setActiveTab("technology")}
                >
                    تکنولوژی
                </button>

                <button
                    type="button"
                    role="tab"
                    id="magazine-tab"
                    aria-selected={activeTab === "magazine"}
                    aria-controls="latest-posts-panel"
                    onClick={() => setActiveTab("magazine")}
                >
                    مجله
                </button>
            </div>

            <div
                className={styles.TabPanel}
                id="latest-posts-panel"
                role="tabpanel"
                aria-labelledby={
                    activeTab === "technology"
                        ? "technology-tab"
                        : "magazine-tab"
                }
            >
                {posts.length === 0 ? (
                    <p>مقاله‌ای در این دسته‌بندی وجود ندارد.</p>
                ) : (
                    <ul className={styles.PostList}>
                        {posts.map((post) => (
                            <li key={post.slug}>
                                <Link
                                    href={`/${encodeURIComponent(post.slug)}`}
                                >
                                    {post.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}
