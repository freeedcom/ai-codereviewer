import * as core from "@actions/core";
import {Octokit} from "@octokit/rest";

const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
export const octokit = new Octokit({auth: GITHUB_TOKEN});

export async function createReviewComment(
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
