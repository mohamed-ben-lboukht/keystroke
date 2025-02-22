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
            const ppTime = timestamp - this.lastKeydown;
            if (ppTime > 0) {
                this.timingData.pp.push(ppTime);
            }
        }
        
        if (this.lastKeyup !== null) {
            const rpTime = timestamp - this.lastKeyup;
            if (rpTime > 0) {
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
            const prTime = timestamp - this.keydownTimes[key];
            if (prTime > 0) {
                this.timingData.pr.push(prTime);
            }
        }

        if (this.lastKeyup !== null) {
            const rrTime = timestamp - this.lastKeyup;
            if (rrTime > 0) {
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