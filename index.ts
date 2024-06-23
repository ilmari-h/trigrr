import cron from "node-cron"
import {parseArgs} from "util"

type CronExpression = {
	cronExpression: string;
	url: URL;
	method: string;
}

async function parseConfig(configFile?: string): Promise<null | CronExpression[]> {
	const config = configFile ? await Bun.file(configFile).text() : Bun.env["TRIGRR_CONFIG"];
	if(!config)
		return null
	const lines = config.split("\n").map(l => l.trim()).filter(l => l.length > 0);
	return lines.map((line,lineno) => {
		const words = line.split(/\s/);
		if(words.length < 6 && words.length > 7)
			throw Error(`Error reading config, line ${lineno} is malformed`)

		// first 5 words is the cron expression
		// following word is either an HTTP method or the URL to request
		// if there was an HTTP method, the following word is the URL
		const cronExpression = words.slice(0,5).join(" ")
		if(!cron.validate(cronExpression))
			throw Error(`Error reading config, invalid cron expression on line ${lineno+1}`)
		const methodOrLink = words[5]
		if(!methodOrLink)
			throw Error(`Error reading config, missing link on line ${lineno+1}`)
		let method = "GET"
		let hadMethod = false
		if(["GET", "POST", "PUT", "PATCH"].find(m => m === methodOrLink)) {
			method = methodOrLink;
			hadMethod = true
		}
		const urlString = (hadMethod && words.length === 7) ? words[6] : methodOrLink;
		if(!URL.canParse(urlString))
			throw Error(`Error reading config, invalid URL on line ${lineno+1}`)
		const url = new URL(urlString)
		return {cronExpression, url, method}
	})
}

async function main() {
	const { values } = parseArgs({
		args: Bun.argv,
		options: {
			config: {
				type: 'string',
			},
		},
		strict: true,
		allowPositionals: true,
	});

	const expressions = await parseConfig(values.config)
	if(!expressions) {
		console.log("No tasks to run")
		return 1
	}
	console.log("Using config:")
	expressions.forEach((expression, i) => {
		console.log(`${i+1}: ${expression.cronExpression} ${expression.method} ${expression.url.origin}...`)
	})
	const tasks = expressions.map((ex, i) => {
		const task = cron.schedule(
			ex.cronExpression,
			async () => {
				console.log(`job ${i+1}: ${ex.method} ${ex.url.origin}...`)
				const res = await fetch(ex.url,  {method: ex.method})
				console.log(`job ${i+1}: received ${res.status} from ${ex.url.origin}...`)
			})
		return new Promise<void>((resolve) => {
			task.start()
			resolve()
		})
	})
	await Promise.all(tasks)
}
main()
