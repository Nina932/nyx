
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { TrainingEnrollment } from '../../types';

const mockEnrollments: TrainingEnrollment[] = [
    { employeeId: 1, employeeName: { en: 'Giorgi Beridze', ka: 'გიორგი ბერიძე' }, courseId: 101, courseTitle: { en: 'Advanced Node.js', ka: 'Node.js-ის გაღრმავებული კურსი' }, status: 'In Progress', progress: 75 },
    { employeeId: 3, employeeName: { en: 'Davit Maisuradze', ka: 'დავით მაისურაძე' }, courseId: 102, courseTitle: { en: 'React Performance', ka: 'React-ის პერფორმანსი' }, status: 'In Progress', progress: 40 },
    { employeeId: 4, employeeName: { en: 'Tamar Lomidze', ka: 'თამარ ლომიძე' }, courseId: 103, courseTitle: { en: 'Introduction to Python', ka: 'Python-ის შესავალი' }, status: 'Completed', progress: 100 },
    { employeeId: 2, employeeName: { en: 'Nino Gelashvili', ka: 'ნინო გელაშვილი' }, courseId: 104, courseTitle: { en: 'Agile Product Management', ka: 'Agile პროდუქტის მენეჯმენტი' }, status: 'In Progress', progress: 85 },
];

const StatusBadge: React.FC<{ status: TrainingEnrollment['status'] }> = ({ status }) => {
    const { t } = useTranslation();
    const styles = {
        'In Progress': 'bg-sky-500/80 border-sky-400',
        'Completed': 'bg-green-500/80 border-green-400',
        'Not Started': 'bg-slate-600/80 border-slate-500',
    };
    const textKey = status === 'In Progress' ? 'inProgress' : (status === 'Completed' ? 'completed' : 'notStarted');
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border text-white ${styles[status]}`}>{t(textKey as any)}</span>
}

export const CourseList: React.FC = () => {
    const { t, language } = useTranslation();

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-cyan-400 uppercase bg-slate-800/60">
                    <tr>
                        <th scope="col" className="px-6 py-3">{t('employee')}</th>
                        <th scope="col" className="px-6 py-3">{t('course')}</th>
                        <th scope="col" className="px-6 py-3">{t('progress')}</th>
                        <th scope="col" className="px-6 py-3 text-center">{t('status')}</th>
                    </tr>
                </thead>
                <tbody>
                    {mockEnrollments.map(enrollment => (
                        <tr key={`${enrollment.employeeId}-${enrollment.courseId}`} className="border-b border-slate-700 hover:bg-slate-800/40">
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{enrollment.employeeName[language]}</td>
                            <td className="px-6 py-4">{enrollment.courseTitle[language]}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${enrollment.progress}%` }}></div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400">{enrollment.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge status={enrollment.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};