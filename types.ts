
export interface ScriptBlockImage {
  blockTitle: string;
  imageUrl: string;
}

export interface GeneratedAssets {
  profilePictureUrl: string;
  description: string;
  capabilities: string;
  customizedScript: string;
  scriptBlockImages: ScriptBlockImage[];
}

export interface TextGenerationResponse {
    description: string;
    capabilities: string[];
    customizedScript: string;
    scriptBlocks: { title: string; description: string }[];
}
