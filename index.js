import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { uid } from 'uid';
import morgan from 'morgan';
const app = express();

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

app.use(cors())
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
const { urls } = db.data;
await db.write();

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
