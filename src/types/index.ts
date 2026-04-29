import { z } from "zod/v4";

export interface ArticleMeta {
  title: string;
  slug: string;
  language: string;
  status: "draft" | "final";
  styleRef: string | null;
  styleVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleTree {
  rootNode: string | null;
  bestNode: string | null;
  latestNode: string | null;
  nodes: Record<string, TreeNode>;
}

export interface TreeNode {
  parent: string | null;
  depth: number;
  children: string[];
}

export interface ArticleDetail {
  meta: ArticleMeta;
  tree: ArticleTree;
  nodes: Record<
    string,
    { frontmatter: Record<string, unknown>; content: string }
  >;
  evaluations: Record<string, EvaluationScores>;
}

export interface EvaluationScores {
  clarity: number;
  style_match: number;
  information_density: number;
  reader_engagement: number;
  hallucination_risk: number;
  overall_score: number;
}

export interface AppConfig {
  models: {
    writing: { provider: string; model: string };
    analysis: { provider: string; model: string };
  };
  language: string;
}

export interface GenerateInput {
  instruction: string;
}

export const GenerateInputSchema = z.object({
  instruction: z.string().min(1),
});
