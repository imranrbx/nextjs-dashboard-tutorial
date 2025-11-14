"use client";

import { useFormStatus } from 'react-dom';
import { clsx } from 'clsx';

type SubmitButtonProps = {
    children: React.ReactNode;
    pendingLabel?: string;
    className?: string;
    disabled?: boolean;
};

export function SubmitButton({
    children,
    pendingLabel = 'Processing...',
    className,
    disabled = false,
}: SubmitButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className={clsx(
                'rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70',
                className,
            )}
            disabled={pending || disabled}
        >
            {pending ? pendingLabel : children}
        </button>
    );
}

