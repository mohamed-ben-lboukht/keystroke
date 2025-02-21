// dataProcessor.js

class DataProcessor {
    constructor() {
        this.baselineSpeeds = {
            slow: 2000,    // 2 seconds between keypresses
            moderate: 500,  // 0.5 seconds between keypresses
            fast: 200      // 0.2 seconds between keypresses
        };
    }

    processTimingData(data) {
        console.log('Processing timing data:', data);
        const { timings, metadata } = data;
        
        // Calculate typing speed metrics
        const typingMetrics = this.calculateTypingMetrics(timings, metadata);
        
        // Calculate rhythm consistency
        const rhythmMetrics = this.calculateRhythmMetrics(timings);

        return {
            raw_timings: timings,
            metrics: {
                ...typingMetrics,
                ...rhythmMetrics
            },
            text_stats: {
                length: metadata.textLength,
                events: {
                    press: metadata.totalPressEvents,
                    release: metadata.totalReleaseEvents
                }
            }
        };
    }

    calculateTypingMetrics(timings, metadata) {
        const { pp, rr, pr, rp } = timings;
        
        // Calculate overall typing speed
        const totalTime = pp.reduce((a, b) => a + b, 0);
        const charactersPerSecond = (metadata.textLength / (totalTime / 1000)) || 0;
        
        // Calculate average timings
        const averages = {
            pressPress: this.average(pp),
            releaseRelease: this.average(rr),
            pressRelease: this.average(pr),
            releasePress: this.average(rp)
        };

        // Classify typing speed
        const speedCategory = this.classifyTypingSpeed(averages.pressPress);

        return {
            speed: {
                cps: charactersPerSecond,
                category: speedCategory
            },
            averages: averages,
            consistency: this.calculateConsistency(pp)
        };
    }

    calculateRhythmMetrics(timings) {
        const rhythmPatterns = {
            regular: this.detectRegularPattern(timings.pp),
            bursts: this.detectTypingBursts(timings.pp),
            pauses: this.detectPauses(timings.pp)
        };

        return {
            rhythm: {
                ...rhythmPatterns,
                overallConsistency: this.calculateOverallConsistency(timings)
            }
        };
    }

    classifyTypingSpeed(avgPressTime) {
        if (avgPressTime >= this.baselineSpeeds.slow) return 'slow';
        if (avgPressTime >= this.baselineSpeeds.moderate) return 'moderate';
        return 'fast';
    }

    detectRegularPattern(pressPressTimes) {
        if (pressPressTimes.length < 2) return false;
        
        const variations = [];
        for (let i = 1; i < pressPressTimes.length; i++) {
            variations.push(Math.abs(pressPressTimes[i] - pressPressTimes[i-1]));
        }
        
        const avgVariation = this.average(variations);
        return avgVariation < 100; // Less than 100ms variation indicates regular pattern
    }

    detectTypingBursts(pressPressTimes) {
        let burstCount = 0;
        let currentBurst = false;
        
        for (let i = 1; i < pressPressTimes.length; i++) {
            if (pressPressTimes[i] < this.baselineSpeeds.moderate) {
                if (!currentBurst) {
                    burstCount++;
                    currentBurst = true;
                }
            } else {
                currentBurst = false;
            }
        }
        
        return burstCount;
    }

    detectPauses(pressPressTimes) {
        return pressPressTimes.filter(time => time > this.baselineSpeeds.slow).length;
    }

    calculateConsistency(array) {
        if (array.length < 2) return 1;
        
        const mean = this.average(array);
        const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
        const stdDev = Math.sqrt(variance);
        
        // Convert to a 0-1 scale where 1 is most consistent
        return Math.max(0, 1 - (stdDev / mean));
    }

    calculateOverallConsistency(timings) {
        const consistencies = [
            this.calculateConsistency(timings.pp),
            this.calculateConsistency(timings.rr),
            this.calculateConsistency(timings.pr),
            this.calculateConsistency(timings.rp)
        ];
        
        return this.average(consistencies);
    }

    average(array) {
        if (array.length === 0) return 0;
        return array.reduce((a, b) => a + b, 0) / array.length;
    }
}

// Make it globally available
window.DataProcessor = DataProcessor;