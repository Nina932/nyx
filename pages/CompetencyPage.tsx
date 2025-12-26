
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { JobRole } from '../types';
import { suggestSkillsForRole } from '../services/geminiService';
import { getJobRoles, addJobRole, updateJobRole, deleteJobRole } from '../services/api';
import { BrainIcon } from '../components/icons/BrainIcon';

export const CompetencyPage: React.FC = () => {
    const { t, language } = useTranslation();
    const [roles, setRoles] = useState<JobRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<JobRole | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestingId, setSuggestingId] = useState<number | null>(null);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const fetchedRoles = await getJobRoles();
            setRoles(fetchedRoles);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const filteredRoles = useMemo(() =>
        roles.filter(role => role.title[language].toLowerCase().includes(searchTerm.toLowerCase())),
        [roles, searchTerm, language]
    );

    const handleOpenForm = (role: JobRole | null = null) => {
        setEditingRole(role);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setEditingRole(null);
        setIsFormOpen(false);
    };

    const handleSaveRole = async (roleData: { title: string, requiredSkills: string[] }) => {
        if (editingRole) {
            const updatedRoleData = { 
                ...editingRole, 
                title: { ...editingRole.title, [language]: roleData.title },
                requiredSkills: roleData.requiredSkills
            };
            await updateJobRole(updatedRoleData);
        } else {
            // Simple duplication for new roles, a real backend would handle this better
            const newRoleData = { 
                title: { en: roleData.title, ka: roleData.title },
                requiredSkills: roleData.requiredSkills
            };
            await addJobRole(newRoleData);
        }
        fetchRoles(); // Re-fetch to get the latest data
        handleCloseForm();
    };
    
    const handleDeleteRole = async (id: number) => {
        await deleteJobRole(id);
        fetchRoles();
    };
    
    const handleSuggestSkills = async (role: JobRole) => {
        setSuggestingId(role.id);
        try {
            const suggestedSkills = await suggestSkillsForRole(role.title.en);
            const updatedRole = { ...role, requiredSkills: suggestedSkills };
            await updateJobRole(updatedRole);
            fetchRoles();
        } catch (error) {
            console.error("Failed to suggest skills:", error);
        } finally {
            setSuggestingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 {/* This title is now handled by the parent TalentPage */}
                <div></div>
                <button onClick={() => handleOpenForm()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors">{t('addRole')}</button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6 shadow-lg">
                <input
                    type="text"
                    placeholder={t('searchRoles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 bg-slate-800/70 border border-slate-600 rounded-md p-2 text-sm"
                />
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="text-center p-8 text-slate-400">{t('analyzing')}...</div>
                    ) : (
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-800/60">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('roleName')}</th>
                                <th scope="col" className="px-6 py-3">{t('requiredSkills')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoles.map(role => (
                                <tr key={role.id} className="border-b border-slate-700 hover:bg-slate-800/40">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{role.title[language]}</td>
                                    <td className="px-6 py-4">{role.requiredSkills.join(', ')}</td>
                                    <td className="px-6 py-4 text-right space-x-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleSuggestSkills(role)}
                                            disabled={suggestingId === role.id}
                                            className="font-medium text-purple-400 hover:text-purple-300 disabled:text-slate-500 disabled:cursor-wait"
                                            title={t('suggestSkills')}
                                        >
                                            {suggestingId === role.id ? 
                                                (<div className="w-5 h-5 border-2 border-t-transparent border-slate-400 rounded-full animate-spin"></div>) : 
                                                (<BrainIcon className="w-5 h-5" />)
                                            }
                                        </button>
                                        <button onClick={() => handleOpenForm(role)} className="font-medium text-cyan-400 hover:underline">{t('edit')}</button>
                                        <button onClick={() => handleDeleteRole(role.id)} className="font-medium text-red-400 hover:underline">{t('delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
            </div>

            {isFormOpen && <RoleForm role={editingRole} onSave={handleSaveRole} onClose={handleCloseForm} />}
        </div>
    );
};

interface RoleFormProps {
    role: JobRole | null;
    onSave: (roleData: { title: string, requiredSkills: string[] }) => void;
    onClose: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, onSave, onClose }) => {
    const { t, language } = useTranslation();
    const [title, setTitle] = useState(role?.title[language] || '');
    const [skills, setSkills] = useState(role?.requiredSkills.join(', ') || '');
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ title, requiredSkills: skills.split(',').map(s => s.trim()).filter(Boolean) });
    };

    const handleSuggestInForm = async () => {
        if (!title.trim()) return;
        setIsSuggesting(true);
        try {
            const suggestedSkills = await suggestSkillsForRole(title);
            setSkills(suggestedSkills.join(', '));
        } catch(err) {
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-slate-900 border border-cyan-400/50 rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">{role ? t('editRole') : t('addRole')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="roleName" className="block mb-1 text-sm font-medium text-slate-300">{t('roleName')}</label>
                        <input type="text" id="roleName" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm" required />
                    </div>
                    <div>
                        <label htmlFor="requiredSkills" className="block mb-1 text-sm font-medium text-slate-300">{t('requiredSkills')}</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                id="requiredSkills" 
                                value={skills} 
                                onChange={e => setSkills(e.target.value)} 
                                className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm pr-10"
                                required 
                            />
                            <button
                                type="button"
                                onClick={handleSuggestInForm}
                                disabled={!title.trim() || isSuggesting}
                                className="absolute inset-y-0 right-0 px-2 flex items-center text-purple-400 hover:text-purple-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                title={t('suggestSkills')}
                            >
                                {isSuggesting ? 
                                    (<div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>) : 
                                    (<BrainIcon className="w-5 h-5"/>)
                                }
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-700 text-sm">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompetencyPage;