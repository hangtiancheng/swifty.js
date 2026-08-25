/** Dialogue transcript types shared by the engine, simulator, and evaluators. */

export type DialogueRole = "model" | "user";

export interface DialogueTurn {
  readonly roundNumber: number;
  readonly role: DialogueRole;
  readonly content: string;
  readonly evaluationNotes?: string;
}

export type TerminationReason = "userRefused" | "userEndedConversation" | "maxRoundsReached";

export interface UserProfile {
  readonly name: string;
  readonly description: string;
  readonly traits: readonly string[];
  /** Tendency in [0, 1] to refuse or stall; injected into the simulator prompt. */
  readonly refusalProbability: number;
  /** Tendency in [0, 1] to ask follow-up questions; injected into the simulator prompt. */
  readonly questionProbability: number;
  readonly systemPrompt: string;
}

export interface DialogueRecord {
  readonly taskId: string;
  readonly userProfile: UserProfile;
  readonly turns: readonly DialogueTurn[];
  readonly terminationReason: TerminationReason;
  /** ISO-8601 timestamp. */
  readonly startTime: string;
  /** ISO-8601 timestamp. */
  readonly endTime: string;
}
