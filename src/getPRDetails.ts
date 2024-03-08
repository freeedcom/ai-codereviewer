import {PRDetails} from "./createPrompt";
import {readFileSync} from "fs";
import {octokit} from "./createReviewComment";

export async function getPRDetails(): Promise<PRDetails> {
  const {repository, number} = JSON.parse(
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
    title: prResponse.data.title ?? "",
    description: prResponse.data.body ?? "",
  };
}
