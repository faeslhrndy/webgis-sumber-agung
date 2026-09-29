// =====================================================
// WEBGIS DESA SUMBER AGUNG
// PEMETAAN LAHAN DAN PERHITUNGAN KEBUTUHAN PUPUK
// =====================================================


// =====================================================
// 1. INISIALISASI PETA
// =====================================================

var map = L.map("map").setView(
    [-5.20, 105.30],
    13
);


// =====================================================
// 2. OPENSTREETMAP
// =====================================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// =====================================================
// 3. DOSIS PUPUK
// =====================================================

var dosisPupuk = {

    jagung: {
        namaPupuk: "NPK",
        dosis: 350
    },

    padi: {
        namaPupuk: "NPK",
        dosis: 250
    },

    cabai: {
        namaPupuk: "NPK",
        dosis: 450
    },

    kakao: {
        namaPupuk: "NPK Formula",
        dosis: 725
    }

};


// =====================================================
// 4. DATA LAHAN
// =====================================================

var dataLahan = [];


// =====================================================
// 5. LAYER LAHAN
// =====================================================

var layerLahan =
    L.featureGroup().addTo(map);


// =====================================================
// 6. NORMALISASI TEKS
// =====================================================

function normalisasiTeks(teks) {

    if (!teks) {
        return "";
    }

    return String(teks)
        .replace(/&nbsp;/gi, " ")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

}


// =====================================================
// 7. MENCARI KELOMPOK TANI
// =====================================================

function cariKelompok(teks) {

    var t =
        normalisasiTeks(teks);


    if (
        t.includes("sido rukun i")
    ) {
        return "Sido Rukun I";
    }


    if (
        t.includes("sido rukun ii")
    ) {
        return "Sido Rukun II";
    }


    if (
        t.includes("sido makmur iii")
    ) {
        return "Sido Makmur III";
    }


    if (
        t.includes("waringin cahyo")
    ) {
        return "Waringin Cahyo";
    }


    if (
        t.includes("sidodadi 1")
    ) {
        return "Sidodadi 1";
    }


    if (
        t.includes("barokah")
    ) {
        return "Barokah";
    }


    if (
        t.includes("sentosa")
    ) {
        return "Sentosa";
    }


    if (
        t.includes("sidomuncul") ||
        t.includes("sido muncul") ||
        t.includes("sidimuncul")
    ) {
        return "Sidomuncul";
    }


    if (
        t.includes("sido mulyo iv") ||
        t.includes("sidomulyo iv") ||
        t.includes("sid mulyo iv")
    ) {
        return "Sido Mulyo IV";
    }


    if (
        t.includes("sido mulyo ii") ||
        t.includes("sidomulyo ii")
    ) {
        return "Sido Mulyo II";
    }


    if (
        t.includes("sido mulyo i") ||
        t.includes("sidomulyo i")
    ) {
        return "Sido Mulyo I";
    }


    if (
        t.includes("sahara")
    ) {
        return "Sahara";
    }


    return "Tidak diketahui";

}


// =====================================================
// 8. MENCARI KOMODITAS
// =====================================================

function cariKomoditas(teks) {

    var t =
        normalisasiTeks(teks);


    var posisi = [];


    var padi =
        t.indexOf("padi");

    if (padi >= 0) {

        posisi.push({
            nama: "Padi",
            posisi: padi
        });

    }


    var jagung =
        t.indexOf("jagung");

    if (jagung >= 0) {

        posisi.push({
            nama: "Jagung",
            posisi: jagung
        });

    }


    var cabai =
        t.indexOf("cabai");

    var cabe =
        t.indexOf("cabe");


    if (
        cabai >= 0 ||
        cabe >= 0
    ) {

        var posisiCabai;

        if (
            cabai >= 0 &&
            cabe >= 0
        ) {

            posisiCabai =
                Math.min(
                    cabai,
                    cabe
                );

        } else {

            posisiCabai =
                cabai >= 0
                    ? cabai
                    : cabe;

        }


        posisi.push({

            nama: "Cabai",

            posisi: posisiCabai

        });

    }


    var kakao =
        t.indexOf("kakao");

    var kako =
        t.indexOf("kako");


    if (
        kakao >= 0 ||
        kako >= 0
    ) {

        var posisiKakao;

        if (
            kakao >= 0 &&
            kako >= 0
        ) {

            posisiKakao =
                Math.min(
                    kakao,
                    kako
                );

        } else {

            posisiKakao =
                kakao >= 0
                    ? kakao
                    : kako;

        }


        posisi.push({

            nama: "Kakao",

            posisi: posisiKakao

        });

    }


    if (
        posisi.length === 0
    ) {

        return "Tidak diketahui";

    }


    posisi.sort(
        function(a, b) {

            return a.posisi -
                b.posisi;

        }
    );


    return posisi[0].nama;

}


// =====================================================
// 9. MENGAMBIL DOSIS PUPUK
// =====================================================

function ambilDosis(
    komoditas
) {

    var key =
        komoditas.toLowerCase();


    if (
        dosisPupuk[key]
    ) {

        return dosisPupuk[key];

    }


    return {

        namaPupuk: "-",

        dosis: 0

    };

}


// =====================================================
// 10. MENGHITUNG LUAS POLYGON
// =====================================================

function hitungLuasPolygon(
    koordinat
) {

    if (
        !koordinat ||
        koordinat.length < 3
    ) {

        return 0;

    }


    var R = 6378137;

    var luas = 0;


    for (
        var i = 0;
        i < koordinat.length;
        i++
    ) {

        var p1 =
            koordinat[i];


        var p2 =
            koordinat[
                (i + 1) %
                koordinat.length
            ];


        var lat1 =
            p1[1] *
            Math.PI /
            180;


        var lat2 =
            p2[1] *
            Math.PI /
            180;


        var lon1 =
            p1[0] *
            Math.PI /
            180;


        var lon2 =
            p2[0] *
            Math.PI /
            180;


        luas +=
            (lon2 - lon1) *
            (
                2 +
                Math.sin(lat1) +
                Math.sin(lat2)
            );

    }


    luas =
        Math.abs(
            luas *
            R *
            R /
            2
        );


    return luas;

}


// =====================================================
// 11. MEMBERSIHKAN NAMA
// =====================================================

function bersihkanNama(
    nama
) {

    if (!nama) {

        return "Tidak diketahui";

    }


    return nama
        .trim()
        .replace(/\s+/g, " ");

}


// =====================================================
// 12. MENGAMBIL DESCRIPTION
// =====================================================

function ambilDescription(
    placemark
) {

    var node =
        placemark.getElementsByTagName(
            "description"
        )[0];


    if (!node) {

        return "";

    }


    return normalisasiTeks(
        node.textContent
    );

}


// =====================================================
// 13. MENGAMBIL NAMA
// =====================================================

function ambilNama(
    placemark
) {

    var node =
        placemark.getElementsByTagName(
            "name"
        )[0];


    if (!node) {

        return "Tidak diketahui";

    }


    return bersihkanNama(
        node.textContent
    );

}


// =====================================================
// 14. MENGAMBIL KOORDINAT
// =====================================================

function ambilKoordinat(
    node
) {

    var teks =
        node.textContent.trim();


    if (!teks) {

        return [];

    }


    var hasil = [];


    var daftar =
        teks.split(/\s+/);


    daftar.forEach(
        function(item) {

            var bagian =
                item.split(",");


            if (
                bagian.length >= 2
            ) {

                var lon =
                    parseFloat(
                        bagian[0]
                    );


                var lat =
                    parseFloat(
                        bagian[1]
                    );


                if (
                    !isNaN(lon) &&
                    !isNaN(lat)
                ) {

                    hasil.push([
                        lon,
                        lat
                    ]);

                }

            }

        }
    );


    return hasil;

}


// =====================================================
// 15. POPUP INFORMASI LAHAN
// =====================================================

function buatPopup(
    data
) {

    return `

        <div class="popup-title">
            Informasi Lahan
        </div>

        <table class="popup-table">

            <tr>
                <td>Nama</td>
                <td>${data.nama}</td>
            </tr>

            <tr>
                <td>Kelompok</td>
                <td>${data.kelompok}</td>
            </tr>

            <tr>
                <td>Komoditas</td>
                <td>${data.komoditas}</td>
            </tr>

            <tr>
                <td>Luas</td>
                <td>
                    ${data.luasHa.toFixed(3)}
                    Ha
                </td>
            </tr>

            <tr>
                <td>Pupuk</td>
                <td>
                    ${data.namaPupuk}
                </td>
            </tr>

            <tr>
                <td>Dosis</td>
                <td>
                    ${data.dosis}
                    Kg/Ha
                </td>
            </tr>

            <tr>
                <td>Kebutuhan</td>
                <td>
                    ${data.kebutuhanPupuk.toFixed(2)}
                    Kg
                </td>
            </tr>

        </table>

    `;

}


// =====================================================
// 16. MEMBUAT POLYGON
// =====================================================

function buatPolygon(
    koordinat
) {

    var latlngs = [];


    koordinat.forEach(
        function(item) {

            latlngs.push([
                item[1],
                item[0]
            ]);

        }
    );


    return L.polygon(
        latlngs,
        {

            color: "#176b3a",

            weight: 2,

            fillColor: "#4caf50",

            fillOpacity: 0.45

        }
    );

}


// =====================================================
// 17. MEMPROSES POLYGON
// =====================================================

function prosesPolygon(
    placemark,
    polygonNode
) {

    var koordinatNode =
        polygonNode.getElementsByTagName(
            "coordinates"
        )[0];


    if (!koordinatNode) {

        return;

    }


    var koordinat =
        ambilKoordinat(
            koordinatNode
        );


    if (
        koordinat.length < 3
    ) {

        return;

    }


    var nama =
        ambilNama(
            placemark
        );


    var description =
        ambilDescription(
            placemark
        );


    var semuaData =
        nama +
        " " +
        description;


    var kelompok =
        cariKelompok(
            semuaData
        );


    var komoditas =
        cariKomoditas(
            description +
            " " +
            nama
        );


    var luasM2 =
        hitungLuasPolygon(
            koordinat
        );


    var luasHa =
        luasM2 / 10000;


    var infoPupuk =
        ambilDosis(
            komoditas
        );


    var kebutuhanPupuk =
        luasHa *
        infoPupuk.dosis;


    var polygon =
        buatPolygon(
            koordinat
        );


    polygon.addTo(
        layerLahan
    );


    polygon.on(
        "mouseover",
        function() {

            polygon.setStyle({

                weight: 4,

                fillOpacity: 0.7

            });

        }
    );


    polygon.on(
        "mouseout",
        function() {

            polygon.setStyle({

                color: "#176b3a",

                weight: 2,

                fillColor: "#4caf50",

                fillOpacity: 0.45

            });

        }
    );


    var data = {

        layer: polygon,

        nama: nama,

        kelompok: kelompok,

        komoditas: komoditas,

        luasM2: luasM2,

        luasHa: luasHa,

        namaPupuk:
            infoPupuk.namaPupuk,

        dosis:
            infoPupuk.dosis,

        kebutuhanPupuk:
            kebutuhanPupuk

    };


    dataLahan.push(
        data
    );


    polygon.bindPopup(
        buatPopup(data)
    );

}


// =====================================================
// 18. MEMPROSES LINESTRING
// =====================================================

function prosesLineString(
    placemark,
    lineNode
) {

    var koordinatNode =
        lineNode.getElementsByTagName(
            "coordinates"
        )[0];


    if (!koordinatNode) {

        return;

    }


    var koordinat =
        ambilKoordinat(
            koordinatNode
        );


    if (
        koordinat.length < 2
    ) {

        return;

    }


    var latlngs = [];


    koordinat.forEach(
        function(item) {

            latlngs.push([
                item[1],
                item[0]
            ]);

        }
    );


    L.polyline(
        latlngs,
        {

            color: "#555",

            weight: 3

        }
    ).addTo(map);

}


// =====================================================
// 19. MEMBACA FILE KML
// =====================================================

function bacaKML() {


    // ==========================================
    // NAMA FILE KML
    // ==========================================

    var namaFile =
        "data/lahan.kml";


    console.log(
        "Membaca file:",
        namaFile
    );


    fetch(
        namaFile
    )


    .then(
        function(response) {


            if (
                !response.ok
            ) {

                throw new Error(
                    "File KML tidak ditemukan. Status: " +
                    response.status
                );

            }


            return response.text();

        }
    )


    .then(
        function(teksKML) {


            console.log(
                "File KML berhasil dimuat."
            );


            var parser =
                new DOMParser();


            var xml =
                parser.parseFromString(
                    teksKML,
                    "text/xml"
                );


            var errorXML =
                xml.getElementsByTagName(
                    "parsererror"
                );


            if (
                errorXML.length > 0
            ) {

                throw new Error(
                    "Format KML tidak dapat dibaca."
                );

            }


            var placemarks =
                xml.getElementsByTagName(
                    "Placemark"
                );


            console.log(
                "Jumlah Placemark:",
                placemarks.length
            );


            if (
                placemarks.length === 0
            ) {

                throw new Error(
                    "Tidak ditemukan Placemark di dalam KML."
                );

            }


            // ======================================
            // PROSES SEMUA PLACEMARK
            // ======================================

            for (
                var i = 0;
                i < placemarks.length;
                i++
            ) {


                var placemark =
                    placemarks[i];


                // Polygon
                var polygons =
                    placemark.getElementsByTagName(
                        "Polygon"
                    );


                for (
                    var j = 0;
                    j < polygons.length;
                    j++
                ) {

                    prosesPolygon(
                        placemark,
                        polygons[j]
                    );

                }


                // LineString
                var lines =
                    placemark.getElementsByTagName(
                        "LineString"
                    );


                for (
                    var k = 0;
                    k < lines.length;
                    k++
                ) {

                    prosesLineString(
                        placemark,
                        lines[k]
                    );

                }

            }


            console.log(
                "Jumlah polygon berhasil diproses:",
                dataLahan.length
            );


            // ======================================
            // FILTER
            // ======================================

            isiFilter();


            // ======================================
            // DASHBOARD
            // ======================================

            updateDashboard();


            // ======================================
            // ZOOM KE SELURUH LAHAN
            // ======================================

            var bounds =
                layerLahan.getBounds();


            if (
                bounds.isValid()
            ) {

                map.fitBounds(
                    bounds
                );

            }


        }
    )


    .catch(
        function(error) {


            console.error(
                "ERROR KML:",
                error
            );


            alert(
                "KML tidak dapat dibaca.\n\n" +
                error.message
            );

        }
    );

}


// =====================================================
// 20. MENGISI FILTER
// =====================================================

function isiFilter() {


    var selectKelompok =
        document.getElementById(
            "filterKelompok"
        );


    var selectKomoditas =
        document.getElementById(
            "filterKomoditas"
        );


    var kelompokSet =
        new Set();


    var komoditasSet =
        new Set();


    dataLahan.forEach(
        function(item) {


            if (
                item.kelompok !==
                "Tidak diketahui"
            ) {

                kelompokSet.add(
                    item.kelompok
                );

            }


            if (
                item.komoditas !==
                "Tidak diketahui"
            ) {

                komoditasSet.add(
                    item.komoditas
                );

            }

        }
    );


    Array.from(
        kelompokSet
    )
    .sort()
    .forEach(
        function(kelompok) {


            var option =
                document.createElement(
                    "option"
                );


            option.value =
                kelompok;


            option.textContent =
                kelompok;


            selectKelompok.appendChild(
                option
            );

        }
    );


    Array.from(
        komoditasSet
    )
    .sort()
    .forEach(
        function(komoditas) {


            var option =
                document.createElement(
                    "option"
                );


            option.value =
                komoditas;


            option.textContent =
                komoditas;


            selectKomoditas.appendChild(
                option
            );

        }
    );

}


// =====================================================
// 21. FILTER DATA
// =====================================================

function filterData() {


    var kelompok =
        document.getElementById(
            "filterKelompok"
        ).value;


    var komoditas =
        document.getElementById(
            "filterKomoditas"
        ).value;


    var hasil = [];


    dataLahan.forEach(
        function(item) {


            var cocokKelompok =

                kelompok === "semua" ||

                item.kelompok ===
                kelompok;


            var cocokKomoditas =

                komoditas === "semua" ||

                item.komoditas ===
                komoditas;


            if (
                cocokKelompok &&
                cocokKomoditas
            ) {


                hasil.push(
                    item
                );


                if (
                    !map.hasLayer(
                        item.layer
                    )
                ) {

                    map.addLayer(
                        item.layer
                    );

                }

            } else {


                if (
                    map.hasLayer(
                        item.layer
                    )
                ) {

                    map.removeLayer(
                        item.layer
                    );

                }

            }

        }
    );


    updateDashboard(
        hasil
    );

}


// =====================================================
// 22. EVENT FILTER
// =====================================================

document
    .getElementById(
        "filterKelompok"
    )
    .addEventListener(
        "change",
        filterData
    );


document
    .getElementById(
        "filterKomoditas"
    )
    .addEventListener(
        "change",
        filterData
    );


// =====================================================
// 23. RESET FILTER
// =====================================================

document
    .getElementById(
        "btnReset"
    )
    .addEventListener(
        "click",
        function() {


            document.getElementById(
                "filterKelompok"
            ).value =
                "semua";


            document.getElementById(
                "filterKomoditas"
            ).value =
                "semua";


            dataLahan.forEach(
                function(item) {


                    if (
                        !map.hasLayer(
                            item.layer
                        )
                    ) {

                        map.addLayer(
                            item.layer
                        );

                    }

                }
            );


            updateDashboard();

        }
    );


// =====================================================
// 24. UPDATE DASHBOARD
// =====================================================

function updateDashboard(
    data
) {


    if (
        !data
    ) {

        data =
            dataLahan;

    }


    var totalLahan =
        data.length;


    var totalLuas =
        0;


    var totalPupuk =
        0;


    data.forEach(
        function(item) {


            totalLuas +=
                item.luasHa;


            totalPupuk +=
                item.kebutuhanPupuk;

        }
    );


    document.getElementById(
        "totalLahan"
    ).textContent =
        totalLahan;


    document.getElementById(
        "totalLuas"
    ).textContent =
        totalLuas.toFixed(2);


    document.getElementById(
        "totalPupuk"
    ).textContent =
        totalPupuk.toFixed(2);


    buatTabelKomoditas(
        data
    );


    buatTabelKelompok(
        data
    );

}


// =====================================================
// 25. TABEL KOMODITAS
// =====================================================

function buatTabelKomoditas(
    data
) {


    var tbody =
        document.getElementById(
            "tabelKomoditas"
        );


    tbody.innerHTML = "";


    var rekap = {};


    data.forEach(
        function(item) {


            var key =
                item.komoditas;


            if (
                !rekap[key]
            ) {


                rekap[key] = {

                    jumlah: 0,

                    luas: 0,

                    dosis:
                        item.dosis,

                    pupuk: 0

                };

            }


            rekap[key].jumlah++;


            rekap[key].luas +=
                item.luasHa;


            rekap[key].pupuk +=
                item.kebutuhanPupuk;

        }
    );


    var nomor = 1;


    Object.keys(
        rekap
    )
    .sort()
    .forEach(
        function(komoditas) {


            var item =
                rekap[komoditas];


            var row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${nomor}
                </td>

                <td>
                    ${komoditas}
                </td>

                <td>
                    ${item.jumlah}
                </td>

                <td>
                    ${item.luas.toFixed(2)}
                </td>

                <td>
                    ${item.dosis}
                </td>

                <td>
                    ${item.pupuk.toFixed(2)}
                </td>

            `;


            tbody.appendChild(
                row
            );


            nomor++;

        }
    );

}


// =====================================================
// 26. TABEL KELOMPOK
// =====================================================

function buatTabelKelompok(
    data
) {


    var tbody =
        document.getElementById(
            "tabelKelompok"
        );


    tbody.innerHTML = "";


    var rekap = {};


    data.forEach(
        function(item) {


            var key =
                item.kelompok;


            if (
                !rekap[key]
            ) {


                rekap[key] = {

                    jumlah: 0,

                    luas: 0,

                    pupuk: 0

                };

            }


            rekap[key].jumlah++;


            rekap[key].luas +=
                item.luasHa;


            rekap[key].pupuk +=
                item.kebutuhanPupuk;

        }
    );


    var nomor = 1;


    Object.keys(
        rekap
    )
    .sort()
    .forEach(
        function(kelompok) {


            var item =
                rekap[kelompok];


            var row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${nomor}
                </td>

                <td>
                    ${kelompok}
                </td>

                <td>
                    ${item.jumlah}
                </td>

                <td>
                    ${item.luas.toFixed(2)}
                </td>

                <td>
                    ${item.pupuk.toFixed(2)}
                </td>

            `;


            tbody.appendChild(
                row
            );


            nomor++;

        }
    );

}


// =====================================================
// 27. JALANKAN PROGRAM
// =====================================================

bacaKML();