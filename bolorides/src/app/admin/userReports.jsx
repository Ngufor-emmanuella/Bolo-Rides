import React, { useEffect, useState } from 'react';
import { db } from '@/app/firebase';
import { collection, getDocs } from 'firebase/firestore';

const UserReports = ({ carId }) => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            const reportsCollection = collection(db, 'DailyReports');
            const reportsSnapshot = await getDocs(reportsCollection);
            const userReports = reportsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(report => report.carId === carId); // Filter reports by carId
            setReports(userReports);
        };

        fetchReports();
    }, [carId]);

    return (
        <div>
            {reports.length > 0 ? (
                <ul>
                    {reports.map(report => (
                        <li key={report.id}>
                            {report.transactionDate} - {report.destination}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reports found for this car.</p>
            )}
        </div>
    );
};

export default UserReports;