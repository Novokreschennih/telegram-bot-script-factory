
export interface ScriptBlockPrompt {
  blockTitle: string;
  imagePrompt: string;
}

export interface GeneratedAssets {
  profilePicturePrompt: string;
  description: string;
  capabilities: string;
  customizedScript: string;
  scriptBlockPrompts: ScriptBlockPrompt[];
}

export interface TextGenerationResponse {
    profilePicturePrompt: string;
    description: string;
    capabilities: string[];
    customizedScript: string;
    scriptBlocks: { title: string; description: string }[];
}