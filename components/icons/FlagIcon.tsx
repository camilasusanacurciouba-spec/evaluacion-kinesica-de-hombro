import React from 'react';

const FlagIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21v-13.25l9-4.5 9 4.5V15M3 21h18M3 21V5m9-2.25V21"
    />
  </svg>
);

export default FlagIcon;