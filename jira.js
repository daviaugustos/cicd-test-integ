import fetch from "node-fetch";
import intervalToDuration from "date-fns/intervalToDuration/index.js";
import formatDuration from "date-fns/formatDuration/index.js";

const BASE_URL = `https://daviaugustos.atlassian.net`;

const baseHeaders = {
  accept: "application/json",
  Authorization: `Basic ${Buffer.from(
    "davi.auguusto@gmail.com:g8p9eNbmquLmssYTWX8m7585"
  ).toString("base64")}`,
};

// ADF MODEL JSON
// {
//     "version": 1,
//     "type": "doc",
//     "content": [
//       {
//         "type": "paragraph",
//         "content": [
//           {
//             "type": "text",
//             "text": "Homefinder (Android)",
//             "marks": [
//               {
//                 "type": "strong"
//               }
//             ]
//           }
//         ]
//       },
//       {
//         "type": "paragraph",
//         "content": [
//           {
//             "type": "text",
//             "text": "Build "
//           },
//           {
//             "type": "text",
//             "text": "#2 ",
//             "marks": [
//               {
//                 "type": "strong"
//               }
//             ]
//           },
//           {
//             "type": "text",
//             "text": "succeeded. "
//           },
//           {
//             "type": "emoji",
//             "attrs": {
//               "shortName": ":rocket:",
//               "id": "1f680",
//               "text": "🚀"
//             }
//           },
//           {
//             "type": "text",
//             "text": " "
//           }
//         ]
//       },
//       {
//         "type": "paragraph",
//         "content": [
//           {
//             "type": "text",
//             "text": "Duration",
//             "marks": [
//               {
//                 "type": "strong"
//               }
//             ]
//           },
//           {
//             "type": "text",
//             "text": ": 1min 15secs"
//           }
//         ]
//       },
//       {
//         "type": "paragraph",
//         "content": [
//           {
//             "type": "text",
//             "text": "Version download",
//             "marks": [
//               {
//                 "type": "strong"
//               }
//             ]
//           },
//           {
//             "type": "text",
//             "text": ": "
//           },
//           {
//             "type": "text",
//             "text": "IFHMS-1076-upgrade-npm-packages",
//             "marks": [
//               {
//                 "type": "link",
//                 "attrs": {
//                   "href": "https://docs.microsoft.com/en-us/appcenter/dashboard/webhooks/"
//                 }
//               }
//             ]
//           }
//         ]
//       },
//       {
//         "type": "paragraph",
//         "content": []
//       }
//     ]
//   }

// WEBHOOK APPCENTER MODEL

// const buildData = {
//   app_name: "myFirstApp",
//   branch: "DSDEV-7@upgrade-npm-packages",
//   build_status: "Succeeded",
//   build_id: "33",
//   build_link:
//     "https://appcenter.ms/users/{user-id}/apps/{app-name}/build/branches/main/builds/33",
//   build_reason: "manual",
//   finish_time: "2018-06-14T23:59:05.2542221Z",
//   icon_link:
//     "https://appcenter-filemanagement-distrib4ede6f06e.azureedge.net/f7794e4c-42f1-4e7c-8013-07ed2e1b733d/ic_launcher.png?sv=2020-02-18&sr=c&sig=gs4JfcWjpKeYH%2F%2Fg0jEtSKKbeRkug9q%2FldslmzzeOg0%3D&se=2020-02-26T08%3A57%3A58Z&sp=r",
//   notification_settings_link:
//     "https://appcenter.ms/users/{user-id}/apps/{app-name}/settings/notifications",
//   os: "iOS",
//   start_time: "2018-06-14T23:57:03.4379381Z",
//   source_version: "55820a357ba26831f2eeb3be9973a4ef20618b73",
//   sent_at: "2018-06-14T23:59:08.4897604Z",
// };

export const getIssue = async (issueKey) => {
  const req = await fetch(`${BASE_URL}/rest/api/3/issue/${issueKey}`, {
    method: "GET",
    headers: baseHeaders,
  });

  return req.json();
};

export const getTransitions = async (issueKey) => {
  const req = await fetch(
    `${BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
    {
      method: "GET",
      headers: baseHeaders,
    }
  );

  return req.json();
};

export const postChangeStatus = async (issueKey, transitionID) => {
  const req = await fetch(
    `${BASE_URL}/rest/api/3/issue/${issueKey}/transitions`,
    {
      method: "POST",
      headers: { ...baseHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        transition: {
          id: transitionID,
        },
      }),
    }
  );

  return req.status;
};

export const postAddComment = async (issueKey, buildData) => {
  const { app_name, build_id, build_link, build_status, os, branch } =
    buildData;
  const duration = formatDuration(
    intervalToDuration({
      start: new Date(buildData.start_time),
      end: new Date(buildData.finish_time),
    })
  );

  const req = await fetch(`${BASE_URL}/rest/api/3/issue/${issueKey}/comment`, {
    method: "POST",
    headers: { ...baseHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({
      body: {
        version: 1,
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `${app_name} (${os})`,
                marks: [
                  {
                    type: "strong",
                  },
                ],
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Build ",
              },
              {
                type: "text",
                text: `#${build_id} `,
                marks: [
                  {
                    type: "strong",
                  },
                ],
              },
              {
                type: "text",
                text: `${build_status}. `,
              },
              {
                type: "emoji",
                attrs: {
                  shortName: build_status === "Succeeded" ? ":rocket:" : ":x:",
                  id: build_status === "Succeeded" ? "1f680" : "274c",
                  text: build_status === "Succeeded" ? "🚀" : "❌",
                },
              },
              {
                type: "text",
                text: " ",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Duration",
                marks: [
                  {
                    type: "strong",
                  },
                ],
              },
              {
                type: "text",
                text: `: ${duration}`,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: build_status === "Succeeded" ? "Version download" : " ",
                marks: [
                  {
                    type: "strong",
                  },
                ],
              },
              {
                type: "text",
                text: build_status === "Succeeded" ? ": " : " ",
              },
              {
                type: "text",
                text: build_status === "Succeeded" ? branch : " ",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: build_link,
                    },
                  },
                ],
              },
            ],
          },
          {
            type: "paragraph",
            content: [],
          },
        ],
      },
    }),
  });

  return req;
};

async function main() {
  try {
    const buildData = {
      app_name: "myFirstApp",
      branch: "DSDEV-7@upgrade-npm-packages",
      build_status: "Failed",
      build_id: "33",
      build_link:
        "https://appcenter.ms/users/{user-id}/apps/{app-name}/build/branches/main/builds/33",
      build_reason: "manual",
      finish_time: "2018-06-14T23:59:05.2542221Z",
      icon_link:
        "https://appcenter-filemanagement-distrib4ede6f06e.azureedge.net/f7794e4c-42f1-4e7c-8013-07ed2e1b733d/ic_launcher.png?sv=2020-02-18&sr=c&sig=gs4JfcWjpKeYH%2F%2Fg0jEtSKKbeRkug9q%2FldslmzzeOg0%3D&se=2020-02-26T08%3A57%3A58Z&sp=r",
      notification_settings_link:
        "https://appcenter.ms/users/{user-id}/apps/{app-name}/settings/notifications",
      os: "iOS",
      start_time: "2018-06-14T23:57:03.4379381Z",
      source_version: "55820a357ba26831f2eeb3be9973a4ef20618b73",
      sent_at: "2018-06-14T23:59:08.4897604Z",
    };

    const result = await postAddComment("DSDEV-7", buildData);

    console.log(result);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
