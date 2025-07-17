import React from "react";

export default function SuccessCheckIcon({ className = "", size = 48 }: { className?: string; size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer rings */}
            <circle cx="32" cy="32" r="32" fill="#E6F4EE" />
            <circle cx="32" cy="32" r="24" fill="#C6E9DA" />
            <circle cx="32" cy="32" r="16" fill="#A3DFC7" />
            {/* Main green circle */}
            <circle cx="32" cy="32" r="12" fill="#22B573" />
            {/* Checkmark */}
            <path
                d="M27.5 32.5L31 36L37 28"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
} 