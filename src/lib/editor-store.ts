import { create } from "zustand";
import type {
  ComponentData,
  EditorState,
  DeviceMode,
  ViewMode,
  HistoryState,
} from "@/types/editor";

// ── Component registry ──────────────────────────────────────────
export interface ComponentDef {
  type: string;
  label: string;
  icon: string;
  category: "layout" | "content" | "media" | "commerce" | "form";
  defaultProps: Record<string, any>;
}

export const COMPONENT_REGISTRY: ComponentDef[] = [
  // Layout
  {
    type: "navbar",
    label: "Navbar",
    icon: "🧭",
    category: "layout",
    defaultProps: {
      logo: "My Site",
      links: [
        { label: "Home", href: "#" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
      ctaText: "Get Started",
      ctaLink: "#",
    },
  },
  {
    type: "hero",
    label: "Hero",
    icon: "🏠",
    category: "layout",
    defaultProps: {
      headline: "Welcome to Our Website",
      subheadline: "Build something amazing today",
      ctaText: "Get Started",
      ctaLink: "#",
      backgroundImage: "",
      overlayOpacity: 0.6,
    },
  },
  {
    type: "footer",
    label: "Footer",
    icon: "📋",
    category: "layout",
    defaultProps: {
      logo: "My Site",
      description: "Building the future, one project at a time.",
      links: [
        {
          title: "Company",
          items: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
          ],
        },
      ],
      social: [
        { platform: "twitter", url: "#" },
        { platform: "github", url: "#" },
      ],
      copyright: "© 2026 My Site. All rights reserved.",
    },
  },
  // Content
  {
    type: "features",
    label: "Features",
    icon: "⭐",
    category: "content",
    defaultProps: {
      title: "Our Features",
      subtitle: "What makes us different",
      items: [
        { icon: "🚀", title: "Fast", description: "Lightning fast performance" },
        { icon: "🔒", title: "Secure", description: "Enterprise-grade security" },
        { icon: "📱", title: "Responsive", description: "Works on every device" },
      ],
    },
  },
  {
    type: "about",
    label: "About",
    icon: "📖",
    category: "content",
    defaultProps: {
      title: "About Us",
      description: "We are a team of passionate builders creating amazing experiences.",
      image: "",
      stats: [
        { value: "100+", label: "Clients" },
        { value: "50+", label: "Projects" },
        { value: "5+", label: "Years" },
      ],
    },
  },
  {
    type: "services",
    label: "Services",
    icon: "🛠️",
    category: "content",
    defaultProps: {
      title: "Our Services",
      subtitle: "Professional solutions for every need",
      items: [
        { icon: "💻", title: "Web Development", description: "Custom websites", price: "$999" },
        { icon: "📱", title: "Mobile Apps", description: "iOS & Android", price: "$1,999" },
        { icon: "🎨", title: "Design", description: "UI/UX Design", price: "$499" },
      ],
    },
  },
  {
    type: "pricing",
    label: "Pricing",
    icon: "💰",
    category: "commerce",
    defaultProps: {
      title: "Pricing Plans",
      subtitle: "Choose the plan that works for you",
      plans: [
        {
          name: "Starter",
          price: "$9",
          period: "/month",
          features: ["1 Project", "Basic Support", "1GB Storage"],
          ctaText: "Start Free",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$29",
          period: "/month",
          features: ["10 Projects", "Priority Support", "10GB Storage", "Custom Domain"],
          ctaText: "Get Pro",
          highlighted: true,
        },
        {
          name: "Enterprise",
          price: "$99",
          period: "/month",
          features: ["Unlimited Projects", "24/7 Support", "100GB Storage", "White Label"],
          ctaText: "Contact Us",
          highlighted: false,
        },
      ],
    },
  },
  {
    type: "contact",
    label: "Contact",
    icon: "📧",
    category: "form",
    defaultProps: {
      title: "Get In Touch",
      subtitle: "We'd love to hear from you",
      email: "hello@example.com",
      phone: "+1 (555) 000-0000",
      address: "123 Main St, City, State 12345",
      formFields: [
        { label: "Name", type: "text", placeholder: "Your name" },
        { label: "Email", type: "email", placeholder: "your@email.com" },
        { label: "Message", type: "textarea", placeholder: "Your message..." },
      ],
    },
  },
  // Media
  {
    type: "product-grid",
    label: "Products",
    icon: "🛍️",
    category: "media",
    defaultProps: {
      title: "Our Products",
      subtitle: "Best sellers this season",
      products: [
        { name: "Product 1", price: "$49", image: "", description: "Amazing product", badge: "New" },
        { name: "Product 2", price: "$79", image: "", description: "Premium quality", badge: "Popular" },
        { name: "Product 3", price: "$29", image: "", description: "Great value", badge: "" },
      ],
    },
  },
  {
    type: "menu-card",
    label: "Menu",
    icon: "🍽️",
    category: "media",
    defaultProps: {
      title: "Our Menu",
      subtitle: "Freshly prepared daily",
      categories: [
        {
          name: "Starters",
          items: [
            { name: "Soup of the Day", description: "Chef's special", price: "$8", image: "" },
            { name: "Caesar Salad", description: "Crisp romaine, croutons", price: "$12", image: "" },
          ],
        },
      ],
    },
  },
  // Extra content blocks
  {
    type: "testimonials",
    label: "Testimonials",
    icon: "💬",
    category: "content",
    defaultProps: {
      title: "What Our Clients Say",
      subtitle: "Real feedback from real people",
      items: [
        { name: "Alice Johnson", role: "CEO", quote: "Absolutely amazing service!", avatar: "" },
        { name: "Bob Smith", role: "Designer", quote: "Transformed our online presence.", avatar: "" },
        { name: "Carol Williams", role: "Developer", quote: "Best platform I've ever used.", avatar: "" },
      ],
    },
  },
  {
    type: "cta-banner",
    label: "CTA Banner",
    icon: "📢",
    category: "content",
    defaultProps: {
      headline: "Ready to Get Started?",
      subheadline: "Join thousands of happy customers today.",
      ctaText: "Sign Up Now",
      ctaLink: "#",
      backgroundColor: "#6366f1",
      textColor: "#ffffff",
    },
  },
  {
    type: "faq",
    label: "FAQ",
    icon: "❓",
    category: "content",
    defaultProps: {
      title: "Frequently Asked Questions",
      items: [
        { question: "How do I get started?", answer: "Simply sign up and choose a template." },
        { question: "Is there a free plan?", answer: "Yes! Our starter plan is free forever." },
        { question: "Can I use my own domain?", answer: "Absolutely. Custom domains are supported on all paid plans." },
      ],
    },
  },
  {
    type: "stats",
    label: "Stats",
    icon: "📊",
    category: "content",
    defaultProps: {
      title: "By the Numbers",
      subtitle: "",
      items: [
        { value: "10K+", label: "Users" },
        { value: "99.9%", label: "Uptime" },
        { value: "150+", label: "Countries" },
        { value: "4.9/5", label: "Rating" },
      ],
    },
  },
  {
    type: "image-gallery",
    label: "Gallery",
    icon: "🖼️",
    category: "media",
    defaultProps: {
      title: "Gallery",
      subtitle: "A look at our work",
      images: [
        { src: "", alt: "Image 1", caption: "Project Alpha" },
        { src: "", alt: "Image 2", caption: "Project Beta" },
        { src: "", alt: "Image 3", caption: "Project Gamma" },
      ],
      columns: 3,
    },
  },
  {
    type: "team",
    label: "Team",
    icon: "👥",
    category: "content",
    defaultProps: {
      title: "Meet the Team",
      subtitle: "",
      members: [
        { name: "Jane Doe", role: "CEO", bio: "Visionary leader", avatar: "" },
        { name: "John Smith", role: "CTO", bio: "Tech expert", avatar: "" },
        { name: "Emily Rose", role: "Designer", bio: "Creative mind", avatar: "" },
      ],
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "↕️",
    category: "layout",
    defaultProps: { height: 60 },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "➖",
    category: "layout",
    defaultProps: { style: "solid", color: "#e2e8f0", thickness: 1 },
  },
  {
    type: "trust-badges",
    label: "Trust Badges",
    icon: "🛡️",
    category: "content",
    defaultProps: {
      badges: [
        { icon: "🚚", title: "Free Shipping", description: "On orders over $50" },
        { icon: "🔒", title: "Secure Checkout", description: "256-bit SSL encryption" },
        { icon: "↩️", title: "Easy Returns", description: "30-day return policy" },
        { icon: "⭐", title: "Quality Guaranteed", description: "100% satisfaction" },
      ],
    },
  },
  {
    type: "promo-banner",
    label: "Promo Banner",
    icon: "📢",
    category: "content",
    defaultProps: {
      text: "🎉 Grand Opening Special — 20% off your first order!",
      ctaText: "Shop Now",
      ctaLink: "#",
      backgroundColor: "#6366f1",
    },
  },
  {
    type: "collection-grid",
    label: "Collections",
    icon: "📂",
    category: "media",
    defaultProps: {
      title: "Shop by Category",
      subtitle: "Browse our curated collections",
      collections: [
        { name: "New Arrivals", description: "Fresh styles just landed", image: "", itemCount: 24 },
        { name: "Best Sellers", description: "Most popular picks", image: "", itemCount: 48 },
        { name: "Sale", description: "Up to 50% off", image: "", itemCount: 32 },
      ],
    },
  },
  {
    type: "newsletter",
    label: "Newsletter",
    icon: "📨",
    category: "form",
    defaultProps: {
      title: "Stay in the Loop",
      subtitle: "Get the latest updates and exclusive offers delivered to your inbox",
      placeholder: "Enter your email",
      ctaText: "Subscribe",
    },
  },
];

// ── helpers ──────────────────────────────────────────────────────
let idCounter = 0;
export function newComponentId(): string {
  return `comp_${Date.now()}_${++idCounter}`;
}

// ── Nested path helpers ─────────────────────────────────────────
function resolveKey(k: string) { const n = Number(k); return isNaN(n) ? k : n; }

export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => acc?.[resolveKey(k)], obj);
}

function setNestedValue(obj: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[resolveKey(keys[i])];
  cur[resolveKey(keys[keys.length - 1])] = value;
  return clone;
}

function deleteAtPath(obj: any, path: string): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) cur = cur[resolveKey(keys[i])];
  const last = keys[keys.length - 1];
  const idx = Number(last);
  if (Array.isArray(cur) && !isNaN(idx)) cur.splice(idx, 1);
  else delete cur[last];
  return clone;
}

function createSnapshot(components: ComponentData[]): HistoryState {
  return { components: JSON.parse(JSON.stringify(components)), timestamp: Date.now() };
}

const MAX_HISTORY = 50;

// ── Store ────────────────────────────────────────────────────────
interface EditorActions {
  // Initialise
  init: (data: {
    projectId: string;
    projectName: string;
    category: string;
    components: ComponentData[];
    isPublished?: boolean;
    subdomain?: string;
    customDomain?: string;
    publishedAt?: string | null;
  }) => void;

  // Component CRUD
  addComponent: (type: string, index?: number) => void;
  removeComponent: (id: string) => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  duplicateComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  updateComponentStyles: (id: string, styles: Record<string, any>) => void;
  replaceAllComponents: (components: ComponentData[]) => void;

  // Selection
  selectComponent: (id: string | null) => void;
  toggleSelectComponent: (id: string) => void;
  clearSelection: () => void;
  setMicroElement: (el: { tag: string; text: string; sectionId: string } | null) => void;
  selectElement: (componentId: string, path: string | null) => void;

  // Element-level CRUD
  updateElementProp: (componentId: string, elementPath: string, key: string, value: any) => void;
  deleteElement: (componentId: string, elementPath: string) => void;
  addElement: (componentId: string, arrayPath: string) => void;
  duplicateElement: (componentId: string, elementPath: string) => void;

  // View
  setDeviceMode: (mode: DeviceMode) => void;
  setViewMode: (mode: ViewMode) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Save / publish
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setPublished: (p: boolean) => void;
  setSubdomain: (s: string) => void;
  setCustomDomain: (d: string) => void;
  setPublishedAt: (d: string | null) => void;
  setProjectName: (name: string) => void;
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // ── Defaults ──
  projectId: "",
  projectName: "",
  category: "",
  components: [],
  selectedComponentId: null,
  selectedComponentIds: [],
  selectedElementPath: null,
  selectedMicroElement: null,
  deviceMode: "desktop",
  viewMode: "edit",
  history: [],
  historyIndex: -1,
  isDirty: false,
  isSaving: false,
  isPublished: false,
  subdomain: "",
  customDomain: "",
  publishedAt: null,

  // ── Init ──
  init: (data) => {
    const snapshot = createSnapshot(data.components);
    set({
      projectId: data.projectId,
      projectName: data.projectName,
      category: data.category,
      components: data.components,
      history: [snapshot],
      historyIndex: 0,
      isPublished: data.isPublished ?? false,
      subdomain: data.subdomain ?? "",
      customDomain: data.customDomain ?? "",
      publishedAt: data.publishedAt ?? null,
      isDirty: false,
      selectedComponentId: null,
    });
  },

  // ── Push History ──
  pushHistory: () => {
    const { components, history, historyIndex } = get();
    const trimmed = history.slice(0, historyIndex + 1);
    const next = [...trimmed, createSnapshot(components)].slice(-MAX_HISTORY);
    set({ history: next, historyIndex: next.length - 1, isDirty: true });
  },

  // ── Add Component ──
  addComponent: (type, index) => {
    const def = COMPONENT_REGISTRY.find((c) => c.type === type);
    if (!def) return;
    const comp: ComponentData = {
      id: newComponentId(),
      type,
      props: JSON.parse(JSON.stringify(def.defaultProps)),
    };
    const { components } = get();
    const next = [...components];
    if (index !== undefined && index >= 0 && index <= next.length) {
      next.splice(index, 0, comp);
    } else {
      next.push(comp);
    }
    set({ components: next });
    get().pushHistory();
    get().selectComponent(comp.id);
  },

  // ── Remove ──
  removeComponent: (id) => {
    const { components, selectedComponentId } = get();
    set({
      components: components.filter((c) => c.id !== id),
      selectedComponentId: selectedComponentId === id ? null : selectedComponentId,
    });
    get().pushHistory();
  },

  // ── Reorder ──
  moveComponent: (from, to) => {
    const comps = [...get().components];
    const [moved] = comps.splice(from, 1);
    comps.splice(to, 0, moved);
    set({ components: comps });
    get().pushHistory();
  },

  // ── Duplicate ──
  duplicateComponent: (id) => {
    const { components } = get();
    const idx = components.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const clone: ComponentData = {
      ...JSON.parse(JSON.stringify(components[idx])),
      id: newComponentId(),
    };
    const next = [...components];
    next.splice(idx + 1, 0, clone);
    set({ components: next });
    get().pushHistory();
    get().selectComponent(clone.id);
  },

  // ── Update Props ──
  updateComponentProps: (id, props) => {
    const { components } = get();
    set({
      components: components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, ...props } } : c
      ),
    });
    get().pushHistory();
  },

  // ── Update Styles ──
  updateComponentStyles: (id, styles) => {
    const { components } = get();
    set({
      components: components.map((c) =>
        c.id === id ? { ...c, styles: { ...(c.styles || {}), ...styles } } : c
      ),
    });
    get().pushHistory();
  },

  // ── Replace All (for AI generation) ──
  replaceAllComponents: (comps) => {
    set({ components: comps, selectedComponentId: null });
    get().pushHistory();
  },

  // ── Selection ──
  selectComponent: (id) => set({ selectedComponentId: id, selectedComponentIds: id ? [id] : [], selectedElementPath: null, selectedMicroElement: null }),
  toggleSelectComponent: (id) => {
    const { selectedComponentIds } = get();
    const has = selectedComponentIds.includes(id);
    const next = has ? selectedComponentIds.filter((i) => i !== id) : [...selectedComponentIds, id];
    set({
      selectedComponentIds: next,
      selectedComponentId: next.length > 0 ? next[next.length - 1] : null,
      selectedMicroElement: null,
    });
  },
  clearSelection: () => set({ selectedComponentId: null, selectedComponentIds: [], selectedElementPath: null, selectedMicroElement: null }),
  setMicroElement: (el) => set({ selectedMicroElement: el }),
  selectElement: (componentId, path) => set({ selectedComponentId: componentId, selectedElementPath: path }),

  // ── Element-level CRUD ──
  updateElementProp: (componentId, elementPath, key, value) => {
    const { components } = get();
    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;
    const elem = getNestedValue(comp.props, elementPath);
    const fullPath = key ? `${elementPath}.${key}` : elementPath;
    if (elem && typeof elem === "object" && !Array.isArray(elem) && key) {
      const updated = setNestedValue(comp.props, fullPath, value);
      set({ components: components.map((c) => c.id === componentId ? { ...c, props: updated } : c) });
    } else {
      // direct value (string, number) or no key
      const updated = setNestedValue(comp.props, fullPath, value);
      set({ components: components.map((c) => c.id === componentId ? { ...c, props: updated } : c) });
    }
    get().pushHistory();
  },

  deleteElement: (componentId, elementPath) => {
    const { components } = get();
    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;
    const updated = deleteAtPath(comp.props, elementPath);
    set({
      components: components.map((c) => c.id === componentId ? { ...c, props: updated } : c),
      selectedElementPath: null,
    });
    get().pushHistory();
  },

  addElement: (componentId, arrayPath) => {
    const { components } = get();
    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;
    const arr = getNestedValue(comp.props, arrayPath);
    if (!Array.isArray(arr) || arr.length === 0) return;
    const template = JSON.parse(JSON.stringify(arr[0]));
    if (typeof template === "object") {
      for (const k in template) {
        if (typeof template[k] === "string") template[k] = "";
        if (typeof template[k] === "boolean") template[k] = false;
      }
    }
    const newArr = [...arr, template];
    const updated = setNestedValue(comp.props, arrayPath, newArr);
    set({ components: components.map((c) => c.id === componentId ? { ...c, props: updated } : c) });
    get().pushHistory();
  },

  duplicateElement: (componentId, elementPath) => {
    const { components } = get();
    const comp = components.find((c) => c.id === componentId);
    if (!comp) return;
    const keys = elementPath.split(".");
    const idx = Number(keys[keys.length - 1]);
    if (isNaN(idx)) return;
    const arrayPath = keys.slice(0, -1).join(".");
    const arr = getNestedValue(comp.props, arrayPath);
    if (!Array.isArray(arr)) return;
    const clone = JSON.parse(JSON.stringify(arr[idx]));
    const newArr = [...arr];
    newArr.splice(idx + 1, 0, clone);
    const updated = setNestedValue(comp.props, arrayPath, newArr);
    set({ components: components.map((c) => c.id === componentId ? { ...c, props: updated } : c) });
    get().pushHistory();
    set({ selectedElementPath: `${arrayPath}.${idx + 1}` });
  },

  // ── View ──
  setDeviceMode: (mode) => set({ deviceMode: mode }),
  setViewMode: (mode) => set({ viewMode: mode }),

  // ── Undo / Redo ──
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const prev = historyIndex - 1;
    set({
      components: JSON.parse(JSON.stringify(history[prev].components)),
      historyIndex: prev,
      isDirty: true,
    });
  },
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const next = historyIndex + 1;
    set({
      components: JSON.parse(JSON.stringify(history[next].components)),
      historyIndex: next,
      isDirty: true,
    });
  },

  // ── Publish helpers ──
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),
  setPublished: (p) => set({ isPublished: p }),
  setSubdomain: (s) => set({ subdomain: s }),
  setCustomDomain: (d) => set({ customDomain: d }),
  setPublishedAt: (d) => set({ publishedAt: d }),
  setProjectName: (name) => set({ projectName: name }),
}));
