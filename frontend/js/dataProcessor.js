class DataProcessor {
    constructor() {
        this.charts = {};
        // Define the bins exactly as they appear in your training data
        this.timingBins = {
            pp: [
                "[-1110000,-520733]",
                "[-520733,68533]",
                "[68533,657800]",
                "[657800,964580]",
                "[964580,1271360]",
                "[1271360,1578140]",
                "[1578140,1884920]",
                "[1884920,2191700]",
                "[2191700,2498480]",
                "[2498480,2805260]",
                "[2805260,3112040]",
                "[3112040,3418820]",
                "[3418820,3725600]",
                "[3725600,21683733]",
                "[21683733,39641867]",
                "[39641867,57600000]"
            ],
            rr: [
                "[-1340000,-666600]",
                "[-666600,6800]",
                "[6800,680200]",
                "[680200,985220]",
                "[985220,1290240]",
                "[1290240,1595260]",
                "[1595260,1900280]",
                "[1900280,2205300]",
                "[2205300,2510320]",
                "[2510320,2815340]",
                "[2815340,3120360]",
                "[3120360,3425380]",
                "[3425380,3730400]",
                "[3730400,21526933]",
                "[21526933,39323467]",
                "[39323467,57120000]"
            ],
            rp: [
                "[-720000,-304733]",
                "[-304733,110533]",
                "[110533,525800]",
                "[525800,834380]",
                "[834380,1142960]",
                "[1142960,1451540]",
                "[1451540,1760120]",
                "[1760120,2068700]",
                "[2068700,2377280]",
                "[2377280,2685860]",
                "[2685860,2994440]",
                "[2994440,3303020]",
                "[3303020,3611600]",
                "[3611600,21844400]",
                "[21844400,40077200]",
                "[40077200,58310000]"
            ],
            pr: [
                "[-1880000,-779867]",
                "[-779867,320267]",
                "[320267,1420400]",
                "[1420400,1725440]",
                "[1725440,2030480]",
                "[2030480,2335520]",
                "[2335520,2640560]",
                "[2640560,2945600]",
                "[2945600,3250640]",
                "[3250640,3555680]",
                "[3555680,3860720]",
                "[3860720,4165760]",
                "[4165760,4470800]",
                "[4470800,22257200]",
                "[22257200,40043600]",
                "[40043600,57830000]"
            ]
        };
    }

    initializeCharts() {
        const chartConfigs = {
            pp: { title: 'Press-to-Press Timings', color: '#2563eb' },
            pr: { title: 'Press-to-Release Timings', color: '#16a34a' },
            rr: { title: 'Release-to-Release Timings', color: '#dc2626' },
            rp: { title: 'Release-to-Press Timings', color: '#9333ea' }
        };

        Object.entries(chartConfigs).forEach(([type, config]) => {
            const canvas = document.getElementById(`chart-${type}`);
            if (!canvas) return;

            // Destroy existing chart if it exists
            if (this.charts[type]) {
                this.charts[type].destroy();
            }

            this.charts[type] = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: config.title,
                        data: [],
                        borderColor: config.color,
                        backgroundColor: `${config.color}33`,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 750,
                        easing: 'easeInOutQuart'
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Keystroke Sequence'
                            },
                            grid: {
                                color: '#e2e8f0'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        });
    }

    updateCharts(keystrokeData) {
        Object.entries(keystrokeData).forEach(([type, data]) => {
            const chart = this.charts[type];
            if (!chart) return;

            const labels = Array.from({ length: data.length }, (_, i) => i + 1);
            
            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            
            // Ensure proper animation
            chart.options.animation = {
                duration: 750,
                easing: 'easeInOutQuart'
            };
            
            chart.update('active');
        });
    }

    processTimingData(timings) {
        return {
            averages: {
                pp: this.calculateAverage(timings.pp),
                pr: this.calculateAverage(timings.pr),
                rr: this.calculateAverage(timings.rr),
                rp: this.calculateAverage(timings.rp)
            },
            consistency: this.calculateConsistency(timings)
        };
    }

    calculateAverage(array) {
        if (!array || array.length === 0) return 0;
        return array.reduce((a, b) => a + b, 0) / array.length;
    }

    calculateConsistency(timings) {
        const allTimings = [...timings.pp, ...timings.pr, ...timings.rr, ...timings.rp];
        const avg = this.calculateAverage(allTimings);
        const variance = allTimings.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / allTimings.length;
        return Math.sqrt(variance);
    }

    clearCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update();
        });
    }

    /**
     * Transform raw timing data into the binned histogram format expected by the ML model
     * @param {Object} timingData - Raw keystroke timing data
     * @returns {Object} - Binned histogram data ready for the ML model
     */
    transformToModelFormat(timingData) {
        const result = {};
        
        // Process each timing type (pp, rr, rp, pr)
        Object.entries(timingData).forEach(([type, timings]) => {
            // Convert raw timings to histogram bins
            const histogram = this.createHistogram(timings, this.timingBins[type]);
            
            // Add each bin count to the result with proper key formatting
            Object.entries(histogram).forEach(([bin, count]) => {
                // Format key as in the training data (e.g., "ppTime_[-1110000,-520733]")
                const key = `${type}Time_${bin}`;
                result[key] = count;
            });
            
            // Add the END value (placeholder for now, might need adjustment)
            result[`${type}Time_END`] = 0;
        });
        
        return result;
    }

    /**
     * Create a histogram of timing values based on the specified bins
     * @param {Array} timings - Array of timing values in milliseconds
     * @param {Array} bins - Array of bin ranges as strings (e.g., "[-1110000,-520733]")
     * @returns {Object} - Histogram object with bin ranges as keys and counts as values
     */
    createHistogram(timings, bins) {
        // Initialize histogram with zeros
        const histogram = {};
        for (const bin of bins) {
            histogram[bin] = 0;
        }
        
        // Count occurrences in each bin
        for (const timing of timings) {
            let binFound = false;
            
            // Debug log to see the actual timing values
            console.log("Processing timing value:", timing);
            
            for (const bin of bins) {
                // Parse bin range from string format "[min,max]"
                const [min, max] = bin.substring(1, bin.length-1).split(',').map(Number);
                
                // Debug log for bin ranges
                console.log(`Checking bin ${bin}: timing=${timing}, min=${min}, max=${max}`);
                
                if (timing >= min && timing <= max) { // Changed < to <= for inclusive upper bound
                    histogram[bin]++;
                    binFound = true;
                    console.log(`Found matching bin ${bin} for timing ${timing}`);
                    break;
                }
            }
            
            if (!binFound) {
                console.log(`No matching bin found for timing ${timing}`);
            }
        }
        
        // Debug log the final histogram
        console.log("Final histogram:", histogram);
        
        return histogram;
    }
}

// Make it available globally
window.DataProcessor = DataProcessor;