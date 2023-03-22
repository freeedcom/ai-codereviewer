import { readFileSync } from "fs";
import * as core from "@actions/core";
import { Configuration, OpenAIApi } from "openai";
import { Octokit } from "@octokit/rest";
import parseDiff, { Chunk, File } from "parse-diff";
import minimatch from "minimatch";

const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  description: string;
}

async function getPRDetails(): Promise<PRDetails> {
  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );
  const prResponse = await octokit.pulls.get({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });
  return {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
    description: prResponse.data.body ?? "",
  };
}

async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string | null> {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });
  // @ts-expect-error - response.data is a string
  return response.data;
}

async function analyzeCode(
  parsedDiff: File[],
  prDescription: string
): Promise<Array<{ body: string; path: string; line: number }>> {
  const comments: Array<{ body: string; path: string; line: number }> = [];

  for (const file of parsedDiff) {
    for (const chunk of file.chunks) {
      const prompt = createPrompt(file, chunk, prDescription);
      const aiResponse = await getAIResponse(prompt);
      if (aiResponse) {
        const comment = createComment(file, chunk, aiResponse);
        if (comment) {
          comments.push(comment);
        }
      }
    }
  }
  return comments;
}

function createPrompt(file: File, chunk: Chunk, prDescription: string): string {
  return `
Review the following code changes in the file "${
    file.to
  }" and take the pull request description into account when writing the response.
  
Description:

---
${prDescription}
---

Please provide comments and suggestions ONLY if there is something to improve, write the answer in Github markdown. If the code looks good, DO NOT return any text (leave the response completely empty)

${chunk.content}
${chunk.changes
  .map((c) => (c.type === "add" ? "+" : "-") + " " + c.content)
  .join("\n")}
`;
}

async function getAIResponse(prompt: string): Promise<string | null> {
  const queryConfig = {
    model: "gpt-4",
    temperature: 0.2,
    max_tokens: 400,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const response = await openai.createChatCompletion({
      ...queryConfig,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    return response.data.choices[0].message?.content?.trim() || null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function createComment(
  file: File,
  chunk: Chunk,
  aiResponse: string
): { body: string; path: string; line: number } | null {
  const lastAddChange = [...chunk.changes]
    .reverse()
    .find((c) => c.type === "add");
  if (lastAddChange && file.to) {
    return {
      body: aiResponse,
      path: file.to,
      // @ts-expect-error below properties exists on AddChange
      line: lastAddChange.ln || lastAddChange.ln1,
    };
  }
  return null;
}

async function createReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  comments: Array<{ body: string; path: string; line: number }>
): Promise<void> {
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: "COMMENT",
  });
}

(async function main() {
  const prDetails = await getPRDetails();
  const diff = await getDiff(
    prDetails.owner,
    prDetails.repo,
    prDetails.pull_number
  );
  if (!diff) {
    console.log("No diff found");
    return;
  }

  const parsedDiff = parseDiff(diff);
  const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  const filteredDiff = parsedDiff.filter((file) => {
    return !excludePatterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });

  const comments = await analyzeCode(filteredDiff, prDetails.description);
  if (comments.length > 0) {
    await createReviewComment(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number,
      comments
    );
  }
})().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
