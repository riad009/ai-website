import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PUBLISH_DIR = path.join(process.cwd(), ".published-sites");

export async function POST(req: NextRequest) {
  try {
    const { projectId, subdomain, components } = await req.json();

    if (!subdomain || !subdomain.trim()) {
      return NextResponse.json({ error: "Subdomain is required" }, { status: 400 });
    }

    const slug = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (slug.length < 2) {
      return NextResponse.json({ error: "Subdomain must be at least 2 characters" }, { status: 400 });
    }

    // Ensure publish directory exists
    await fs.mkdir(PUBLISH_DIR, { recursive: true });

    // Save site data as JSON
    const siteData = {
      slug,
      projectId,
      components,
      publishedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(PUBLISH_DIR, `${slug}.json`),
      JSON.stringify(siteData, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      subdomain: slug,
      url: `/preview/${slug}`,
      publishedAt: siteData.publishedAt,
    });
  } catch (error: any) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: error.message || "Publish failed" }, { status: 500 });
  }
}
