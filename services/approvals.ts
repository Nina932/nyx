import type { AiAction } from '../types';

// In-memory store for the mock service
let mockApprovals: AiAction[] = [];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getApprovals = async (): Promise<AiAction[]> => {
    await simulateDelay(300);
    return [...mockApprovals];
};

export const addApproval = (actionData: Omit<AiAction, 'id' | 'status'>): void => {
    const newAction: AiAction = {
        id: `ACT-${Date.now()}`,
        status: 'pending',
        ...actionData,
    };
    mockApprovals.push(newAction);
};

export const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected'): Promise<AiAction> => {
    await simulateDelay(200);
    const actionIndex = mockApprovals.findIndex(a => a.id === id);
    if (actionIndex !== -1) {
        mockApprovals[actionIndex].status = status;
        return { ...mockApprovals[actionIndex] };
    }
    throw new Error("Action not found");
};
