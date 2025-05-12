// File to seed the database with fake users
import { userData, portfolioData } from "../data/index.js";
import { dbConnection, closeConnection } from "../config/mongodb/mongoConnection.js";

const db = await dbConnection();
await db.dropDatabase();

// Create 3 accounts first


const Tanav = await userData.createUser("TanavT", "Tanav", "Thota", "tanavthota@gmail.com", "Password123!", "20", "2004-06-24")
const Chris = await userData.createUser("ChrisBrown", "Chris", "Brown", "cbrown19@notstevens.edu", "Test!ngDIFFERENTPassword098", "21", "2003-10-23")
const Mylo = await userData.createUser("Mylo", "Mylo", "Thota", "randomemail@hotmail.com", "BadPassword2!", "21", "2004-01-19")
const Logan = await userData.createUser("ltripler", "Logan", "Tripler", "logantripler@example.com", "P@sswd123", "20", "2002-12-07")
const JustinK = await userData.createUser("jkwak", "Justin", "Kwak", "justinkwak@example.com", "P@ssw0d123", "21", "2005-06-24")
const JustinF = await userData.createUser("jfarley", "Justin", "Farley", "justinfarley@example.com", "Pa$$wor23", "21", "2003-07-24")
const Peter = await userData.createUser("pparker", "Peter", "Parker", "peterparker@example.com", "Passd!23", "27", "2004-08-18")
const Sam = await userData.createUser("ssulek", "Sam", "Sulek", "samsulek@example.com", "P@ssw12E", "23", "2002-11-04")
const Rock = await userData.createUser("trock", "The", "Rock", "therock@example.com", "Passrd!23", "53", "2003-12-22")
const Mike = await userData.createUser("mtyson", "Mike", "Tyson", "miketyson@example.com", "Pas0rd!23", "58", "2003-10-19")
const Willy = await userData.createUser("wwonka", "Willy", "Wonka", "willywonka@example.com", "P@sord123*", "47", "2001-01-27");

const Tid = Tanav._id.toString();
const Cid = Chris._id.toString();
const Myid = Mylo._id.toString()
const Lid = Logan._id.toString();
const JKid = JustinK._id.toString();
const JFid = JustinF._id.toString();
const Pid = Peter._id.toString();
const Sid = Sam._id.toString();
const Rid = Rock._id.toString();
const Miid = Mike._id.toString();
const Wid = Willy._id.toString();

//will add way to add and buy stocks in the past for development not user use prob
// Populate each accounts portfolio information, (use the portfolio functions)
await portfolioData.buyStockPast(Tid, "AAPL", "200", "2025-01-02")
await portfolioData.sellStockPast(Tid, "AAPL", "4", "2025-01-05")
await portfolioData.sellStockPast(Tid, "AAPL", "8", "2025-01-07")
await portfolioData.buyStockPast(Tid, "DOMO", "1070", "2025-01-15")
await portfolioData.buyStockPast(Tid, "AAPL", "6", "2025-01-20")
await portfolioData.buyStockPast(Tid, "ASST", "200", "2025-01-29")
await portfolioData.buyStockPast(Tid, "TPIF", "190", "2025-02-08")
await portfolioData.sellStockPast(Tid, "DOMO", "200", "2025-05-05")

console.log("Done Tanav")

await portfolioData.buyStockPast(Cid, "MSFT", "80", "2025-01-03")
await portfolioData.buyStockPast(Cid, "NVDA", "20", "2025-01-11")
await portfolioData.sellStockPast(Cid, "MSFT", "10", "2025-01-25")
await portfolioData.buyStockPast(Cid, "COST", "30", "2025-02-02")
await portfolioData.buyStockPast(Cid, "DIS", "150", "2025-02-16")
await portfolioData.sellStockPast(Cid, "DIS", "30", "2025-03-02")
await portfolioData.buyStockPast(Cid, "SBUX", "80", "2025-03-20")

console.log("Done Chris")

await portfolioData.buyStockPast(Myid, "AMZN", "60", "2025-01-06")
await portfolioData.buyStockPast(Myid, "TSLA", "40", "2025-01-13")
await portfolioData.buyStockPast(Myid, "AAPL", "150", "2025-01-22")
await portfolioData.sellStockPast(Myid, "TSLA", "20", "2025-02-01")
await portfolioData.buyStockPast(Myid, "KO", "300", "2025-02-12")
await portfolioData.buyStockPast(Myid, "JNJ", "80", "2025-02-27")
await portfolioData.buyStockPast(Myid, "XOM", "90", "2025-03-10")
await portfolioData.sellStockPast(Myid, "KO", "50", "2025-04-01")

console.log("Done Mylo")
await portfolioData.buyStockPast(Lid, "GOOGL", "15", "2025-01-03");
await portfolioData.buyStockPast(Lid, "MSFT", "10", "2025-01-10");
await portfolioData.sellStockPast(Lid, "GOOGL", "2", "2025-01-15");
await portfolioData.buyStockPast(Lid, "TSLA", "6", "2025-01-23");
await portfolioData.sellStockPast(Lid, "MSFT", "1", "2025-02-01");
await portfolioData.buyStockPast(Lid, "VOO", "12", "2025-02-14");
await portfolioData.sellStockPast(Lid, "TSLA", "1", "2025-02-28");

console.log("Done Logan")
await portfolioData.buyStockPast(JKid, "NVDA", "80", "2025-01-05");
await portfolioData.buyStockPast(JKid, "AMZN", "90", "2025-01-12");
await portfolioData.sellStockPast(JKid, "AMZN", "15", "2025-01-19");
await portfolioData.buyStockPast(JKid, "AAPL", "50", "2025-01-25");
await portfolioData.buyStockPast(JKid, "QQQ", "110", "2025-02-05");
await portfolioData.sellStockPast(JKid, "NVDA", "10", "2025-02-18");

console.log("Done Justin Kwak")
await portfolioData.buyStockPast(JFid, "META", "70", "2025-01-02");
await portfolioData.buyStockPast(JFid, "BA", "100", "2025-01-13");
await portfolioData.sellStockPast(JFid, "BA", "20", "2025-01-20");
await portfolioData.buyStockPast(JFid, "COST", "40", "2025-01-30");
await portfolioData.buyStockPast(JFid, "JNJ", "9", "2025-02-07");
await portfolioData.sellStockPast(JFid, "META", "10", "2025-02-17");

console.log("Done Justin Farley")
await portfolioData.buyStockPast(Pid, "DIS", "150", "2025-01-04");
await portfolioData.buyStockPast(Pid, "SBUX", "130", "2025-01-11");
await portfolioData.sellStockPast(Pid, "DIS", "25", "2025-01-21");
await portfolioData.buyStockPast(Pid, "NFLX", "60", "2025-01-27");
await portfolioData.sellStockPast(Pid, "SBUX", "15", "2025-02-09");
await portfolioData.buyStockPast(Pid, "V", "4", "2025-02-20");

console.log("Done Peter")
await portfolioData.buyStockPast(Sid, "NKE", "180", "2025-01-06");
await portfolioData.buyStockPast(Sid, "TGT", "90", "2025-01-14");
await portfolioData.sellStockPast(Sid, "NKE", "30", "2025-01-25");
await portfolioData.buyStockPast(Sid, "HD", "70", "2025-02-02");
await portfolioData.buyStockPast(Sid, "CVX", "100", "2025-02-11");
await portfolioData.sellStockPast(Sid, "TGT", "20", "2025-02-19");

console.log("Done Sam")
await portfolioData.buyStockPast(Rid, "KO", "200", "2025-01-07");
await portfolioData.buyStockPast(Rid, "PEP", "150", "2025-01-17");
await portfolioData.sellStockPast(Rid, "KO", "40", "2025-01-26");
await portfolioData.buyStockPast(Rid, "XOM", "90", "2025-02-06");
await portfolioData.sellStockPast(Rid, "PEP", "25", "2025-02-15");
await portfolioData.buyStockPast(Rid, "PG", "110", "2025-02-22");

console.log("Done The Rock")
await portfolioData.buyStockPast(Miid, "UPS", "160", "2025-01-08");
await portfolioData.buyStockPast(Miid, "FDX", "100", "2025-01-16");
await portfolioData.sellStockPast(Miid, "UPS", "20", "2025-01-28");
await portfolioData.buyStockPast(Miid, "WMT", "90", "2025-02-08");
await portfolioData.sellStockPast(Miid, "FDX", "15", "2025-02-16");
await portfolioData.buyStockPast(Miid, "DE", "80", "2025-02-25");

console.log("Done Mike")
await portfolioData.buyStockPast(Wid, "HSY", "120", "2025-01-09");
await portfolioData.buyStockPast(Wid, "MCD", "100", "2025-01-18");
await portfolioData.sellStockPast(Wid, "HSY", "25", "2025-01-29");
await portfolioData.buyStockPast(Wid, "K", "130", "2025-02-10");
await portfolioData.sellStockPast(Wid, "MCD", "10", "2025-02-17");
await portfolioData.buyStockPast(Wid, "SJM", "90", "2025-02-26");

console.log("Done Willy")
console.log("Done seeding")
await closeConnection();