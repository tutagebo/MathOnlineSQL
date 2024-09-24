const portNum = 8211;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: 'localhost',
    user: 'tutan',
    password: 'TtnSQL_1024',
    database: 'mathgamedb'
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get("/",async(req,res)=>{
    let send_data;
    let q = req.query;
    switch(q.op){
        case 'rn':{
            send_data = await GetRankingData();
            break;
        }
        case 'ping':{
            send_data = "pong";
            break;
        }
        case 'l':{
            send_data = await UserLogin(q.id,q.password);
        }
    }
    console.log(send_data);
    res.status(200).send(send_data);
});

app.post("/",async(req,res)=>{
    let send_data = null;
    let q = req.body;
    switch(q.op){
        case 'u':{
            send_data = await UpdateData(q.table,q.id,q.data);
            console.log("c")
            break;
        }
        case 'r':{
            send_data = await RegistData(q.table,q.data);
            break;
        }
        case 'hsr':{
            send_data = await UpdateHighScore(q.data);
            break;
        }
    }
    //console.log(send_data);
    res.status(200).send(send_data);
});

app.listen(portNum);

console.log(`using port ${portNum}`);

async function UserLogin(id,pass){
    let retData = {
        result: false
    }
    const [res,error] = await connection.query(`SELECT * FROM playerdata WHERE player_id = '${id}'`)
    .catch(()=>{
        if(error)throw error;
    });
    let r = res[0];
    if(r?.password==pass){
        retData = {
            result: true,
            data: {
                name: r.name,
                rate: r.rate
            }
        }
    }else{
        retData={
            result: false
        }
    }
    
    return JSON.stringify(retData);
}

async function RegistData(table,dataobj){
    let dataAry = dataobj.split(',');
    let keys="",values="";
    for(let ele of dataAry){
        ele = ele.split('=');
        keys += `${ele[0]},`
        values += `'${ele[1]}',`;
    }
    keys += "regist_date";
    values += `'${GetToday()}'`;
    const [res] = await connection.query(`INSERT INTO ${table}(${keys}) VALUES (${values})`)
    .catch(e=>console.log(e));
    console.log(res);
    return 'success!';
}

async function UpdateData(table,targetId,dataobj){
    console.log(`UPDATE ${table} SET ${dataobj} WHERE player_id='${targetId}'`);
    const [res] = await connection.query(`UPDATE ${table} SET ${dataobj} WHERE player_id='${targetId}'`)
                        .catch(e=>console.log(e));
    console.log(res);
    return 'success!';
}

async function GetRankingData(){
    const [res1] = await connection.query(`SELECT HighScoreData.rate, playerdata.name FROM HighScoreData INNER JOIN playerdata ON HighScoreData.player_id = playerdata.player_id ORDER BY HighScoreData.rate DESC LIMIT 10;`)
                        .catch(e=>console.log(e));
    const [res2] = await connection.query(`SELECT HighScoreData.high_score, playerdata.name FROM HighScoreData INNER JOIN playerdata ON HighScoreData.player_id = playerdata.player_id ORDER BY HighScoreData.high_score DESC LIMIT 10;`)
                        .catch(e=>console.log(e));
    const [res3] = await connection.query(`SELECT HighScoreData.high_combo, playerdata.name FROM HighScoreData INNER JOIN playerdata ON HighScoreData.player_id = playerdata.player_id ORDER BY HighScoreData.high_combo DESC LIMIT 10;`)
                        .catch(e=>console.log(e));
    let retData= {
        ranking:{
            rate:res1,
            score:res2,
            combo:res3
        }
    };
    return JSON.stringify(retData);
}

async function UpdateHighScore(dataobj){
    console.log(dataobj);
    let [changeKey,changeData,notNeed,id] = dataobj.split(/,|=/g);
    const [res] = await connection.query(`SELECT 1 FROM HighScoreData WHERE player_id='${id}'`)
    .catch(e=>console.log(e));
    if(typeof res[0]==='undefined'||res[0]==null){
        const [respons] = await connection.query(`INSERT INTO HighScoreData(player_id,${changeKey}) VALUES ('${id}','${changeData}')`)
        .catch(e=>console.log(e));
        console.log(respons);
    }else{
        const [respons] = await connection.query(`UPDATE HighScoreData SET ${changeKey}='${changeData}' WHERE player_id ='${id}'`)
        .catch(e=>console.log(e));
        console.log(respons);
    }
}

function GetToday(){
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}

/*
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
  
readline.question('>', (answer) => {
    console.log(`Hello, ${answer}!\n`);
    readline.close();
});
connection.connect((error)=>{
    if(e){
        console.log(`error!!!:${e.stack}`);
        return;
    }
    console.log(`success id:${connection.threadId}`)
});

connection.end();*/
