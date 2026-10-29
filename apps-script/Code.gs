/**
 * BACKEND ARSIP PKL ZAKI ANSYARI
 * Database: Google Sheets
 *
 * Buat sheet bernama:
 * 1) Admins: kolom A username, kolom B password_hash (SHA-256 hex), kolom C active (TRUE/FALSE)
 * 2) Content: kolom A key, kolom B JSON
 *
 * Jangan simpan password teks biasa. Buat hash SHA-256 dengan fungsi hashPassword()
 * di bawah, jalankan dari editor Apps Script, lalu salin hasil hash ke kolom B.
 */
const SPREADSHEET_ID = "1oydZ65_Wyctd7RqceriVhu_9A4cxVzjKDcLyqaH63MU";
const SESSION_TTL_SECONDS = 21600;
const CONTENT_KEY = "public_content";

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "content";
  if (action === "content") return json_({ok:true, content:readContent_()});
  return json_({ok:false,message:"Aksi tidak tersedia."});
}

function doPost(e) {
  try {
    const body = JSON.parse((e.postData && e.postData.contents) || "{}");
    if (body.action === "login") return json_(login_(body.username, body.password));
    if (!validSession_(body.token)) return json_({ok:false,message:"Sesi admin tidak valid atau sudah kedaluwarsa."});
    if (body.action === "saveContent") {
      saveContent_(body.content || {});
      return json_({ok:true,message:"Konten tersimpan."});
    }
    return json_({ok:false,message:"Aksi tidak dikenal."});
  } catch (err) {
    return json_({ok:false,message:String(err && err.message || err)});
  }
}

function login_(username, password) {
  if (!username || !password) return {ok:false,message:"Username dan password wajib diisi."};
  const sheet = getSheet_("Admins");
  const rows = sheet.getDataRange().getValues();
  const inputHash = sha256_(String(password));
  for (let i=1;i<rows.length;i++) {
    const active = String(rows[i][2]).toLowerCase() === "true";
    if (String(rows[i][0]) === String(username) && String(rows[i][1]) === inputHash && active) {
      const token = Utilities.getUuid() + Utilities.getUuid();
      CacheService.getScriptCache().put("session_"+token, String(username), SESSION_TTL_SECONDS);
      return {ok:true,token:token,username:String(username)};
    }
  }
  return {ok:false,message:"Username atau password salah, atau akun tidak aktif."};
}

function validSession_(token) {
  return !!token && !!CacheService.getScriptCache().get("session_"+token);
}

function readContent_() {
  const sheet = getSheet_("Content");
  const rows = sheet.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][0]) === CONTENT_KEY) {
      try { return JSON.parse(rows[i][1]); } catch (_) { return {}; }
    }
  }
  return {};
}

function saveContent_(content) {
  const sheet = getSheet_("Content");
  const rows = sheet.getDataRange().getValues();
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][0]) === CONTENT_KEY) {
      sheet.getRange(i+1,2).setValue(JSON.stringify(content));
      return;
    }
  }
  sheet.appendRow([CONTENT_KEY, JSON.stringify(content)]);
}

function getSheet_(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === "Admins") sheet.appendRow(["username","password_hash","active"]);
    if (name === "Content") sheet.appendRow(["key","json"]);
  }
  if (sheet.getLastRow() === 0) {
    if (name === "Admins") sheet.appendRow(["username","password_hash","active"]);
    if (name === "Content") sheet.appendRow(["key","json"]);
  }
  return sheet;
}

function sha256_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2,"0")).join("");
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Jalankan fungsi ini dari editor untuk memperoleh hash password admin. */
function hashPassword() {
  const password = "GANTI_PASSWORD_ADMIN_DI_SINI";
  Logger.log(sha256_(password));
}

/** Jalankan sekali setelah mengisi SPREADSHEET_ID untuk membuat sheet yang diperlukan. */
function setupSheets() {
  getSheet_("Admins");
  getSheet_("Content");
}
