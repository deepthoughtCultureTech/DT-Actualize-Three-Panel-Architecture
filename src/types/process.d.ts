export interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "longText" | "codeEditor" | "audioResponse" | "fileUpload" | "singleChoice" | "multipleChoice";
  options?: string[]; // for singleChoice and multipleChoice
  description?: string; // optional description for the field
}

export interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction"; 
  fields?: Field[]; // optional, only if type=form/coding
  instruction?: string; // optional, if type=instruction
}

export interface WatchBeforeYouBegin {
  enabled: boolean;
  videoUrl: string; // URL to MP4, YouTube, Vimeo, or hosted link
  videoTitle: string;
  videoDescription: string;
  isMandatory: boolean;
  videoDuration?: string; // optional, e.g., "5:30"
}

export interface Process {
  _id: string;
  title: string;
  description: string;
  rounds: Round[];
  adminId: string;
  status: "draft" | "published";
  createdAt: string;
  watchBeforeYouBegin?: WatchBeforeYouBegin; // optional video configuration
}
