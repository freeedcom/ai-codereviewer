import {octokit} from "./createReviewComment";

export async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string | null> {
  const response = await octokit.pulls.get({
                                             owner,
                                             repo,
                                             pull_number,
                                             mediaType: {format: "diff"},
                                           });
  // @ts-expect-error - response.data is a string
  return response.data;
}
