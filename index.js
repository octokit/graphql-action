import { inspect } from "node:util";
import { load } from "js-yaml";
import { info, setOutput, debug, setFailed } from "@actions/core";
import { Octokit } from "@octokit/action";

main();

async function main() {
  try {
    ``;
    const octokit = new Octokit();
    const { query, ...variables } = getAllInputs();

    info(query);
    for (const [name, value] of Object.entries(variables)) {
      info(`> ${name}: ${value}`);
    }

    const time = Date.now();
    const data = await octokit.graphql(query, variables);

    info(`< 200 ${Date.now() - time}ms`);

    setOutput("data", JSON.stringify(data, null, 2));
  } catch (error) {
    debug(inspect(error));
    setFailed(error.message);
  }
}

function getAllInputs() {
  return Object.entries(process.env).reduce((result, [key, value]) => {
    if (!/^INPUT_/.test(key)) return result;

    const inputName =
      key.toLowerCase() === "input_mediatype"
        ? "mediaType"
        : key.substr("INPUT_".length).toLowerCase();

    // The js-yaml parser cannot handle the syntax of a multi-line GraphQL query very well,
    // so we just leave it as-is.
    // https://github.com/octokit/graphql-action/issues/21
    if (inputName === `query`) {
      result.query = value;
      return result;
    }

    if (inputName === `variables`) {
      const variables = load(value);
      return { ...result, ...variables };
    }

    result[inputName] = load(value);
    result[inputName] =
      result[inputName] == parseInt(result[inputName], 10)
        ? parseInt(result[inputName], 10)
        : result[inputName];
    return result;
  }, {});
}
