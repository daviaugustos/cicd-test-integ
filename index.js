import express from "express";
import { getBranches, createBuild } from "./appcenter.js";
import { postChangeStatus, postAddComment } from "./jira.js";
const app = express();
const port = 3000;

app.use(express.json());

app.post("/build", async (req, res) => {
  const { key } = req.body;

  try {
    const branchesFromAppcenter = await getBranches();

    const respectiveBranch = branchesFromAppcenter.filter(({ branch }) =>
      branch.name.includes(key)
    );

    if (!respectiveBranch.length) {
      throw { message: "Branch not found" };
    }
    const fullBranchName = respectiveBranch[0].branch.name;

    const { buildNumber } = await createBuild(fullBranchName);

    //este trigger sera feito no momento que o status for alterado de in development pra building e nao precisa ser feito aqui
    // const statusChangeResult = await postChangeStatus(key, "2");

    res.send(statusChangeResult);
  } catch (err) {
    res.send(err);
  }
});

app.post("/post-build", async (req, res) => {
  const appCenterWebhookBuildDataPayload = req.body;

  const jiraIssueKey = appCenterWebhookBuildDataPayload.branch.split("@")[0];
  const jiraTransitionStatusID =
    appCenterWebhookBuildDataPayload.build_status === "Succeeded" ? "3" : "21";

  try {
    const addCommentResult = await postAddComment(
      jiraIssueKey,
      appCenterWebhookBuildDataPayload
    );
    const statusChangeResult = await postChangeStatus(
      jiraIssueKey,
      jiraTransitionStatusID
    );
    res.send(addCommentResult);
  } catch (err) {
    res.send(err);
  }
});

app.post("/", async (req, res) => {
  res.send("err");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
