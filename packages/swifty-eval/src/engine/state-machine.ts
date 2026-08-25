/** Dialogue flow states. */
export const DIALOGUE_STATES = [
	"start",
	"identityCheck",
	"flowExecution",
	"taskComplete",
	"userRefusal",
	"comfortUser",
	"end",
] as const;

export type DialogueState = (typeof DIALOGUE_STATES)[number];

/** Actions request a transition into the state of the same name. */
export type DialogueAction = Exclude<DialogueState, "start">;

const TRANSITIONS: Readonly<
	Record<DialogueState, ReadonlySet<DialogueAction>>
> = {
	start: new Set(["identityCheck", "flowExecution"]),
	identityCheck: new Set(["flowExecution", "userRefusal"]),
	flowExecution: new Set(["taskComplete", "userRefusal", "flowExecution"]),
	taskComplete: new Set(["end"]),
	userRefusal: new Set(["comfortUser", "end"]),
	comfortUser: new Set(["end"]),
	end: new Set(),
};

/** Tracks dialogue flow state transitions and completed flow steps. */
export class DialogueStateMachine {
	private state: DialogueState = "start";
	private readonly completedSteps = new Set<number>();
	private readonly history: DialogueState[] = [];

	get currentState(): DialogueState {
		return this.state;
	}

	get stateHistory(): readonly DialogueState[] {
		return this.history;
	}

	/** Attempts a transition; returns false when the action is not permitted. */
	transition(action: DialogueAction): boolean {
		if (!TRANSITIONS[this.state].has(action)) {
			return false;
		}
		this.history.push(this.state);
		this.state = action;
		return true;
	}

	markStepCompleted(stepId: number): void {
		this.completedSteps.add(stepId);
	}

	getCompletedSteps(): ReadonlySet<number> {
		return new Set(this.completedSteps);
	}

	getCompletionRatio(totalSteps: number): number {
		if (totalSteps === 0) {
			return 1;
		}
		return this.completedSteps.size / totalSteps;
	}

	isTerminal(): boolean {
		return this.state === "end";
	}

	reset(): void {
		this.state = "start";
		this.completedSteps.clear();
		this.history.length = 0;
	}
}
