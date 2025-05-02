import React, { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';
import { API_BASE_URL } from '../../utils/constants';

const CommunityFeed = () => {
    const axiosInstance = useAxios;
    const [posts, setPosts] = useState([]);
    const [newStatus, setNewStatus] = useState('');
    const [commentText, setCommentText] = useState({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const res = await axiosInstance.get('/community/');
        setPosts(res.data);
    };

    const postStatus = async () => {
        await axiosInstance.post('/community/', { content: newStatus });
        setNewStatus('');
        fetchPosts();
    };

    const postComment = async (postId) => {
        if (!commentText[postId]) return;
        await axiosInstance.post('/community/comment/', {
            content: commentText[postId],
            post: postId
        });
        setCommentText((prev) => ({ ...prev, [postId]: '' }));
        fetchPosts();
    };

    document.title = 'Community Feed | Med Pro Assessments';

    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />
                    <div className="content p-4">
                        <div className="status-box card mb-4 status-box shadow-sm">
                            <div className="card-body">
                                <h2 className="card-title">Community Feed</h2>
                                <div>
                                    <textarea
                                        value={newStatus}
                                        onChange={(e) =>
                                            setNewStatus(e.target.value)
                                        }
                                        placeholder="Share an update..."
                                        rows={3}
                                        className="form-control mb-2"
                                    />
                                    <button
                                        onClick={postStatus}
                                        className="btn btn-primary m-2 rounded"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="post-box">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="card mb-3 post shadow-sm"
                                >
                                    <div className="card-body d-flex flex-column flex-md-row align-items-start">
                                        {post.profile_picture && (
                                            <img
                                                src={`http://localhost:8000${post.profile_picture}`}
                                                className="user-avatar me-2 mb-2 mb-md-0"
                                                alt="User"
                                            />
                                        )}
                                        <div className="d-flex flex-column justify-content-center flex-grow-1">
                                            <h6 className="card-subtitle text-dark mb-1">
                                                <strong>
                                                    {post.profile_name}
                                                </strong>
                                            </h6>
                                            <p className="card-text mb-1">
                                                {post.content}
                                            </p>
                                            <div className="timestamp">
                                                {new Date(
                                                    post.timestamp
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* reply section */}
                                    <div className="reply-box mt-2 px-4">
                                        {post.comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className="d-flex align-items-center mb-2"
                                            >
                                                {comment.profile_picture && (
                                                    <img
                                                        src={`http://localhost:8000${comment.profile_picture}`}
                                                        className="user-avatar me-2 mb-2 mb-md-0"
                                                        alt="Commenter"
                                                        width={40}
                                                        height={40}
                                                    />
                                                )}
                                                <div className="d-flex flex-column flex-md-row p-2 bg-white border rounded flex-grow-1">
                                                    <span className="me-2">
                                                        <strong>
                                                            {
                                                                comment.profile_name
                                                            }
                                                        </strong>
                                                        :
                                                    </span>
                                                    <div className="comment-content me-2">
                                                        {comment.content}
                                                    </div>
                                                    <div className="timestamp">
                                                        {new Date(
                                                            comment.timestamp
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* comment input */}
                                    <div className="card-body pt-0">
                                        <div className="mt-2 d-flex flex-column flex-md-row">
                                            <textarea
                                                placeholder="Write a comment..."
                                                value={
                                                    commentText[post.id] || ''
                                                }
                                                onChange={(e) =>
                                                    setCommentText((prev) => ({
                                                        ...prev,
                                                        [post.id]:
                                                            e.target.value
                                                    }))
                                                }
                                                rows={2}
                                                className="form-control mb-2 mb-md-0 me-md-2 reply-input rounded"
                                            />
                                            <button
                                                onClick={() =>
                                                    postComment(post.id)
                                                }
                                                className="btn btn-primary px-3 py-2"
                                            >
                                                Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommunityFeed;
