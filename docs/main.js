
// https://www.arbeit-wirtschaft.at/vergangene-steuerreformen-auf-einen-blick/3/
const taxBuckets = [
    {
        year: 2005,
        buckets: [
            { upperLimit:    10000, taxRate:  0.0 },
            { upperLimit:    25000, taxRate: 38.5 },
            { upperLimit:    50000, taxRate: 43.596 },
            { upperLimit: Infinity, taxRate: 50.0 }
        ]
    },
    {
        year: 2010,
        buckets: [
            { upperLimit:    11000, taxRate:  0.0 },
            { upperLimit:    25000, taxRate: 36.5 },
            { upperLimit:    60000, taxRate: 43.21 },
            { upperLimit: Infinity, taxRate: 50.0 }
        ]
    },
    {
        year: 2016,
        buckets: [
            { upperLimit:    11000, taxRate:  0.0 },
            { upperLimit:    18000, taxRate: 25.0 },
            { upperLimit:    31000, taxRate: 35.0 },
            { upperLimit:    60000, taxRate: 42.0 },
            { upperLimit:    90000, taxRate: 48.0 },
            { upperLimit:  1000000, taxRate: 50.0 },
            { upperLimit: Infinity, taxRate: 55.0 }
        ]
    },
    {
        year: 2020,
        buckets: [
            { upperLimit:    11000, taxRate:  0.0 },
            { upperLimit:    18000, taxRate: 20.0 },
            { upperLimit:    31000, taxRate: 35.0 },
            { upperLimit:    60000, taxRate: 42.0 },
            { upperLimit:    90000, taxRate: 48.0 },
            { upperLimit:  1000000, taxRate: 50.0 },
            { upperLimit: Infinity, taxRate: 55.0 }
        ]
    },
    {
        year: 2022,
        buckets: [
            { upperLimit:    11000, taxRate:  0.0 },
            { upperLimit:    18000, taxRate: 20.0 },
            { upperLimit:    31000, taxRate: 30.0 },
            { upperLimit:    60000, taxRate: 42.0 },
            { upperLimit:    90000, taxRate: 48.0 },
            { upperLimit:  1000000, taxRate: 50.0 },
            { upperLimit: Infinity, taxRate: 55.0 }
        ]
    },
    {
        year: 2023,
        buckets: [
            { upperLimit:    11000, taxRate:  0.0 },
            { upperLimit:    18000, taxRate: 20.0 },
            { upperLimit:    31000, taxRate: 30.0 },
            { upperLimit:    60000, taxRate: 40.0 },
            { upperLimit:    90000, taxRate: 48.0 },
            { upperLimit:  1000000, taxRate: 50.0 },
            { upperLimit: Infinity, taxRate: 55.0 }
        ]
    }
];

// https://www.inflation.eu/de/inflationsraten/osterreich/historische-inflation/vpi-inflation-osterreich.aspx
const inflation = [

    { year: 2005, rate: 1.40 },
    { year: 2006, rate: 1.49 },
    { year: 2007, rate: 3.63 },
    { year: 2008, rate: 1.32 },
    { year: 2009, rate: 1.03 },

    { year: 2010, rate: 2.31 },
    { year: 2011, rate: 3.17 },
    { year: 2012, rate: 2.78 },
    { year: 2013, rate: 1.87 },
    { year: 2014, rate: 1.01 },
    { year: 2015, rate: 1.01 },

    { year: 2016, rate: 1.39 },
    { year: 2017, rate: 2.15 },
    { year: 2018, rate: 1.92 },
    { year: 2019, rate: 1.69 },
    { year: 2020, rate: 1.14 },
    { year: 2021, rate: 2.20 },
    // prediction WIFO
    // https://de.statista.com/statistik/daten/studie/290144/umfrage/prognosen-zur-entwicklung-der-inflationsrate-in-oesterreich/
    { year: 2022, rate: 2.00 },
    { year: 2023, rate: 1.90 },
    { year: 2024, rate: 1.80 },
    { year: 2025, rate: 1.70 }
];

function initTaxBucketLowerLimits() {
    for (let i = 0; i < taxBuckets.length; i++) {
        const buckets = taxBuckets[i].buckets;
        for (let j = 0; j < buckets.length; j++) {
            buckets[j].lowerLimit = j == 0 ? 0 : buckets[j - 1].upperLimit;
        }
    }
}
initTaxBucketLowerLimits();

function getTaxBuckets(year) {
    for (let i = taxBuckets.length - 1; i >= 0; i--) {
        if (year >= taxBuckets[i].year) {
            return taxBuckets[i].buckets;
        }
    }
}

function calculateTotalTaxes(buckets, beforeTaxes) {
    let totalTax = 0;
    for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i];
        const contribution = Math.min(beforeTaxes, bucket.upperLimit - bucket.lowerLimit);
        totalTax += contribution * bucket.taxRate / 100;
        beforeTaxes -= contribution;
    }
    return totalTax;
}

function getTotalInflationInternal(from, to) {
    let result = 1;
    for (let i = 0; i < inflation.length; i++) {
        if (from <= inflation[i].year && inflation[i].year < to) {
            result *= (1 + inflation[i].rate / 100)
        }
    }
    return result;
}

function getTotalInflation(from, to) {
    if (from <= to) {
        return getTotalInflationInternal(from, to);
    }
    return 1 / getTotalInflationInternal(to, from);
}

function appendBuckets(sb, taxBuckets) {
    sb += "<h3>Ab " +  taxBuckets.year + "</h3>";
    sb += "<table>";
    sb += "<thead>";
    sb += "<tr>";
    sb += "<th>Von</th>";
    sb += "<th>Bis</th>";
    sb += "<th>Grenzsteuersatz</th>";
    sb += "</tr>";
    sb += "</thead>";
    sb += "<tbody>";
    const buckets = taxBuckets.buckets; 
    for (let j = 0; j < buckets.length; j++) {
        let bucket = buckets[j];
        sb += "<tr>";
        sb += "<td>" + Math.round(bucket.lowerLimit) +" €</td>";
        if (bucket.upperLimit != Infinity) {
            sb += "<td>" + Math.round(bucket.upperLimit) + " €</td>";
        } else {
            sb += "<td>-</td>";
        }            
        sb += "<td>"+bucket.taxRate+" %</td>";
        sb += "</tr>";
    }
    sb += "</tbody>";
    sb += "</table>";
    sb += "";
    return sb;
}

function appendCustomEditableBuckets(sb, taxBuckets) {
    sb += "<h3>Neue Steuerreform</h3>";
    sb += "Jahr: <input type=\"text\" value=\"" + taxBuckets.year + "\" maxlength=\"4\"></input><br><br>";
    sb += "<table>";
    sb += "<thead>";
    sb += "<tr>";
    sb += "<th>Von</th>";
    sb += "<th>Bis</th>";
    sb += "<th>Grenzsteuersatz</th>";
    sb += "</tr>";
    sb += "</thead>";
    sb += "<tbody>";
    const buckets = taxBuckets.buckets; 
    for (let j = 0; j < buckets.length; j++) {
        let bucket = buckets[j];
        sb += "<tr>";
        const upperLimit = bucket.upperLimit == Infinity ? "" : bucket.upperLimit
        sb += "<td><input class=\"r\" type=\"text\" value=\"" + bucket.lowerLimit + "\" maxlength=\"7\" size=\"7\"></input> €</td>";
        sb += "<td><input class=\"r\" type=\"text\" value=\"" + upperLimit + "\" maxlength=\"7\" size=\"7\"></input> €</td>";
        sb += "<td><input class=\"r\" type=\"text\" value=\"" + bucket.taxRate + "\" maxlength=\"7\" size=\"7\"></input> %</td>";
        sb += "</tr>";
    }
    sb += "</tbody>";
    sb += "</table>";
    sb += "";
    return sb;
}

function showTaxInfo() {    
    var sb = "";
    for (let i = taxBuckets.length - 1; i >= 0; i--) {
        if (taxBuckets[i].custom) {
            sb = appendCustomEditableBuckets(sb, taxBuckets[i]);
        } else {
            sb = appendBuckets(sb, taxBuckets[i]);
        }        
    }
    const targetContainer = document.getElementById('tax_info');
    targetContainer.innerHTML = sb;
}

function createNewTaxBuckets() {
    document.getElementById("newTaxBuckets").style.display = "none";
    const eurusd = 1.16;
    taxBuckets.push(
        {
            // TODO editing does not yet work
            //custom: true,
            year: 2024,
            buckets: [
                { upperLimit:    16000, taxRate:  0.0 },
                { upperLimit:    31000, taxRate: 35.0 },
                { upperLimit:    60000, taxRate: 40.0 },
                { upperLimit:    90000, taxRate: 48.0 },
                { upperLimit:   200000, taxRate: 50.0 },
                { upperLimit:   400000, taxRate: 53.0 },
                { upperLimit:   800000, taxRate: 56.0 },
                { upperLimit: Infinity, taxRate: 59.0 }
            ]
        }
    );
    initTaxBucketLowerLimits();
    updateCharts();
}

function plotInflation(yearFrom, yearTo) {
    const x = [];
    const y = [];

    for (let year = yearFrom; year <= yearTo; year++) {
        const inflation = (getTotalInflation(yearFrom, year) - 1) * 100;
        x.push(year);
        y.push(inflation);
    }

    Plotly.newPlot(
        document.getElementById('chart_inflation'), 
        [
            {
                x: x,
                y: y
            }
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Jahr' },
            yaxis: { title: 'Gesamtinflation (%)' }
        }
    );
}

function createSeriesChangesPerIncome(title, minBeforeTaxes, maxBeforeTaxes, yearFrom, yearTo, showInflationBetweenFromAndTo, adjustToYear, yearBase, relativeToIncome) {
    let bucketsFrom = getTaxBuckets(yearFrom);
    const bucketsTo = getTaxBuckets(yearTo);   
    const inflationFromTo = getTotalInflation(yearFrom, yearTo);
    const inflationToBase = getTotalInflation(yearTo, yearBase);
    const x = [];
    const y = [];
    for (let beforeTaxes = minBeforeTaxes; beforeTaxes <= maxBeforeTaxes; beforeTaxes += 1000) {
        let beforeTaxesFrom = beforeTaxes;
        let beforeTaxesTo = beforeTaxes;
        if (showInflationBetweenFromAndTo) {
            beforeTaxesFrom = beforeTaxesFrom / inflationFromTo;
        } 
        if (adjustToYear) {
            beforeTaxesFrom = beforeTaxesFrom / inflationToBase;
            beforeTaxesTo = beforeTaxesTo / inflationToBase;
        }
        let totalTaxesTo = calculateTotalTaxes(bucketsTo, beforeTaxesTo);
        let totalTaxesFrom = calculateTotalTaxes(bucketsFrom, beforeTaxesFrom);
        if (showInflationBetweenFromAndTo) {
            totalTaxesFrom = totalTaxesFrom * inflationFromTo;
        }
        if (adjustToYear) {
            totalTaxesTo = totalTaxesTo * inflationToBase;
            totalTaxesFrom = totalTaxesFrom * inflationToBase;
        }
        x.push(beforeTaxes);
        const changeAbs = totalTaxesFrom - totalTaxesTo;
        if (relativeToIncome) {
            y.push(changeAbs * 100 / beforeTaxes);
        } else {
            y.push(changeAbs);
        }
        
    }
    return {
        name: title,
        x: x,
        y: y 
    }
}


function calcTaxes(year, yearBase, beforeTaxesAtBase, showInflation) {
    const buckets = getTaxBuckets(year);
    const inflation = getTotalInflation(year, yearBase);

    let beforeTaxes = beforeTaxesAtBase;
    if (showInflation) {
        beforeTaxes /= inflation; 
    }
    let totalTaxes = calculateTotalTaxes(buckets, beforeTaxes);
    if (showInflation) {
        totalTaxes *= inflation;
    }
    return totalTaxes;
}

function plotChangesOverTime(targetId, minBeforeTaxes, maxBeforeTaxes, yearFrom, yearTo, yearBase, showInflation, relativeToIncome) {
    const data = [];

    minBeforeTaxes = Math.max(10000, minBeforeTaxes)
    for (let i = 0; i <= 9; i++) {
        let beforeTaxes = minBeforeTaxes + (maxBeforeTaxes - minBeforeTaxes) * i / 9;
        const x = [];
        const y = [];
        const totalTaxesForStart = calcTaxes(yearFrom, yearBase, beforeTaxes, showInflation);
        for (let year = yearFrom; year <= yearTo; year++) {
            const totalTaxesForYear = calcTaxes(year, yearBase, beforeTaxes, showInflation);
    
            x.push(year);
            const absChange = totalTaxesForStart - totalTaxesForYear;
            y.push(relativeToIncome ? absChange * 100 / beforeTaxes : absChange);
            
        }
        data.push({
            name: Math.round(beforeTaxes),
            x: x,
            y: y
        });
    }
    
    let targetElement = document.getElementById(targetId);
    Plotly.newPlot(
        targetElement, 
        data, 
        {
            margin: { t: 20 },
            xaxis: { title: 'Jahr' },
            yaxis: { title: relativeToIncome ? 'Entlastung (%)' : 'Entlastung' }
        }
    );
}

function plotEffictiveTaxRatePerIncome(targetId, minBeforeTaxes, maxBeforeTaxes, yearFrom, yearTo, yearBase, showInflation) {
    const data = [];
    minBeforeTaxes = Math.max(10000, minBeforeTaxes)
    for (let i = 0; i <= 9; i++) {
        let beforeTaxes = minBeforeTaxes + (maxBeforeTaxes - minBeforeTaxes) * i / 9;
        const x = [];
        const y = [];
        for (let year = yearFrom; year <= yearTo; year++) {
            const totalTaxesForYear = calcTaxes(year, yearBase, beforeTaxes, showInflation);
            x.push(year);
            y.push(totalTaxesForYear * 100 / beforeTaxes);
        }
        data.push({
            name: Math.round(beforeTaxes),
            x: x,
            y: y
        });
    }
    
    let targetElement = document.getElementById(targetId);
    Plotly.newPlot(
        targetElement, 
        data, 
        {
            margin: { t: 20 },
            xaxis: { title: 'Jahr' },
            yaxis: { title: 'Effektive Lohnsteuer (%)' }
        }
    );
}

function calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, year, yearBase) {
    const x = [];
    const y = [];
    for (let beforeTaxes = minBeforeTaxes; beforeTaxes <= maxBeforeTaxes; beforeTaxes += 1000) {
        const inflation = getTotalInflation(year, yearBase); 
        x.push(beforeTaxes);
        const taxes = calcTaxes(year, yearBase, beforeTaxes, true);
        y.push(100 * taxes / beforeTaxes);       
    }
    return {
        name: year,
        x: x,
        y: y
    };
}



function updateCharts() {
    const minBeforeTaxes = parseInt(document.getElementById("minBeforeTaxes").value);
    const maxBeforeTaxes = parseInt(document.getElementById("maxBeforeTaxes").value);    

    showTaxInfo();
    plotInflation(2005, 2025);

    // in nominal terms

    Plotly.newPlot(
        document.getElementById('chart_reformen'), 
        [
            createSeriesChangesPerIncome("Steuerreform 2010", minBeforeTaxes, maxBeforeTaxes, 2009, 2010, false, false),
            createSeriesChangesPerIncome("Steuerreform 2016", minBeforeTaxes, maxBeforeTaxes, 2015, 2016, false, false),
            createSeriesChangesPerIncome("Steuerreform 2020+22+23", minBeforeTaxes, maxBeforeTaxes, 2019, 2023, false, false)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung' }
        } 
    );
    
    Plotly.newPlot(
        document.getElementById('chart_reformen_2022euro'), 
        [
            createSeriesChangesPerIncome("Steuerreform 2010", minBeforeTaxes, maxBeforeTaxes, 2009, 2010, false, true, 2022),
            createSeriesChangesPerIncome("Steuerreform 2016", minBeforeTaxes, maxBeforeTaxes, 2015, 2016, false, true, 2022),
            createSeriesChangesPerIncome("Steuerreform 2020+22+23", minBeforeTaxes, maxBeforeTaxes, 2019, 2023, false, true, 2022)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung' }
        } 
    );
    
    plotChangesOverTime('chart_changes', minBeforeTaxes, maxBeforeTaxes, 2005, 2025, 2022, false);
    

    // in real terms

    Plotly.newPlot(
        document.getElementById('chart_real_reformen'), 
        [
            createSeriesChangesPerIncome("2010 vs 2005", minBeforeTaxes, maxBeforeTaxes, 2005, 2010, true, false),
            createSeriesChangesPerIncome("2016 vs 2010", minBeforeTaxes, maxBeforeTaxes, 2010, 2016, true, false),
            createSeriesChangesPerIncome("2023 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2023, true, false)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung' }
        } 
    );
    
    Plotly.newPlot(
        document.getElementById('chart_real_reformen_2022euro'), 
        [
            createSeriesChangesPerIncome("2010 vs 2005", minBeforeTaxes, maxBeforeTaxes, 2005, 2010, true, true, 2022),
            createSeriesChangesPerIncome("2016 vs 2010", minBeforeTaxes, maxBeforeTaxes, 2010, 2016, true, true, 2022),
            createSeriesChangesPerIncome("2023 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2023, true, true, 2022),
            createSeriesChangesPerIncome("2025 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2025, true, true, 2022)
        ],
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung' }
        } 
    );    
    
    plotChangesOverTime('chart_real_changes', minBeforeTaxes, maxBeforeTaxes, 2005, 2025, 2022, true);

    
    // in relative terms

    Plotly.newPlot(
        document.getElementById('chart_real_relative_reformen'), 
        [
            createSeriesChangesPerIncome("2010 vs 2005", minBeforeTaxes, maxBeforeTaxes, 2005, 2010, true, false, -1, true),
            createSeriesChangesPerIncome("2016 vs 2010", minBeforeTaxes, maxBeforeTaxes, 2010, 2016, true, false, -1, true),
            createSeriesChangesPerIncome("2023 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2023, true, false, -1, true)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung (%)' }
        } 
    );

    Plotly.newPlot(
        document.getElementById('chart_real_relative_reformen_2022euro'), 
        [
            createSeriesChangesPerIncome("2010 vs 2005", minBeforeTaxes, maxBeforeTaxes, 2005, 2010, true, true, 2022, true),
            createSeriesChangesPerIncome("2016 vs 2010", minBeforeTaxes, maxBeforeTaxes, 2010, 2016, true, true, 2022, true),
            createSeriesChangesPerIncome("2023 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2023, true, true, 2022, true)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung (%)' }
        } 
    );

    Plotly.newPlot(
        document.getElementById('chart_real_relative_reformen_akk_2022euro'), 
        [
            createSeriesChangesPerIncome("2023 vs 2016", minBeforeTaxes, maxBeforeTaxes, 2016, 2023, true, true, 2022, true),
            createSeriesChangesPerIncome("2023 vs 2010", minBeforeTaxes, maxBeforeTaxes, 2010, 2023, true, true, 2022, true),
            createSeriesChangesPerIncome("2023 vs 2005", minBeforeTaxes, maxBeforeTaxes, 2005, 2023, true, true, 2022, true)
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Entlastung (%)' }
        } 
    );
    
    plotChangesOverTime('chart_real_relative_changes', minBeforeTaxes, maxBeforeTaxes, 2005, 2025, 2022, true, true);
    

    // effective tax rate

    plotEffictiveTaxRatePerIncome('chart_effective_tax_rate_per_year', minBeforeTaxes, maxBeforeTaxes, 2005, 2025, 2022, false);
    plotEffictiveTaxRatePerIncome('chart_real_effective_tax_rate_per_year', minBeforeTaxes, maxBeforeTaxes, 2005, 2025, 2022, true);
        
    Plotly.newPlot(
        document.getElementById('chart_real_effective_tax_rate_per_income'), 
        [
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2025, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2023, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2019, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2016, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2015, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2010, 2022),
            calcTaxRatePerIncome(minBeforeTaxes, maxBeforeTaxes, 2009, 2022),
        ], 
        {
            margin: { t: 20 },
            xaxis: { title: 'Bemessungsgrundlage' },
            yaxis: { title: 'Effektive Lohnsteuer (%)' }
        } 
    );


}

updateCharts();