// keystrokeCollector.js

class KeystrokeCollector {
    constructor() {
        this.isRecording = false;
        this.keydownTimes = {};
        this.keyupTimes = {};
        this.timingData = {
            pp: [], // press-press times
            rr: [], // release-release times
            pr: [], // press-release times
            rp: []  // release-press times
        };
        this.lastKeydown = null;
        this.lastKeyup = null;
        this.text = '';
    }

    start() {
        this.reset();
        this.isRecording = true;
        console.log('Recording started');
    }

    stop() {
        this.isRecording = false;
        console.log('Recording stopped, processing data...');
        return this.getTimingData();
    }

    reset() {
        this.keydownTimes = {};
        this.keyupTimes = {};
        this.timingData = {
            pp: [],
            rr: [],
            pr: [],
            rp: []
        };
        this.lastKeydown = null;
        this.lastKeyup = null;
        this.text = '';
    }

    handleKeyDown(event) {
        if (!this.isRecording) return;
        
        const timestamp = performance.now();
        const key = event.key;
        
        // Store keydown timestamp
        this.keydownTimes[key] = timestamp;

        // Calculate press-press time
        if (this.lastKeydown !== null) {
            const ppTime = timestamp - this.lastKeydown;
            if (ppTime > 0) {
                this.timingData.pp.push(ppTime);
                console.log('PP time:', ppTime);
            }
        }
        
        // Calculate release-press time
        if (this.lastKeyup !== null) {
            const rpTime = timestamp - this.lastKeyup;
            if (rpTime > 0) {
                this.timingData.rp.push(rpTime);
                console.log('RP time:', rpTime);
            }
        }

        this.lastKeydown = timestamp;
    }

    handleKeyUp(event) {
        if (!this.isRecording) return;
        
        const timestamp = performance.now();
        const key = event.key;
        
        // Store keyup timestamp
        this.keyupTimes[key] = timestamp;

        // Calculate press-release time for this key
        if (this.keydownTimes[key]) {
            const prTime = timestamp - this.keydownTimes[key];
            if (prTime > 0) {
                this.timingData.pr.push(prTime);
                console.log('PR time:', prTime);
            }
        }

        // Calculate release-release time
        if (this.lastKeyup !== null) {
            const rrTime = timestamp - this.lastKeyup;
            if (rrTime > 0) {
                this.timingData.rr.push(rrTime);
                console.log('RR time:', rrTime);
            }
        }

        this.lastKeyup = timestamp;
    }

    handleTextInput(text) {
        if (!this.isRecording) return;
        this.text = text;
    }

    getTimingData() {
        return {
            text: this.text,
            timings: this.timingData,
            metadata: {
                textLength: this.text.length,
                totalPressEvents: this.timingData.pp.length + 1,
                totalReleaseEvents: this.timingData.rr.length + 1,
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

// Make it globally available
window.KeystrokeCollector = KeystrokeCollector;