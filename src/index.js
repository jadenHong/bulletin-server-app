// npm install mysql2
// npm install express
// npm install i -D nodemon
// npm install cors

// connect server
console.log('Hong\'s server');

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// connect database 
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ap28xm59',
  database: 'bulletin_practice',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

const app = express();
const SERVER_PORT = 8090;
app.use(express.json()); // json 바디를 파싱해준다.
// app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors());
app.listen(SERVER_PORT, () => {
  console.log(`Server is listening to ${SERVER_PORT}`);
});

// ****** Read selected data ******

// connect browser to server. 브라우저에서 아래의 URL로 fetch 하면 이 쪽으로 get이 된다.
app.get('/customer/search/:name', async (req, res) => {
  const name = req.params.name;
  console.log(`received: ${name}`);
  try {
    const result = await getInfoByName(name);
    console.log(`result: ${JSON.stringify(result)}`);
    console.log(`result: ${result[0].name}`);
    res.json(result) // response 에서 브라우저로 넘겨준다. 그래서 fetch().then((response) => response.json()) 여기서 response를 받는것이다.
  } catch (err) {
    throw err;
  }
});

const getInfoByName = async (name) => {
  // 절대로 이렇게 쿼리 짜지마 큰일남. 파라미터로 받을떄 특히!! 작동은 잘되는데 sql injection 이라고하는 mysql 해킹방식에 노출됨
  // const QUERY = `SELECT * FROM userinfo WHERE name=${name}`

  const QUERY = `SELECT * FROM userinfo WHERE name=?`; // raw query 라고 부름
  const [rows, fields] = await promisePool.query(QUERY, name);
  console.log(`rows: ${rows}`);
  console.log(`fileds: ${fields}`);
  return rows;
}

// ****** Read all data ******
app.get('/customer/information/', async (req, res) => {
  try {
    const result = await getCustInfo();
    res.json(result);
  } catch (error) {
    throw error;
  }
});

const getCustInfo = async () => {
  const QUERY = `SELECT id, name, gender, email, title, content FROM userinfo NATURAL JOIN board`;
  const [rows, fileds] = await promisePool.query(QUERY);
  return rows;
}


// ****** Update data ******
app.post('/customer/update/', async (req, res) => {
  const body = req.body;
  console.log(body);
  try {
    const result = await modifyByUserid(body);
    res.json(result);
  } catch (error) {
    throw error;
  }
});

const modifyByUserid = async (body) => {
  const userid = body.id;
  const content = body.content;
  const QUERY = `UPDATE board SET content =? WHERE userid = ?`;
  const [rows] = await promisePool.query(QUERY, [content, userid]);
  return rows;
};


// ****** Insert data ******

app.post('/customer/save/', async (req, res) => {
  const body = req.body;
  console.log(req.body.name);
  try {
    const result = await saveDataByUserid(body);
    res.json(result);
  } catch (error) {
    throw error;
  }
});

const saveDataByUserid = async (body) => {
  const QUERY = 'INSERT INTO userinfo VALUES(?,?,?,?,?)';
  const [rows] = await promisePool.query(QUERY, [body.id, body.passwd, body.name, body.gender, body.email]);
  return rows;
}



// ****** delete data ******

app.get('/customer/delete/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const result = await deleteContent(id);
    res.json(result);
  } catch (error) {
    throw error;
  }
});

const deleteContent = async (id) => {
  const QUERY = `DELETE FROM board WHERE id=?`;
  const [rows] = await promisePool.query(QUERY, id);
  return rows
}