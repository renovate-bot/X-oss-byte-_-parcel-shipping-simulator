const { hashSync, genSaltSync, compareSync } = require("bcrypt")
const { StatusCodes } = require(`http-status-codes`)
const models = require("../models")
const Joi = require('joi')
const nodemailer = require('nodemailer');
const { isRef } = require("joi");
const { id } = require("../models/validationNewOrder");

const newUserSchema = models.userModel.newUserSchema
const newOrderSchema = models.newOrderModel
const validationEmailChangeCredentials = models.userModel.validationEmailChangeCredentials

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'proiecttwpss@gmail.com',
        pass: 'proiecttv'
    }
});

var mailOptions = {
    from: 'proiecttwpss@gmail.com',
    to: '',
    subject: '',
    text: ''
};

module.exports = {
    createAccountUser: (req, res) => {
        const body = req.body
        const salt = genSaltSync(10)
        body.password = hashSync(body.password, salt)
        const { error, value } = newUserSchema.validate(body);
        if (error) {
            return res.status(300).json({
                success: false,
                error: error.message
            })
        }
        req.db.createAccount(body, (error, results) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                })
            } else {
                res.status(200).json({
                    success: true
                })
                mailOptions.to = body.email
                mailOptions.subject = 'Confirmare creare cont'
                mailOptions.text = 'Ți-ai creat cont cu succes!'
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
        })
        return res
    },
    getCost: (req, res) => {
        console.log(req.body);
        return res.json({ message: res.body });
    },
    placeOrder: (req, res) => {
        const body = req.body
        if (!body)
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: `no body provided for neworder`
            })
        const { error, value } = newOrderSchema.validate(body);
        if (error) {
            console.log(error.message)
            return res.status(300).json({
                success: false,
                error: error.message
            })
        }
        console.log(body);
        req.db.placeNewOrder(body, (error, results) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                })
            } else res.status(200).json({
                success: true
            })
        })
        return res
    },
    codeChangePassword: (req, res) => {
        const body = req.body
        const { error, value } = validationEmailChangeCredentials.validate(body)
        if (error) {
            console.log(error.message)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
        req.db.getUserByEmail(body.email, (error, results) => {
            console.log(body.email)
            if (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                })
            }
            else if (results == undefined) {
                res.status(500).json({
                    success: false,
                    error: "not exist"
                })
            }
            else {
                var id = results.id
                req.db.newCode(results.id, (error, results) => {
                    if (error) {
                        res.status(500).json({
                            success: false,
                            error: error.message
                        })
                    }
                    else {
                        console.log(results)
                        console.log(id)
                        mailOptions.to = body.email
                        mailOptions.subject = 'Cod pentru schimbarea parolei'
                        mailOptions.text = 'Codul pentru resetarea parolei este:\n' + results.insertId
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error.message);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        const data = {
                            id: id,
                            code: results.insertId
                        }
                        req.db.deleteCode(data, (error, results) => {
                            if (error) {
                                res.status(500).json({
                                    success: false,
                                    error: error.message
                                })
                            }
                        })
                        res.status(200).json({
                            success: true
                        })
                    }
                })
            }
        })
        return res;
    },
    changePassword: (req, res) => {
        const body = req.body
        req.db.selectIdChangePassword(body.code, (error, results) => {
            if (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                })
            }
            else if (results == undefined) {
                res.status(500).json({
                    success: false,
                    error: "not exist"
                })
            }
            else {
                const salt = genSaltSync(10)
                body.password = hashSync(body.password, salt)
                body.id = results.id
                var id = results.id
                req.db.changePassword(body, (error, results) => {
                    if (error) {
                        res.status(500).json({
                            success: false,
                            error: error.message
                        })
                    }
                    else {
                        const data = {
                            id: id,
                            code: 0
                        }
                        req.db.deleteCode(data, (error, results) => {
                            if (error) {
                                res.status(500).json({
                                    success: false,
                                    error: error.message
                                })
                            }
                        })
                        res.status(200).json({
                            success: true
                        })
                    }
                })
            }
        })
        return res
    }
}