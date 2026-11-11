import { DurableObject } from "cloudflare:workers";
import HOST from "./host.html";
import PLAY from "./play.html";
import COMMON from "./common.txt";
import STYLE from "./style.txt";
import BUILD from "./build.txt";

const CLIMAT = {
  "Trois-Rivières (Québec)": { t: [-9.9, -8.5, -3.1, 4.6, 12.6, 18.1, 20.9, 19.9, 15.5, 8.5, 1.8, -5.3], p: [83.1, 65.9, 76.3, 87.3, 83.4, 104.5, 124.5, 95.7, 96.9, 100.5, 88.0, 94.7], src: "Environnement et Changement climatique Canada, normales 1991 à 2020" },
  "Quito (Équateur)": { t: [13.9, 13.9, 14.1, 14.1, 14.2, 14.2, 14.3, 14.5, 14.5, 14.2, 13.8, 13.9], p: [81.3, 109.1, 142.4, 168.2, 120.5, 41.3, 22.0, 31.5, 69.4, 112.1, 108.5, 93.6], src: "Organisation météorologique mondiale, normales 1991 à 2020" },
  "Athènes (Grèce)": { t: [10.2, 10.8, 13.1, 16.7, 21.8, 26.6, 29.3, 29.4, 25.0, 20.3, 15.6, 11.6], p: [55.6, 44.4, 45.6, 27.6, 20.7, 11.6, 10.7, 5.4, 25.8, 38.6, 70.8, 76.3], src: "Observatoire national d'Athènes, normales 1991 à 2020" },
  "Kuujjuaq (Nunavik)": { t: [-23.3, -23.1, -16.9, -8.4, 1.2, 7.8, 12.5, 11.8, 6.7, 0.8, -7.2, -16.2], p: [30.7, 29.3, 31.6, 27.4, 31.5, 51.1, 75.2, 75.9, 87.8, 57.0, 43.8, 36.9], src: "Environnement et Changement climatique Canada, normales 1991 à 2020" },
  "Le Caire (Égypte)": { t: [14.4, 15.6, 18.3, 21.8, 25.6, 28.2, 29.1, 29.2, 27.6, 24.6, 20.0, 15.9], p: [4.8, 3.8, 6.3, 1.3, 0.2, 0, 0, 0, 0, 0.7, 4.3, 3.4], src: "NOAA, normales 1991 à 2020" }
};
const Q1 = [
  { type: "clic", kind: "Clic sur la carte", q: "Où est le mont Saint Helens ?", lat: 46.20, lon: -122.18, proj: { type: "geoConicConformal", parallels: [33, 45], rotate: [98, 0], region: [-128, 26, -66, 54], name: "Projection conique conforme de Lambert" }, tol: 150, max: 1500, dur: 40, why: "Le volcan est dans la chaîne des Cascades, dans le sud de l'État de Washington." },
  { type: "clic", kind: "Coordonnées", q: "Place le point 46,35° N, 72,55° O.", lat: 46.35, lon: -72.55, proj: { type: "geoConicConformal", parallels: [46, 60], rotate: [68.5, 0], region: [-82, 41, -56, 55], name: "Projection conique conforme de Lambert, parallèles du Québec" }, grat: 5, tol: 100, max: 1000, dur: 40, why: "C'est Trois-Rivières. La latitude se lit vers le nord à partir de l'équateur, la longitude vers l'ouest à partir de Greenwich." },
  { type: "num", kind: "Échelle", q: "Sur une carte au 1 : 50 000, deux refuges sont à 6 cm l'un de l'autre. Quelle est la distance réelle ?", unit: "km", ans: 3, dur: 60, why: "1 cm sur la carte vaut 50 000 cm sur le terrain, donc 0,5 km. 6 cm valent 3 km." },
  { type: "climat", kind: "Climatogramme mystère", q: "À quelle ville appartient ce climatogramme ?", ville: "Kuujjuaq (Nunavik)", dur: 40, why: "Six mois sous zéro, un été court et frais, peu de précipitations. C'est un climat subarctique." },
  { type: "clic", kind: "Clic sur la carte", q: "Où est le delta du Gange et du Brahmapoutre ?", lat: 22.7, lon: 90.4, proj: { type: "geoAzimuthalEqualArea", rotate: [-86, -22], region: [64, 6, 108, 38], name: "Projection azimutale équivalente de Lambert" }, tol: 150, max: 1500, dur: 40, why: "Le delta s'ouvre sur le golfe du Bengale et couvre presque tout le Bangladesh." },
  { type: "qcm", kind: "Coordonnées", q: "Quelles sont les coordonnées du point marqué ?", point: { lat: 0, lon: -78 }, proj: { type: "geoMercator", region: [-112, -27, -44, 27], name: "Projection de Mercator" }, grat: 10, choices: ["0°, 78° O", "0°, 78° E", "78° N, 0°", "78° S, 0°"], ans: 0, dur: 30, why: "Le point est sur l'équateur, donc à 0° de latitude, et à l'ouest de Greenwich. C'est tout près de Quito." },
  { type: "num", kind: "Échelle", q: "Sur une carte, 2 cm représentent 5 km sur le terrain. Quelle est l'échelle ?", prefix: "1 :", ans: 250000, dur: 60, why: "5 km font 500 000 cm. 2 cm pour 500 000 cm donnent 1 cm pour 250 000 cm." },
  { type: "climat", kind: "Climatogramme mystère", q: "À quelle ville appartient ce climatogramme ?", ville: "Athènes (Grèce)", dur: 40, why: "Été chaud et sec, pluies en hiver. C'est la signature du climat méditerranéen." },
  { type: "clic", kind: "Coordonnées", q: "Place le point 33,9° S, 18,4° E.", lat: -33.9, lon: 18.4, proj: { type: "geoAzimuthalEqualArea", rotate: [-20, 0], region: [-24, -38, 58, 38], fit: "contain", name: "Projection azimutale équivalente de Lambert" }, grat: 10, tol: 150, max: 1500, dur: 40, why: "C'est Le Cap, en Afrique du Sud. Sud et est, donc sous l'équateur et à droite de Greenwich." },
  { type: "climat", kind: "Climatogramme mystère", q: "À quelle ville appartient ce climatogramme ?", ville: "Quito (Équateur)", dur: 40, why: "La température ne bouge presque pas de l'année. On est sur l'équateur, et l'altitude (2 850 m) explique la fraîcheur." }
];
const W = (type, extra) => ({ type, sphere: true, name: "", ...extra });
const CONS = ["Les angles", "Les surfaces", "Les distances", "Rien du tout"];
const Q2 = [
  { type: "qcm", kind: "Projections", q: "Quelle est cette projection ?", proj: W("geoMercator"), tissot: true, choices: ["Mercator", "Equal Earth", "Azimutale équidistante", "Orthographique"], ans: 0, dur: 30, why: "Les méridiens et les parallèles forment une grille de lignes droites, et les hautes latitudes sont énormément agrandies." },
  { type: "qcm", kind: "Déformations", q: "Les cercles restent ronds, mais ils grossissent vers les pôles. Que conserve cette projection ?", proj: W("geoMercator"), tissot: true, choices: CONS, ans: 0, dur: 30, why: "Des cercles qui restent ronds indiquent une projection conforme. Elle conserve les angles et les formes locales, pas les surfaces." },
  { type: "qcm", kind: "Déformations", q: "Ici, les cercles s'écrasent en ellipses, mais gardent tous la même aire. Que conserve cette projection ?", proj: W("geoEqualEarth"), tissot: true, choices: CONS, ans: 1, dur: 30, why: "C'est la projection Equal Earth, une projection équivalente. Elle conserve les surfaces et déforme les formes vers les bords." },
  { type: "clic", kind: "Clic sur la carte", q: "Le Groenland paraît ici aussi grand que l'Afrique. Clique sur celui qui est vraiment 14 fois plus grand.", lat: 2, lon: 20, proj: W("geoMercator", { name: "Projection de Mercator" }), tol: 4300, max: 6000, dur: 40, why: "L'Afrique couvre environ 30 millions de km², le Groenland environ 2,2 millions. Mercator agrandit les hautes latitudes." },
  { type: "num", kind: "Échelle", q: "Sur une carte au 1 : 20 000, une piste mesure 8 cm. Quelle est sa longueur réelle ?", unit: "km", ans: 1.6, dur: 60, why: "1 cm vaut 20 000 cm, donc 200 m. 8 cm valent 1 600 m, soit 1,6 km." },
  { type: "qcm", kind: "Projections", q: "Cette projection centrée sur le pôle Nord figure sur l'emblème de l'ONU. Laquelle est-ce ?", proj: W("geoAzimuthalEquidistant", { rotate: [0, -90] }), choices: ["Azimutale équidistante", "Mercator", "Conique conforme de Lambert", "Equal Earth"], ans: 0, dur: 30, why: "Les distances mesurées à partir du centre sont exactes. L'Antarctique, lui, s'étire sur tout le pourtour." },
  { type: "qcm", kind: "Projections", q: "La Terre vue comme depuis l'espace. Quelle est cette projection ?", proj: W("geoOrthographic", { rotate: [72.5, -46] }), choices: ["Orthographique", "Mercator", "Equal Earth", "Azimutale équidistante"], ans: 0, dur: 30, why: "La projection orthographique montre un seul hémisphère, comme une photo prise de très loin." },
  { type: "num", kind: "Coordonnées", q: "Trois-Rivières est à 72,55° O. Dans quel fuseau UTM se trouve la ville ?", prefix: "Fuseau", ans: 18, dur: 60, why: "Chaque fuseau couvre 6° de longitude. Le fuseau 18 va de 78° O à 72° O." },
  { type: "qcm", kind: "Projections", q: "Quelle projection utilisent Google Maps et OpenStreetMap ?", proj: W("geoMercator"), choices: ["Web Mercator", "Equal Earth", "Conique conforme de Lambert", "Orthographique"], ans: 0, dur: 30, why: "Web Mercator (EPSG:3857) garde les formes à tous les niveaux de zoom, ce qui convient aux tuiles. Elle exagère les surfaces loin de l'équateur." },
  { type: "clic", kind: "Coordonnées", q: "Sur cette carte Equal Earth, place le point 30° S, 60° E.", lat: -30, lon: 60, proj: W("geoEqualEarth", { name: "Projection Equal Earth" }), grat: 30, tol: 400, max: 3500, dur: 40, why: "Sud, donc sous l'équateur. Est, donc à droite de Greenwich. Le point tombe dans l'océan Indien, au sud-est de Madagascar." }
];
const SA = {
  "032": { n: "Argentine", pop: 45.5, dens: 16.6, lang: 0 }, "068": { n: "Bolivie", pop: 12.2, dens: 11.1, lang: 0 },
  "076": { n: "Brésil", pop: 211.1, dens: 25.2, lang: 1 }, "152": { n: "Chili", pop: 19.7, dens: 26.3, lang: 0 },
  "170": { n: "Colombie", pop: 52.3, dens: 46.6, lang: 0 }, "218": { n: "Équateur", pop: 18.0, dens: 71.8, lang: 0 },
  "328": { n: "Guyana", pop: 0.8, dens: 3.9, lang: 2 }, "600": { n: "Paraguay", pop: 6.8, dens: 17.1, lang: 0 },
  "604": { n: "Pérou", pop: 33.8, dens: 26.2, lang: 0 }, "740": { n: "Suriname", pop: 0.6, dens: 3.9, lang: 3 },
  "858": { n: "Uruguay", pop: 3.4, dens: 19.4, lang: 0 }, "862": { n: "Venezuela", pop: 28.3, dens: 32.0, lang: 0 }
};
const AMS = { type: "geoAzimuthalEqualArea", rotate: [60, 20], region: [-96, -56, -22, 13], fit: "contain", name: "Projection azimutale équivalente de Lambert" };
const VV = ["La taille", "La valeur, du clair au foncé", "La couleur", "La forme"];
const Q3 = [
  { type: "qcm", kind: "Variables visuelles", q: "Cette carte montre la population des pays. Quelle variable visuelle porte l'information ?", proj: AMS, thema: { mode: "circ" }, choices: VV, ans: 0, dur: 30, why: "Plus le cercle est grand, plus le pays est peuplé. La taille est la variable visuelle qui traduit le mieux une quantité." },
  { type: "qcm", kind: "Variables visuelles", q: "Cette carte montre la densité de population. Quelle variable visuelle porte l'information ?", proj: AMS, thema: { mode: "chor", v: "dens", pal: "seq" }, choices: VV, ans: 1, dur: 30, why: "Une seule teinte, du clair au foncé. La valeur traduit un ordre, du moins dense au plus dense." },
  { type: "qcm", kind: "Carte ratée", q: "Cette carte colore chaque pays selon sa population totale. Quelle est l'erreur ?", proj: AMS, thema: { mode: "chor", v: "pop", pal: "seq" }, choices: ["Un total se montre avec des cercles proportionnels", "Il manque la rose des vents", "Les couleurs sont trop foncées", "Rien, la carte est bonne"], ans: 0, dur: 40, why: "Un aplat de couleur convient à un rapport, comme des habitants par km². Avec un total, les grands pays ressortent seulement parce qu'ils sont grands." },
  { type: "qcm", kind: "Carte ratée", q: "Cette carte montre encore la densité de population. Qu'est-ce qui cloche ?", proj: AMS, thema: { mode: "chor", v: "dens", pal: "arc" }, choices: ["Les couleurs n'ont pas d'ordre, on ne voit pas le plus et le moins", "Il y a trop peu de classes", "La carte devrait être en noir et blanc", "Rien, la carte est bonne"], ans: 0, dur: 40, why: "Des teintes différentes séparent des catégories, elles ne classent pas. Pour une donnée ordonnée, on garde une teinte qui va du clair au foncé." },
  { type: "qcm", kind: "Palettes", q: "On cartographie des écarts de température à la normale, avec des valeurs négatives et positives. Quelle palette convient ?", fig: "pal", choices: ["Palette 1", "Palette 2", "Palette 3", "Palette 4"], ans: 1, dur: 40, why: "Une palette divergente oppose deux teintes de part et d'autre d'une valeur neutre, ici zéro." },
  { type: "qcm", kind: "Variables visuelles", q: "Cette carte montre la langue officielle principale, une information sans ordre. Quelle variable visuelle porte l'information ?", proj: AMS, thema: { mode: "cat" }, choices: VV, ans: 2, dur: 30, why: "Des teintes bien distinctes séparent des catégories sans laisser croire que l'une vaut plus que l'autre." },
  { type: "qcm", kind: "Implantation", q: "Sur cette carte, les cercles sont des figurés de quelle implantation ?", proj: AMS, thema: { mode: "circ" }, choices: ["Ponctuelle", "Linéaire", "Zonale"], ans: 0, dur: 30, why: "Un figuré placé en un point est en implantation ponctuelle. Une rivière est en implantation linéaire, une forêt en implantation zonale." },
  { type: "clic", kind: "Lire la légende", q: "Clique sur le pays le plus densément peuplé.", lat: -1.4, lon: -78.4, proj: AMS, thema: { mode: "chor", v: "dens", pal: "seq" }, tol: 400, max: 1800, dur: 40, why: "L'Équateur, avec environ 72 habitants par km² en 2022. La couleur la plus foncée désigne la classe la plus élevée." },
  { type: "num", kind: "Cercles proportionnels", q: "Une ville a 4 fois plus d'habitants qu'une autre. Sur une carte en cercles proportionnels, son rayon est combien de fois plus grand ?", unit: "fois", ans: 2, dur: 60, why: "C'est la surface du cercle qui est proportionnelle à la quantité. La surface varie avec le carré du rayon, donc 4 fois la surface donne 2 fois le rayon." },
  { type: "qcm", kind: "Carte ratée", q: "Que manque-t-il à cette carte pour qu'on puisse la lire ?", proj: AMS, thema: { mode: "chor", v: "dens", pal: "seq", noleg: true }, choices: ["La légende", "La rose des vents", "Le quadrillage", "Le nom des océans"], ans: 0, dur: 30, why: "Sans légende, on ne sait ni ce que la carte mesure ni ce que valent les couleurs. Jacques Bertin a décrit ces règles dans Sémiologie graphique, en 1967." }
];
const T = (key, lat, lon, wkm, eq, idx, x) => ({ key, lat, lon, wkm, eq, idx, ...x });
const TH = T("topo-hilaire-1", 45.552, -73.162, 8, 20, 5), TF = T("topo-fuji-1", 35.36, 138.73, 30, 100, 5), TG = T("topo-saguenay-1", 48.32, -70.43, 12, 50, 2);
const TP = T("topo-pingualuit-1", 61.278, -73.66, 8, 10, 5, { lake: { lat: 61.275, lon: -73.66, alt: 470 } }), TA = T("topo-albert-1", 48.915, -66.195, 12, 50, 2), TC = T("topo-canyon-1", 36.10, -112.11, 16, 50, 5);
const Q4 = [
  { type: "qcm", kind: "Courbes de niveau", q: "Que relie une courbe de niveau ?", topo: TH, choices: ["Des points de même altitude", "Des points de même pente", "Les sommets entre eux", "Les cours d'eau entre eux"], ans: 0, dur: 30, why: "Tous les points d'une même courbe sont à la même altitude. Ici, c'est le mont Saint-Hilaire, en Montérégie." },
  { type: "qcm", kind: "Formes du terrain", q: "Des courbes en cercles, de plus en plus serrées vers le centre. Quelle forme de terrain ?", topo: TF, choices: ["Un volcan en forme de cône", "Un cratère creux", "Une vallée", "Un plateau"], ans: 0, dur: 30, why: "L'altitude monte vers le centre et la pente se raidit près du sommet. C'est le mont Fuji, au Japon, 3 776 m." },
  { type: "num", kind: "Équidistance", q: "Les courbes épaisses sont cotées tous les 100 m. Quelle est l'équidistance des courbes ?", topo: { ...TH, noeq: true }, unit: "m", ans: 20, dur: 60, why: "Entre deux courbes épaisses, on compte cinq intervalles. 100 m divisés par 5 donnent 20 m." },
  { type: "clic", kind: "Clic sur la carte", q: "Clique sur le sommet le plus haut du mont.", topo: TH, lat: 45.5502, lon: -73.1724, tol: 0.25, max: 2.5, dur: 40, why: "Le sommet est à l'intérieur de la plus petite courbe fermée, du côté ouest. C'est le point culminant du mont Saint-Hilaire, un peu plus de 400 m." },
  { type: "qcm", kind: "Pente", q: "Où la pente est-elle la plus raide ?", topo: { ...TG, pts: [{ l: "A", lat: 48.341, lon: -70.4574 }, { l: "B", lat: 48.3001, lon: -70.4051 }] }, choices: ["Au point A", "Au point B", "C'est pareil aux deux points"], ans: 0, dur: 30, why: "Des courbes serrées indiquent une pente forte, des courbes espacées une pente douce. Le point A est sur une paroi du fjord du Saguenay." },
  { type: "qcm", kind: "Formes du terrain", q: "Les courbes forment un anneau surélevé autour d'un lac rond. Quelle forme de terrain ?", topo: TP, choices: ["Un cratère", "Une colline", "Un canyon", "Un delta"], ans: 0, dur: 30, why: "Le rebord est plus haut que le plateau autour, et un lac occupe le fond. C'est le cratère des Pingualuit, au Nunavik, creusé par une météorite." },
  { type: "qcm", kind: "Lire une altitude", q: "Une randonneuse est entre la courbe de 300 m et la courbe de 320 m. Quelle altitude est possible ?", topo: TH, choices: ["312 m", "295 m", "325 m", "340 m"], ans: 0, dur: 30, why: "Entre deux courbes voisines, l'altitude est comprise entre leurs deux cotes." },
  { type: "qcm", kind: "Pente", q: "Au point A, sur le dessus du mont Albert, comment est le terrain ?", topo: { ...TA, pts: [{ l: "A", lat: 48.9316, lon: -66.18 }] }, choices: ["Presque plat, les courbes sont très espacées", "Très raide, les courbes sont serrées", "En creux, comme une cuvette"], ans: 0, dur: 30, why: "Le dessus du mont Albert, en Gaspésie, est un plateau. Les courbes s'y écartent, puis se resserrent sur les versants." },
  { type: "qcm", kind: "Cours d'eau", q: "Quand une rivière croise les courbes de niveau, elles dessinent des V. Vers où pointe le V ?", topo: TC, choices: ["Vers l'amont", "Vers l'aval", "Vers le nord", "Vers la mer"], ans: 0, dur: 30, why: "La pointe du V remonte la vallée, vers l'amont. Ici, le Grand Canyon, en Arizona." },
  { type: "clic", kind: "Lire une altitude", q: "Clique sur le point le plus haut de la carte.", topo: TA, lat: 48.9018, lon: -66.2031, tol: 0.4, max: 4, dur: 45, why: "Il faut lire les cotes des courbes épaisses. Le point le plus haut dépasse 1 100 m." }
];
const S2 = (key, scene, bb, c, wkm, cap, x) => ({ key, scene, bb, c, wkm, cap, bands: "TCI", ...x });
const S3R = S2("sat-3r-tci-1", "18/T/XS/2024/8/S2A_18TXS_20240824_0_L2A", [677789, 5128538, 697789, 5139788], [[-72.68769, 46.38828], [-72.42782, 46.38273], [-72.69195, 46.28712]], 20, "Sentinel-2, 24 août 2024. Couleurs naturelles");
const S3I = { ...S3R, key: "sat-3r-ir-1", bands: ["B08", "B04", "B03"], lo: [182, 164, 210], hi: [5568, 1872, 1734], cap: "Sentinel-2, 24 août 2024. Fausses couleurs, proche infrarouge" };
const SYU = S2("sat-yul-tci-1", "18/T/WR/2024/8/S2A_18TWR_20240807_0_L2A", [591055, 5030898, 609055, 5041023], [[-73.83417, 45.51679], [-73.60377, 45.51421], [-73.83605, 45.42567]], 18, "Sentinel-2, 7 août 2024. Couleurs naturelles");
const SJA = S2("sat-jasper-swir-1", "11/U/MU/2024/9/S2A_11UMU_20240910_1_L2A", [414210, 5842102, 444210, 5858977], [[-118.27465, 52.87365], [-117.82898, 52.8776], [-118.27023, 52.72199]], 30, "Sentinel-2, 10 septembre 2024. Fausses couleurs, infrarouge à ondes courtes", { bands: ["B12", "B8A", "B04"], lo: [368, 467, 217], hi: [3369, 4001, 3082] });
const SPI = S2("sat-pivot-tci-1", "37/R/DP/2024/3/S2A_37RDP_20240312_0_L2A", [432189, 3324393, 452189, 3335643], [[38.29586, 30.15024], [38.50353, 30.15119], [38.29658, 30.04873]], 20, "Sentinel-2, 12 mars 2024. Couleurs naturelles");
const SAL = S2("sat-aletsch-tci-1", "32/T/MS/2023/9/S2A_32TMS_20230926_0_L2A", [414833, 5139387, 440833, 5154012], [[7.88936, 46.53428], [8.22838, 46.53707], [7.89204, 46.40269]], 26, "Sentinel-2, 26 septembre 2023. Couleurs naturelles");
const SAS = { ...SAL, key: "sat-aletsch-swir-1", bands: ["B12", "B8A", "B04"], lo: [80, 455, 97], hi: [3790, 8567, 9820], cap: "Sentinel-2, 26 septembre 2023. Fausses couleurs, infrarouge à ondes courtes" };
const Q5 = [
  { type: "qcm", kind: "Couleurs naturelles", q: "Voici Trois-Rivières vue par le satellite Sentinel-2, en couleurs naturelles. Quelles bandes forment cette image ?", sat: S3R, choices: ["Le rouge, le vert et le bleu", "Le proche infrarouge, le rouge et le vert", "L'infrarouge thermique", "Le radar"], ans: 0, dur: 30, why: "Une image en couleurs naturelles combine les bandes rouge, verte et bleue, comme une photo." },
  { type: "clic", kind: "Clic sur l'image", q: "Clique sur le pont Laviolette.", sat: S3R, lat: 46.308, lon: -72.563, tol: 0.7, max: 7, dur: 40, why: "Le pont traverse le fleuve Saint-Laurent entre Trois-Rivières et Bécancour. Sur l'image, c'est un mince trait clair en travers de l'eau." },
  { type: "qcm", kind: "Fausses couleurs", q: "Même endroit, en fausses couleurs avec le proche infrarouge. Que montre le rouge vif ?", sat: S3I, choices: ["La végétation en pleine croissance", "Les zones brûlées", "Les toits des bâtiments", "L'eau peu profonde"], ans: 0, dur: 30, why: "Les feuilles réfléchissent beaucoup le proche infrarouge. Cette composition l'affiche en rouge, donc les champs et les forêts ressortent en rouge." },
  { type: "qcm", kind: "Fausses couleurs", q: "Sur cette image en proche infrarouge, pourquoi le fleuve est-il si sombre ?", sat: S3I, choices: ["L'eau absorbe le proche infrarouge", "L'eau est très froide", "Le fleuve est à l'ombre", "Le satellite ne voit pas l'eau"], ans: 0, dur: 30, why: "L'eau absorbe presque tout le proche infrarouge. C'est pourquoi cette bande sert à tracer les rives et les lacs." },
  { type: "qcm", kind: "Interpréter", q: "Que sont ces cercles verts dans le désert, en Arabie saoudite ?", sat: SPI, choices: ["Des champs irrigués par une rampe qui pivote", "Des cratères de météorites", "Des réservoirs d'eau", "Des villages"], ans: 0, dur: 30, why: "Une rampe d'arrosage tourne autour d'un puits central et dessine un champ rond. L'eau vient d'une nappe souterraine." },
  { type: "clic", kind: "Clic sur l'image", q: "Clique sur les pistes de l'aéroport Montréal-Trudeau.", sat: SYU, lat: 45.4706, lon: -73.7408, tol: 1.2, max: 7, dur: 40, why: "Les pistes sont de longues bandes droites et claires, entourées de gazon. L'aéroport est à Dorval, au nord du lac Saint-Louis." },
  { type: "qcm", kind: "Interpréter", q: "Vallée de Jasper, en Alberta, en septembre 2024. Qu'est-ce que la grande zone rouge brun ?", sat: SJA, choices: ["Une forêt brûlée", "Un lac asséché", "Une ville", "Des champs cultivés"], ans: 0, dur: 30, why: "Le feu de juillet 2024 a brûlé la vallée au sud de Jasper. L'infrarouge à ondes courtes fait ressortir le brûlis en rouge brun et la forêt vivante en vert." },
  { type: "qcm", kind: "Fausses couleurs", q: "Alpes suisses, avec l'infrarouge à ondes courtes. Que montre le bleu cyan ?", sat: SAS, choices: ["La neige et la glace", "La végétation", "La roche nue", "Les nuages"], ans: 0, dur: 30, why: "La neige et la glace absorbent l'infrarouge à ondes courtes, donc elles sortent en bleu cyan. Les nuages, eux, resteraient blancs." },
  { type: "clic", kind: "Clic sur l'image", q: "Clique sur la longue langue de glace du glacier d'Aletsch.", sat: SAL, lat: 46.462, lon: 8.077, tol: 2, max: 9, dur: 40, why: "Le glacier d'Aletsch est le plus long des Alpes, environ 20 km. Les lignes sombres sur la glace sont des moraines." },
  { type: "num", kind: "Résolution", q: "Un pixel de Sentinel-2 couvre 10 m sur 10 m. Combien de pixels faut-il pour couvrir un terrain de soccer de 100 m sur 60 m ?", unit: "pixels", ans: 60, dur: 60, why: "10 pixels sur la longueur et 6 sur la largeur. 10 fois 6 donnent 60 pixels." }
];
const WPP = "ONU, World Population Prospects 2019, année 2020", BM = "Banque mondiale, 2023";
const PY = (m, f) => ({ t: "pyr", m, f, src: WPP });
const PNE = PY([10.08, 8.34, 6.86, 5.54, 4.39, 3.43, 2.58, 1.87, 1.64, 1.38, 1.1, 1.03, 0.77, 0.6, 0.38, 0.2, 0.1], [9.7, 8.06, 6.64, 5.35, 4.23, 3.3, 2.65, 2.23, 1.82, 1.48, 1.22, 0.98, 0.75, 0.55, 0.41, 0.24, 0.13]);
const PJP = PY([1.94, 2.19, 2.26, 2.31, 2.43, 2.49, 2.75, 3.1, 3.41, 4.02, 3.45, 3.13, 2.95, 3.24, 3.41, 2.5, 3.24], [1.84, 2.08, 2.14, 2.19, 2.31, 2.37, 2.62, 2.96, 3.29, 3.89, 3.39, 3.1, 2.97, 3.39, 3.81, 3.08, 5.74]);
const PCA = PY([2.7, 2.68, 2.69, 2.7, 3.2, 3.68, 3.49, 3.5, 3.24, 3.15, 3.22, 3.66, 3.38, 2.78, 2.3, 1.51, 1.76], [2.58, 2.56, 2.57, 2.57, 3.06, 3.56, 3.47, 3.52, 3.28, 3.16, 3.2, 3.65, 3.41, 2.92, 2.45, 1.74, 2.65]);
const PQA = PY([2.4, 2.42, 2.18, 2.02, 6.57, 14.12, 13.92, 9.16, 6.84, 5.73, 4.32, 2.75, 1.5, 0.76, 0.31, 0.07, 0.07], [2.29, 2.28, 2.06, 1.66, 1.67, 2.54, 3.27, 3.02, 2.02, 1.45, 1.08, 0.67, 0.37, 0.21, 0.13, 0.06, 0.08]);
const PYC = ["Une population très jeune, qui grandit vite", "Une population vieillissante", "Une population stable, en forme de colonne", "Un pays qui attire des travailleurs migrants"];
const SAP = Object.values(SA).map((c) => [c.n, c.pop]).sort((a, b) => b[1] - a[1]);
const Q6 = [
  { type: "qcm", kind: "Climatogramme", q: "Quel climat montre ce climatogramme ?", ville: "Le Caire (Égypte)", choices: ["Désertique chaud", "Équatorial humide", "Méditerranéen", "Subarctique"], ans: 0, dur: 30, why: "Presque aucune pluie de l'année et des étés très chauds. C'est Le Caire, en Égypte." },
  { type: "qcm", kind: "Climatogramme", q: "Sur ce climatogramme, quelle saison est la plus sèche ?", ville: "Athènes (Grèce)", choices: ["L'été", "L'hiver", "Le printemps", "L'automne"], ans: 0, dur: 30, why: "Les barres de pluie s'effondrent de juin à août, quand la courbe de température est au plus haut. Un été chaud et sec, c'est la marque du climat méditerranéen. Ici, Athènes." },
  { type: "qcm", kind: "Climatogramme", q: "Combien de mois ont une température moyenne sous zéro ?", ville: "Kuujjuaq (Nunavik)", choices: ["6 mois", "2 mois", "4 mois", "9 mois"], ans: 0, dur: 40, why: "De novembre à avril, la courbe reste sous 0 °C. C'est Kuujjuaq, au Nunavik." },
  { type: "qcm", kind: "Climatogramme", q: "Quel est l'écart entre le mois le plus chaud et le mois le plus froid ?", ville: "Trois-Rivières (Québec)", choices: ["Environ 30 °C", "Environ 10 °C", "Environ 20 °C", "Environ 45 °C"], ans: 0, dur: 40, why: "Juillet est à 20,9 °C et janvier à −9,9 °C. L'écart est de 30,8 °C. C'est Trois-Rivières." },
  { type: "qcm", kind: "Pyramide des âges", q: "Que montre cette pyramide des âges ?", chart: PNE, choices: PYC, ans: 0, dur: 30, why: "La base est très large. La moitié de la population a moins de 15 ans. C'est le Niger." },
  { type: "qcm", kind: "Pyramide des âges", q: "Et celle-ci, que montre-t-elle ?", chart: PJP, choices: PYC, ans: 1, dur: 30, why: "Le haut est plus large que la base. Au Japon, environ 28 % de la population a 65 ans ou plus." },
  { type: "qcm", kind: "Pyramide des âges", q: "Au Qatar, pourquoi y a-t-il autant d'hommes de 25 à 39 ans ?", chart: PQA, choices: ["Des travailleurs migrants, surtout des hommes", "Il naît beaucoup plus de garçons", "Une guerre récente", "Une erreur de recensement"], ans: 0, dur: 30, why: "Le pays fait venir beaucoup de travailleurs étrangers, en majorité des hommes d'âge actif. La pyramide déborde d'un seul côté." },
  { type: "qcm", kind: "Pyramide mystère", q: "À quel pays appartient cette pyramide des âges ?", chart: PCA, choices: ["Canada", "Niger", "Japon", "Qatar"], ans: 0, dur: 30, why: "Une forme en colonne, avec un renflement autour de 55 à 64 ans, la génération du baby-boom. C'est le Canada." },
  { type: "qcm", kind: "Graphique raté", q: "Ce graphique exagère les écarts entre les pays. Pourquoi ?", chart: { t: "bar", items: SAP.slice(1, 5), y0: 25, title: "Population en 2023, en millions", src: BM }, choices: ["L'axe vertical ne commence pas à zéro", "Les barres sont trop larges", "Il manque une légende de couleurs", "Les pays sont mal classés"], ans: 0, dur: 40, why: "L'axe commence à 25 millions. La barre du Venezuela paraît minuscule, alors que sa population vaut plus de la moitié de celle de la Colombie." },
  { type: "qcm", kind: "Graphique raté", q: "Pourquoi ce diagramme circulaire est-il difficile à lire ?", chart: { t: "pie", items: SAP, title: "Population des pays d'Amérique du Sud en 2023", src: BM }, choices: ["Il y a trop de parts, des barres seraient plus claires", "Il manque l'échelle", "Les couleurs sont trop pâles", "Rien, il se lit très bien"], ans: 0, dur: 40, why: "L'œil compare mal des angles, surtout pour les petites parts. Avec douze pays, un diagramme à barres classées se lit beaucoup mieux." }
];
const QC = { type: "geoConicConformal", parallels: [46, 60], rotate: [68.5, 0], region: [-82, 44, -56, 53], name: "Projection conique conforme de Lambert, parallèles du Québec" };
const Q7 = [
  { type: "qcm", kind: "Satellites", q: "Combien de satellites faut-il au minimum pour calculer une position en trois dimensions ?", choices: ["4", "1", "2", "12"], ans: 0, dur: 30, why: "Trois satellites donnent la position. Le quatrième sert à corriger l'horloge du récepteur." },
  { type: "qcm", kind: "Coordonnées", q: "Dans la longitude −72,55°, que veut dire le signe moins ?", choices: ["À l'ouest du méridien de Greenwich", "À l'est du méridien de Greenwich", "Au sud de l'équateur", "Sous le niveau de la mer"], ans: 0, dur: 30, why: "Les longitudes ouest sont négatives et les latitudes sud aussi. Trois-Rivières est à 72,55° O, donc −72,55°." },
  { type: "num", kind: "Conversion", q: "Convertis 46° 30' N en degrés décimaux.", unit: "° N", ans: 46.5, dur: 60, why: "Un degré vaut 60 minutes. 30 minutes font donc 0,5 degré, et 46° 30' donnent 46,5°." },
  { type: "clic", kind: "Clic sur la carte", q: "Place le point 0° de latitude, 0° de longitude.", lat: 0, lon: 0, proj: W("geoEqualEarth", { name: "Projection Equal Earth" }), grat: 30, tol: 500, max: 4500, dur: 40, why: "L'équateur croise le méridien de Greenwich dans le golfe de Guinée. Les géomaticiens surnomment ce point Null Island, parce que les coordonnées vides y aboutissent." },
  { type: "qcm", kind: "Précision", q: "À ciel ouvert, quelle est la précision habituelle du GPS d'un téléphone ?", choices: ["Environ 5 m", "Environ 5 cm", "Environ 500 m", "Environ 5 km"], ans: 0, dur: 30, why: "Un téléphone se situe à quelques mètres près. Un récepteur d'arpentage, avec corrections, descend à quelques centimètres." },
  { type: "num", kind: "Ordre de grandeur", q: "Un degré de latitude vaut environ combien de kilomètres ?", unit: "km", ans: 111, dur: 60, why: "Le tour de la Terre fait environ 40 000 km. Divisé par 360 degrés, on obtient environ 111 km par degré." },
  { type: "qcm", kind: "Précision", q: "Qu'est-ce qui nuit le plus à la réception du GPS ?", choices: ["Les édifices hauts et le couvert d'arbres", "Une pluie légère", "La nuit", "Le vent"], ans: 0, dur: 30, why: "Les édifices et les arbres masquent une partie du ciel et font rebondir les signaux. La position dérive alors de plusieurs mètres." },
  { type: "qcm", kind: "Coordonnées", q: "Dans 46,34720° N, à quoi correspond la cinquième décimale ?", choices: ["Environ 1 m", "Environ 1 km", "Environ 100 m", "Environ 1 mm"], ans: 0, dur: 40, why: "Un degré vaut environ 111 km. Un cent-millième de degré vaut donc environ 1,1 m." },
  { type: "qcm", kind: "Système géodésique", q: "Dans quel système géodésique un récepteur GPS donne-t-il ses coordonnées ?", choices: ["WGS 84", "NAD 27", "UTM", "Mercator"], ans: 0, dur: 30, why: "Le GPS travaille dans le système mondial WGS 84. UTM et Mercator sont des projections, pas des systèmes géodésiques." },
  { type: "clic", kind: "Clic sur la carte", q: "Un récepteur affiche 48,4° N, 71,1° O. Place ce point.", lat: 48.4, lon: -71.1, proj: QC, grat: 5, tol: 60, max: 600, dur: 45, why: "Entre 45° N et 50° N, plus près de 50. Entre 70° O et 75° O, tout près de 70. Le point tombe à Saguenay." }
];
const QUIZZES = {
  bases: { title: "Les bases de la carte", desc: "Lieux, coordonnées, échelle, climatogrammes", questions: Q1 },
  projections: { title: "Projections", desc: "Reconnaître une projection et lire ses déformations", questions: Q2 },
  semio: { title: "Sémiologie graphique", desc: "Variables visuelles, palettes et cartes ratées", questions: Q3 },
  topo: { title: "Lire une carte topo", desc: "Courbes de niveau, pentes et formes du terrain", questions: Q4 },
  sat: { title: "Images satellitaires", desc: "Couleurs naturelles, fausses couleurs et repérage sur Sentinel-2", questions: Q5 },
  graph: { title: "Graphiques mystères", desc: "Climatogrammes, pyramides des âges et graphiques ratés", questions: Q6 },
  gps: { title: "GPS et coordonnées", desc: "Satellites, précision, formats de coordonnées", questions: Q7 }
};
const assetsOf = (qs) => { const m = {}; for (const q of qs) { const a = q.topo || q.sat; if (a) m[a.key] = { kind: q.topo ? "topo" : "sat", ...a }; } return Object.values(m); };
const ASSETS = Object.values(QUIZZES).flatMap((z) => assetsOf(z.questions));
const ALPHA = "BCDFGHJKMNPQRSTVWXZ";
const rid = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => ALPHA[b % ALPHA.length]).join("");
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function distKm(a, b, c, d) { const R = 6371, r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
const page = (body, type) => new Response(body, { headers: { "content-type": type + "; charset=utf-8", "cache-control": "no-cache" } });
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === "/") return page(PLAY, "text/html");
    if (u.pathname === "/host") return page(HOST, "text/html");
    if (u.pathname === "/common.js") return page(COMMON, "text/javascript");
    if (u.pathname === "/style.css") return page(STYLE, "text/css");
    if (u.pathname === "/build.js") return page(BUILD, "text/javascript");
    if (u.pathname.startsWith("/a/")) {
      const key = u.pathname.slice(3);
      if (!ASSETS.some((a) => a.key === key)) return json({ error: "inconnu" }, 404);
      const stub = env.ROOM.get(env.ROOM.idFromName("ASSETS"));
      if (req.method !== "PUT") return stub.fetch("https://do/asset?key=" + key);
      if (!env.HOST_PIN || String(req.headers.get("x-pin") || "").trim().toLowerCase() !== env.HOST_PIN.toLowerCase()) return json({ error: "pin" }, 403);
      const body = await req.arrayBuffer();
      if (body.byteLength > 900000) return json({ error: "taille" }, 413);
      return stub.fetch("https://do/asset?key=" + key, { method: "PUT", body, headers: { "content-type": req.headers.get("content-type") || "application/octet-stream" } });
    }
    if (u.pathname === "/api/quizzes") return json(Object.entries(QUIZZES).map(([id, z]) => ({ id, title: z.title, desc: z.desc, n: z.questions.length, assets: assetsOf(z.questions) })));
    if (u.pathname === "/api/new" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      if (!env.HOST_PIN || String(b.pin || "").trim().toLowerCase() !== env.HOST_PIN.toLowerCase()) return json({ error: "pin" }, 403);
      for (let k = 0; k < 6; k++) {
        const code = rid(4), key = rid(16);
        const r = await env.ROOM.get(env.ROOM.idFromName(code)).fetch("https://room/init", { method: "POST", body: JSON.stringify({ code, key, quiz: b.quiz }) });
        if (r.ok) return json({ code, key });
      }
      return json({ error: "busy" }, 503);
    }
    if (u.pathname === "/ws") {
      const code = (u.searchParams.get("code") || "").toUpperCase();
      if (!/^[A-Z]{4}$/.test(code)) return json({ error: "code" }, 400);
      return env.ROOM.get(env.ROOM.idFromName(code)).fetch(req);
    }
    return new Response("Introuvable", { status: 404 });
  }
};

export class Room extends DurableObject {
  async load() { if (this.S === undefined) this.S = (await this.ctx.storage.get("S")) || null; return this.S; }
  async save() { await this.ctx.storage.put("S", this.S); }
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/asset") {
      const k = "a:" + u.searchParams.get("key");
      if (req.method === "PUT") { await this.ctx.storage.put(k, { t: req.headers.get("content-type"), b: await req.arrayBuffer() }); return json({ ok: true }); }
      const v = await this.ctx.storage.get(k);
      return v ? new Response(v.b, { headers: { "content-type": v.t, "cache-control": "public, max-age=604800" } }) : json({ error: "absent" }, 404);
    }
    const S = await this.load();
    if (u.pathname === "/init") {
      if (S) return json({ error: "exists" }, 409);
      const b = await req.json();
      this.S = { code: b.code, key: b.key, phase: "lobby", quiz: QUIZZES[b.quiz] ? b.quiz : "bases", qi: -1, players: {}, opts: null, t0: 0, ends: 0 };
      await this.save(); await this.ctx.storage.setAlarm(Date.now() + 8 * 3600 * 1000);
      return json({ ok: true });
    }
    if (!S) return json({ error: "inconnu" }, 404);
    if (req.headers.get("Upgrade") !== "websocket") return json({ error: "ws" }, 426);
    const host = u.searchParams.get("role") === "host";
    if (host && u.searchParams.get("key") !== S.key) return json({ error: "cle" }, 403);
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    pair[1].serializeAttachment({ role: host ? "host" : "player", pid: null });
    if (host) pair[1].send(JSON.stringify(this.view()));
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
  async alarm() { for (const ws of this.ctx.getWebSockets()) try { ws.close(1000, "fin"); } catch (e) { } await this.ctx.storage.deleteAll(); this.S = null; }
  online() { const s = new Set(); for (const ws of this.ctx.getWebSockets()) { const a = ws.deserializeAttachment(); if (a && a.pid) s.add(a.pid); } return s; }
  QS() { return QUIZZES[this.S.quiz || "bases"].questions; }
  pubQ() {
    const q = this.QS()[this.S.qi]; if (!q) return null;
    const o = { type: q.type, kind: q.kind, q: q.q, proj: q.proj, grat: q.grat, tissot: q.tissot, fig: q.fig, thema: q.thema, topo: q.topo, sat: q.sat, chart: q.chart, point: q.point, unit: q.unit, prefix: q.prefix, dur: q.dur, opts: this.S.opts };
    if (q.thema) o.data = SA;
    if (q.ville) o.clim = { t: CLIMAT[q.ville].t, p: CLIMAT[q.ville].p };
    return o;
  }
  view() {
    const S = this.S, on = this.online(), show = S.phase !== "question" && S.phase !== "lobby", q = this.QS()[S.qi];
    const players = Object.entries(S.players).map(([pid, p]) => ({ pid, name: p.name, color: p.color, score: p.score, answered: p.answered, on: on.has(pid), last: show ? p.last : null }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const m = { t: "state", code: S.code, phase: S.phase, qi: S.qi, n: this.QS().length, title: QUIZZES[S.quiz || "bases"].title, quiz: S.quiz || "bases", players, q: S.phase === "lobby" ? null : this.pubQ(), ends: S.ends, now: Date.now() };
    if (show && q) m.sol = { lat: q.lat, lon: q.lon, label: q.type === "qcm" ? q.choices[q.ans] : q.ville, ans: q.ans, why: q.why, src: q.ville ? CLIMAT[q.ville].src : q.chart ? q.chart.src : null };
    return m;
  }
  cast() { const m = JSON.stringify(this.view()); for (const ws of this.ctx.getWebSockets()) try { ws.send(m); } catch (e) { } }
  startQ(i) {
    const S = this.S, q = this.QS()[i];
    S.qi = i; S.phase = "question"; S.t0 = Date.now(); S.ends = S.t0 + q.dur * 1000;
    S.opts = q.type === "qcm" ? shuffle(q.choices) : q.type === "climat" ? shuffle([q.ville, ...shuffle(Object.keys(CLIMAT).filter((v) => v !== q.ville)).slice(0, 3)]) : null;
    for (const p of Object.values(S.players)) { p.answered = false; p.last = null; }
  }
  reveal() { const S = this.S; if (S.phase !== "question") return; S.phase = "reveal"; for (const p of Object.values(S.players)) if (p.last) p.score += p.last.pts; }
  grade(q, v, sec) {
    let p = 0, d = null, val = null;
    if (q.type === "clic") {
      const lat = Number(v && v.lat), lon = Number(v && v.lon);
      if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 360) return null;
      d = distKm(lat, lon, q.lat, q.lon); p = d <= q.tol ? 1 : Math.max(0, 1 - (d - q.tol) / (q.max - q.tol)); val = { lat, lon };
    } else if (q.type === "num") {
      const x = Number(v); if (!isFinite(x)) return null; p = Math.abs(x - q.ans) <= Math.abs(q.ans) * 0.02 ? 1 : 0; val = x;
    } else {
      val = String(v).slice(0, 80); if (!this.S.opts.includes(val)) return null;
      p = val === (q.type === "qcm" ? q.choices[q.ans] : q.ville) ? 1 : 0;
    }
    const base = Math.round(1000 * p), bonus = p > 0 ? Math.round(500 * p * Math.max(0, 1 - sec / q.dur)) : 0;
    return { v: val, p, d, base, bonus, sec, pts: base + bonus };
  }
  async webSocketMessage(ws, raw) {
    const S = await this.load(); if (!S) return;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const a = ws.deserializeAttachment() || {};
    if (a.role === "host") {
      if (m.t === "start" && S.phase === "lobby" && Object.keys(S.players).length) this.startQ(0);
      else if (m.t === "reveal") this.reveal();
      else if (m.t === "scores" && S.phase === "reveal") S.phase = "scores";
      else if (m.t === "next" && (S.phase === "scores" || S.phase === "reveal")) { if (S.qi + 1 < this.QS().length) this.startQ(S.qi + 1); else S.phase = "final"; }
      else if (m.t === "kick" && S.phase === "lobby") {
        delete S.players[m.pid];
        for (const w of this.ctx.getWebSockets()) { const b = w.deserializeAttachment(); if (b && b.pid === m.pid) try { w.send(JSON.stringify({ t: "kicked" })); w.close(1000, "retiré"); } catch (e) { } }
      }
      else if (m.t === "again" && S.phase === "final") { S.phase = "lobby"; S.qi = -1; for (const p of Object.values(S.players)) { p.score = 0; p.last = null; p.answered = false; } }
      else return;
    } else {
      if (m.t === "join") {
        let pid = m.pid && S.players[m.pid] ? m.pid : null;
        if (!pid) {
          const name = String(m.name || "").replace(/\s+/g, " ").trim().slice(0, 18);
          if (!name) return ws.send(JSON.stringify({ t: "error", msg: "Écris un nom d'équipe." }));
          if (Object.keys(S.players).length >= 40) return ws.send(JSON.stringify({ t: "error", msg: "La partie est pleine." }));
          if (Object.values(S.players).some((p) => p.name.toLowerCase() === name.toLowerCase())) return ws.send(JSON.stringify({ t: "error", msg: "Ce nom est déjà pris." }));
          pid = rid(10); S.players[pid] = { name, color: Object.keys(S.players).length % 12, score: 0, answered: false, last: null };
        }
        ws.serializeAttachment({ role: "player", pid });
        ws.send(JSON.stringify({ t: "you", pid }));
      } else if (m.t === "answer" && a.pid && S.players[a.pid] && S.phase === "question") {
        const p = S.players[a.pid], now = Date.now();
        if (p.answered || now > S.ends + 1500) return;
        const g = this.grade(this.QS()[S.qi], m.v, (now - S.t0) / 1000); if (!g) return;
        p.last = g; p.answered = true;
        const on = this.online();
        if ([...on].every((id) => !S.players[id] || S.players[id].answered)) this.reveal();
      } else return;
    }
    await this.save(); this.cast();
  }
  async webSocketClose(ws) { if (await this.load()) this.cast(); }
  async webSocketError(ws) { if (await this.load()) this.cast(); }
}
