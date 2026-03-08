export interface WebsiteTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
}

export interface NavbarContent {
    logo: string;
    links: { label: string; href: string }[];
    ctaText: string;
    ctaLink: string;
}

export interface HeroContent {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: string;
    overlayOpacity: number;
}

export interface FeaturesContent {
    title: string;
    subtitle: string;
    items: { icon: string; title: string; description: string }[];
}

export interface PricingContent {
    title: string;
    subtitle: string;
    plans: {
        name: string;
        price: string;
        period: string;
        features: string[];
        ctaText: string;
        highlighted: boolean;
    }[];
}

export interface AboutContent {
    title: string;
    description: string;
    image: string;
    stats: { value: string; label: string }[];
}

export interface ContactContent {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    formFields: { label: string; type: string; placeholder: string }[];
}

export interface ServicesContent {
    title: string;
    subtitle: string;
    items: {
        icon: string;
        title: string;
        description: string;
        price: string;
    }[];
}

export interface ProductGridContent {
    title: string;
    subtitle: string;
    products: {
        name: string;
        price: string;
        image: string;
        description: string;
        badge: string;
    }[];
}

export interface MenuCardContent {
    title: string;
    subtitle: string;
    categories: {
        name: string;
        items: {
            name: string;
            description: string;
            price: string;
            image: string;
        }[];
    }[];
}

export interface FooterContent {
    logo: string;
    description: string;
    links: { title: string; items: { label: string; href: string }[] }[];
    social: { platform: string; url: string }[];
    copyright: string;
}

export type SectionType =
    | "navbar"
    | "hero"
    | "features"
    | "pricing"
    | "about"
    | "contact"
    | "services"
    | "product-grid"
    | "menu-card"
    | "testimonials"
    | "promo-banner"
    | "collection-grid"
    | "newsletter"
    | "trust-badges"
    | "faq"
    | "footer"
    | "custom";

export interface WebsiteSection {
    id: string;
    type: SectionType;
    content: any;
}

export interface WebsiteData {
    siteName: string;
    category: string;
    theme: WebsiteTheme;
    sections: WebsiteSection[];
}

export type Category =
    | "auto"
    | "business"
    | "portfolio"
    | "restaurant"
    | "local-service"
    | "event"
    | "basic-store";

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
    { value: "auto", label: "Auto-detect from prompt", icon: "🤖" },
    { value: "business", label: "Business", icon: "🏢" },
    { value: "portfolio", label: "Portfolio", icon: "💼" },
    { value: "restaurant", label: "Restaurant", icon: "🍽️" },
    { value: "local-service", label: "Local Service", icon: "🔧" },
    { value: "event", label: "Event", icon: "🎉" },
    { value: "basic-store", label: "Basic Store", icon: "🛍️" },
];
