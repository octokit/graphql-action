const { inspect } = require("util");

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

main();

async function main() {
  if (!process.env.GITHUB_REPOSITORY) {
    core.setFailed(
      'GITHUB_REPOSITORY missing, must be set to "<repo owner>/<repo name>"'
    );
    return;
  }

  try {
    const eventPayload = require(process.env.GITHUB_EVENT_PATH);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const repositoryId = eventPayload.repository.node_id;

    const octokit = new Octokit();
    const { query, ...variables } = getAllInputs();

    if (/\$repositoryId\b/.test(query)) {
      variables.repositoryId = variables.repositoryId || repositoryId;
    }
    if (/\$owner\b/.test(query)) {
      variables.owner = variables.owner || owner;
    }
    if (/\$repo\b/.test(query)) {
      variables.repo = variables.repo || repo;
    }

    core.debug(
      `Setting default parameters: ${inspect({
        owner,
        repo,
        repositoryId
      })}`
    );

    core.info(query);
    for (const [name, value] of Object.entries(variables)) {
      core.info(`> ${name}: ${value}`);
    }

    const time = Date.now();
    const data = await octokit.graphql(query, variables);

    core.info(`< 200 ${Date.now() - time}ms`);

    core.setOutput("data", JSON.stringify(data, null, 2));
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName = key.substr("INPUT_".length).toLowerCase();
    result[inputName] = value;
    return result;
  }, {});
}
