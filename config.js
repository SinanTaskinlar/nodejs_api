const _crypto = require('crypto');

//var sql =
//{
//    server: 'localhost',
//    port: 1433,
//    database: 'panelnet',
//    user: 'sa',
//    password: '000000',
//    encrypt: false
//};

var sql =
{
    server: `localhost\\MSSQLSERVER2016`,
    port: 1433,
    database: 'paytiqocom',
    user: 'paytiqocomuser',
    password: '9u%7inH2',
    encrypt: false
};

function fSha256(reqData)
{
    return _crypto.createHash('sha256').update(reqData).digest('hex');
}

function fErrorMessage(reqID, reqLang)
{
    var message = "";

    if (reqID == 900 && reqLang == "tr") { message = "Lütfen POST metodu kullan."; }
    else if (reqID == 900 && reqLang == "en") { message = "Please use POST method."; }
    else if (reqID == 901 && reqLang == "tr") { message = "Varolmayan bir sayfayı çağırdın."; }
    else if (reqID == 901 && reqLang == "en") { message = "You have called a nonexistent page."; }
    else if (reqID == 902 && reqLang == "tr") { message = "Bilinmeyen bir ödeme metodu kullandın."; }
    else if (reqID == 902 && reqLang == "en") { message = "You used an unknown payment method."; }
    else if (reqID == 903 && reqLang == "tr") { message = "api_key veya secret_key bilgilerinin doğru olduğundan emin ol."; }
    else if (reqID == 903 && reqLang == "en") { message = "Make sure the api_key or secret_key are correct."; }
    else if (reqID == 904 && reqLang == "tr") { message = "IP adresinin erişim yetkisi yok."; }
    else if (reqID == 904 && reqLang == "en") { message = "IP address does not have access authorization."; }
    else if (reqID == 905 && reqLang == "tr") { message = "Yatırım almak için uygun hesap yok."; }
    else if (reqID == 905 && reqLang == "en") { message = "There are no accounts available to receive investments."; }
    else if (reqID == 906 && reqLang == "tr") { message = "Yatırım miktarı minimum {amount} TL olmalıdır."; }
    else if (reqID == 906 && reqLang == "en") { message = "The investment amount must be at least {amount} TL."; }
    else if (reqID == 907 && reqLang == "tr") { message = "Yatırım miktarı maksimum {amount} TL olmalıdır."; }
    else if (reqID == 907 && reqLang == "en") { message = "The investment amount must be maximum {amount} TL."; }
    else if (reqID == 908 && reqLang == "tr") { message = "Eksik veya hatalı veri gönderildi."; }
    else if (reqID == 908 && reqLang == "en") { message = "Incomplete or incorrect data sent."; }
    else if (reqID == 909 && reqLang == "tr") { message = "name alanı boş bırakılamaz."; }
    else if (reqID == 909 && reqLang == "en") { message = "The name field cannot be left blank."; }
    else if (reqID == 910 && reqLang == "tr") { message = "surname alanı boş bırakılamaz."; }
    else if (reqID == 910 && reqLang == "en") { message = "The surname field cannot be left blank."; }
    else if (reqID == 911 && reqLang == "tr") { message = "amount alanı boş bırakılamaz."; }
    else if (reqID == 911 && reqLang == "en") { message = "The amount field cannot be left blank."; }
    else if (reqID == 912 && reqLang == "tr") { message = "Çekim almak için uygun hesap yok."; }
    else if (reqID == 912 && reqLang == "en") { message = "No account available to receive withdrawals."; }
    else if (reqID == 913 && reqLang == "tr") { message = "Çekim miktarı minimum {amount} TL olmalıdır."; }
    else if (reqID == 913 && reqLang == "en") { message = "Withdrawal amount must be minimum {amount} TL."; }
    else if (reqID == 914 && reqLang == "tr") { message = "Çekim miktarı maksimum {amount} TL olmalıdır."; }
    else if (reqID == 914 && reqLang == "en") { message = "Withdrawal amount must be maximum {amount} TL."; }
    else if (reqID == 915 && reqLang == "tr") { message = "bank_name alanı boş bırakılamaz."; }
    else if (reqID == 915 && reqLang == "en") { message = "The bank_name field cannot be left blank."; }
    else if (reqID == 916 && reqLang == "tr") { message = "account_number alanı boş bırakılamaz."; }
    else if (reqID == 916 && reqLang == "en") { message = "The account_number field cannot be left blank."; }
    else if (reqID == 917 && reqLang == "tr") { message = "Callback link bulunamadı!"; }
    else if (reqID == 917 && reqLang == "en") { message = "Callback link not found!"; }

    return message;
}

function fMessage(reqID, reqLang)
{
    var message = "";

    if (reqID == 100 && reqLang == "tr") { message = "Bekliyor"; }
    else if (reqID == 100 && reqLang == "en") { message = "Waiting"; }

    return message;
}

function fTextToTurkish(reqText)
{
    // Iı_Ğğ_Üü_Şş_İi_Öö_Çç
    // Iý_Ðð_Üü_Þþ_Ýi_Öö_Çç

    reqText = reqText.replace(/ý/g, 'ı').replace(/Ð/g, 'Ğ').replace(/ð/g, 'ğ').replace(/Þ/g, 'Ş').replace(/þ/g, 'ş').replace(/Ý/g, 'İ');

    return reqText;
}

module.exports = { sql, fSha256, fErrorMessage, fMessage, fTextToTurkish };