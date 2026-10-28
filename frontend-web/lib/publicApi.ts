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

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[]
}

export interface PublicPostFilters {
    page?: number;
    search?: string;
    category?: string;
    ordering?: string;
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

export async function getPublicPosts({page = 1, search = "", category = "", ordering = "-published_at"}: PublicPostFilters = {}): Promise<PaginatedResponse<PublicPost>> {
    const params = new URLSearchParams();

    params.set("page", String(page));

    const tSearch = search?.trim();
    tSearch && params.set('search', tSearch);

    const tCategory = category?.trim();
    tCategory && params.set('category', tCategory);

    const tOrdering = ordering?.trim();
    tOrdering && params.set('ordering', tOrdering);

    return await fetchPublicAPI<PaginatedResponse<PublicPost>>(`/posts/?${params.toString()}`);
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
    const data = await fetchPublicAPI<PaginatedResponse<PublicCategory>>(
        "/categories/"
    );

    return data.results;
}

export async function getPublicPostBySlug(slug: string): Promise<PublicPost | null> {
    try {
        return await fetchPublicAPI<PublicPost>(`/posts/${slug}/`);
    } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
            return null;
        }

        throw error;
    }
}
