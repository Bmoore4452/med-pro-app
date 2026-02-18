import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxios from '../../utils/useAxios';
import BaseHeader from '../partials/BaseHeader';
import Sidebar from '../partials/Sidebar';

const LEVEL_TIMER_SECONDS = 60 * 60;
const TRANSITION_TIMER_SECONDS = 5 * 60;

const AssessmentInterface = () => {
    const axios = useAxios;
    const navigate = useNavigate();

    const [stage, setStage] = useState('ready');
    const [currentLevel, setCurrentLevel] = useState('1');
    const [pendingNextLevel, setPendingNextLevel] = useState(null);

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);

    const [timeLeft, setTimeLeft] = useState(LEVEL_TIMER_SECONDS);
    const [transitionTimeLeft, setTransitionTimeLeft] = useState(
        TRANSITION_TIMER_SECONDS
    );

    const [profile, setProfile] = useState(null);
    const [currentAssessmentId, setCurrentAssessmentId] = useState(null);

    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastLevelResult, setLastLevelResult] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [questionLoadError, setQuestionLoadError] = useState(false);
    const [questionReloadTick, setQuestionReloadTick] = useState(0);
    const [ariaStatusMessage, setAriaStatusMessage] = useState('');
    const [lastLevelTimeAnnouncement, setLastLevelTimeAnnouncement] =
        useState(null);
    const [lastTransitionAnnouncement, setLastTransitionAnnouncement] =
        useState(null);

    const stageHeadingRef = useRef(null);
    const startButtonRef = useRef(null);
    const continueAssessmentButtonRef = useRef(null);
    const readyEnteredAtRef = useRef(Date.now());
    const stageRef = useRef(stage);
    const currentLevelRef = useRef(currentLevel);
    const assessmentIdRef = useRef(currentAssessmentId);
    const timeLeftRef = useRef(timeLeft);
    const transitionTimeLeftRef = useRef(transitionTimeLeft);

    useEffect(() => {
        stageRef.current = stage;
        currentLevelRef.current = currentLevel;
        assessmentIdRef.current = currentAssessmentId;
        timeLeftRef.current = timeLeft;
        transitionTimeLeftRef.current = transitionTimeLeft;
    }, [
        stage,
        currentLevel,
        currentAssessmentId,
        timeLeft,
        transitionTimeLeft
    ]);

    const emitTelemetry = useCallback(
        async (eventType, details = {}) => {
            try {
                const currentStage = stageRef.current;
                await axios.post('/assessment/telemetry/', {
                    event_type: eventType,
                    stage: currentStage,
                    level: currentLevelRef.current,
                    assessment_id: assessmentIdRef.current,
                    time_left:
                        currentStage === 'level'
                            ? timeLeftRef.current
                            : currentStage === 'transition'
                              ? transitionTimeLeftRef.current
                              : null,
                    details
                });
            } catch (error) {
                console.debug('Telemetry event failed:', eventType, error);
            }
        },
        [axios]
    );

    const showFeedback = (type, text) => {
        setFeedback({ type, text });
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileRes = await axios.get('/user/profile/');
                setProfile(profileRes.data);
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        loadProfile();
    }, [axios]);

    const startAssessment = async () => {
        try {
            setIsStarting(true);
            setFeedback(null);
            setShowExitConfirm(false);
            setQuestionLoadError(false);
            setQuestionReloadTick(0);
            setLastLevelResult(null);
            setPendingNextLevel(null);
            setQuestions([]);
            setAnswers([]);
            setCurrentIndex(0);
            setCurrentLevel('1');
            setTimeLeft(LEVEL_TIMER_SECONDS);
            setTransitionTimeLeft(TRANSITION_TIMER_SECONDS);

            const profileRes = await axios.get('/user/profile/');
            setProfile(profileRes.data);

            const startRes = await axios.post('/assessment/start/', {
                level: '1'
            });

            setCurrentAssessmentId(startRes.data.assessment_id);
            await emitTelemetry('assessment_started', {
                ready_dwell_seconds: Math.round(
                    (Date.now() - readyEnteredAtRef.current) / 1000
                )
            });
            setStage('level');
        } catch (error) {
            console.error('Error starting assessment:', error);
            showFeedback(
                'danger',
                'Failed to start assessment. Please try again.'
            );
        } finally {
            setIsStarting(false);
        }
    };

    const handleRetake = async () => {
        await emitTelemetry('assessment_retake_clicked', {
            previous_level: lastLevelResult?.level || currentLevel,
            previous_score: lastLevelResult?.score ?? null
        });
        await startAssessment();
    };

    const moveToNextLevel = () => {
        if (!pendingNextLevel) {
            emitTelemetry('assessment_transition_to_profile');
            navigate('/profile');
            return;
        }

        emitTelemetry('assessment_transition_manual_start_next_level', {
            next_level: pendingNextLevel
        });

        setCurrentLevel(pendingNextLevel);
        setPendingNextLevel(null);
        setCurrentIndex(0);
        setAnswers([]);
        setTimeLeft(LEVEL_TIMER_SECONDS);
        setTransitionTimeLeft(TRANSITION_TIMER_SECONDS);
        setStage('level');
    };

    useEffect(() => {
        const stageMessages = {
            ready: 'Assessment is ready to begin.',
            level: `Level ${currentLevel} in progress.`,
            transition: `Level ${lastLevelResult?.level || currentLevel} passed. Transition screen active.`,
            failed: `Level ${lastLevelResult?.level || currentLevel} not passed.`,
            completed: 'Assessment completed successfully.'
        };

        setAriaStatusMessage(stageMessages[stage] || 'Assessment updated.');

        if (stage === 'ready' && startButtonRef.current) {
            startButtonRef.current.focus();
            return;
        }

        if (stageHeadingRef.current) {
            stageHeadingRef.current.focus();
        }
    }, [stage, currentLevel, lastLevelResult]);

    useEffect(() => {
        if (stage === 'ready') {
            readyEnteredAtRef.current = Date.now();
            emitTelemetry('assessment_ready_viewed');
        }
    }, [stage, emitTelemetry]);

    useEffect(() => {
        if (stage !== 'level' || !currentAssessmentId) {
            return;
        }

        const fetchQuestions = async () => {
            try {
                setQuestionLoadError(false);
                const res = await axios.get(
                    `/assessment/questions/?level=${currentLevel}`
                );
                setQuestions(res.data || []);
                setCurrentIndex(0);
                setAnswers([]);
                setTimeLeft(LEVEL_TIMER_SECONDS);
            } catch (error) {
                console.error('Failed to fetch questions:', error);
                setQuestionLoadError(true);
                showFeedback(
                    'danger',
                    'Unable to load questions for this level. Please retry.'
                );
            }
        };

        fetchQuestions();
    }, [stage, currentAssessmentId, currentLevel, questionReloadTick, axios]);

    useEffect(() => {
        if (stage !== 'level' || !currentAssessmentId) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    emitTelemetry('assessment_level_timeout', {
                        level: currentLevel
                    });
                    showFeedback('warning', "Time's up for this level.");
                    navigate('/profile');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [stage, currentAssessmentId, currentLevel, navigate, emitTelemetry]);

    useEffect(() => {
        if (stage !== 'level') {
            return;
        }

        if (
            (timeLeft === 300 || timeLeft === 60) &&
            timeLeft !== lastLevelTimeAnnouncement
        ) {
            const minuteText = timeLeft === 60 ? '1 minute' : '5 minutes';
            setAriaStatusMessage(`${minuteText} remaining for this level.`);
            setLastLevelTimeAnnouncement(timeLeft);
        }
    }, [stage, timeLeft, lastLevelTimeAnnouncement]);

    useEffect(() => {
        if (stage !== 'transition') {
            return;
        }

        const timer = setInterval(() => {
            setTransitionTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);

                    emitTelemetry('assessment_transition_auto_advanced', {
                        next_level: pendingNextLevel
                    });

                    if (!pendingNextLevel) {
                        navigate('/profile');
                        return 0;
                    }

                    setCurrentLevel(pendingNextLevel);
                    setPendingNextLevel(null);
                    setCurrentIndex(0);
                    setAnswers([]);
                    setTimeLeft(LEVEL_TIMER_SECONDS);
                    setTransitionTimeLeft(TRANSITION_TIMER_SECONDS);
                    setStage('level');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [stage, pendingNextLevel, navigate, emitTelemetry]);

    useEffect(() => {
        if (stage !== 'transition') {
            return;
        }

        if (
            (transitionTimeLeft === 60 || transitionTimeLeft === 30) &&
            transitionTimeLeft !== lastTransitionAnnouncement
        ) {
            const secondText =
                transitionTimeLeft === 60 ? '60 seconds' : '30 seconds';
            setAriaStatusMessage(
                `${secondText} until automatic move to Level ${pendingNextLevel}.`
            );
            setLastTransitionAnnouncement(transitionTimeLeft);
        }
    }, [
        stage,
        transitionTimeLeft,
        pendingNextLevel,
        lastTransitionAnnouncement
    ]);

    useEffect(() => {
        if (!showExitConfirm) {
            return;
        }

        if (continueAssessmentButtonRef.current) {
            continueAssessmentButtonRef.current.focus();
        }

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                emitTelemetry('assessment_exit_canceled');
                setShowExitConfirm(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [showExitConfirm, emitTelemetry]);

    const handleLevelSubmit = async () => {
        try {
            setFeedback(null);
            const res = await axios.post('/assessment/submit/', {
                assessment_id: currentAssessmentId
            });

            const levelResult = res.data;
            setLastLevelResult(levelResult);

            await emitTelemetry('assessment_level_submitted', {
                result_level: levelResult.level,
                score: levelResult.score,
                passed: levelResult.passed,
                next_level: levelResult.next_level
            });

            if (levelResult.passed && levelResult.next_level) {
                setPendingNextLevel(levelResult.next_level);
                setTransitionTimeLeft(TRANSITION_TIMER_SECONDS);
                setStage('transition');
                return;
            }

            if (levelResult.passed && !levelResult.next_level) {
                await emitTelemetry('assessment_completed', {
                    final_level: levelResult.level,
                    final_score: levelResult.score
                });
                setStage('completed');
                return;
            }

            await emitTelemetry('assessment_failed', {
                failed_level: levelResult.level,
                failed_score: levelResult.score
            });
            setStage('failed');
        } catch (error) {
            console.error('Error submitting level:', error);
            showFeedback('danger', 'Failed to submit level. Please try again.');
        }
    };

    const handleSubmitAnswer = async () => {
        if (stage !== 'level') {
            return;
        }

        if (!currentAssessmentId || !profile?.id) {
            showFeedback(
                'warning',
                'Assessment is still initializing. Please wait a moment.'
            );
            return;
        }

        const question = questions[currentIndex];
        const answer = answers[currentIndex];

        if (!question) {
            return;
        }

        if (!answer) {
            showFeedback(
                'warning',
                'Please select an answer before continuing.'
            );
            return;
        }

        try {
            setFeedback(null);
            setIsSubmitting(true);

            await axios.post('/assessment/submit-response/', {
                assessment: currentAssessmentId,
                profile: profile.id,
                question: question.id,
                selected_choice: answer
            });

            const next = currentIndex + 1;
            if (next < questions.length) {
                setCurrentIndex(next);
            } else {
                await handleLevelSubmit();
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            showFeedback(
                'danger',
                'Failed to save your answer. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExitAssessment = () => {
        emitTelemetry('assessment_exit_confirmed', {
            current_question_index: currentIndex,
            total_questions: questions.length
        });
        setShowExitConfirm(false);
        navigate('/profile');
    };

    const retryLoadQuestions = () => {
        setFeedback(null);
        setQuestionLoadError(false);
        setQuestionReloadTick((value) => value + 1);
    };

    return (
        <div className="container-fluid d-flex flex-sm-row">
            <Sidebar />
            <div className="main-content">
                <BaseHeader />

                <div className="container-fluid py-4">
                    <div
                        className="visually-hidden"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {ariaStatusMessage}
                    </div>

                    {feedback && (
                        <div
                            className={`alert alert-${feedback.type} d-flex justify-content-between align-items-center`}
                            role="alert"
                        >
                            <span>{feedback.text}</span>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setFeedback(null)}
                            ></button>
                        </div>
                    )}

                    {stage === 'ready' && (
                        <div className="card p-4 shadow-sm text-center">
                            <h2 className="mb-3">Assessment Overview</h2>
                            <p className="mb-3">
                                You will complete 3 levels. Each level is timed
                                for 60 minutes. Start when you are ready.
                            </p>
                            <div
                                className="alert alert-info text-start mb-3"
                                role="status"
                            >
                                <p className="mb-2 fw-semibold">
                                    Before you begin
                                </p>
                                <ul className="mb-0">
                                    <li>
                                        You pass each level with a score of 60%
                                        or higher.
                                    </li>
                                    <li>
                                        If time runs out, the level ends and you
                                        return to your profile.
                                    </li>
                                    <li>
                                        If you fail a level, you can retake the
                                        full assessment from Level 1.
                                    </li>
                                </ul>
                            </div>
                            <button
                                className="btn btn-primary"
                                disabled={isStarting}
                                onClick={startAssessment}
                                ref={startButtonRef}
                            >
                                {isStarting
                                    ? 'Starting...'
                                    : 'Start Assessment'}
                            </button>
                        </div>
                    )}

                    {stage === 'level' && (
                        <>
                            <div className="d-flex flex-column justify-content-start align-items-center text-center mb-4">
                                <h2>Level {currentLevel} Assessment</h2>
                                <span className="badge bg-primary fs-5">
                                    Time Left: {formatTime(timeLeft)}
                                </span>
                                {questions.length > 0 && (
                                    <div
                                        className="mt-3 w-100"
                                        style={{ maxWidth: 640 }}
                                    >
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="text-muted">
                                                Question {currentIndex + 1} of{' '}
                                                {questions.length}
                                            </small>
                                            <small className="text-muted">
                                                {Math.round(
                                                    ((currentIndex + 1) /
                                                        questions.length) *
                                                        100
                                                )}
                                                %
                                            </small>
                                        </div>
                                        <div
                                            className="progress"
                                            style={{ height: 8 }}
                                        >
                                            <div
                                                className="progress-bar"
                                                role="progressbar"
                                                style={{
                                                    width: `${((currentIndex + 1) / questions.length) * 100}%`
                                                }}
                                                aria-valuenow={Math.round(
                                                    ((currentIndex + 1) /
                                                        questions.length) *
                                                        100
                                                )}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                            ></div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    className="btn btn-outline-secondary mt-3"
                                    onClick={() => {
                                        emitTelemetry(
                                            'assessment_exit_prompt_opened'
                                        );
                                        setShowExitConfirm(true);
                                    }}
                                >
                                    Exit Assessment
                                </button>
                            </div>

                            <details className="card p-3 shadow-sm mb-3" open>
                                <summary className="fw-semibold">
                                    Assessment Help
                                </summary>
                                <ul className="mt-3 mb-0 text-start">
                                    <li>
                                        <strong>How scoring works:</strong> each
                                        level score is the percentage of correct
                                        answers. A score of 60% or higher passes
                                        the level.
                                    </li>
                                    <li>
                                        <strong>
                                            What happens on timeout:
                                        </strong>{' '}
                                        if the level timer reaches 0, the level
                                        ends and you return to your profile.
                                    </li>
                                    <li>
                                        <strong>Retake rules:</strong> failing a
                                        level ends the current attempt, and you
                                        can retake from Level 1 immediately.
                                    </li>
                                </ul>
                            </details>

                            {questions.length > 0 ? (
                                <div className="card p-4 shadow-sm">
                                    <h3
                                        id="assessment-question-heading"
                                        ref={stageHeadingRef}
                                        tabIndex="-1"
                                    >
                                        {questions[currentIndex]?.text}
                                    </h3>
                                    <fieldset
                                        className="mt-3"
                                        aria-labelledby="assessment-question-heading"
                                    >
                                        <legend className="visually-hidden">
                                            Choose one answer
                                        </legend>
                                        {questions[currentIndex]?.choices?.map(
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
                                    </fieldset>
                                    <div className="d-flex justify-content-end">
                                        <button
                                            className="btn btn-primary mt-3"
                                            disabled={isSubmitting}
                                            onClick={handleSubmitAnswer}
                                        >
                                            {isSubmitting
                                                ? 'Submitting...'
                                                : currentIndex ===
                                                    questions.length - 1
                                                  ? 'Submit Level'
                                                  : 'Next Question'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="card p-4 shadow-sm text-center">
                                    {questionLoadError
                                        ? 'Questions failed to load.'
                                        : 'Loading level questions...'}
                                    {questionLoadError && (
                                        <div className="mt-3">
                                            <button
                                                className="btn btn-primary"
                                                onClick={retryLoadQuestions}
                                            >
                                                Retry Loading Questions
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {stage === 'transition' && (
                        <div className="card p-4 shadow-sm text-center">
                            <h2
                                className="mb-3"
                                ref={stageHeadingRef}
                                tabIndex="-1"
                            >
                                Level {lastLevelResult?.level} Passed
                            </h2>
                            <p className="mb-2">
                                Score: {lastLevelResult?.score}%
                            </p>
                            <p className="mb-3">
                                You can start Level {pendingNextLevel} when
                                ready.
                            </p>
                            <p className="mb-3">
                                Auto-start in{' '}
                                <strong>
                                    {formatTime(transitionTimeLeft)}
                                </strong>
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={moveToNextLevel}
                            >
                                Start Level {pendingNextLevel}
                            </button>
                        </div>
                    )}

                    {stage === 'failed' && (
                        <div className="card p-4 shadow-sm text-center">
                            <h2
                                className="mb-3 text-danger"
                                ref={stageHeadingRef}
                                tabIndex="-1"
                            >
                                Level {lastLevelResult?.level} Not Passed
                            </h2>
                            <p className="mb-2">
                                Score: {lastLevelResult?.score}%
                            </p>
                            <p className="mb-3">
                                You can retake now or go to your profile page to
                                review your results.
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    className="btn btn-primary"
                                    disabled={isStarting}
                                    onClick={handleRetake}
                                >
                                    {isStarting
                                        ? 'Starting Retake...'
                                        : 'Retake Assessment'}
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => navigate('/profile')}
                                >
                                    Go to Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {stage === 'completed' && (
                        <div className="card p-4 shadow-sm text-center">
                            <h2
                                className="mb-3 text-success"
                                ref={stageHeadingRef}
                                tabIndex="-1"
                            >
                                Assessment Completed
                            </h2>
                            <p className="mb-2">
                                Final Level Score: {lastLevelResult?.score}%
                            </p>
                            <p className="mb-3">
                                Great job. View your full results on your
                                profile page.
                            </p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/profile')}
                            >
                                Go to Profile
                            </button>
                        </div>
                    )}
                </div>

                {showExitConfirm && (
                    <div
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{ background: 'rgba(0,0,0,0.35)', zIndex: 1050 }}
                    >
                        <div
                            className="card shadow"
                            style={{ maxWidth: 460, width: '90%' }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="exit-assessment-title"
                            aria-describedby="exit-assessment-description"
                        >
                            <div className="card-body p-4">
                                <h5
                                    className="card-title mb-3"
                                    id="exit-assessment-title"
                                >
                                    Exit Assessment?
                                </h5>
                                <p
                                    className="card-text mb-4"
                                    id="exit-assessment-description"
                                >
                                    Your current level progress will be saved up
                                    to the last submitted answer. Do you want to
                                    leave now?
                                </p>
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        className="btn btn-outline-secondary"
                                        ref={continueAssessmentButtonRef}
                                        onClick={() => {
                                            emitTelemetry(
                                                'assessment_exit_canceled'
                                            );
                                            setShowExitConfirm(false);
                                        }}
                                    >
                                        Continue Assessment
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleExitAssessment}
                                    >
                                        Exit to Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentInterface;
