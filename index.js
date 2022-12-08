import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { uid } from 'uid';
import morgan from 'morgan';
const app = express();

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

app.use(morgan('dev'));
app.use(cors());
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const jsonParser = bodyParser.json();
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file);
const db = new Low(adapter);
await db.read();

db.data ||= {
	users: []
};
const { users } = db.data;

await db.write();

app.post('/api/users', urlencodedParser, async (req, res, next) => {
	const getUserName = req.body.username;
	const hashUserName = uid(24);
	if (getUserName.length > 0) {
		try {
			db.data
				.users
				.push({
					username: getUserName,
					_id: hashUserName,
					log: []
				});
			await db.write();		
			res.json({ username: getUserName, _id: hashUserName });
		} catch (error) {
			res.json({ error: 'invalid data' });		
			}
	} else {
		res.json({ 'error': 'invalid data' });				
	}
});

app.post('/', urlencodedParser, async (req, res, next) => {
	// console.log(req.body);
	const getId = req.body[':_id'];
	const getUserById = users.find(({ _id }) => _id == getId);
	const getDescription = req.body.description;
	const getDuration = req.body.duration;
	let getDateNow = new Date();	
	const getDate = req.body.date || getDateNow.toDateString();
		
});

app.post('/api/users/:id/exercises', urlencodedParser, async (req, res, next) => {	
	const getId = req.params.id;	
	const getDescription = req.body.description;
	const getDuration = req.body.duration;
	let getDateNow = new Date();	
	const getDate = req.body.date || getDateNow.toDateString();

	function isValidDate (date) {
		let setDate = Date.parse(date);		
		if (!isNaN(setDate)) {
			setDate = new Date(date).toDateString();			
			return setDate;
		} else {
			setDate = new Date().toDateString();
			return setDate;
		}		
	}

	let setDate = isValidDate(getDate);
		
	const getUserById = users.find(({ _id }) => _id == getId) || getId;
	
	const { username, _id } = getUserById;
		
	try {
		
		getUserById.log.push({
				'description': getDescription,
				'duration': +getDuration,
				'date': setDate
			});
			
			await db.write();
		
		res.json({
			username,
			description: getDescription,
			duration: +getDuration,
			date: setDate,
			_id: getId
			// log: getUserById.log
		});		
	} catch (error) {
		res.json({error})
	}
});

app.get('/api/users/:id/logs', urlencodedParser, async (req, res, next) => {	
	const getId = req.params.id;		
	const getUserById = users.find(({ _id }) => _id == getId) || getId;
	
	const { username, _id } = getUserById;
		
	try {		
		res.json({
			username,
			count: getUserById.log.length,
			_id: getId,			
			log: getUserById.log
		});		
	} catch (error) {
		res.json({error})
	}
});

app.get('/api/users', (req, res) => {
	const getAllUsers = [];
	users.forEach(user => {
		getAllUsers.push(user);
	});
	res.json(getAllUsers);	
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
