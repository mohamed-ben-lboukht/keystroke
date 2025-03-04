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
        // Scale factor to distribute timings across bins (needed for model compatibility)
        this.SCALE_FACTOR = 1000;
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
            const ppTimeMs = Math.round(timestamp - this.lastKeydown);
            const ppTimeScaled = Math.round(ppTimeMs * this.SCALE_FACTOR);
            if (ppTimeMs > 0 && ppTimeMs < 2000) { // Reasonable range for typing (0-2 seconds)
                console.log('PP timing (ms):', ppTimeMs, 'scaled:', ppTimeScaled);
                this.timingData.pp.push(ppTimeScaled);
            }
        }
        
        if (this.lastKeyup !== null) {
            const rpTimeMs = Math.round(timestamp - this.lastKeyup);
            const rpTimeScaled = Math.round(rpTimeMs * this.SCALE_FACTOR);
            if (rpTimeMs > 0 && rpTimeMs < 2000) {
                console.log('RP timing (ms):', rpTimeMs, 'scaled:', rpTimeScaled);
                this.timingData.rp.push(rpTimeScaled);
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
            const prTimeMs = Math.round(timestamp - this.keydownTimes[key]);
            const prTimeScaled = Math.round(prTimeMs * this.SCALE_FACTOR);
            if (prTimeMs > 0 && prTimeMs < 1000) { // Key hold time usually < 1 second
                console.log('PR timing (ms):', prTimeMs, 'scaled:', prTimeScaled);
                this.timingData.pr.push(prTimeScaled);
            }
        }

        if (this.lastKeyup !== null) {
            const rrTimeMs = Math.round(timestamp - this.lastKeyup);
            const rrTimeScaled = Math.round(rrTimeMs * this.SCALE_FACTOR);
            if (rrTimeMs > 0 && rrTimeMs < 2000) {
                console.log('RR timing (ms):', rrTimeMs, 'scaled:', rrTimeScaled);
                this.timingData.rr.push(rrTimeScaled);
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