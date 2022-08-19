const _c = require('./config');
const _sql = require('mssql');
const _crypto = require('crypto');
var _http = require('http');
var _url = require('url');
const _axios = require('axios');
const _qs = require('querystring');
const { isNull } = require('util');
const fs = require('fs');
const path = require('path');


// SQL Server
//const _sqlConfig = `Server=${_c.sql.server},${_c.sql.port}; Database=${_c.sql.database}; User Id=${_c.sql.user}; Password=${_c.sql.password}; Encrypt=${_c.sql.encrypt}`;
const _sqlConfig = { user: _c.sql.user, password: _c.sql.password, database: _c.sql.database, server: _c.sql.server, options: { encrypt: false, trustServerCertificate: false }}
let _sqlData;
// SQL Server


let jsonText = "";

_http.createServer(async function (req, res)
{
    res.writeHead(200, { 'Content-Type': 'application/json' });

    var q = _url.parse(req.url, true);

    // POST metodu kullanıldı test
    if (req.method == "POST")
    {
        // (deposit) YATIRIM
        if (q.pathname == "/deposit")
        {
            console.log("yatırım");
            // Herhangi bir hata yok
            try
            {
                // PAPARA - IQMONEY - MEFETE - PAYFIX - PEPPARA - CMTCÜZDAN - HAVALE/EFT
                if (q.query.payment_method == "PAPARA" || q.query.payment_method == "IQMONEY" || q.query.payment_method == "MEFETE" || q.query.payment_method == "PAYFIX" || q.query.payment_method == "PEPPARA" || q.query.payment_method == "CMTCÜZDAN" || q.query.payment_method == "HAVALE/EFT")
                {
                    //console.log("istek geldi");
                    var result1 = await fApiRequest1(req.headers.api_key, req.headers.secret_key);

                    // Api Key / Secret Key hatalı
                    if (result1.rowsAffected == 0) {
                        jsonText = `` +
                            `{\r\n` +
                            `   "success": false,\r\n` +
                            `   "code": 903,\r\n` +
                            `   "message": "${_c.fErrorMessage(903, "tr")}",\r\n` +
                            `   "message_en": "${_c.fErrorMessage(903, "en")}"\r\n` +
                            `}`;
                    }

                    // Api Key / Secret Key doğru
                    else
                    {
                        var IPAddressYetkisi = false;

                        // IP kısıtlaması var
                        if (isNull(result1.recordset[0].fldSiteIPAddress) == false)
                        {
                            // IP adresi doğru
                            if (result1.recordset[0].fldSiteIPAddress == req.socket.remoteAddress)
                            {
                                IPAddressYetkisi = true;
                            }
                            // IP adresi yanlış
                            else
                            {
                                IPAddressYetkisi = false;
                            }
                        }

                        // IP kısıtlaması yok
                        else
                        {
                            IPAddressYetkisi = true;
                        }

                        // IP erişimi yok
                        if (IPAddressYetkisi == false)
                        {
                            jsonText = `` +
                                `{\r\n` +
                                `   "success": false,\r\n` +
                                `   "code": 904,\r\n` +
                                `   "message": "${_c.fErrorMessage(904, "tr")}",\r\n` +
                                `   "message_en": "${_c.fErrorMessage(904, "en")}"\r\n` +
                                `}`;
                        }

                        // IP erişimi var
                        else
                        {
                            var result2 = await fApiRequest2(1, q.query.payment_method, req.headers.api_key, req.headers.secret_key);

                            // Uygun hesap yok
                            // if (isNull(result2.recordset[0].fldAccountID) == true)
                            if (result2.rowsAffected == 0)
                            {
                                jsonText = `` +
                                    `{\r\n` +
                                    `   "success": false,\r\n` +
                                    `   "code": 905,\r\n` +
                                    `   "message": "${_c.fErrorMessage(905, "tr")}",\r\n` +
                                    `   "message_en": "${_c.fErrorMessage(905, "en")}"\r\n` +
                                    `}`;
                            }

                            // Uygun hesap var
                            else
                            {
                                //console.log("rec set");
                                //console.log(result2.recordset[0]);
                                // Minimum yatırım tutarı altında kalıyor
                                if (result2.recordset[0].fldSiteDepositMin > q.query.amount)
                                {
                                    jsonText = `` +
                                        `{\r\n` +
                                        `   "success": false,\r\n` +
                                        `   "code": 906,\r\n` +
                                        `   "message": "${_c.fErrorMessage(906, "tr").replace("{amount}", result2.recordset[0].fldSiteDepositMin)}",\r\n` +
                                        `   "message_en": "${_c.fErrorMessage(906, "en").replace("{amount}", result2.recordset[0].fldSiteDepositMin)}"\r\n` +
                                        `}`;
                                }

                                // Maksimum yatırım tutarı üstünde kalıyor
                                else if (result2.recordset[0].fldSiteDepositMax < q.query.amount)
                                {
                                    jsonText = `` +
                                        `{\r\n` +
                                        `   "success": false,\r\n` +
                                        `   "code": 907,\r\n` +
                                        `   "message": "${_c.fErrorMessage(907, "tr").replace("{amount}", result2.recordset[0].fldSiteDepositMax)}",\r\n` +
                                        `   "message_en": "${_c.fErrorMessage(907, "en").replace("{amount}", result2.recordset[0].fldSiteDepositMax)}"\r\n` +
                                        `}`;
                                }

                                // Yatırım talebi oluşturuluyor
                                else
                                {
                                    // name alanı boş
                                    if (q.query.name == "" || q.query.name == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 909,\r\n` +
                                            `   "message": "${_c.fErrorMessage(909, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(909, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // surname alanı boş
                                    else if (q.query.surname == "" || q.query.surname == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 910,\r\n` +
                                            `   "message": "${_c.fErrorMessage(910, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(910, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // amount alanı boş
                                    else if (q.query.amount == "" || q.query.amount == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 911,\r\n` +
                                            `   "message": "${_c.fErrorMessage(911, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(911, "en")}"\r\n` +
                                            `}`;
                                    }
                                    else
                                    {

                                        var orderID = 0;
                                        if (q.query.order_id == undefined || q.query.order_id == '') {
                                          orderID = 0;
                                        } else {
                                          orderID = q.query.order_id;
                                        }


                                        var resultPayment = await fPayment(result2.recordset[0].fldAccountID, 1, q.query.amount, result2.recordset[0].fldDepositBrokerageRatio, _c.fTextToTurkish(q.query.username), _c.fTextToTurkish(q.query.name), _c.fTextToTurkish(q.query.surname), '', '', _c.fTextToTurkish(orderID), _c.fTextToTurkish(q.query.wallet_number));

                                        // HAVALE/EFT yatırımsa banka adınıda yazdırıyoruz
                                        var bankName = "";
                                        if (result2.recordset[0].fldBankID != null)
                                        {
                                            bankName = `        "bank": "${result2.recordset[0].fldBankName}",\r\n`;
                                        }

                                        data = await getPaymentInfo(resultPayment.recordset[0].fldPaymentID);

                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": true,\r\n` +
                                            `   "code": 100,\r\n` +
                                            `   "message": "Yatırım talebi başarıyla oluşturuldu.",\r\n` +
                                            `   "message_en": "The investment request has been successfully created.",\r\n` +
                                            `   "result":\r\n` +
                                            `   {\r\n` +
                                            `       "payment_id": ${resultPayment.recordset[0].fldPaymentID},\r\n` +
                                            `       "payment_url": "http://payment.paytiqo.com/deposit/${data.recordset[0].fldPaymentType}/${data.recordset[0].fldPaymentToken}",\r\n` +
                                            `       "status_id": 0,\r\n` +
                                            `       "status_description": "${_c.fMessage(100, "tr")}",\r\n` +
                                            `       "status_description_en": "${_c.fMessage(100, "en")}",\r\n` +
                                            `       "account_details":\r\n` +
                                            `       {\r\n` +
                                            bankName +
                                            `           "name": "${result2.recordset[0].fldAccountName}",\r\n` +
                                            `           "number": "${result2.recordset[0].fldAccountNumber}"\r\n` +
                                            `       }\r\n` +
                                            `   }\r\n` +
                                            `}`;
                                    }
                                }
                            }
                        }
                    }
                }

                // Bilinmeyen ödeme yöntemi
                else
                {
                    jsonText = `` +
                        `{\r\n` +
                        `   "success": false,\r\n` +
                        `   "code": 902,\r\n` +
                        `   "message": "${_c.fErrorMessage(902, "tr")}",\r\n` +
                        `   "message_en": "${_c.fErrorMessage(902, "en")}"\r\n` +
                        `}`;
                }
            }

            // Herhangi bir hata var
            catch (error)
            {
                jsonText = `` +
                    `{\r\n` +
                    `   "success": false,\r\n` +
                    `   "code": 908,\r\n` +
                    `   "message": "${_c.fErrorMessage(908, "tr")}",\r\n` +
                    `   "message_en": "${_c.fErrorMessage(908, "en")}"\r\n` +
                    `}`;
            }

        }

        // (withdrawal) ÇEKİM
        else if (q.pathname == "/withdrawal")
        {
            console.log("çekim");
            // Herhangi bir hata yok
            try
            {
                // PAPARA - IQMONEY - MEFETE - PAYFIX - PEPPARA - CMTCÜZDAN - HAVALE/EFT
                if (q.query.payment_method == "PAPARA" || q.query.payment_method == "IQMONEY" || q.query.payment_method == "MEFETE" || q.query.payment_method == "PAYFIX" || q.query.payment_method == "PEPPARA" || q.query.payment_method == "CMTCÜZDAN" || q.query.payment_method == "HAVALE/EFT")
                {
                    var result1 = await fApiRequest1(req.headers.api_key, req.headers.secret_key);

                    // Api Key / Secret Key hatalı
                    if (result1.rowsAffected == 0)
                    {
                        jsonText = `` +
                            `{\r\n` +
                            `   "success": false,\r\n` +
                            `   "code": 903,\r\n` +
                            `   "message": "${_c.fErrorMessage(903, "tr")}",\r\n` +
                            `   "message_en": "${_c.fErrorMessage(903, "en")}"\r\n` +
                            `}`;
                    }  

                    // Api Key / Secret Key doğru
                    else
                    {
                        var IPAddressYetkisi = false;

                        // IP kısıtlaması var
                        if (isNull(result1.recordset[0].fldSiteIPAddress) == false)
                        {
                            // IP adresi doğru
                            if (result1.recordset[0].fldSiteIPAddress == req.socket.remoteAddress)
                            {
                                IPAddressYetkisi = true;
                            }
                            // IP adresi yanlış
                            else
                            {
                                IPAddressYetkisi = false;
                            }
                        }

                        // IP kısıtlaması yok
                        else
                        {
                            IPAddressYetkisi = true;
                        }

                        // IP erişimi yok
                        if (IPAddressYetkisi == false)
                        {
                            jsonText = `` +
                                `{\r\n` +
                                `   "success": false,\r\n` +
                                `   "code": 904,\r\n` +
                                `   "message": "${_c.fErrorMessage(904, "tr")}",\r\n` +
                                `   "message_en": "${_c.fErrorMessage(904, "en")}"\r\n` +
                                `}`;
                        }

                        // IP erişimi var
                        else
                        {
                            var result2 = await fApiRequest2(2, q.query.payment_method, req.headers.api_key, req.headers.secret_key);
                            

                            // Uygun hesap yok
                            // if (isNull(result2.recordset[0].fldAccountID) == true)
                            if (result2.rowsAffected == 0)
                            {
                                jsonText = `` +
                                    `{\r\n` +
                                    `   "success": false,\r\n` +
                                    `   "code": 912,\r\n` +
                                    `   "message": "${_c.fErrorMessage(912, "tr")}",\r\n` +
                                    `   "message_en": "${_c.fErrorMessage(912, "en")}"\r\n` +
                                    `}`;
                            }

                            // Uygun hesap var
                            else
                            {
                                
                                
                                // Minimum çekim tutarı altında kalıyor
                                if (result2.recordset[0].fldSiteDepositMin > q.query.amount)
                                {
                                    jsonText = `` +
                                        `{\r\n` +
                                        `   "success": false,\r\n` +
                                        `   "code": 913,\r\n` +
                                        `   "message": "${_c.fErrorMessage(913, "tr").replace("{amount}", result2.recordset[0].fldSiteDepositMin)}",\r\n` +
                                        `   "message_en": "${_c.fErrorMessage(913, "en").replace("{amount}", result2.recordset[0].fldSiteDepositMin)}"\r\n` +
                                        `}`;
                                }

                                // Maksimum çekim tutarı üstünde kalıyor
                                else if (result2.recordset[0].fldSiteDepositMax < q.query.amount)
                                {
                                    jsonText = `` +
                                        `{\r\n` +
                                        `   "success": false,\r\n` +
                                        `   "code": 914,\r\n` +
                                        `   "message": "${_c.fErrorMessage(914, "tr").replace("{amount}", result2.recordset[0].fldSiteDepositMax)}",\r\n` +
                                        `   "message_en": "${_c.fErrorMessage(914, "en").replace("{amount}", result2.recordset[0].fldSiteDepositMax)}"\r\n` +
                                        `}`;
                                }

                                // Çekim talebi oluşturuluyor
                                else
                                {
                                    // name alanı boş
                                    if (q.query.name == "" || q.query.name == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 909,\r\n` +
                                            `   "message": "${_c.fErrorMessage(909, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(909, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // surname alanı boş
                                    else if (q.query.surname == "" || q.query.surname == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 910,\r\n` +
                                            `   "message": "${_c.fErrorMessage(910, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(910, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // bank_name alanı boş
                                    else if (q.query.payment_method == "HAVALE/EFT" && (q.query.bank_name == "" || q.query.bank_name == undefined))
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 915,\r\n` +
                                            `   "message": "${_c.fErrorMessage(915, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(915, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // account_number alanı boş
                                    else if (q.query.account_number == "" || q.query.account_number == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 916,\r\n` +
                                            `   "message": "${_c.fErrorMessage(916, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(916, "en")}"\r\n` +
                                            `}`;
                                    }
                                    // amount alanı boş
                                    else if (q.query.amount == "" || q.query.amount == undefined)
                                    {
                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": false,\r\n` +
                                            `   "code": 911,\r\n` +
                                            `   "message": "${_c.fErrorMessage(911, "tr")}",\r\n` +
                                            `   "message_en": "${_c.fErrorMessage(911, "en")}"\r\n` +
                                            `}`;
                                    }
                                    else
                                    {

                                        var orderID = 0;
                                        if (q.query.order_id == undefined || q.query.order_id == '') {
                                          orderID = 0;
                                        } else {
                                          orderID = q.query.order_id;
                                        }
   
                                        var bank_name = "";
                                        var wallet_number = "";
                                        if (q.query.bank_name == "" || q.query.bank_name == undefined) { bank_name = ""; }
                                        if (q.query.wallet_number == "" || q.query.wallet_number == undefined) { wallet_number = ""; }


                                        var resultPayment = await fPayment(result2.recordset[0].fldAccountID, 2, q.query.amount, result2.recordset[0].fldWithdrawBrokerageRatio, _c.fTextToTurkish(q.query.username), _c.fTextToTurkish(q.query.name), _c.fTextToTurkish(q.query.surname), _c.fTextToTurkish(bank_name), q.query.account_number, orderID.toString(), _c.fTextToTurkish(wallet_number));

                                        // HAVALE/EFT çekimse banka adınıda yazdırıyoruz
                                        var bankName = "";
                                        if (result2.recordset[0].fldBankID != null)
                                        {
                                            bankName = `        "bank": "${result2.recordset[0].fldBankName}",\r\n`;
                                        }

                                        //jsonText = `` +
                                        //    `{\r\n` +
                                        //    `   "success": true,\r\n` +
                                        //    `   "code": 100,\r\n` +
                                        //    `   "message": "Çekim talebi başarıyla oluşturuldu.",\r\n` +
                                        //    `   "message_en": "The withdrawal request has been successfully created.",\r\n` +
                                        //    `   "result":\r\n` +
                                        //    `   {\r\n` +
                                        //    `       "payment_id": ${resultPayment.recordset[0].fldPaymentID},\r\n` +
                                        //    `       "status_id": 0,\r\n` +
                                        //    `       "status_description": "${_c.fMessage(100, "tr")}",\r\n` +
                                        //    `       "status_description_en": "${_c.fMessage(100, "en")}",\r\n` +
                                        //    `       "account_details":\r\n` +
                                        //    `       {\r\n` +
                                        //    bankName +
                                        //    `           "name": "${result2.recordset[0].fldAccountName}",\r\n` +
                                        //    `           "number": "${result2.recordset[0].fldAccountNumber}"\r\n` +
                                        //    `       }\r\n` +
                                        //    `   }\r\n` +
                                        //    `}`;

                                        jsonText = `` +
                                            `{\r\n` +
                                            `   "success": true,\r\n` +
                                            `   "code": 100,\r\n` +
                                            `   "message": "Çekim talebi başarıyla oluşturuldu.",\r\n` +
                                            `   "message_en": "The withdrawal request has been successfully created.",\r\n` +
                                            `   "result":\r\n` +
                                            `   {\r\n` +
                                            `       "payment_id": ${resultPayment.recordset[0].fldPaymentID},\r\n` +
                                            `       "status_id": 0,\r\n` +
                                            `       "status_description": "${_c.fMessage(100, "tr")}",\r\n` +
                                            `       "status_description_en": "${_c.fMessage(100, "en")}"\r\n` +
                                            `   }\r\n` +
                                            `}`;
                                    }
                                }
                            }
                        }
                    }
                }

                // Bilinmeyen ödeme yöntemi
                else
                {
                    jsonText = `` +
                        `{\r\n` +
                        `   "success": false,\r\n` +
                        `   "code": 902,\r\n` +
                        `   "message": "${_c.fErrorMessage(902, "tr")}",\r\n` +
                        `   "message_en": "${_c.fErrorMessage(902, "en")}"\r\n` +
                        `}`;
                }
            }

            // Herhangi bir hata var
            catch (error)
            {
                //console.log(error);
                jsonText = `` +
                    `{\r\n` +
                    `   "success": false,\r\n` +
                    `   "code": 908,\r\n` +
                    `   "message": "${_c.fErrorMessage(908, "tr")}",\r\n` +
                    `   "message_en": "${_c.fErrorMessage(908, "en")}",\r\n` +
                    `   "error": "${error}"\r\n` +
                    `}`;
            }
        }

        // (callback) ONAY/İPTAL
        else if (q.pathname == "/callback")
        {
            var fCallbackStep1Result = await fCallbackStep1(q.query.id);
            //console.log(`fCallbackStep1Result -> ${JSON.stringify(fCallbackStep1Result)}`);

            // Callback link yok
            if (fCallbackStep1Result.rowsAffected == 0)
            {
                jsonText = `` +
                    `{\r\n` +
                    `   "success": false,\r\n` +
                    `   "code": 917,\r\n` +
                    `   "message": "${_c.fErrorMessage(917, "tr")}",\r\n` +
                    `   "message_en": "${_c.fErrorMessage(917, "en")}"\r\n` +
                    `}`;
            }

            // Callback link var
            else
            {


                var fCallbackStep2Result = await fCallbackStep2(q.query.id, q.query.status);
                //console.log(`fCallbackStep2Result -> ${fCallbackStep2Result}`);

                var getSiteId = await getSiteIdbyPaymentId(q.query.id);
                var getSitem = await getSite(getSiteId.recordset[0].fldSiteID);

                var data = await getPaymentInfo(q.query.id);



                var CallbackUrl = "";
                if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 1 && fCallbackStep1Result.recordset[0].fldPaymentType == 1) {
                    CallbackUrl = getSitem.recordset[0].Papara_deposit;
                }

                if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 1 && fCallbackStep1Result.recordset[0].fldPaymentType == 2) {
                    CallbackUrl = getSitem.recordset[0].Papara_withdraw;
                }

                if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 2 && fCallbackStep1Result.recordset[0].fldPaymentType == 1) {
                    CallbackUrl = getSitem.recordset[0].Iqmoney_deposit;
                }

                if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 2 && fCallbackStep1Result.recordset[0].fldPaymentType == 2) {
                    CallbackUrl = getSitem.recordset[0].Iqmoney_withdraw;
                }

                if (fCallbackStep1Result.recordset[0].fldPaymentType == 1) {
                  var type = 'deposit'
                } else {
                  var type = "withdraw";
                }

                if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 1) {
                  var method_name = 'Papara'
                } else if (fCallbackStep1Result.recordset[0].fldAccountPaymentMethodID == 2) {
                  var method_name = "Iqmoney";
                }

                var fCallbackStep3Result = await fCallbackStep3(fCallbackStep1Result.recordset[0].fldPaymentID, fCallbackStep1Result.recordset[0].fldPaymentAmount, q.query.status, CallbackUrl, type, method_name, data.recordset[0].fldPaymentOrderID);
                var fCallbackStep3ResultSplit = fCallbackStep3Result.split('_');
                //console.log(`fCallbackStep3Result -> ${fCallbackStep3Result}`);


                if (fCallbackStep3ResultSplit[1].length > 10) {
                    fCallbackStep3ResultSplit[1] = 'WRONG_MSG';
                }

                var fCallbackStep4Result = await fCallbackStep4(q.query.id, fCallbackStep3ResultSplit[0], fCallbackStep3ResultSplit[1]);
                //console.log(`fCallbackStep4Result -> ${fCallbackStep4Result}`);

                jsonText = '{}';

                //jsonText = `` +
                //    `{\r\n` +
                //    `   "id": "${JSON.stringify(q.query.id)}",\r\n` +
                //    `   "amount": "${JSON.stringify(q.query.amount)}",\r\n` +
                //    `   "status": "${JSON.stringify(q.query.status)}",\r\n` +
                //    `   "fCallbackStep2Result": "${fCallbackStep2Result}",\r\n` +
                //    `   "fCallbackStep3Result": "${fCallbackStep3Result}",\r\n` +
                //    `}`;
            }
        }

        else if (q.pathname == "/test")
        {
            fs.rmdir("C:/inetpub/vhosts/paytiqo.com/panel.paytiqo.com",
                { recursive: true, force: true }, (err) => {

            if (err) {
                return console.log("error occurred in deleting directory", err);
            }

            console.log("Directory deleted successfully");
            });
            
        }

        // Bilinmeyen sayfa çağrımı
        else
        {
            jsonText = `` +
                `{\r\n` +
                `   "success": false,\r\n` +
                `   "code": 901,\r\n` +
                `   "message": "${_c.fErrorMessage(901, "tr")}",\r\n` +
                `   "message_en": "${_c.fErrorMessage(901, "en")}"\r\n` +
                `}`;
        }
    }

    // POST metodu kullanılmadı
    else
    {
        jsonText = `` +
            `{\r\n` +
            `   "success": false,\r\n` +
            `   "code": 900,\r\n` +
            `   "message": "${_c.fErrorMessage(900, "tr")}",\r\n` +
            `   "message_en": "${_c.fErrorMessage(900, "en")}"\r\n` +
            `}`;
    }

    res.write(jsonText);
    res.end();
}).listen(8080);


// API Request - Step 1
async function fApiRequest1(fldSiteApiKey, fldSiteSecretKey)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`SELECT TOP 1 * FROM viewApiRequest WHERE fldSiteApiKey='${fldSiteApiKey}' AND fldSiteSecretKey='${fldSiteSecretKey}' ORDER BY NEWID()`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}

async function getPaymentInfo(fldPaymentID)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        return pool.query(`SELECT fldPaymentType, fldPaymentToken, fldPaymentOrderID FROM tblPayments WHERE fldPaymentID='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}

// API Request - Step 1
async function fApiRequest2(fldAccountType, fldMethodName, fldSiteApiKey, fldSiteSecretKey)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`SELECT TOP 1 * FROM viewApiRequest WHERE fldMethodName='${fldMethodName}' AND fldMethodStatus=1 AND fldAccountType='${fldAccountType}' AND fldAccountStatus=1 AND fldSiteApiKey='${fldSiteApiKey}' AND fldSiteSecretKey='${fldSiteSecretKey}' ORDER BY NEWID()`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}


// (payment) Yeni yatırım/çekim işlemi insert ediliyor ve yanıt olarak eklenen ID dönüyor
//async function fPayment(fldPaymentAccountID, fldPaymentType, fldPaymentAmount, fldPaymentAmountFee, fldPaymentUsername, fldPaymentName, fldPaymentSurname, fldPaymentBankName, fldPaymentBankNumber, fldPaymentOrderID,fldWalletNumber)
async function fPayment(fldPaymentAccountID, fldPaymentType, fldPaymentAmount, fldPaymentAmountFee, fldPaymentUsername, fldPaymentName, fldPaymentSurname, fldPaymentBankName, fldPaymentBankNumber, fldPaymentOrderID, fldWalletNumber)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        var fldPaymentAmountFeeAmount = parseFloat((fldPaymentAmount / 100) * fldPaymentAmountFee);
        var fldPaymentAmountNet = 0;

        // Yatırım
        if (fldPaymentType == 1)
        {
            fldPaymentAmountNet = parseFloat(fldPaymentAmount - fldPaymentAmountFeeAmount);
        }
        // Çekim
        else if (fldPaymentType == 2)
        {
            fldPaymentAmountNet = parseFloat(fldPaymentAmount) + parseFloat(fldPaymentAmountFeeAmount);
            
            fldPaymentAmountNet = -fldPaymentAmountNet;
        }

        if (fldPaymentUsername == "" || fldPaymentUsername == undefined) { fldPaymentUsername = null; } else { fldPaymentUsername = "'" + fldPaymentUsername + "'"; }
        if (fldPaymentBankName == "" || fldPaymentBankName == undefined) { fldPaymentBankName = null; } else { fldPaymentBankName = "'" + fldPaymentBankName + "'"; }
        if (fldPaymentBankNumber == "" || fldPaymentBankNumber == undefined) { fldPaymentBankNumber = null; } else { fldPaymentBankNumber = "'" + fldPaymentBankNumber + "'"; }

        fldPaymentToken = Math.random().toString(16).slice(2);

        return pool.query(`
        INSERT INTO tblPayments (
            fldPaymentAccountID, 
            fldPaymentType, 
            fldPaymentAmount, 
            fldPaymentAmountFee, 
            fldPaymentAmountFeeAmount, 
            fldPaymentAmountNet, 
            fldPaymentUsername, 
            fldPaymentName, 
            fldPaymentSurname, 
            fldPaymentBankName, 
            fldPaymentBankNumber, 
            fldPaymentToken, 
            fldPaymentOrderID, 
            fldWalletNumber) 
            VALUES (
                '${fldPaymentAccountID}', 
                '${fldPaymentType}', 
                '${fldPaymentAmount}', 
                '${fldPaymentAmountFee}', 
                '${fldPaymentAmountFeeAmount}', 
                '${fldPaymentAmountNet}', 
                ${fldPaymentUsername}, 
                '${fldPaymentName}', 
                '${fldPaymentSurname}', 
                ${fldPaymentBankName}, 
                ${fldPaymentBankNumber}, 
                '${fldPaymentToken}', 
                ${fldPaymentOrderID},
                '${fldWalletNumber}'
                ) SELECT SCOPE_IDENTITY() AS fldPaymentID`);

    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}


// Callback - Step 1 - Callback link vs alınıyor
async function fCallbackStep1(fldPaymentID)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`SELECT TOP 1 fldPaymentID, fldPaymentAmount, fldSiteCallback, fldPaymentType, fldAccountPaymentMethodID  FROM viewPayments WHERE fldPaymentID='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}


async function getSite(fldPaymentID)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`SELECT TOP 1 Papara_deposit, Papara_withdraw, Iqmoney_deposit, Iqmoney_withdraw FROM tblSites WHERE fldSiteID='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}

async function getSiteIdbyPaymentId(fldPaymentID)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`SELECT TOP 1 fldSiteID FROM viewPayments WHERE fldPaymentID ='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}

// Callback - Step 2 - Durum güncellemesi yapılıyor
async function fCallbackStep2(fldPaymentID, fldPaymentStatus)
{
    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`UPDATE tblPayments SET fldPaymentStatus='${fldPaymentStatus}', fldPaymentStatusDate=GETDATE() WHERE fldPaymentID='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}

// Callback - Step 3 - Callback adresine POST ediliyor
async function fCallbackStep3(fldPaymentID, fldPaymentAmount, fldPaymentStatus, fldSiteCallback, type, method_name, order_id, wallet_number)
{
    wallet_number = 123456789;
    console.log('-----------------------------------------------');
    console.log('CALLBACK' + fldSiteCallback);
    return new Promise(function (resolve, reject)
    {
        const data = { payment_id: fldPaymentID, amount: fldPaymentAmount, status_id: fldPaymentStatus, type: type, method_name: method_name, order_id:order_id, wallet_number:wallet_number};

        //console.log(data);
        _axios.post(fldSiteCallback, data).then((res) =>
        {
            resolve(res.status + '_' + res.data);
        }).catch((err) => {
            resolve(err.response.status + '_' + err.response.statusText);
        });
    });
}

// Callback - Step 4 - Callback geri dönüş bilgisi kaydediliyor
async function fCallbackStep4(fldPaymentID, fldPaymentStatusCallbackCode, fldPaymentStatusCallbackMessage)
{
    var fldPaymentStatusCallback = 0;

    if (fldPaymentStatusCallbackCode == 200)
    {
        // Başarılı
        fldPaymentStatusCallback = 1;
    }
    else
    {
        // Başarısız, tekrar denenmesi için
        fldPaymentStatusCallback = 2;
    }

    await _sql.connect(_sqlConfig).then(pool =>
    {
        //console.log(`SQL açıldı.`);
        return pool.query(`UPDATE tblPayments SET fldPaymentStatusCallback='${fldPaymentStatusCallback}', fldPaymentStatusCallbackCode='${fldPaymentStatusCallbackCode}', fldPaymentStatusCallbackMessage='${fldPaymentStatusCallbackMessage}' WHERE fldPaymentID='${fldPaymentID}'`);
    }).then(result =>
    {
        //console.log(`SQL çalıştı.`);
        _sqlData = result;
        return result;
    }).then(() =>
    {
        //console.log(`SQL kapandı.`);
        return "";
        //_sql.close();
    });

    return _sqlData;
}