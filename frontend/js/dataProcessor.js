class DataProcessor {
    constructor() {
        this.charts = {};
        this.fineSubdivisions = 10;  // For frequent intervals
        this.coarseSubdivisions = 3; // For other intervals
        this.timingBins = {};  // Will be populated dynamically
        this.frequentIntervals = {}; // Will be calculated from actual data
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

            // Unscale the data for display (divide by 1000)
            const unscaledData = data.map(value => value / 1000);
            const labels = Array.from({ length: unscaledData.length }, (_, i) => i + 1);
            
            chart.data.labels = labels;
            chart.data.datasets[0].data = unscaledData;
            
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
     * Calculate dynamic bins based on the data distribution using the notebook approach
     * @param {Array} data - Array of timing values
     * @param {string} type - Timing type (pp, rr, rp, pr)
     * @returns {Array} - Array of bin ranges as strings
     */
    calculateDynamicBins(data, type) {
        if (data.length === 0) {
            // Return 16 default bins if no data
            const defaultBins = [];
            for (let i = 0; i < 16; i++) {
                defaultBins.push(`[${i*100},${(i+1)*100}]`);
            }
            return defaultBins;
        }

        // Sort the data
        const sortedData = [...data].sort((a, b) => a - b);
        const minValue = sortedData[0];
        const maxValue = sortedData[sortedData.length - 1];

        // Find the most frequent interval using a histogram
        const tempBinCount = 50; // As used in the notebook for initial analysis
        const tempBinWidth = (maxValue - minValue) / tempBinCount;
        const tempHistogram = new Array(tempBinCount).fill(0);
        
        // Fill the temporary histogram
        for (const value of data) {
            const binIndex = Math.min(
                Math.floor((value - minValue) / tempBinWidth),
                tempBinCount - 1
            );
            tempHistogram[binIndex]++;
        }

        // Find the densest region (most frequent interval)
        let maxDensity = 0;
        let densestBinStart = 0;
        for (let i = 0; i < tempBinCount - 9; i++) {
            const regionDensity = tempHistogram.slice(i, i + 10).reduce((a, b) => a + b, 0);
            if (regionDensity > maxDensity) {
                maxDensity = regionDensity;
                densestBinStart = i;
            }
        }

        // Calculate the frequent interval boundaries
        const frequentStart = minValue + (densestBinStart * tempBinWidth);
        const frequentEnd = minValue + ((densestBinStart + 10) * tempBinWidth);

        // Initialize refined_bins array (following notebook's approach)
        let refined_bins = [];

        // 1. First add the fine subdivisions for the frequent interval
        const fineStep = (frequentEnd - frequentStart) / 10;
        for (let i = 0; i <= 10; i++) {
            refined_bins.push(frequentStart + (i * fineStep));
        }

        // 2. Add coarse subdivisions before the frequent interval
        const beforeStep = (frequentStart - minValue) / 3;
        for (let i = 0; i <= 3; i++) {
            const value = minValue + (i * beforeStep);
            if (value < frequentStart) { // Don't add if it equals frequentStart (avoid duplicates)
                refined_bins.push(value);
            }
        }

        // 3. Add coarse subdivisions after the frequent interval
        const afterStep = (maxValue - frequentEnd) / 3;
        for (let i = 1; i <= 3; i++) { // Start from 1 to avoid duplicating frequentEnd
            const value = frequentEnd + (i * afterStep);
            refined_bins.push(value);
        }

        // Sort all bin edges
        refined_bins = [...new Set(refined_bins)].sort((a, b) => a - b);

        // Create the final bin strings
        const bins = [];
        for (let i = 0; i < refined_bins.length - 1; i++) {
            bins.push(`[${Math.round(refined_bins[i])},${Math.round(refined_bins[i+1])}]`);
        }

        // Ensure exactly 16 bins
        if (bins.length > 16) {
            // If we have too many bins, remove from the middle (where bins are finest)
            while (bins.length > 16) {
                const middleIndex = Math.floor(bins.length / 2);
                bins.splice(middleIndex, 1);
            }
        } else if (bins.length < 16) {
            // If we have too few bins, duplicate the last bin with smaller subdivisions
            const lastBin = bins[bins.length - 1];
            const [start, end] = lastBin.substring(1, lastBin.length-1).split(',').map(Number);
            const extraStep = (end - start) / (17 - bins.length);
            
            let currentStart = start;
            while (bins.length < 16) {
                const binEnd = currentStart + extraStep;
                bins[bins.length - 1] = `[${Math.round(currentStart)},${Math.round(binEnd)}]`;
                currentStart = binEnd;
                if (bins.length < 16) {
                    bins.push(`[${Math.round(binEnd)},${Math.round(end)}]`);
                }
            }
        }

        return bins;
    }

    /**
     * Update bin configurations based on collected data
     * @param {Object} timingData - Object containing timing arrays
     */
    updateBinConfigurations(timingData) {
        Object.entries(timingData).forEach(([type, data]) => {
            this.timingBins[type] = this.calculateDynamicBins(data, type);
        });
    }

    /**
     * Identify the most frequent interval in the data
     * @param {Array} data - Array of timing values
     * @returns {Object} - Object containing interval_start, interval_end, and interval_length
     */
    findFrequentInterval(data) {
        if (data.length === 0) return null;

        // Sort the data
        const sortedData = [...data].sort((a, b) => a - b);
        
        // Calculate initial statistics
        const min = sortedData[0];
        const max = sortedData[sortedData.length - 1];
        const range = max - min;
        
        // Use Sturges' formula to determine initial number of bins for analysis
        const numBins = Math.ceil(1 + 3.322 * Math.log10(data.length));
        const tempBinWidth = range / numBins;
        
        // Create temporary bins to find the most frequent range
        const tempBins = new Map();
        for (let i = 0; i < numBins; i++) {
            const binStart = min + (i * tempBinWidth);
            const binEnd = binStart + tempBinWidth;
            tempBins.set(`[${binStart},${binEnd}]`, 0);
        }
        
        // Count values in each bin
        for (const value of data) {
            for (const [binRange, count] of tempBins) {
                const [start, end] = binRange.substring(1, binRange.length-1).split(',').map(Number);
                if (value >= start && value < end) {
                    tempBins.set(binRange, count + 1);
                    break;
                }
            }
        }
        
        // Find the bin with the most values
        let maxCount = 0;
        let frequentBinRange = null;
        for (const [binRange, count] of tempBins) {
            if (count > maxCount) {
                maxCount = count;
                frequentBinRange = binRange;
            }
        }
        
        // Extract the frequent interval
        if (frequentBinRange) {
            const [start, end] = frequentBinRange.substring(1, frequentBinRange.length-1).split(',').map(Number);
            // Extend the interval slightly to ensure we capture the full range of frequent values
            const extension = (end - start) * 0.5;
            return {
                interval_start: Math.max(min, start - extension),
                interval_end: Math.min(max, end + extension),
                interval_length: end - start + (2 * extension)
            };
        }
        
        // Fallback if no clear frequent interval is found
        return {
            interval_start: min,
            interval_end: max,
            interval_length: range
        };
    }

    /**
     * Update frequent intervals based on the current data
     * @param {Object} timingData - Object containing timing arrays
     */
    updateFrequentIntervals(timingData) {
        Object.entries(timingData).forEach(([type, data]) => {
            const typeKey = `${type}Time`;
            this.frequentIntervals[typeKey] = this.findFrequentInterval(data);
        });
    }

    /**
     * Transform raw timing data into the binned histogram format expected by the ML model
     * @param {Object} timingData - Raw keystroke timing data
     * @returns {Object} - Binned histogram data ready for the ML model
     */
    transformToModelFormat(timingData) {
        // First, analyze the data to find frequent intervals
        this.updateFrequentIntervals(timingData);
        
        // Then update bin configurations based on the identified intervals
        this.updateBinConfigurations(timingData);
        
        const result = {};
        
        // Process each timing type (pp, rr, rp, pr)
        Object.entries(timingData).forEach(([type, timings]) => {
            // Convert raw timings to histogram bins
            const histogram = this.createHistogram(timings, this.timingBins[type]);
            
            // Add each bin count to the result with proper key formatting
            Object.entries(histogram).forEach(([bin, count]) => {
                const key = `${type}Time_${bin}`;
                result[key] = count;
            });
            
            // Add the END value
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