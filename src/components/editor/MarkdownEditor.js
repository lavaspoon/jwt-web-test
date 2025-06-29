import React, { useRef, useState, useEffect } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { useSaveBoard, useUpdateBoard, useGetBoard } from '../../api/queries';
import { useNavigate, useParams } from 'react-router-dom';

// 파일 타입 매핑
const FILE_TYPES = {
    // 이미지
    'image/jpeg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/gif': 'IMAGE',
    'image/webp': 'IMAGE',
    // PDF
    'application/pdf': 'PDF',
    // 비디오
    'video/mp4': 'VIDEO',
    'video/quicktime': 'VIDEO',
    'video/x-msvideo': 'VIDEO',
    // 기타 문서
    'application/msword': 'OTHER',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'OTHER',
    'application/vnd.ms-excel': 'OTHER',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'OTHER',
    'application/vnd.ms-powerpoint': 'OTHER',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'OTHER',
    'text/plain': 'OTHER',
    'application/zip': 'OTHER',
    'application/x-rar-compressed': 'OTHER',
    'application/x-7z-compressed': 'OTHER'
};

const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'IMAGE':
            return '🖼️';
        case 'PDF':
            return '📄';
        case 'VIDEO':
            return '🎥';
        default:
            return '📎';
    }
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MarkdownEditor = () => {
    const { boardId } = useParams();
    const [title, setTitle] = useState('');
    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const editorRef = useRef();
    const fileInputRef = useRef();
    const navigate = useNavigate();

    const { data: boardData, isLoading: isLoadingBoard } = useGetBoard(boardId);
    const { mutate: saveBoard, isLoading: isSaving } = useSaveBoard();
    const { mutate: updateBoard, isLoading: isUpdating } = useUpdateBoard();

    useEffect(() => {
        if (boardData) {
            setTitle(boardData.title);
            if (editorRef.current) {
                editorRef.current.getInstance().setMarkdown(boardData.content);
            }
            if (boardData.attachments) {
                setExistingFiles(boardData.attachments);
            }
        }
    }, [boardData]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const extractLinks = (content) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [];
        let match;
        while ((match = linkRegex.exec(content)) !== null) {
            links.push(match[2]); // URL만 추출
        }
        return links;
    };

    const handleRemoveExistingFile = (fileId) => {
        setExistingFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleSave = async () => {
        try {
            const content = editorRef.current?.getInstance().getMarkdown();
            if (!title.trim() || !content.trim()) {
                alert('제목과 내용을 입력해주세요.');
                return;
            }

            const links = extractLinks(content);
            const formData = new FormData();

            const boardDataJson = JSON.stringify({
                title: title,
                content: content,
                links: links,
                remainingFileIds: existingFiles.map(file => file.id)
            });
            formData.append('boardData', new Blob([boardDataJson], { type: 'application/json' }));

            files.forEach(file => {
                formData.append('files', file);
            });

            if (boardId) {
                updateBoard(
                    { boardId, formData },
                    {
                        onSuccess: () => {
                            alert('게시글이 수정되었습니다.');
                            navigate(`/board/${boardId}`);
                        },
                        onError: (error) => {
                            console.error('수정 실패:', error);
                            alert('게시글 수정에 실패했습니다.');
                        }
                    }
                );
            } else {
                saveBoard(formData, {
                    onSuccess: () => {
                        alert('게시글이 저장되었습니다.');
                        navigate('/');
                    },
                    onError: (error) => {
                        console.error('저장 실패:', error);
                        alert('게시글 저장에 실패했습니다.');
                    }
                });
            }
        } catch (error) {
            console.error('준비 중 오류 발생:', error);
            alert('준비 중 오류가 발생했습니다.');
        }
    };

    if (boardId && isLoadingBoard) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="editor-container">
            <div className="editor-header">
                <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="title-input"
                />
                <div className="file-upload-section">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="file-input"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.mp4,.mov,.avi"
                    />
                    <div className="files-preview">
                        {existingFiles.map((file) => (
                            <div key={file.id} className="file-preview">
                                <span className="file-icon">{getFileIcon(file.fileType)}</span>
                                <span className="file-name">{file.originalFileName}</span>
                                <span className="file-size">
                                    ({formatFileSize(file.fileSize)})
                                </span>
                                <button
                                    onClick={() => handleRemoveExistingFile(file.id)}
                                    className="remove-file"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        {files.map((file, index) => (
                            <div key={`new-${index}`} className="file-preview">
                                <span className="file-icon">{getFileIcon(FILE_TYPES[file.type])}</span>
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">
                                    ({formatFileSize(file.size)})
                                </span>
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="remove-file"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="button-group">
                    <button
                        onClick={() => navigate(boardId ? `/board/${boardId}` : '/')}
                        className="cancel-button"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUpdating}
                        className="save-button"
                    >
                        {isSaving || isUpdating ? '처리 중...' : (boardId ? '수정' : '저장')}
                    </button>
                </div>
            </div>
            <Editor
                ref={editorRef}
                initialValue={boardId ? '' : '내용을 입력하세요'}
                previewStyle="vertical"
                height="600px"
                initialEditType="markdown"
                useCommandShortcut={true}
            />
        </div>
    );
};

export default MarkdownEditor; 