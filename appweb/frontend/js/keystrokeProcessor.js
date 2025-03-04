class KeystrokeProcessor {
    constructor(debugMode = false) {
        this.debugMode = debugMode;
        this.FINE_SUBDIVISIONS = 10;  // For frequent intervals
        this.COARSE_SUBDIVISIONS = 3; // For other intervals
        this.TOTAL_BINS = 16;         // Required bins for model
        this.SCALE_FACTOR = 1000;     // Scale timing data for precision
        
        // Debug elements
        if (debugMode) {
            this.createDebugElements();
        }
    }

    createDebugElements() {
        // Create debug container
        const debugContainer = document.createElement('div');
        debugContainer.id = 'debug-container';
        debugContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 1200px;
            background: rgba(0, 0, 0, 0.9);
            color: #fff;
            padding: 20px;
            border-radius: 8px;
            font-family: monospace;
            z-index: 1000;
            max-height: 40vh;
            overflow-y: auto;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: space-around;
        `;

        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Keystroke Debug Info';
        title.style.cssText = `
            width: 100%;
            text-align: center;
            margin-top: 0;
            margin-bottom: 15px;
            color: #00ff00;
        `;
        debugContainer.appendChild(title);

        // Create sections for different timing types
        ['pp', 'rr', 'pr', 'rp'].forEach(type => {
            const section = document.createElement('div');
            section.id = `debug-${type}`;
            section.style.cssText = `
                flex: 1;
                min-width: 250px;
                max-width: 300px;
                background: rgba(0, 0, 0, 0.5);
                padding: 10px;
                border-radius: 4px;
            `;
            section.innerHTML = `
                <h4 style="color: #00ff00; margin-top: 0;">${type.toUpperCase()} Timings</h4>
                <div id="${type}-stats"></div>
                <div id="${type}-bins"></div>
            `;
            debugContainer.appendChild(section);
        });

        document.body.appendChild(debugContainer);
    }

    updateDebugInfo(type, data, bins, histogram) {
        if (!this.debugMode) return;

        const statsDiv = document.getElementById(`${type}-stats`);
        const binsDiv = document.getElementById(`${type}-bins`);

        // Update stats with proper handling of empty data
        const mean = data.length ? data.reduce((a, b) => a + b) / data.length : 0;
        const range = data.length ? 
            `${Math.min(...data).toFixed(2)} - ${Math.max(...data).toFixed(2)}` : 
            'No data';
            
        const stats = `
            <div style="margin-bottom: 10px;">
                <div>Count: ${data.length}</div>
                <div>Mean: ${mean.toFixed(2)}ms</div>
                <div>Range: ${range}${data.length ? 'ms' : ''}</div>
            </div>
        `;
        statsDiv.innerHTML = stats;

        // Update bins visualization
        const maxCount = Math.max(...histogram, 1); // Use at least 1 to avoid division by zero
        const binViz = bins.map((bin, i) => {
            const height = maxCount ? (histogram[i] / maxCount) * 100 : 0;
            const color = height > 50 ? '#00ff00' : '#00aa00';
            return `
                <div style="margin-bottom: 5px; font-size: 11px;">
                    <div style="display: flex; align-items: center;">
                        <div style="
                            width: ${height}%;
                            height: 10px;
                            background: ${color};
                            margin-right: 5px;
                            transition: width 0.3s ease;
                        "></div>
                        <span>${bin}: ${histogram[i]}</span>
                    </div>
                </div>
            `;
        }).join('');
        binsDiv.innerHTML = binViz;
    }

    processTimingData(timingData) {
        const processed = {};
        const types = {
            pp: 'ppTime_',
            rr: 'rrTime_',
            pr: 'prTime_',
            rp: 'rpTime_'
        };
        
        for (const [type, prefix] of Object.entries(types)) {
            // Remove the extra scaling since data is already scaled
            const data = timingData[type];
            
            // Calculate dynamic bins
            const bins = this.calculateDynamicBins(data, type);
            const histogram = this.createHistogram(data, bins);
            
            // Add bin data to processed output
            bins.forEach((bin, i) => {
                const [start, end] = bin.slice(1, -1).split(',').map(Number);
                processed[`${prefix}[${start},${end}]`] = histogram[i];
            });
            
            // Add END marker
            processed[`${prefix}END`] = 0;

            // Update debug visualization if enabled
            if (this.debugMode) {
                this.updateDebugInfo(type, data, bins, histogram);
            }
        }
        
        return processed;
    }

    calculateDynamicBins(data, type) {
        // If no data, return default bins
        if (!data || data.length === 0) {
            const defaultBins = [];
            for (let i = 0; i < 16; i++) {
                defaultBins.push(`[${i*100000},${(i+1)*100000}]`);
            }
            return defaultBins;
        }

        // Sort the data
        const sortedData = [...data].sort((a, b) => a - b);
        const minValue = sortedData[0];
        const maxValue = sortedData[sortedData.length - 1];
        const range = maxValue - minValue;

        // Create initial histogram to find high frequency interval
        const TEMP_BINS = 50;
        const tempBinWidth = range / TEMP_BINS;
        const tempHistogram = new Array(TEMP_BINS).fill(0);

        // Fill temporary histogram
        sortedData.forEach(value => {
            const binIndex = Math.min(
                Math.floor((value - minValue) / tempBinWidth),
                TEMP_BINS - 1
            );
            tempHistogram[binIndex]++;
        });

        // Find the window of 10 consecutive bins with highest frequency
        let maxCount = 0;
        let maxStartBin = 0;
        const WINDOW_SIZE = 10;

        for (let i = 0; i <= TEMP_BINS - WINDOW_SIZE; i++) {
            const windowCount = tempHistogram.slice(i, i + WINDOW_SIZE)
                .reduce((sum, count) => sum + count, 0);
            if (windowCount > maxCount) {
                maxCount = windowCount;
                maxStartBin = i;
            }
        }

        // Calculate the high frequency interval boundaries
        const highFreqStart = minValue + (maxStartBin * tempBinWidth);
        const highFreqEnd = minValue + ((maxStartBin + WINDOW_SIZE) * tempBinWidth);

        // Create the final bins array
        const bins = [];

        // 1. Add 3 bins before high frequency interval
        const beforeRange = highFreqStart - minValue;
        if (beforeRange > 0) {
            const beforeStep = beforeRange / 3;
            for (let i = 0; i < 3; i++) {
                const start = minValue + (i * beforeStep);
                const end = minValue + ((i + 1) * beforeStep);
                bins.push(`[${Math.round(start)},${Math.round(end)}]`);
            }
        }

        // 2. Add 10 bins for high frequency interval
        const highFreqStep = (highFreqEnd - highFreqStart) / 10;
        for (let i = 0; i < 10; i++) {
            const start = highFreqStart + (i * highFreqStep);
            const end = highFreqStart + ((i + 1) * highFreqStep);
            bins.push(`[${Math.round(start)},${Math.round(end)}]`);
        }

        // 3. Add 3 bins after high frequency interval
        const afterRange = maxValue - highFreqEnd;
        if (afterRange > 0) {
            const afterStep = afterRange / 3;
            for (let i = 0; i < 3; i++) {
                const start = highFreqEnd + (i * afterStep);
                const end = highFreqEnd + ((i + 1) * afterStep);
                bins.push(`[${Math.round(start)},${Math.round(end)}]`);
            }
        }

        // Ensure exactly 16 bins
        while (bins.length < 16) {
            // Add extra bins at the end if needed
            const lastBin = bins[bins.length - 1];
            const [start, end] = lastBin.slice(1, -1).split(',').map(Number);
            const extraBinWidth = (end - start) / 2;
            bins[bins.length - 1] = `[${Math.round(start)},${Math.round(start + extraBinWidth)}]`;
            bins.push(`[${Math.round(start + extraBinWidth)},${Math.round(end)}]`);
        }

        // If we somehow got more than 16 bins, merge some in the middle
        while (bins.length > 16) {
            const middleIndex = Math.floor(bins.length / 2);
            bins.splice(middleIndex, 1);
        }

        return bins;
    }

    createHistogram(data, bins) {
        const histogram = new Array(bins.length).fill(0);
        
        data.forEach(value => {
            for (let i = 0; i < bins.length; i++) {
                const [start, end] = bins[i].slice(1, -1).split(',').map(Number);
                if (value >= start && value < end) {
                    histogram[i]++;
                    break;
                }
            }
        });

        return histogram;
    }
}

// Make it available globally
window.KeystrokeProcessor = KeystrokeProcessor; 