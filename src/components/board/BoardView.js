import React from 'react';
import { useGetBoard } from '../../api/queries';
import { downloadFile } from '../../utils/fileUtils';
import { Editor } from '@toast-ui/react-editor';
import { useParams, useNavigate } from 'react-router-dom';
import '@toast-ui/editor/dist/toastui-editor.css';
import './BoardView.css';

const BoardView = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const { data: board, isLoading, error } = useGetBoard(boardId);

    const handleFileDownload = async (file) => {
        try {
            await downloadFile(file.id, file.originalFileName);
        } catch (error) {
            alert(error.message);
        }
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>에러가 발생했습니다: {error.message}</div>;
    if (!board) return <div>게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="board-view">
            <div className="board-header">
                <div className="header-buttons">
                    <button onClick={() => navigate('/')} className="back-button">
                        목록으로
                    </button>
                    <button
                        onClick={() => navigate(`/edit/${boardId}`)}
                        className="edit-button"
                    >
                        수정
                    </button>
                </div>
                <h1 className="board-title">{board.title}</h1>
                <div className="board-info">
                    <span className="created-at">
                        작성일: {new Date(board.createdAt).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* 첨부파일 목록 */}
            {board.attachments && board.attachments.length > 0 && (
                <div className="attachments-section">
                    <h3>첨부파일</h3>
                    <div className="attachments-list">
                        {board.attachments.map((file) => (
                            <div key={file.id} className="attachment-item">
                                <span className="file-icon">
                                    {file.fileType === 'IMAGE' ? '🖼️' :
                                        file.fileType === 'PDF' ? '📄' :
                                            file.fileType === 'VIDEO' ? '🎥' : '📎'}
                                </span>
                                <span className="file-name">{file.originalFileName}</span>
                                <span className="file-size">
                                    ({Math.round(file.fileSize / 1024)} KB)
                                </span>
                                <button
                                    onClick={() => handleFileDownload(file)}
                                    className="download-button"
                                >
                                    다운로드
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 비디오 링크 목록 */}
            {board.links && board.links.length > 0 && (
                <div className="links-section">
                    <h3>링크</h3>
                    <div className="links-list">
                        {board.links.map((link, index) => (
                            <div key={index} className="link-item">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                    {link}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 게시글 내용 */}
            <div className="board-content">
                <Editor
                    initialValue={board.content}
                    previewStyle="vertical"
                    height="600px"
                    initialEditType="markdown"
                    useCommandShortcut={true}
                    viewer={true}
                />
            </div>
        </div>
    );
};

export default BoardView; 