export interface BugInput {
    errorMessage: string;
}

export interface DiagnosisResult {
    title: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    classification: string;
    root_cause: string;
    explanation: string;
    suggested_fix: string;
    reproduction_steps: string[];
    prevention_strategy: string;
    confidence_score: number;
}
