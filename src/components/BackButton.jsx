import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label = 'ย้อนกลับ', style, className = '' }) {
  return (
    <button
      type="button"
      className={`backBtn ${className}`}
      onClick={onClick}
      style={style}
      title={label}
    >
      <ArrowLeft size={20} />
      <span>{label}</span>
    </button>
  );
}
