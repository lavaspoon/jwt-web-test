import React, { useState } from 'react';
import { useGetBoardList } from '../../api/queries';
import { useNavigate } from 'react-router-dom';
import './BoardList.css';

const BoardList = () => {
    const [page, setPage] = useState(0);
    const { data: boardList, isLoading } = useGetBoardList(page);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
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

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (isLoading) return <div className="loading">로딩 중...</div>;

    return (
        <div className="board-list-container">
            <div className="board-list-header">
                <h1>게시판</h1>
                <button
                    className="write-button"
                    onClick={() => navigate('/write')}
                >
                    글쓰기
                </button>
            </div>

            <div className="board-list">
                {boardList?.content.map((board) => (
                    <div
                        key={board.boardId}
                        className="board-item"
                        onClick={() => navigate(`/board/${board.boardId}`)}
                    >
                        <div className="board-item-header">
                            <h2 className="board-title">{board.title}</h2>
                            <span className="board-date">{formatDate(board.createdAt)}</span>
                        </div>

                        <div className="board-content-preview">
                            {board.content.length > 100
                                ? `${board.content.substring(0, 100)}...`
                                : board.content}
                        </div>

                        {board.attachments && board.attachments.length > 0 && (
                            <div className="board-attachments">
                                {board.attachments.map((file) => (
                                    <span key={file.id} className="attachment-badge">
                                        {getFileIcon(file.fileType)} {file.originalFileName}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {boardList && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0}
                        className="page-button"
                    >
                        이전
                    </button>
                    <span className="page-info">
                        {page + 1} / {boardList.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={boardList.last}
                        className="page-button"
                    >
                        다음
                    </button>
                </div>
            )}
        </div>
    );
};

export default BoardList; 