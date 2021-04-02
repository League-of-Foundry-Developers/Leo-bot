//import DB from "sequelize";
const { Reputation } = require("./database.js");
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("sqlite:./leo.db");

async function main(d) {
	Reputation.init(sequelize);
//	ReputationDelta.init(sequelize);

	await Reputation.sync({ alter: true });
//	await ReputationDelta.sync({ alter: true });

//	await insertData(d);

	let delta = await Reputation.create({
		user: "zeel#4200",
		delta: 1
	});

	await delta.save();
}

async function insertData(data) {
	for (let row of data) {
		await Reputation.create({
			user: row.userName,
			delta: row.score
		})
	}
}

const data = [
 {
   "userName": "Calego#0914",
   "score": 390
 },
 {
   "userName": "zeel#4200",
   "score": 179
 },
 {
   "userName": "Moerill#7205",
   "score": 84
 },
 {
   "userName": "KaKaRoTo#1337",
   "score": 73
 },
 {
   "userName": "Ethaks#2903",
   "score": 73
 },
 {
   "userName": "cole#9640",
   "score": 65
 },
 {
   "userName": "vance#1935",
   "score": 64
 },
 {
   "userName": "errational#2007",
   "score": 61
 },
 {
   "userName": "corporat#1282",
   "score": 49
 },
 {
   "userName": "Norc#5108",
   "score": 45
 },
 {
   "userName": "JDW#6422",
   "score": 44
 },
 {
   "userName": "LukeAbby#0001",
   "score": 42
 },
 {
   "userName": "Atropos#3814",
   "score": 39
 },
 {
   "userName": "ardittristan#0001",
   "score": 38
 },
 {
   "userName": "ghost#2000",
   "score": 37
 },
 {
   "userName": "Blitz#6797",
   "score": 32
 },
 {
   "userName": "Spacemandev#6256",
   "score": 31
 },
 {
   "userName": "BadIdeasBureau#7024",
   "score": 29
 },
 {
   "userName": "BlueInk#7650",
   "score": 23
 },
 {
   "userName": "KayelGee#5241",
   "score": 23
 },
 {
   "userName": "Varriount#0883",
   "score": 19
 },
 {
   "userName": "Kandashi (He/Him)#6698",
   "score": 18
 },
 {
   "userName": "Sunspots#6102",
   "score": 18
 },
 {
   "userName": "Anathema#3668",
   "score": 17
 },
 {
   "userName": "f1r3w4rr10r#0733",
   "score": 17
 },
 {
   "userName": "MLeahy#4299",
   "score": 16
 },
 {
   "userName": "Rughalt#4238",
   "score": 15
 },
 {
   "userName": "Hidetaka#2494",
   "score": 15
 },
 {
   "userName": "Spetzel#0103",
   "score": 13
 },
 {
   "userName": "Bolts#9418",
   "score": 13
 },
 {
   "userName": "Ethck#6879",
   "score": 12
 },
 {
   "userName": "Fallayn#6414",
   "score": 12
 },
 {
   "userName": "flamewave000#6766",
   "score": 12
 },
 {
   "userName": "Voldemalort#9415",
   "score": 11
 },
 {
   "userName": "SecretFire#4843",
   "score": 11
 },
 {
   "userName": "valravn#7351",
   "score": 11
 },
 {
   "userName": "Mougli#1487",
   "score": 10
 },
 {
   "userName": "FloRad#2142",
   "score": 10
 },
 {
   "userName": "Marian#8010",
   "score": 10
 },
 {
   "userName": "LorduFreeman#8747",
   "score": 10
 },
 {
   "userName": "Cris#6864",
   "score": 9
 },
 {
   "userName": "baileywiki#5851",
   "score": 9
 },
 {
   "userName": "shem#0226",
   "score": 9
 },
 {
   "userName": "Mesignosis#7987",
   "score": 8
 },
 {
   "userName": "Malekal#9985",
   "score": 8
 },
 {
   "userName": "Stäbchenfisch#5107",
   "score": 8
 },
 {
   "userName": "xdy#3735",
   "score": 8
 },
 {
   "userName": "asacolips#1867",
   "score": 8
 },
 {
   "userName": "mclemente#5524",
   "score": 8
 },
 {
   "userName": "MrPrimate#8701",
   "score": 8
 },
 {
   "userName": "edzillion#8362",
   "score": 8
 },
 {
   "userName": "ComicXero#0255",
   "score": 7
 },
 {
   "userName": "enso#0361",
   "score": 7
 },
 {
   "userName": "Pakki Sukibe ♛#0214",
   "score": 7
 },
 {
   "userName": "nikolaj-a#7082",
   "score": 7
 },
 {
   "userName": "1000nettles#6307",
   "score": 7
 },
 {
   "userName": "Skimble#8601",
   "score": 7
 },
 {
   "userName": "tposney#1462",
   "score": 7
 },
 {
   "userName": "WillS#7818",
   "score": 7
 },
 {
   "userName": "grape_juice#2539",
   "score": 7
 },
 {
   "userName": "270296833966866433",
   "score": 7
 },
 {
   "userName": "assassinduke#0983",
   "score": 7
 },
 {
   "userName": "Exitalterego#8315",
   "score": 6
 },
 {
   "userName": "Supe#7438",
   "score": 6
 },
 {
   "userName": "Kreals#1571",
   "score": 6
 },
 {
   "userName": "baileywick#0327",
   "score": 6
 },
 {
   "userName": "Eunomiac#8172",
   "score": 5
 },
 {
   "userName": "DJ Addi#1087",
   "score": 5
 },
 {
   "userName": "iceman#7615",
   "score": 5
 },
 {
   "userName": "MajorVictory87#3666",
   "score": 5
 },
 {
   "userName": "Zamrod#9326",
   "score": 5
 },
 {
   "userName": "ApoApostolov#4622",
   "score": 5
 },
 {
   "userName": "ChrisF#4895",
   "score": 4
 },
 {
   "userName": "Kerrec Snowmane#5264",
   "score": 4
 },
 {
   "userName": "crhampton1#8618",
   "score": 4
 },
 {
   "userName": "sdenec#3813",
   "score": 4
 },
 {
   "userName": "Brother Sharp#6921",
   "score": 4
 },
 {
   "userName": "jegasus#1367",
   "score": 4
 },
 {
   "userName": "EsotericOdyssey#9387",
   "score": 4
 },
 {
   "userName": "GlassJetpack#3000",
   "score": 4
 },
 {
   "userName": "CyberPathogen#3502",
   "score": 4
 },
 {
   "userName": "Juanfrank#9519",
   "score": 4
 },
 {
   "userName": "Grygon#9138",
   "score": 3
 },
 {
   "userName": "Lupusmalus#3187",
   "score": 3
 },
 {
   "userName": "blair#9056",
   "score": 3
 },
 {
   "userName": "Dipso#2519",
   "score": 3
 },
 {
   "userName": "Filloax#5012",
   "score": 3
 },
 {
   "userName": "Caramel#7647",
   "score": 3
 },
 {
   "userName": "WarHead#0001",
   "score": 3
 },
 {
   "userName": "DaveOfWonders#1503",
   "score": 3
 },
 {
   "userName": "stwlam#3718",
   "score": 3
 },
 {
   "userName": "hmqgg#5775",
   "score": 3
 },
 {
   "userName": "Avery#9136",
   "score": 3
 },
 {
   "userName": "Carl-bot#1536",
   "score": 3
 },
 {
   "userName": "328315278771486722",
   "score": 3
 },
 {
   "userName": "Gort#1178",
   "score": 3
 },
 {
   "userName": "trdischat#2123",
   "score": 3
 },
 {
   "userName": "joespan#3152",
   "score": 3
 },
 {
   "userName": "ironmonk88#4075",
   "score": 3
 },
 {
   "userName": "Lucas Ferreira#7182",
   "score": 3
 },
 {
   "userName": "mattexdee#8612",
   "score": 2
 },
 {
   "userName": "winterwulf#0666",
   "score": 2
 },
 {
   "userName": "Rom#4445",
   "score": 2
 },
 {
   "userName": "arbron#6515",
   "score": 2
 },
 {
   "userName": "Tielc#7191",
   "score": 2
 },
 {
   "userName": "joaquim#0237",
   "score": 2
 },
 {
   "userName": "Spice_King#3128",
   "score": 2
 },
 {
   "userName": "brkwsk#9340",
   "score": 2
 },
 {
   "userName": "NickEast#1131",
   "score": 2
 },
 {
   "userName": "Cobalt#7779",
   "score": 2
 },
 {
   "userName": "vigorator#8691",
   "score": 2
 },
 {
   "userName": "RevCivic#8608",
   "score": 2
 },
 {
   "userName": "T.J.#4236",
   "score": 2
 },
 {
   "userName": "Steel_Wind#5114",
   "score": 2
 },
 {
   "userName": "Vass#3760",
   "score": 2
 },
 {
   "userName": "JacobMcAuley#3461",
   "score": 2
 },
 {
   "userName": "AssassinManiac | Max#5505",
   "score": 2
 },
 {
   "userName": "tdhsmith#8148",
   "score": 2
 },
 {
   "userName": "Nordiii#9334",
   "score": 2
 },
 {
   "userName": "VersaceHovercraft#5703",
   "score": 2
 },
 {
   "userName": "Necrophage#6900",
   "score": 2
 },
 {
   "userName": "Nick Coffin, PI#8616",
   "score": 2
 },
 {
   "userName": "Shylight#1337",
   "score": 2
 },
 {
   "userName": "Paul Watson#0965",
   "score": 2
 },
 {
   "userName": "Zakkon#3694",
   "score": 2
 },
 {
   "userName": "grey#3333",
   "score": 2
 },
 {
   "userName": "JSinMe#6969",
   "score": 2
 },
 {
   "userName": "Wasp#2005",
   "score": 2
 },
 {
   "userName": "mirkoRainer#3102",
   "score": 2
 },
 {
   "userName": "4535992#1766",
   "score": 2
 },
 {
   "userName": "xurxodiz#5885",
   "score": 2
 },
 {
   "userName": "Celestian#0854",
   "score": 2
 },
 {
   "userName": "YAGPDB.xyz#8760",
   "score": 2
 },
 {
   "userName": "CJ#9767",
   "score": 2
 },
 {
   "userName": "javierrivera#4813",
   "score": 2
 },
 {
   "userName": "Corndog#7362",
   "score": 2
 },
 {
   "userName": "SDoehren#1162",
   "score": 2
 },
 {
   "userName": "BeCakes#1161",
   "score": 1
 },
 {
   "userName": "Bart_Thievescant#2089",
   "score": 1
 },
 {
   "userName": "sPOiDar🕷#8967",
   "score": 1
 },
 {
   "userName": "jakvike#2615",
   "score": 1
 },
 {
   "userName": "bojjenclon#9292",
   "score": 1
 },
 {
   "userName": "Simone [UTC +1]#6710",
   "score": 1
 },
 {
   "userName": "Guru Mike#3771",
   "score": 1
 },
 {
   "userName": "grand#5298",
   "score": 1
 },
 {
   "userName": "DM_miX#9427",
   "score": 1
 },
 {
   "userName": "Pawper#2358",
   "score": 1
 },
 {
   "userName": "Trentin C Bergeron (UTC-8)#9176",
   "score": 1
 },
 {
   "userName": "GloriousGe0rge#0042",
   "score": 1
 },
 {
   "userName": "Matt | TheGoblinExplorer#9128",
   "score": 1
 },
 {
   "userName": "Snowryo#6969",
   "score": 1
 },
 {
   "userName": "AdagioT#9507",
   "score": 1
 },
 {
   "userName": "ccjmk#0141",
   "score": 1
 },
 {
   "userName": "Bluesatin [Pete]#0583",
   "score": 1
 },
 {
   "userName": "Snark#1167",
   "score": 1
 },
 {
   "userName": "DjinnStar#0480",
   "score": 1
 },
 {
   "userName": "tmtProdigy#1857",
   "score": 1
 },
 {
   "userName": "RoaringCat#6784",
   "score": 1
 },
 {
   "userName": "EBER#7243",
   "score": 1
 },
 {
   "userName": "MrUnderhill#4707",
   "score": 1
 },
 {
   "userName": "JeansenVaars#2857",
   "score": 1
 },
 {
   "userName": "Cannyjack#9386",
   "score": 1
 },
 {
   "userName": "SoaringDylan#0380",
   "score": 1
 },
 {
   "userName": "Moo Man#7518",
   "score": 1
 },
 {
   "userName": "Guoccamolé#5843",
   "score": 1
 },
 {
   "userName": "EndlesNights#9000",
   "score": 1
 },
 {
   "userName": "Teuri#9911",
   "score": 1
 },
 {
   "userName": "Hudston#2078",
   "score": 1
 },
 {
   "userName": "Tyke ((TempoReignsPrime))#7277",
   "score": 1
 },
 {
   "userName": "Stefouch#5202",
   "score": 1
 },
 {
   "userName": "fadedshadow589#8270",
   "score": 1
 },
 {
   "userName": "Bithir#2454",
   "score": 1
 },
 {
   "userName": "wake#6127",
   "score": 1
 },
 {
   "userName": "descention#5912",
   "score": 1
 },
 {
   "userName": "Vizael#0570",
   "score": 1
 },
 {
   "userName": "ldlework#5133",
   "score": 1
 },
 {
   "userName": "Stan#1549",
   "score": 1
 },
 {
   "userName": "InterruptingOctopus#1061",
   "score": 1
 },
 {
   "userName": "zstix#8082",
   "score": 1
 },
 {
   "userName": "crowbar_of_irony#5798",
   "score": 1
 },
 {
   "userName": "CalegoAlt#2020",
   "score": 1
 },
 {
   "userName": "mtvjr#4598",
   "score": 1
 },
 {
   "userName": "IceWolf#8921",
   "score": 1
 },
 {
   "userName": "webmaster94#6939",
   "score": 1
 },
 {
   "userName": "Magus#9576",
   "score": 1
 },
 {
   "userName": "Mana#4176",
   "score": 1
 },
 {
   "userName": "NealSig#3965",
   "score": 1
 },
 {
   "userName": "buddha_314#1897",
   "score": 1
 },
 {
   "userName": "weinerdolphin#3175",
   "score": 1
 },
 {
   "userName": "Vindico#9013",
   "score": 1
 },
 {
   "userName": "Eva#3782",
   "score": 1
 },
 {
   "userName": "MrVauxs#8622",
   "score": 1
 },
 {
   "userName": "danielrab#7070",
   "score": 1
 },
 {
   "userName": "Heliomance#6035",
   "score": 1
 },
 {
   "userName": "agaringer#6498",
   "score": 1
 },
 {
   "userName": "5.4422E+17",
   "score": 1
 },
 {
   "userName": "Enrahim#5273",
   "score": 1
 },
 {
   "userName": "Acheron#7102",
   "score": 1
 },
 {
   "userName": "Kauyon#7835",
   "score": 1
 },
 {
   "userName": "Peach#3809",
   "score": 1
 },
 {
   "userName": "Zzarek#8820",
   "score": 1
 },
 {
   "userName": "DestinyGrey#2890",
   "score": 1
 },
 {
   "userName": "tepiid#7106",
   "score": 1
 },
 {
   "userName": "113123859657416704",
   "score": 1
 },
 {
   "userName": "rrenna#0889",
   "score": 1
 },
 {
   "userName": "RogueEntity (He/Him)#8939",
   "score": 1
 },
 {
   "userName": "Rasmus Høg#9663",
   "score": 1
 },
 {
   "userName": "alcobeard#2639",
   "score": 1
 },
 {
   "userName": "GunFighter11#3974",
   "score": 1
 },
 {
   "userName": "Illuvian#6528",
   "score": 1
 },
 {
   "userName": "Fab#3091",
   "score": 1
 },
 {
   "userName": "SinSurroundsIt#7544",
   "score": 1
 },
 {
   "userName": "portercraft#1813",
   "score": 1
 },
 {
   "userName": "arkansandragoness#9647",
   "score": 1
 },
 {
   "userName": "Alarich#0883",
   "score": 1
 },
 {
   "userName": "681770687614156811",
   "score": 0
 },
 {
   "userName": "cswendrowski#9701",
   "score": -9868
 }
];

main(data);