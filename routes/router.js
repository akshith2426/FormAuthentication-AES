const express = require('express');
const route = express.Router()
const mysql = require('mysql');
const AES = require('mysql-aes')
var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'isaa-users',
	multipleStatements: true
});
con.connect(function(error) {
	if (error) throw error;
	console.log('MySQL Database Connected for ISAA Users Database');
});
route.get('/', (req, resp) => {
    resp.render("index");
})

route.post('/usersData', (req, resp) => {
    if(!req.body){
        res.status(400).send({ message : "Content can not be emtpy!"});
        return;
    }
    var nameBody = req.body.name;
    var emailBody = req.body.email;
    var genderBody = req.body.gender;
    var statusBody = req.body.status;
    var insertQuery = 'INSERT INTO users_table(name,email,gender,status) VALUES (?,?,?,?)';
    con.query(insertQuery,[AES.encrypt(nameBody,'key'),AES.encrypt(emailBody,'key'),AES.encrypt(genderBody,'key'),AES.encrypt(statusBody,'key')], function (err, result) {
        if (err) {
            console.error(err);
        }
        resp.redirect("/allUsers");
    })
})
route.get('/allUsers', (req, resp) => {
    var selectQuery = 'SELECT * FROM users_table';
    con.query(selectQuery, (err, results) => {
        if (err) {
            console.error(err);
        }
        var usersInfo = [];
        for (var i = 0; i < results.length; i++) {
            var userObject = {
                uid: results[i].uniqueNumber,
                name: AES.decrypt(results[i].name, 'key'),
                email: AES.decrypt(results[i].email, 'key'),
                gender: AES.decrypt(results[i].gender, 'key'),
                status: AES.decrypt(results[i].status, 'key')
            };
            usersInfo.push(userObject);
        }
        resp.render('allUserData', { usersInfo: usersInfo })
    })
});

route.get('/deleteUser/:id', (req, resp) => {
    var uniqueID = req.params.id;
    var deleteQuery = 'DELETE FROM users_table WHERE uniqueNumber=?';
    con.query(deleteQuery, [uniqueID], function (err, result) {
        if (err) {
            console.log(err);
        }
        resp.redirect('/allUsers');
    });
})
route.get('/userUpdate/:id', (req, resp) => {
    var uniqueNum = req.params.id;
    var selectOnlyUser = 'SELECT * FROM users_table WHERE uniqueNumber = ?';
    con.query(selectOnlyUser,[uniqueNum], function (err, answer) {
        resp.render('onlyUserData', {
            updateData: {
                uid: answer[0].uniqueNumber,
                name: AES.decrypt(answer[0].name, 'key'),
                email: AES.decrypt(answer[0].email, 'key'),
                gender: AES.decrypt(answer[0].gender, 'key'),
                status: AES.decrypt(answer[0].status, 'key')
        }});
    })
})
route.post('/userUpdated/:id', (req, resp) => {
    var uniqueNum = parseInt(req.params.id);
    var nameUpdated = req.body.name;
    var emailUpdated = req.body.email;
    var genderUpdated = req.body.gender;
    var statusUpdated = req.body.status;
    var updateQuery = 'UPDATE users_table SET name=? ,email=? ,gender=? ,status=? WHERE uniqueNumber=?';
    con.query(updateQuery, [AES.encrypt(nameUpdated,'key'),AES.encrypt(emailUpdated,'key'),AES.encrypt(genderUpdated,'key'),AES.encrypt(statusUpdated,'key'), uniqueNum], (err, response) => {
        if (err) {
            console.error(err);
        }
        resp.redirect('/allUsers');
    })
})
module.exports = route;