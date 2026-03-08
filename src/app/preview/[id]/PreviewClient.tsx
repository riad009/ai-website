"use client";

import React from "react";
import WebsiteRenderer from "@/components/renderer/WebsiteRenderer";
import { WebsiteData } from "@/lib/schemas";

interface PreviewClientProps {
    project: {
        id: string;
        name: string;
        content: any;
    };
}

export default function PreviewClient({ project }: PreviewClientProps) {
    const websiteData = project.content as WebsiteData;

    return (
        <div style={{ minHeight: "100vh", background: "#fff" }}>
            <WebsiteRenderer data={websiteData} editMode={false} />
        </div>
    );
}
