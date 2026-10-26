
import api from '../../../core/api/axios'

// Posts

export const getPosts = (params = {}) =>
    api.get('/content/posts/', { params })

export const getPost = (id) =>
    api.get(`/content/posts/${id}/`)

export const createPost = (data) =>
    api.post('/content/posts/', data)

export const updatePost = (id, data) =>
    api.patch(`/content/posts/${id}/`, data)

export const deletePost = (id) =>
    api.delete(`/content/posts/${id}/`)

// Categories

export const getCategoryTree = () =>
    api.get('/content/categories/tree/')

export const getCategories = (params = {}) =>
    api.get('/content/categories/', { params })

export const getCategory = (id) =>
    api.get(`/content/categories/${id}/`)

export const createCategory = (data) =>
    api.post('/content/categories/', data)

export const updateCategory = (id, data) =>
    api.patch(`/content/categories/${id}/`, data)

export const deleteCategory = (id) =>
    api.delete(`/content/categories/${id}/`)



// Media
export const getMediaFiles = (params = {}) =>
    api.get('/media/', { params })

export const getMediaFile = (id) =>
    api.get(`/media/${id}/`)

export const uploadMediaFile = (data) =>
    api.post('/media/', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })

export const updateMediaFile = (id, data) =>
    api.patch(`/media/${id}/`, data)

export const deleteMediaFile = (id) =>
    api.delete(`/media/${id}/`)
