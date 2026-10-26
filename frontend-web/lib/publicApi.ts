import * as process from "node:process";

const API_BASE_URL = process.env.DJANGO_PUBLIC_API_URL;

export interface PublicCategory {
    name: string;
    slug: string;
}

export interface PublicPost {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    published_at: string;
    meta_title: string;
    meta_description: string;
    featured_image_url: string | null;
    categories: PublicCategory[];
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[]
}

const httpConfig = {
    headers: {
        Accept: "application/json"
    },
    next: {
        revalidate: 60
    }
}

async function fetchPublicAPI<T>(endpoint: string): Promise<T> {
    if (!API_BASE_URL)
        throw new Error("DJANGO_PUBLIC_API_URL is not configured.");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, httpConfig);
    if (!response.ok) {
        throw new Error(`Django API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as Promise<T>;
}

export async function getPublicPosts(): Promise<PublicPost[]> {
    const data = await fetchPublicAPI<PaginatedResponse<PublicPost>>("/posts/");

    return data.results;
}

export async function getPublicPostBySlug(slug: string): Promise<PublicPost | null> {
    try {
        return await fetchPublicAPI<PublicPost>(`/posts/${encodeURIComponent(slug)}/`);
    } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
            return null;
        }

        throw error;
    }
}
