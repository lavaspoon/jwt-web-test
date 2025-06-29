import { useMutation, useQuery } from '@tanstack/react-query';
import { axiosInstance } from './axios';

export const useGetBoardList = (page = 0, size = 10) => {
    return useQuery({
        queryKey: ['boardList', page, size],
        queryFn: async () => {
            const response = await axiosInstance.get(`/api/board/list?page=${page}&size=${size}`);
            return response.data;
        },
    });
};

export const useSaveBoard = () => {
    return useMutation({
        mutationFn: async (formData) => {
            const response = await axiosInstance.post('/api/board/save', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
    });
};

export const useUpdateBoard = () => {
    return useMutation({
        mutationFn: async ({ boardId, formData }) => {
            const response = await axiosInstance.put(`/api/board/${boardId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
    });
};

export const useGetBoard = (boardId) => {
    return useQuery({
        queryKey: ['board', boardId],
        queryFn: async () => {
            if (!boardId) return null;
            const response = await axiosInstance.get(`/api/board/${boardId}`);
            return response.data;
        },
        enabled: !!boardId,
    });
}; 