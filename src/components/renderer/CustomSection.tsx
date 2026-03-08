"use client";

import React from "react";

interface CustomSectionProps {
    content: {
        html: string;
        sectionLabel?: string;
    };
    theme: any;
    editMode?: boolean;
    onUpdate?: (content: any) => void;
}

export default function CustomSectionRenderer({ content, theme, editMode, onUpdate }: CustomSectionProps) {
    if (!content.html) return null;

    return (
        <div
            className="custom-section"
            style={{
                fontFamily: `'${theme.fontFamily}', sans-serif`,
                /* Inject theme as CSS variables so AI-generated HTML can use them */
                ["--primary" as any]: theme.primaryColor,
                ["--secondary" as any]: theme.secondaryColor,
                ["--accent" as any]: theme.accentColor,
                ["--bg" as any]: theme.backgroundColor,
                ["--text" as any]: theme.textColor,
            }}
            dangerouslySetInnerHTML={{ __html: content.html }}
        />
    );
}
