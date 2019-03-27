const fs = require('fs');
const csv = require('csv');
const parser = csv.parse();
const sqlite = require('sqlite');

function writeToDB(db) {
	const readStream = fs.createReadStream('BikeRackData.csv');	
	let first = true;
	readStream.on('readable', () => {
		let data = readStream.read();		
		data && parser.write(data);
	});

	parser.on('readable', () => {
		let rec = parser.read();
		if (first) {
			first = false; 
			return;
		}
		
		let sql = `INSERT into BikeRackData (Number, Name, Side) 
			VALUES ('${rec[0]}', '${rec[1]}', '${rec[2]}')`;
		console.log(sql);
		db.exec(sql);
	});
}

sqlite.open('database.sqlite').then( async (db) => {
	//console.log('database opened', db);
	
	await db.all(`DROP TABLE IF EXISTS BikeRackData`);
	
	await db.all(`CREATE TABLE BikeRackData (
		id INTEGER PRIMARY KEY,
		Number TEXT,
		Name TEXT,
		Side TEXT,
		Station TEXT,
		BIA TEXT,
		Racks INTEGER,
		Year INTEGER,
		Type TEXT,
		Capacity INTEGER,
		Status TEXT,
		Street TEXT
	)`);
	
	writeToDB(db);
});
