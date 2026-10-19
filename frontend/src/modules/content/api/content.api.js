import api from '../../../core/api/axios'

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

export const getCategoryTree = () =>
    api.get('/content/categories/tree/')