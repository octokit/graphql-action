const { inspect } = require("util");

const core = require("@actions/core");
const { Octokit } = require("@octokit/action");

main();

async function main() {
    try {
        ``;
        const octokit = new Octokit();
        const { query, ...variables } = getAllInputs();

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

function parseValue(value) {
	try {
		if (parseInt(value, 10)) {
			return parseInt(value, 10);
		}

		var obj = JSON.parse(value);
		if (obj && typeof obj === "object") {
			// this condition prevents the returning wring value
			// because neither JSON.parse(false) or JSON.parse(1234) throw errors
			// and JSON.parse(null) returns null so we have to check for that
			return obj;
		}
	} catch (e) {
		// ignore the error thrown by the parsing
	}

	return value;
}

function getAllInputs() {
    return Object.entries(process.env).reduce((result, [key, value]) => {
        if (!/^INPUT_/.test(key)) return result;

        const inputName = key.substr("INPUT_".length).toLowerCase();
        result[inputName] = parseValue(value);
        return result;
    }, {});
}
