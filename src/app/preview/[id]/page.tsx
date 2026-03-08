import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

const PUBLISH_DIR = path.join(process.cwd(), ".published-sites");

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: slug } = await params;

    try {
        const filePath = path.join(PUBLISH_DIR, `${slug}.json`);
        const raw = await fs.readFile(filePath, "utf-8");
        const siteData = JSON.parse(raw);

        // Convert editor components to WebsiteData format
        const sections = (siteData.components || []).map((comp: any) => ({
            id: comp.id,
            type: comp.type,
            content: comp.props || {},
            customStyle: comp.customStyle || {},
        }));

        const websiteData = {
            siteName: slug,
            category: "business",
            theme: {
                primaryColor: "#6366f1",
                secondaryColor: "#0ea5e9",
                accentColor: "#f43f5e",
                backgroundColor: "#ffffff",
                textColor: "#1a1a2e",
                fontFamily: "Inter",
            },
            sections,
        };

        return (
            <PreviewClient
                project={{
                    id: siteData.projectId || slug,
                    name: slug,
                    content: websiteData,
                }}
            />
        );
    } catch {
        notFound();
    }
}
