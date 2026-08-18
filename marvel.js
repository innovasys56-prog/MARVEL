import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAjeDGp-zpEh3gSaoSZe-nH8iowOAGOecc",
    authDomain: "marvel-en-orden-cronologico.firebaseapp.com",
    projectId: "marvel-en-orden-cronologico",
    storageBucket: "marvel-en-orden-cronologico.firebasestorage.app",
    messagingSenderId: "56299264347",
    appId: "1:56299264347:web:3479c14e029ad98ab7e27e",
    measurementId: "G-70ZYETCL7X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let userProgress = {};
let currentFilter = 'all';

const mcuData = [
    // --- SIGLO XX (ORÍGENES) ---
    { id: "capitan-america-1", title: "Capitán América: El Primer Vengador", year: "1942–1945", type: "peli", era: "Siglo XX (Orígenes)", poster: "https://image.tmdb.org/t/p/original/4tOdihzPwzN919yfezie5JsaEIo.jpg" },
    { id: "agente-carter", title: "Agente Carter (T1 y T2)", year: "1946–1947", type: "serie", era: "Siglo XX (Orígenes)", poster: "https://image.tmdb.org/t/p/original/scZsg0rfAyH8ADphzrdhgo5jAXd.jpg" },
    { id: "capitana-marvel", title: "Capitana Marvel", year: "1995", type: "peli", era: "Siglo XX (Orígenes)", poster: "https://image.tmdb.org/t/p/original/6kkjuh4FTS0oTeG7IxJvbFvSRv9.jpg" },

    // --- SAGA DEL INFINITO (FASES 1, 2 Y 3) ---
    { id: "iron-man-1", title: "Iron Man", year: "2008", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/bFJpvSBNtBHne1pZcCD0IMObZ4A.jpg" },
    { id: "iron-man-2", title: "Iron Man 2", year: "2010", type: "peli", era: "Saga del Infinito", poster: "https://alternativemovieposters.com/wp-content/uploads/2012/12/ironman2bg1.jpg" },
    { id: "increible-hulk", title: "El Increíble Hulk", year: "2010", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/5fTSI0wRRljOcQWFMRhZwfjs1Jp.jpg" },
    { id: "thor-1", title: "Thor", year: "2010", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/qFAVW4XJaxhj7PcpiUI5hhO9bOX.jpg" },
    { id: "vengadores-1", title: "Los Vengadores", year: "2012", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/cWNIua1iPA4kGyQxJGvnx7UIzoT.jpg" },
    { id: "iron-man-3", title: "Iron Man 3", year: "2012–2013", type: "peli", era: "Saga del Infinito", poster: "https://www.cinemascomics.com/wp-content/uploads/2013/04/Ironman3-poster.jpg" },
    { id: "thor-2", title: "Thor: El Mundo Oscuro", year: "2013", type: "peli", era: "Saga del Infinito", poster: "https://www.findelahistoria.com/web/wp-content/uploads/2013/08/20130830-152310.jpg" },
    { id: "capitan-america-2", title: "Capitán América: El Soldado de Invierno", year: "2014", type: "peli", era: "Saga del Infinito", poster: "https://www.cinemascomics.com/wp-content/uploads/2014/02/w7k1.jpg" },
    { id: "gotg-1", title: "Guardianes de la Galaxia", year: "2014", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/tLPOphMdoULccLiBq5PkOZhfdMI.jpg" },
    { id: "i-am-groot-1", title: "Yo soy Groot (T1)", year: "2014", type: "serie", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/mdfNWN04h8GAyMkPkhDplnZtPOw.jpg" },
    { id: "gotg-2", title: "Guardianes de la Galaxia Vol. 2", year: "2014", type: "peli", era: "Saga del Infinito", poster: "https://www.mubis.es/media/users/9192/174890/guardianes-de-la-galaxia-vol-2-l_cover.png" },
    { id: "i-am-groot-2", title: "Yo soy Groot (T2)", year: "2014", type: "serie", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/cMWApUzgeYcHeCxDKLjdybJpYZW.jpg" },
    { id: "daredevil-1", title: "Daredevil (T1)", year: "2014–2015", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/zdjmPOMNlDpmqXLgNaGBT7jAiFj.jpg" },
    { id: "jessica-jones-1", title: "Jessica Jones (T1)", year: "2015", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/1M4zaaGezvGOLYXKM70t1TmFXMi.jpg" },
    { id: "vengadores-2", title: "Vengadores: La Era de Ultrón", year: "2015", type: "peli", era: "Saga del Infinito", poster: "https://www.cinemascomics.com/wp-content/uploads/2014/10/Poster-oficial-de-Los-Vengadores-2-La-era-de-Ultron.jpg" },
    { id: "ant-man-1", title: "Ant-Man", year: "2015", type: "peli", era: "Saga del Infinito", poster: "https://www.mubis.es/media/articles/11677/118866/nuevo-poster-para-espana-de-ant-man-de-marvel-l_cover.jpg" },
    { id: "daredevil-2", title: "Daredevil (T2)", year: "2015–2016", type: "netflix", era: "Saga del Infinito", poster: "https://im.ziffdavisinternational.com/ign_es/screenshot/default/daredevil_8dds.jpg" },
    { id: "luke-cage-1", title: "Luke Cage (T1)", year: "2016", type: "netflix", era: "Saga del Infinito", poster: "https://www.mubis.es/media/users/9192/204822/poster-y-trailer-de-la-segunda-temporada-de-luke-cage-original.jpg" },
    { id: "capitan-america-3", title: "Capitán América: Civil War", year: "2016", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/g6UTwUVFYWI8VPWo5GylnbZVhin.jpg" },
    { id: "black-widow", title: "Viuda Negra", year: "2016", type: "peli", era: "Saga del Infinito", poster: "https://www.mubis.es/media/users/7286/257391/poster-oficial-de-viuda-negra-l_cover.jpg" },
    { id: "black-panther-1", title: "Black Panther", year: "2016", type: "peli", era: "Saga del Infinito", poster: "https://lumiere-a.akamaihd.net/v1/images/p_blackpanther_19754_4ac13f07.jpeg?region=0%2C0%2C540%2C810" },
    { id: "spiderman-1", title: "Spider-Man: Homecoming", year: "2016", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/bRl6C6FwzTndk0MBGZZ68nRFlw3.jpg" },
    { id: "doctor-strange-1", title: "Doctor Strange", year: "2016–2017", type: "peli", era: "Saga del Infinito", poster: "https://areajugones.sport.es/wp-content/uploads/2016/09/cr2vlm7wyaabl7_.jpg" },
    { id: "iron-fist-1", title: "Iron Fist (T1)", year: "2017", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/ywrvjIgK5K9Ff8RddgdFI3kfDqT.jpg" },
    { id: "defenders", title: "The Defenders", year: "2017", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/4D8hJCMzYWJunOhDlJ4yQ7xSoUJ.jpg" },
    { id: "punisher-1", title: "The Punisher (T1)", year: "2017", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/8OdIbo68mFE4w6jXA20aL8ocPsE.jpg" },
    { id: "jessica-jones-2", title: "Jessica Jones (T2)", year: "2017–2018", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/lrKlQseRAmNKHdhOyMiylCwxbp.jpg" },
    { id: "luke-cage-2", title: "Luke Cage (T2)", year: "2018", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/1zr8G7pmLEQl29L0Qks3a4BsSei.jpg" },
    { id: "iron-fist-2", title: "Iron Fist (T2)", year: "2018", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/pO2PnCmgeLKlazux6uSxI8tAc2Y.jpg" },
    { id: "daredevil-3", title: "Daredevil (T3)", year: "2018", type: "netflix", era: "Saga del Infinito", poster: "https://i0.wp.com/codigoespagueti.com/wp-content/uploads/2018/09/daredevil-3ra-temporada.jpg?w=640&ssl=1" },
    { id: "punisher-2", title: "The Punisher (T2)", year: "2018", type: "netflix", era: "Saga del Infinito", poster: "https://hips.hearstapps.com/hmg-prod/images/punsiher-season-2-poster-1547133343.jpeg?crop=1xw:1xh;center,top&resize=980:*" },
    { id: "jessica-jones-3", title: "Jessica Jones (T3)", year: "2018", type: "netflix", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/llxDEkJ4c7rvXNUBQmIXiKBFxBS.jpg" },
    { id: "thor-3", title: "Thor: Ragnarok", year: "2017", type: "peli", era: "Saga del Infinito", poster: "https://www.mubis.es/media/users/3724/191190/thor-ragnarok-nuevo-poster-y-tv-spot-l_cover.jpg" },
    { id: "ant-man-2", title: "Ant-Man y la Avispa", year: "2018", type: "peli", era: "Saga del Infinito", poster: "https://www.mubis.es/media/users/9192/204320/poster-oficialde-ant-man-y-la-avispa-l_cover.jpg" },
    { id: "vengadores-3", title: "Vengadores: Infinity War", year: "2018", type: "peli", era: "Saga del Infinito", poster: "https://image.tmdb.org/t/p/original/90yhZSwCZZ8jxJkZBqUlXibNPUs.jpg" },
    { id: "vengadores-4", title: "Vengadores: Endgame", year: "2018–2023", type: "peli", era: "Saga del Infinito", poster: "https://i0.wp.com/codigoespagueti.com/wp-content/uploads/2018/12/poster-avengers-endgame.jpg?w=640&ssl=1" },

    // --- SAGA DEL MULTIVERSO (FASES 4, 5 Y MÁS ALLÁ) ---
    { id: "loki-1", title: "Loki (T1 y T2)", year: "Fuera de línea temporal", type: "serie", era: "Saga del Multiverso", poster: "https://moviepostermexico.com/cdn/shop/products/loki_ver2_xxlg_1024x1024@2x.jpg?v=1623037856" },
    { id: "what-if-1", title: "What If...? (T1, T2 y T3)", year: "Multiverso", type: "serie", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2021/04/1618310327_941009_1618310394_sumario_normal.jpg" },
    { id: "wandavision", title: "Bruja Escarlata y Visión (WandaVision)", year: "2023", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/hEb0uSHvhSwsMMRUGUttxqtHKnZ.jpg" },
    { id: "shang-chi", title: "Shang-Chi y la Leyenda de los Diez Anillos", year: "2024", type: "peli", era: "Saga del Multiverso", poster: "https://www.mubis.es/media/users/12828/286651/nuevo-poster-de-shang-chi-y-la-leyenda-de-los-diez-anillos-l_cover.jpg" },
    { id: "falcon-ws", title: "Falcon y el Soldado de Invierno", year: "2024", type: "serie", era: "Saga del Multiverso", poster: "https://www.mubis.es/media/users/7286/276718/poster-y-trailer-oficial-de-falcon-y-el-soldado-de-invierno-l_cover.jpg" },
    { id: "spiderman-2", title: "Spider-Man: Lejos de Casa", year: "2024", type: "peli", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2019/05/poster-spider-man-lejos-de-casa-06.jpg" },
    { id: "eternals", title: "Eternals", year: "2024", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/a2ETqzAPn5oN1BVAMXxIYXj2U0.jpg" },
    { id: "spiderman-3", title: "Spider-Man: No Way Home", year: "2024", type: "peli", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2022/01/poster-Spider-man-no-way-home.jpg" },
    { id: "doctor-strange-2", title: "Doctor Strange en el Multiverso de la Locura", year: "2024", type: "peli", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2022/04/poster-doctor-strange-en-el-multiverso-de-la-locura-2.jpg" },
    { id: "hawkeye", title: "Ojo de Halcón (Hawkeye)", year: "Navidad de 2024", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/uQdAET8dl403BIVktl5gjtzXRDT.jpg" },
    { id: "moon-knight", title: "Moon Knight", year: "2025", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/YksR65as1ppF2N48TJAh2PLamX.jpg" },
    { id: "black-panther-2", title: "Black Panther: Wakanda Forever", year: "2025", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/3nRpczJi9l1zfc726hzxoD55mKS.jpg" },
    { id: "echo", title: "Echo", year: "2025", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/1RFLMSnFng8G23zZ1G5Q6lFVRfY.jpg" },
    { id: "she-hulk", title: "She-Hulk", year: "2024–2025", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/5xz2orV8f0usyrfGNshcoXHmiaV.jpg" },
    { id: "ms-marvel", title: "Ms. Marvel", year: "2025", type: "serie", era: "Saga del Multiverso", poster: "https://lumiere-a.akamaihd.net/v1/images/ms_979c8372.jpeg" },
    { id: "thor-4", title: "Thor: Love and Thunder", year: "2025", type: "peli", era: "Saga del Multiverso", poster: "https://www.mubis.es/media/users/12828/301820/poster-imax-thor-love-and-thunder-l_cover.jpg" },
    { id: "werewolf-by-night", title: "La Maldición del Hombre Lobo", year: "2025", type: "especial", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/1n2q0Y1pX8PkQh9imqGbNH7Bw4q.jpg" },
    { id: "gotg-holiday", title: "Guardianes de la Galaxia: Especial Felices Fiestas", year: "Navidad de 2025", type: "especial", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/AcriCv7GpkXTrG0nFbvB6dWcF86.jpg" },
    { id: "ant-man-3", title: "Ant-Man y la Avispa: Quantumania", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/xTF9FjdFXjpmzrY7W6Wo47gJyR.jpg" },
    { id: "gotg-3", title: "Guardianes de la Galaxia Vol. 3", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2019/08/Poster-de-Guardianes-de-la-galaxia-Vol-3.jpg" },
    { id: "secret-invasion", title: "Invasión Secreta", year: "2026", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/f5ZMzzCvt2IzVDxr54gHPv9jlC9.jpg" },
    { id: "the-marvels", title: "The Marvels", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/y4YMYsGSMwu8e985g0Zbumvqxld.jpg" },
    { id: "deadpool-3", title: "Deadpool & Wolverine", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://www.tomosygrapas.com/wp-content/uploads/2024/04/Deadpool-3-poster-1.jpg" },
    { id: "agatha", title: "Agatha en todas partes", year: "2026", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/qiTk8O471Rvrbq8u1wnBKh0ZqGo.jpg" },
    { id: "capitan-america-4", title: "Capitán América: Brave New World", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/pVMSRyAiye7gZ8NtuCt1qgbspY9.jpg" },
    { id: "thunderbolts", title: "Thunderbolts*", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/hqcexYHbiTBfDIdDWxrxPtVndBX.jpg" },
    { id: "fantastic-four", title: "Los 4 Fantásticos: Primeros Pasos", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/7xvPyfuBqdGFt4adeI6VxhlVRsk.jpg" },
    { id: "ironheart", title: "Ironheart", year: "2026", type: "serie", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/cXYl3KW0vCjzF7zRCDKZyLbctzj.jpg" },
    { id: "daredevil-ba", title: "Daredevil: Born Again", year: "2026", type: "serie", era: "Saga del Multiverso", poster: "https://www.cinemascomics.com/wp-content/uploads/2026/03/Daredevil-Born-Again-poster-02.jpg" },
    { id: "sm-bnd", title: "Spider-Man: Brand New Day", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://cdn.marvel.com/content/1x/spidermanbrandnewday_lob_crd_02.webp" },
    { id: "avengers-doomsday", title: "Avengers: Doomsday", year: "2026", type: "peli", era: "Saga del Multiverso", poster: "https://image.tmdb.org/t/p/original/7WU8xhLhiCYuRB2VcBnUMvo6kST.jpg" }
];

const labels = {
    peli: "Película",
    serie: "Serie Disney+",
    netflix: "Defenders",
    especial: "Especial TV"
};

function initDoomsdayCountdown() {
    const targetDate = new Date("2026-12-17T00:00:00").getTime();

    setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            document.getElementById("days").innerText = Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            document.getElementById("hours").innerText = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            document.getElementById("minutes").innerText = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            document.getElementById("seconds").innerText = Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, '0');
        }
    }, 1000);
}

async function checkIsAdmin(user) {
    if (!user) return false;
    try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data().role === "admin";
        }
    } catch (e) {
        console.error("Error comprobando rol de admin:", e);
    }
    return false;
}

onAuthStateChanged(auth, async (user) => {
    const userDisplay = document.getElementById("user-info");
    const authBtn = document.getElementById("auth-btn");
    const adminBtn = document.getElementById("admin-panel-btn");

    if (user) {
        currentUser = user;
        userDisplay.innerText = `Hola, ${user.email}`;
        authBtn.innerText = "Cerrar Sesión";
        
        const isAdmin = await checkIsAdmin(user);
        if (isAdmin) {
            adminBtn.style.display = "inline-block";
        } else {
            adminBtn.style.display = "none";
        }
        
        await fetchUserProgress();
    } else {
        currentUser = null;
        userProgress = {};
        userDisplay.innerText = "";
        authBtn.innerText = "Iniciar Sesión";
        adminBtn.style.display = "none";
    }
    renderTimeline();
});

const authModal = document.getElementById("auth-modal");
const authBtn = document.getElementById("auth-btn");
const closeAuthBtn = document.querySelector(".close-auth");
const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

authBtn.addEventListener("click", () => {
    if (currentUser) {
        signOut(auth);
    } else {
        authModal.style.display = "block";
    }
});

closeAuthBtn.onclick = () => authModal.style.display = "none";

tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display = "flex";
    registerForm.style.display = "none";
});

tabRegister.addEventListener("click", () => {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "flex";
    loginForm.style.display = "none";
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        authModal.style.display = "none";
        loginForm.reset();
    } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
    }
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "usuarios", user.uid), {
            email: user.email,
            role: "user",
            createdAt: new Date().toISOString()
        });

        authModal.style.display = "none";
        registerForm.reset();
    } catch (error) {
        alert("Error al crear cuenta: " + error.message);
    }
});

async function fetchUserProgress() {
    if (!currentUser) return;
    try {
        const userDocRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            userProgress = docSnap.data().progress || {};
        }
    } catch (e) {
        console.error("Error al obtener datos:", e);
    }
}

async function saveItemProgress(itemId, status, timeMark) {
    if (!currentUser) {
        alert("Inicia sesión para guardar tu progreso.");
        return;
    }
    userProgress[itemId] = { status, timeMark, updatedAt: new Date().toISOString() };
    
    try {
        await setDoc(doc(db, "usuarios", currentUser.uid), {
            email: currentUser.email,
            progress: userProgress
        }, { merge: true });
    } catch (e) {
        console.error("Error al guardar progreso:", e);
    }
}

function renderTimeline() {
    const timelineList = document.getElementById('timelineList');
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    
    timelineList.innerHTML = '';
    let currentEra = '';

    const filteredData = mcuData.filter(item => {
        const matchesType = (currentFilter === 'all') || (item.type === currentFilter);
        const matchesSearch = item.title.toLowerCase().includes(query) || item.year.toLowerCase().includes(query);
        return matchesType && matchesSearch;
    });

    if (filteredData.length === 0) {
        timelineList.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">No se encontraron resultados.</p>`;
        return;
    }

    filteredData.forEach(item => {
        if (item.era !== currentEra) {
            currentEra = item.era;
            const eraDiv = document.createElement('h2');
            eraDiv.className = 'era-header';
            eraDiv.textContent = currentEra;
            timelineList.appendChild(eraDiv);
        }

        const itemData = userProgress[item.id] || { status: "pending", timeMark: "" };
        const defaultPoster = 'https://via.placeholder.com/70x105/2a2e39/a0a5b5?text=UCM';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item';
        
        itemDiv.innerHTML = `
            <img class="poster" src="${item.poster}" alt="Póster de ${item.title}" onerror="this.src='${defaultPoster}'">
            <div class="item-content">
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <div class="year">Año: ${item.year}</div>
                    ${currentUser ? `
                        <div class="user-progress-controls">
                            <select class="status-select" data-id="${item.id}">
                                <option value="pending" ${itemData.status === 'pending' ? 'selected' : ''}>Por ver</option>
                                <option value="watching" ${itemData.status === 'watching' ? 'selected' : ''}>Viendo</option>
                                <option value="completed" ${itemData.status === 'completed' ? 'selected' : ''}>Vista</option>
                            </select>
                            <input type="text" class="time-input" data-id="${item.id}" placeholder="Tiempo (ej: 01:15:00)" value="${itemData.timeMark || ''}">
                        </div>
                    ` : ''}
                </div>
                <span class="badge badge-${item.type}">${labels[item.type] || item.type}</span>
            </div>
        `;
        timelineList.appendChild(itemDiv);
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const timeInput = document.querySelector(`.time-input[data-id="${id}"]`).value;
            saveItemProgress(id, e.target.value, timeInput);
        });
    });

    document.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.id;
            const statusSelect = document.querySelector(`.status-select[data-id="${id}"]`).value;
            saveItemProgress(id, statusSelect, e.target.value);
        });
    });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) searchInput.addEventListener('input', renderTimeline);

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTimeline();
    });
});

const adminModal = document.getElementById("admin-modal");
const adminBtn = document.getElementById("admin-panel-btn");

if (adminBtn && adminModal) {
    adminBtn.onclick = async () => {
        adminModal.style.display = "block";
        const usersContainer = document.getElementById("admin-users-list");
        usersContainer.innerHTML = "<p>Cargando registros...</p>";

        try {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            let html = "";

            querySnapshot.forEach((docSnap) => {
                const userData = docSnap.data();
                html += `
                <div style="border-bottom: 1px solid var(--border-color); padding: 12px 0;">
                    <h3 style="color: var(--accent-red);">${userData.email || 'Usuario sin correo'} <span style="font-size:0.8rem; color:var(--badge-serie);">[${userData.role || 'user'}]</span></h3>
                    <pre style="color: var(--text-muted); font-size: 0.85rem; background: #0b100d; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(userData.progress || {}, null, 2)}</pre>
                </div>`;
            });

            usersContainer.innerHTML = html || "<p>No hay datos guardados de usuarios aún.</p>";
        } catch (e) {
            usersContainer.innerHTML = `<p style="color:red;">Error al cargar datos. Revisa las reglas de Firestore.</p>`;
        }
    };
}

const closeAdminBtn = document.querySelector(".close-admin");
if (closeAdminBtn && adminModal) {
    closeAdminBtn.onclick = () => adminModal.style.display = "none";
}

window.onclick = (event) => {
    if (event.target === authModal) {
        authModal.style.display = "none";
    }
    if (event.target === adminModal) {
        adminModal.style.display = "none";
    }
};

initDoomsdayCountdown();
renderTimeline();
