"use client";
import { QuestionnaireProvider } from "@/context/questionnaire-context";
export function Providers({ children }: { children: React.ReactNode }) { return <QuestionnaireProvider>{children}</QuestionnaireProvider>; }
