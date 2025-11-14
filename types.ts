
export interface ScriptButton {
  text: string;
  callback_data: string;
}

export interface ScriptNode {
  text: string;
  buttons?: ScriptButton[][];
}

export interface ImagePlaceholderNode {
    imagePlaceholderFor: string;
}

export type CustomizedScriptItem = ScriptNode | ImagePlaceholderNode;

export interface ScriptBlockPrompt {
  blockTitle: string;
  imagePrompt: string;
}

export interface GeneratedAssets {
  profilePicturePrompt: string;
  description: string;
  capabilities: string;
  customizedScript: CustomizedScriptItem[];
  scriptBlockPrompts: ScriptBlockPrompt[];
}

export interface TextGenerationResponse {
    profilePicturePrompt: string;
    description: string;
    capabilities: string[];
    customizedScript: CustomizedScriptItem[];
    scriptBlocks: { title: string; description: string }[];
}