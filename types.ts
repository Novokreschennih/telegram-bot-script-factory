
export interface ScriptButton {
  text: string;
  callback_data: string;
}

export interface ScriptNode {
  text: string;
  buttons?: ScriptButton[][];
}

export interface ScriptBlockPrompt {
  blockTitle: string;
  imagePrompt: string;
}

export interface GeneratedAssets {
  profilePicturePrompt: string;
  description: string;
  capabilities: string;
  customizedScript: ScriptNode[];
  scriptBlockPrompts: ScriptBlockPrompt[];
}

export interface TextGenerationResponse {
    profilePicturePrompt: string;
    description: string;
    capabilities: string[];
    customizedScript: ScriptNode[];
    scriptBlocks: { title: string; description: string }[];
}
