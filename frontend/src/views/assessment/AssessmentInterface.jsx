import { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import { useNavigate } from 'react-router-dom';
import BaseHeader from '../partials/BaseHeader';
import Sidebar from '../partials/Sidebar';

const AssessmentInterface = () => {
    const axios = useAxios;
    const navigate = useNavigate();
    const [level, setLevel] = useState('1');
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
    const [profile, setProfile] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/user/profile/');
                setProfile(res.data);
            } catch (err) {
                console.error('Error fetching profile', err);
            }
        };

        fetchProfile();
    }, [axios]);

    console.log('Profile:', profile.id);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(
                    `/assessment/questions/?level=${level}`
                );

                setQuestions(res.data);
                setCurrentIndex(0);
            } catch (error) {
                console.error('Failed to fetch questions', error);
            }
        };
        fetchQuestions();
    }, [level]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert("⏰ Time's up!");
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [navigate]);

    const handleSubmitAnswer = async () => {
        const question = questions[currentIndex];
        const answer = answers[currentIndex];

        await axios.post('/assessment/submit-response/', {
            profile: profile.id,
            question: question.id,
            selected_choice: answer
        });

        const next = currentIndex + 1;
        if (next < questions.length) {
            setCurrentIndex(next);
        } else {
            const res = await axios.post('/assessment/submit/', {
                profile_id: profile.id
            });
            console.log('✅✅', res.data);

            const current = res.data.results.find((r) => r.level === level);
            if (current.passed) {
                if (level === '3') {
                    alert('✅ All levels passed!');
                    // navigate('/dashboard');
                } else {
                    setLevel((prev) => String(parseInt(prev) + 1));
                }
            } else {
                console.log(`❌ Failed Level ${level}: ${current.feedback}`);
                // screen.location.reload();
            }
        }
    };

    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content">
                    <BaseHeader />

                    <div className="container-fluid py-4">
                        <div className="d-flex flex-column justify-content-start align-items-center text-center mb-4">
                            <h2>Level {level} Assessment</h2>
                            <span className="badge bg-primary fs-5">
                                Time Left: {Math.floor(timeLeft / 60)}:
                                {String(timeLeft % 60).padStart(2, '0')}
                            </span>
                        </div>

                        {questions.length > 0 && (
                            <div className="card p-4 shadow-sm">
                                <h3>{questions[currentIndex].text}</h3>
                                <div className="mt-3">
                                    {questions[currentIndex].choices?.map(
                                        (choice) => (
                                            <div
                                                className="form-check mb-2"
                                                key={choice.id}
                                            >
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="answer"
                                                    id={`choice-${choice.id}`}
                                                    checked={
                                                        answers[
                                                            currentIndex
                                                        ] === choice.id
                                                    }
                                                    onChange={() => {
                                                        const copy = [
                                                            ...answers
                                                        ];
                                                        copy[currentIndex] =
                                                            choice.id;
                                                        setAnswers(copy);
                                                    }}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`choice-${choice.id}`}
                                                >
                                                    {choice.text}
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={handleSubmitAnswer}
                                    >
                                        {currentIndex === questions.length - 1
                                            ? 'Submit Level'
                                            : 'Next Question'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssessmentInterface;
