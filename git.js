import { execSync } from "child_process";

const gitCommand = "git rev-parse HEAD";

export function getCommitSha() {
  return execSync(gitCommand).toString().trim();
}
