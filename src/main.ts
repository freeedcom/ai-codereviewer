import {readFileSync} from "fs";
import * as core from "@actions/core";
import parseDiff from "parse-diff";
import minimatch from "minimatch";
import {createReviewComment, octokit} from "./createReviewComment";
import {analyzeCode} from "./analyzeCode";
import {getPRDetails} from "./getPRDetails";
import {getDiff} from "./getDiff";

async function main() {
  const prDetails = await getPRDetails();
  let diff: string | null;
  const eventData = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
  );

  if (eventData.action === "opened") {
    diff = await getDiff(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;

    const response = await octokit.repos.compareCommits({
                                                          headers: {
                                                            accept: "application/vnd.github.v3.diff",
                                                          },
                                                          owner: prDetails.owner,
                                                          repo: prDetails.repo,
                                                          base: newBaseSha,
                                                          head: newHeadSha,
                                                        });

    diff = String(response.data);
  } else {
    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

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

  const comments = await analyzeCode(filteredDiff, prDetails);
  if (comments.length > 0) {
    await createReviewComment(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number,
      comments
    );
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
