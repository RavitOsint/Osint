import { useState } from 'react';
import './TerminalCard.css';

export default function TerminalCard({ children, title, className = '' }) {
    return (
        <div className={`terminal-card ${className}`}>
            <div className="terminal-header">
                <div className="terminal-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                </div>
                {title && <span className="terminal-title">{title}</span>}
            </div>
            <div className="terminal-body">
                {children}
            </div>
        </div>
    );
}
