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
	users: [],
	exercises: [],
	log: []
};
const { users, exercises, log } = db.data;
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
					_id: hashUserName
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
	console.log(req.body);
	const getId = req.body[':_id'];
	const getUserById = users.find(({ _id }) => _id == getId);
	const getDescription = req.body.description;
	const getDuration = req.body.duration;
	let getDateNow = new Date();	
	const getDate = req.body.date || getDateNow.toDateString();
	if (getUserById){
		try {
			const {username, _id } = getUserById;
			db.data
			.exercises
			.push({
				username,
				'description': getDescription,
				'duration': getDuration,
				'date': getDate,
				_id,
			});
			await db.write();
		} catch (error) {
			res.json({error})
		}
	} else {
		res.json({'error': 'userId not found'})
	}
});

app.post('/api/users/:id/exercises', urlencodedParser, async (req, res, next) => {
	const getId = req.params.id;
	try {
		const getUserById = users.find(({ _id }) => _id == getId);	
		res.json({getUserById});		
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
