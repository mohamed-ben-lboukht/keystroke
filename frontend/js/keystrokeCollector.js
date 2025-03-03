class KeystrokeCollector {
    constructor() {
        this.isRecording = false;
        this.keydownTimes = {};
        this.keyupTimes = {};
        this.lastKeydown = null;
        this.lastKeyup = null;
        this.timingData = {
            pp: [], // press-press times
            rr: [], // release-release times
            pr: [], // press-release times
            rp: []  // release-press times
        };
        // Scale factor to distribute timings across bins
        this.SCALE_FACTOR = 1000; // Multiply timings by 1000 to spread across bins
    }

    start() {
        this.isRecording = true;
        this.resetData();
        return this.isRecording;
    }

    stop() {
        this.isRecording = false;
        return this.getTimingData();
    }

    resetData() {
        this.keydownTimes = {};
        this.keyupTimes = {};
        this.lastKeydown = null;
        this.lastKeyup = null;
        this.timingData = {
            pp: [],
            rr: [],
            pr: [],
            rp: []
        };
    }

    handleKeyDown(event) {
        if (!this.isRecording) return;
        
        const timestamp = performance.now();
        const key = event.key;
        
        this.keydownTimes[key] = timestamp;

        if (this.lastKeydown !== null) {
            const ppTime = Math.round((timestamp - this.lastKeydown) * this.SCALE_FACTOR);
            if (ppTime > -1110000 && ppTime < 57600000) {
                console.log('PP timing (scaled):', ppTime);
                this.timingData.pp.push(ppTime);
            }
        }
        
        if (this.lastKeyup !== null) {
            const rpTime = Math.round((timestamp - this.lastKeyup) * this.SCALE_FACTOR);
            if (rpTime > -720000 && rpTime < 58310000) {
                console.log('RP timing (scaled):', rpTime);
                this.timingData.rp.push(rpTime);
            }
        }

        this.lastKeydown = timestamp;
    }

    handleKeyUp(event) {
        if (!this.isRecording) return;
        
        const timestamp = performance.now();
        const key = event.key;
        
        this.keyupTimes[key] = timestamp;

        if (this.keydownTimes[key]) {
            const prTime = Math.round((timestamp - this.keydownTimes[key]) * this.SCALE_FACTOR);
            if (prTime > -1880000 && prTime < 57830000) {
                console.log('PR timing (scaled):', prTime);
                this.timingData.pr.push(prTime);
            }
        }

        if (this.lastKeyup !== null) {
            const rrTime = Math.round((timestamp - this.lastKeyup) * this.SCALE_FACTOR);
            if (rrTime > -1340000 && rrTime < 57120000) {
                console.log('RR timing (scaled):', rrTime);
                this.timingData.rr.push(rrTime);
            }
        }

        this.lastKeyup = timestamp;
    }

    getTimingData() {
        return {
            timings: this.timingData,
            metadata: {
                totalKeystrokes: this.timingData.pp.length + 1,
                averages: {
                    pp: this.calculateAverage(this.timingData.pp),
                    rr: this.calculateAverage(this.timingData.rr),
                    pr: this.calculateAverage(this.timingData.pr),
                    rp: this.calculateAverage(this.timingData.rp)
                }
            }
        };
    }

    calculateAverage(array) {
        if (array.length === 0) return 0;
        return array.reduce((a, b) => a + b, 0) / array.length;
    }
}

// Make it available globally
window.KeystrokeCollector = KeystrokeCollector;