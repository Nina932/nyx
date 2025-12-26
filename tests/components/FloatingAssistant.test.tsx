import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FloatingAssistant } from '../../components/ai/FloatingAssistant';

// Mock the geminiService
vi.mock('../../services/geminiService', () => ({
    getChatResponse: vi.fn().mockResolvedValue('Mock AI response'),
}));

// Mock the translation hook
vi.mock('../../hooks/useTranslation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        language: 'en',
    }),
}));

describe('FloatingAssistant', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the floating button when closed', () => {
        render(<FloatingAssistant />);

        const button = screen.getByRole('button', { name: /floatingAssistantTitle/i });
        expect(button).toBeInTheDocument();
    });

    it('opens the chat modal when button is clicked', async () => {
        render(<FloatingAssistant />);

        const button = screen.getByRole('button', { name: /floatingAssistantTitle/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('floatingAssistantTitle')).toBeInTheDocument();
        });
    });

    it('displays persona buttons in the chat modal', async () => {
        render(<FloatingAssistant />);

        // Open modal
        const openButton = screen.getByRole('button', { name: /floatingAssistantTitle/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            expect(screen.getByText('persona_general')).toBeInTheDocument();
            expect(screen.getByText('persona_strategist')).toBeInTheDocument();
            expect(screen.getByText('persona_data_analyst')).toBeInTheDocument();
        });
    });

    it('allows typing in the input field', async () => {
        render(<FloatingAssistant />);

        // Open modal
        const openButton = screen.getByRole('button', { name: /floatingAssistantTitle/i });
        fireEvent.click(openButton);

        await waitFor(() => {
            const input = screen.getByPlaceholderText('startTyping') as HTMLInputElement;
            fireEvent.change(input, { target: { value: 'Hello AI' } });
            expect(input.value).toBe('Hello AI');
        });
    });
});
