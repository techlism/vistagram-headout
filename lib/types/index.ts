export interface User {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    createdAt: string;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    avatar: string | null;
    imageUrl: string;
    caption: string | null;
    location: string | null;
    likesCount: number;
    sharesCount: number;
    createdAt: Date | string;
}

export interface Comment {
    id: string;
    content: string;
    createdAt: Date | string;
    userId: string;
    username: string;
    avatar: string | null;
}

export interface PostsResponse {
    posts: Post[];
    nextCursor: string | null;
    hasNextPage: boolean;
}