import { axiosInstance } from '../api/axios';

export const getFileNameFromPath = (path) => {
    return path.split('/').pop();
};

export const downloadFile = async (fileId, originalFileName) => {
    try {
        const response = await axiosInstance.get(`/api/board/download/${fileId}`, {
            responseType: 'blob',
            headers: {
                'Accept': 'application/octet-stream',
            }
        });

        // Content-Disposition 헤더에서 파일명 추출
        const contentDisposition = response.headers['content-disposition'];
        let filename = originalFileName;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }

        const url = window.URL.createObjectURL(new Blob([response.data], {
            type: response.headers['content-type']
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('파일 다운로드 실패:', error);
        if (error.response?.status === 404) {
            throw new Error('파일을 찾을 수 없습니다.');
        } else if (error.response?.status === 400) {
            throw new Error('비디오 링크는 다운로드할 수 없습니다.');
        } else {
            throw new Error('파일 다운로드 중 오류가 발생했습니다.');
        }
    }
}; 