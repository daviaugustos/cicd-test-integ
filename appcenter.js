import fetch from "node-fetch";
import { getCommitSha } from "./git.js";

export const customAppcenterSettings = {
  token: process.env.APPCENTER_API_TOKEN,
  projectName: process.env.APPCENTER_PROJECT_NAME,
  ownerName: process.env.APPCENTER_OWNER_NAME,
};

const BASE_URL = `https://api.appcenter.ms/v0.1/apps/${customAppcenterSettings.ownerName}/${customAppcenterSettings.projectName}`;

const baseHeaders = {
  accept: "application/json",
  "X-API-Token": customAppcenterSettings.token,
  "Content-Type": "application/json",
};

export const createBuild = async (
  branchName,
  baseSettings = customAppcenterSettings
) => {
  // const commitSha = await getCommitSha();
  const commitSha = "0f86d74ce8c2460cc94fc610f35050ceaf927479";

  const req = await fetch(`${BASE_URL}/branches/${branchName}/builds`, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      sourceVersion: commitSha,
    }),
  });

  return req.json();
};

function sleep(time = 100) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function getBuildInfo(buildNumber) {
  const req = await fetch(`${BASE_URL}/builds/${buildNumber}`, {
    method: "GET",
    headers: baseHeaders,
  });

  return req.json();
}

async function monitorStatus(buildNumber) {
  const buildInfo = await getBuildInfo(buildNumber);

  console.info("In progress... ", buildInfo);

  if (buildInfo.status === "completed") {
    if (buildInfo.result === "failed" || buildInfo.result === "canceled") {
      throw "Something went wrong with your build";
    }

    console.log("Your build is completed");

    return buildInfo;
  }

  if (buildInfo.status === "failed") {
    console.error("Your build failed");
    return buildInfo;
  }

  if (buildInfo.status === "canceled") {
    console.error("The build was canceled");
    return buildInfo;
  }

  await sleep(60000);

  return monitorStatus(buildNumber);
}

export const getBranches = async () => {
  const req = await fetch(`${BASE_URL}/branches`, {
    method: "GET",
    headers: baseHeaders,
  });

  return req.json();
};

async function main() {
  try {
    // const { buildNumber } = await createBuild();
    // console.log("buildNumber", buildNumber);

    // await monitorStatus(buildNumber);
    const result = await getBranches();

    console.log("result", result);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
