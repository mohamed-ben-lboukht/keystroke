class DataProcessor {
    constructor() {
        this.charts = {};
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

            this.charts[type] = new Chart(canvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: config.title,
                        data: [],
                        borderColor: config.color,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Time (ms)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Keystroke Sequence'
                            }
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

            chart.data.labels = Array.from({ length: data.length }, (_, i) => i + 1);
            chart.data.datasets[0].data = data;
            chart.update();
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
}

// Make it available globally
window.DataProcessor = DataProcessor;