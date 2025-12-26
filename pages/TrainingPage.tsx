
import React, { useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { TrainingDashboard } from '../components/training/TrainingDashboard';
import { CourseList } from '../components/training/CourseList';
import { AiTrainingSuggester } from '../components/training/AiTrainingSuggester';
import { DashboardCard } from '../components/DashboardCard';

const TrainingPage: React.FC = () => {
    const { t } = useTranslation();
    const enrollmentsRef = useRef<HTMLDivElement>(null);

    const handleEnrollmentsClick = () => {
        enrollmentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('page_training')}</h2>
            
            <TrainingDashboard onEmployeesInTrainingClick={handleEnrollmentsClick} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2" ref={enrollmentsRef}>
                    <DashboardCard titleKey='ongoingTraining'>
                        <CourseList />
                    </DashboardCard>
                </div>
                <div>
                     <DashboardCard titleKey='aiTrainingSuggester'>
                        <AiTrainingSuggester />
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};

export default TrainingPage;