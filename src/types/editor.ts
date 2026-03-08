export type DeviceMode = "desktop" | "tablet" | "mobile";
export type ViewMode = "edit" | "split" | "preview";

export interface ComponentStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  fontSize?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  maxWidth?: string;
  textAlign?: "left" | "center" | "right";
}

export interface ComponentData {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: ComponentStyles;
  children?: ComponentData[];
}

export interface HistoryState {
  components: ComponentData[];
  timestamp: number;
}

export interface EditorState {
  // Project
  projectId: string;
  projectName: string;
  category: string;

  // Components on canvas
  components: ComponentData[];

  // Selection
  selectedComponentId: string | null;
  selectedComponentIds: string[];
  selectedElementPath: string | null;
  selectedMicroElement: { tag: string; text: string; sectionId: string } | null;

  // View
  deviceMode: DeviceMode;
  viewMode: ViewMode;

  // History
  history: HistoryState[];
  historyIndex: number;

  // Saving / Publishing
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  subdomain: string;
  customDomain: string;
  publishedAt: string | null;
}

export interface PublishSettings {
  subdomain: string;
  customDomain?: string;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}
