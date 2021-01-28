const http = require('http');
const { exit } = require('process');

if (process.argv.length != 3) {
	console.error("Usage: node scrapper.js [ip]");
	exit(1);
}

async function promissifyReq(url) {
	return new Promise((resolve) => {
		const cb = (res) => {
			let txt = "";
			res.on("data", data => {
				txt += data;
			})
			res.on("end", () => {
				resolve(txt.toString('utf-8'));
			})
		}
		http.request(url, cb).end();
	})
}

//Liste des dossiers à explorer
let waitingList = [`http://${process.argv[2]}/.hidden/`];

//Liste des phrases dans le README, et leur nombre d'occurrences
let decoys = {};

(async () => {
	while (waitingList.length) {
		//On prend la première url
		const url = waitingList.shift();
		let data = await promissifyReq(url);
		//On capture le contenu du href des liens sur la page
		let reg = /<a href="(.*)">/gm;
		let ret;
		while (ret = reg.exec(data)) {
			const path = ret[1];
			//Pour ne pas boucler a l'infini
			if (path === "../")
				continue ;
			//On ajoute le contenu du README, pour voir le nb d'occurrences
			else if (path === "README") {
				let str = await promissifyReq(url + path);
				if (!decoys[str])
					decoys[str] = 1;
				else
					decoys[str]++;
			}
			//C'est un path, on le rajoute a la liste
			else {
				waitingList.push(url + path);
			}
		}
	}
	console.log(decoys);
})()
