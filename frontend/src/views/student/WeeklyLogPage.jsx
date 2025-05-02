import React, { useEffect, useState } from 'react';
import useAxios from '../../utils/useAxios';
import { Tabs, Tab, Button, Form, Modal } from 'react-bootstrap';
import Sidebar from '../partials/Sidebar';
import BaseHeader from '../partials/BaseHeader';

const WeeklyLogPage = () => {
    const axiosInstance = useAxios;
    const [weeklyLogs, setWeeklyLogs] = useState({});
    const [activeTab, setActiveTab] = useState('1');
    const [isSaving, setIsSaving] = useState({});
    const [selectedDay, setSelectedDay] = useState(null); // For the calendar popout
    const [showModal, setShowModal] = useState(false); // Modal visibility
    const [previewImage, setPreviewImage] = useState(null);

    const handleImageClick = (imageSrc) => {
        setPreviewImage(imageSrc); // Set the clicked image as the preview
    };

    const closePreview = () => {
        setPreviewImage(null); // Close the preview
    };

    const allowedFormats = ['image/jpeg', 'image/png'];

    useEffect(() => {
        const fetchWeeklyLogs = async () => {
            try {
                const res = await axiosInstance.get('/user/profile/');
                setWeeklyLogs(res.data.weekly_logs);
            } catch (err) {
                console.error('Error fetching profile', err);
            }
        };

        fetchWeeklyLogs();
    }, [axiosInstance]);

    const handleChange = (index, field, value) => {
        if (field === 'progress_picture' && value instanceof File) {
            if (!allowedFormats.includes(value.type)) {
                alert(
                    '❌ Invalid file format. Please upload a JPG or PNG image.'
                );
                return;
            }
        }

        setWeeklyLogs((prev) => {
            const updatedLogs = [...prev];
            updatedLogs[index] = {
                ...updatedLogs[index],
                [field]: value
            };
            return updatedLogs;
        });
    };

    const handleSave = async (weekIndex) => {
        const log = weeklyLogs[weekIndex];
        const formData = new FormData();

        // Append only the specified fields
        const fields = [
            'biceps',
            'chest',
            'waist',
            'hips',
            'thighs',
            'journal'
        ];
        fields.forEach((field) => {
            if (log[field]) {
                formData.append(field, log[field]);
            }
        });

        // Append progress picture if it's a file
        if (log.progress_picture instanceof File) {
            formData.append('progress_picture', log.progress_picture);
        }

        setIsSaving((prev) => ({ ...prev, [weekIndex]: true }));

        console.log('Saving log:', log); // Debugging

        try {
            await axiosInstance.put(`/user/weekly-log/${log.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Response:', log.id); // Debugging
            alert(`✅ Week ${log.week_number} saved successfully!`);
            // Optionally reload or update the UI
            window.location.reload();
        } catch (err) {
            console.error(
                '❌ Error saving weekly log:',
                err.response?.data || err.message
            );
            alert('❌ Save failed');
        } finally {
            setIsSaving((prev) => ({ ...prev, [weekIndex]: false }));
        }
    };

    const handleDayClick = (day) => {
        console.log('Selected day:', day); // Debugging
        setSelectedDay({
            ...day,
            weekly_log: day.weekly_log || day.weekly_log_id // Ensure weekly_log is set
        });
        setShowModal(true);
    };

    const handleModalSave = async () => {
        console.log('Saving selected day:', selectedDay); // Debugging
        if (selectedDay) {
            const updatedDay = {
                ...selectedDay,
                weekly_log: selectedDay.weekly_log, // Send only the ID
                duration: selectedDay.duration || '' // Ensure time is not null
            };

            console.log('Payload being sent:', updatedDay); // Debugging

            try {
                await axiosInstance.put(
                    `/daily-log/${updatedDay.id}/`,
                    updatedDay
                );
                alert('Daily log saved successfully!');
                setShowModal(false);
                window.location.reload();
            } catch (err) {
                console.error('Error saving daily log:', err);
                alert('Failed to save daily log.');
            }
        }
    };

    document.title = 'Weekly Logs | Med Pro Assesments';

    return (
        <>
            <div className="container-fluid d-flex flex-sm-row">
                <Sidebar />
                <div className="main-content small-screen">
                    <BaseHeader />
                    <h2 className="mb-3">Weekly Logs</h2>
                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                    >
                        {Array.isArray(weeklyLogs) &&
                            weeklyLogs.map((log, i) => (
                                <Tab
                                    eventKey={String(log.week_number)}
                                    title={`Week ${log.week_number}`}
                                    key={log.id}
                                >
                                    <Form>
                                        <div className="small-screen d-flex flex-row align-items-start">
                                            {/* Progress Picture */}
                                            <div className="col-md-4">
                                                <Form.Group
                                                    controlId={`progressPicture-${i}`}
                                                    className="mb-3"
                                                >
                                                    <div className="d-flex flex-column col-md-12">
                                                        <h5>
                                                            <strong>
                                                                <Form.Label>
                                                                    Current
                                                                    Progress
                                                                    Picture
                                                                </Form.Label>
                                                            </strong>
                                                        </h5>
                                                        <img
                                                            src={`http://localhost:8000${log.progress_picture}`}
                                                            alt="Profile"
                                                            width={300}
                                                            height={375}
                                                            className="progress-picture rounded shadow mb-3"
                                                            onClick={() =>
                                                                handleImageClick(
                                                                    `http://localhost:8000${log.progress_picture}`
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    {/* Modal for Full Preview */}
                                                    {previewImage && (
                                                        <div
                                                            className="image-preview-modal"
                                                            onClick={
                                                                closePreview
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    previewImage
                                                                }
                                                                alt="Preview"
                                                                className="full-image"
                                                            />
                                                        </div>
                                                    )}
                                                    <Form.Label>
                                                        <p className="text-danger">
                                                            Please upload a JPG
                                                            or PNG image
                                                        </p>
                                                        <Form.Control
                                                            type="file"
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    i,
                                                                    'progress_picture',
                                                                    e.target
                                                                        .files[0]
                                                                )
                                                            }
                                                        />
                                                    </Form.Label>
                                                </Form.Group>
                                            </div>

                                            {/* Calendar */}
                                            <div className="calendar-section">
                                                <h5>
                                                    <strong>
                                                        <Form.Label>
                                                            7-Day Calendar
                                                        </Form.Label>
                                                    </strong>
                                                </h5>
                                                <div
                                                    className="calendar-container"
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns:
                                                            'repeat(4, 1fr)',
                                                        gap: '1rem',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    {log.daily_logs?.map(
                                                        (
                                                            dailyLog,
                                                            dayIndex
                                                        ) => (
                                                            <div
                                                                key={dayIndex}
                                                                className="calendar-day border rounded d-flex flex-column justify-content-center align-items-center"
                                                                style={{
                                                                    height: '100px',
                                                                    backgroundColor:
                                                                        '#fff',
                                                                    cursor: 'pointer',
                                                                    boxShadow:
                                                                        '0 2px 5px rgba(0,0,0,0.1)',
                                                                    transition:
                                                                        '0.3s'
                                                                }}
                                                                onClick={() =>
                                                                    handleDayClick(
                                                                        dailyLog
                                                                    )
                                                                }
                                                            >
                                                                <h6 className="m-0">
                                                                    {
                                                                        dailyLog.day
                                                                    }
                                                                </h6>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {[
                                            'biceps',
                                            'chest',
                                            'waist',
                                            'hips',
                                            'thighs'
                                        ].map((field) => (
                                            <Form.Group
                                                controlId={`${field}-${i}`}
                                                key={field}
                                                className="mb-3"
                                            >
                                                <Form.Label>
                                                    {field
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        field.slice(1)}
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={log[field] || ''}
                                                    onChange={(e) =>
                                                        handleChange(
                                                            i,
                                                            field,
                                                            e.target.value
                                                        )
                                                    }
                                                    onWheel={(e) =>
                                                        e.target.blur()
                                                    }
                                                />
                                            </Form.Group>
                                        ))}
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Journal Entry
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={log.journal || ''}
                                                onChange={(e) =>
                                                    handleChange(
                                                        i,
                                                        'journal',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            className="mb-3"
                                            onClick={() => handleSave(i)}
                                            disabled={isSaving[i]}
                                        >
                                            {isSaving[i]
                                                ? 'Saving...'
                                                : 'Save Week'}
                                        </Button>
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                <strong>Daily Logs</strong>
                                            </Form.Label>
                                            <div className="d-flex flex-wrap">
                                                {log.daily_logs?.map(
                                                    (dailyLog, dayIndex) => (
                                                        <div
                                                            key={dayIndex}
                                                            className="card m-2"
                                                            style={{
                                                                width: '18rem'
                                                            }}
                                                        >
                                                            <div className="card-body">
                                                                <h5 className="card-title">
                                                                    {
                                                                        dailyLog.day
                                                                    }
                                                                </h5>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Workout:
                                                                    </strong>{' '}
                                                                    {dailyLog.workout ||
                                                                        'No Workout'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Duration:
                                                                    </strong>{' '}
                                                                    {dailyLog.duration ||
                                                                        'No Time'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Notes:
                                                                    </strong>{' '}
                                                                    {dailyLog.notes ||
                                                                        'No Notes'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Breakfast:
                                                                    </strong>{' '}
                                                                    {dailyLog.breakfast ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Lunch:
                                                                    </strong>{' '}
                                                                    {dailyLog.lunch ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Dinner:
                                                                    </strong>{' '}
                                                                    {dailyLog.dinner ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Snack 1:
                                                                    </strong>{' '}
                                                                    {dailyLog.snack1 ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Snack 2:
                                                                    </strong>{' '}
                                                                    {dailyLog.snack2 ||
                                                                        'N/A'}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>
                                                                        Water
                                                                        Intake:
                                                                    </strong>{' '}
                                                                    {dailyLog.water_intake_oz
                                                                        ? `${dailyLog.water_intake_oz} oz`
                                                                        : 'N/A'}
                                                                </p>
                                                                <Button
                                                                    variant="primary"
                                                                    onClick={() =>
                                                                        handleDayClick(
                                                                            dailyLog
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </Form.Group>
                                        {/* 👇 Insert this below the Journal Entry form
                                                                    group */}
                                        {/* <Form.Group className="mb-4">
                                        <Form.Label>
                                            <strong>Daily Logs</strong>
                                        </Form.Label>
                                        {log.daily_logs?.map(
                                            (dailyLog, dayIndex) => (
                                                <div
                                                    key={dayIndex}
                                                    className="p-3 mb-3 border rounded bg-light"
                                                >
                                                    <h6>{dailyLog.day}</h6>

                                                    {[
                                                        'breakfast',
                                                        'lunch',
                                                        'dinner',
                                                        'snack1',
                                                        'snack2',
                                                        'water_intake_oz'
                                                    ].map((mealField) => (
                                                        <Form.Group
                                                            key={mealField}
                                                            className="mb-3"
                                                            controlId={`day-${dayIndex}-${mealField}`}
                                                        >
                                                            <Form.Label>
                                                                {mealField
                                                                    .replace(
                                                                        /_/g,
                                                                        ' '
                                                                    )
                                                                    .replace(
                                                                        /\b\w/g,
                                                                        (c) =>
                                                                            c.toUpperCase()
                                                                    )}
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                value={
                                                                    dailyLog[
                                                                        mealField
                                                                    ] || ''
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    setWeeklyLogs(
                                                                        (
                                                                            prev
                                                                        ) => {
                                                                            const updatedLogs =
                                                                                [
                                                                                    ...prev
                                                                                ];

                                                                            const updatedDailyLogs =
                                                                                [
                                                                                    ...updatedLogs[
                                                                                        i
                                                                                    ]
                                                                                        .daily_logs
                                                                                ];
                                                                            console.log(
                                                                                '✅',
                                                                                updatedDailyLogs
                                                                            );

                                                                            updatedDailyLogs[
                                                                                dayIndex
                                                                            ] =
                                                                                {
                                                                                    ...updatedDailyLogs[
                                                                                        dayIndex
                                                                                    ],
                                                                                    [mealField]:
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                };
                                                                            updatedLogs[
                                                                                i
                                                                            ] =
                                                                                {
                                                                                    ...updatedLogs[
                                                                                        i
                                                                                    ],
                                                                                    daily_logs:
                                                                                        updatedDailyLogs
                                                                                };
                                                                            return updatedLogs;
                                                                        }
                                                                    );
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    ))}
                                                </div>
                                            )
                                        )}
                                    </Form.Group> */}
                                    </Form>
                                </Tab>
                            ))}
                    </Tabs>

                    {/* Modal for Editing Daily Log */}
                    <Modal show={showModal} onHide={() => setShowModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Daily Log</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedDay && (
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Workout</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.workout || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    workout: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Duration</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.duration || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    duration: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Notes</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={selectedDay.notes || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    notes: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    {/* Add new fields */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Breakfast</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.breakfast || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    breakfast: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Lunch</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.lunch || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    lunch: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Dinner</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.dinner || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    dinner: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Snack 1</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.snack1 || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    snack1: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Snack 2</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedDay.snack2 || ''}
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    snack2: e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Water Intake (Oz)
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={
                                                selectedDay.water_intake_oz ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setSelectedDay((prev) => ({
                                                    ...prev,
                                                    water_intake_oz:
                                                        e.target.value
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Form>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleModalSave}>
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </>
    );
};

export default WeeklyLogPage;
