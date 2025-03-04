class UIManager {
    constructor() {
        this.textInput = null;
        this.redoButton = null;
        this.showGraphsButton = null;
        this.graphsContainer = null;
        this.profileContainer = null;
        // Use placeholder for testing
        this.api = new KeystrokeAPI('placeholder');
        this.collector = new KeystrokeCollector();
        this.processor = new DataProcessor();
        this.hasStartedTyping = false;
    }

    initialize() {
        // Initialize DOM elements
        this.textInput = document.getElementById('textInput');
        this.redoButton = document.getElementById('redoButton');
        this.showGraphsButton = document.getElementById('showGraphsButton');
        this.graphsContainer = document.getElementById('graphsContainer');
        this.profileContainer = document.getElementById('profileContainer');

        // Initialize event listeners
        this.redoButton.addEventListener('click', () => this.resetRecording());
        this.showGraphsButton.addEventListener('click', () => this.toggleGraphs());
        
        // Handle keydown events
        this.textInput.addEventListener('keydown', (e) => {
            // Start recording on first keypress
            if (!this.hasStartedTyping) {
                this.startRecording();
            }
            
            // Stop recording when Enter is pressed
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent new line
                this.stopRecording();
                return;
            }
            
            this.collector.handleKeyDown(e);
        });
        
        this.textInput.addEventListener('keyup', (e) => {
            if (e.key !== 'Enter') {
                this.collector.handleKeyUp(e);
            }
        });

        // Initialize charts
        this.processor.initializeCharts();

        // Display initial status message
        this.displayStatus('Start typing to begin recording keystroke data. Press Enter when finished.');
    }

    startRecording() {
        this.hasStartedTyping = true;
        this.collector.start();
        this.textInput.focus();
        this.profileContainer.innerHTML = '';
        this.processor.clearCharts();
        this.displayStatus('Recording keystroke dynamics. Press Enter when finished...');
    }

    resetRecording() {
        this.hasStartedTyping = false;
        this.collector.resetData();
        this.textInput.value = '';
        this.textInput.focus();
        this.profileContainer.innerHTML = '';
        this.processor.clearCharts();
        this.displayStatus('Start typing to begin recording keystroke data. Press Enter when finished.');
    }

    async stopRecording() {
        if (!this.hasStartedTyping) return;
        
        const data = this.collector.stop();
        this.hasStartedTyping = false;
        this.displayStatus('Processing data...');

        // Update charts with raw timing data
        this.processor.updateCharts(data.timings);

        // Show the data in histogram format
        this.displayDataDistribution(data.timings);

        // Get user profile predictions
        try {
            const profile = await this.api.getUserProfile(data);
            this.displayProfile(profile);
            this.displayStatus('Analysis complete. Click "Start Over" to try again.');
        } catch (error) {
            console.error('Error getting user profile:', error);
            this.displayStatus('Error analyzing keystroke data. Click "Start Over" to try again.');
        }
    }

    toggleGraphs() {
        const isVisible = this.graphsContainer.style.display !== 'none';
        if (isVisible) {
            this.graphsContainer.style.opacity = '0';
            setTimeout(() => {
                this.graphsContainer.style.display = 'none';
            }, 300); // Match the CSS transition duration
        } else {
            this.graphsContainer.style.display = 'block';
            // Force a reflow
            this.graphsContainer.offsetHeight;
            this.graphsContainer.style.opacity = '1';
        }
        this.showGraphsButton.textContent = isVisible ? 'Show Graphs' : 'Hide Graphs';
    }

    displayProfile(profile) {
        this.profileContainer.innerHTML = `
            <div class="profile-card">
                <h3>User Profile</h3>
                <div class="profile-grid">
                    <div class="profile-item">
                        <span class="label">Age Range:</span>
                        <span class="value">${profile.ageRange}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Gender:</span>
                        <span class="value">${profile.gender}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Handedness:</span>
                        <span class="value">${profile.handedness}</span>
                    </div>
                    <div class="profile-item">
                        <span class="label">Typing Style:</span>
                        <span class="value">${profile.typingStyle}</span>
                    </div>
                </div>
            </div>
        `;
    }

    displayStatus(message) {
        const statusElement = document.createElement('div');
        statusElement.className = 'status-message';
        statusElement.textContent = message;
        
        const statusContainer = document.getElementById('statusContainer');
        if (statusContainer) {
            statusContainer.innerHTML = '';
            statusContainer.appendChild(statusElement);
        }
    }

    displayDataDistribution(timingData) {
        // Create a transformed version of the data for the model
        const transformedData = this.processor.transformToModelFormat(timingData);
        
        // For debugging - log the transformed data
        console.log("Transformed data:", transformedData);
        
        // Create visualization of the histogram distributions
        const debugElement = document.getElementById('debugContainer');
        if (debugElement) {
            let visualizationHtml = `
                <div class="debug-card">
                    <h3>Keystroke Timing Distributions</h3>
                    <div class="distribution-grid">
            `;
            
            // Create a visualization for each timing type
            Object.entries(timingData).forEach(([type, data]) => {
                const typeKey = `${type}Time`;
                const frequentInterval = this.processor.frequentIntervals[typeKey];
                const bins = this.processor.timingBins[type];
                const histogram = this.processor.createHistogram(data, bins);
                
                // Calculate max count for scaling
                const maxCount = Math.max(...Object.values(histogram));
                
                visualizationHtml += `
                    <div class="distribution-chart">
                        <h4>${type.toUpperCase()} Timing Distribution</h4>
                        <div class="histogram">
                            <div class="interval-markers">
                                <span class="marker start">${Math.round(frequentInterval.interval_start/1000)}ms</span>
                                <span class="marker end">${Math.round(frequentInterval.interval_end/1000)}ms</span>
                            </div>
                `;
                
                // Create bars for each bin
                Object.entries(histogram).forEach(([bin, count]) => {
                    const height = (count / maxCount) * 100;
                    const [start, end] = bin.substring(1, bin.length-1).split(',').map(Number);
                    const binWidth = (end - start) / 1000; // Convert to ms
                    
                    // Determine if this bin is in the frequent interval
                    const isFrequent = start >= frequentInterval.interval_start && end <= frequentInterval.interval_end;
                    
                    visualizationHtml += `
                        <div class="histogram-bar ${isFrequent ? 'frequent' : 'coarse'}" 
                             style="height: ${height}%;" 
                             title="Bin: [${Math.round(start/1000)}-${Math.round(end/1000)}]ms&#10;Count: ${count}&#10;Width: ${Math.round(binWidth)}ms">
                        </div>
                    `;
                });
                
                visualizationHtml += `
                        </div>
                        <div class="histogram-stats">
                            <p>Total bins: ${bins.length}</p>
                            <p>Fine subdivisions: ${this.processor.fineSubdivisions}</p>
                            <p>Coarse subdivisions: ${this.processor.coarseSubdivisions}</p>
                            <p>Samples: ${data.length}</p>
                        </div>
                    </div>
                `;
            });
            
            visualizationHtml += `
                    </div>
                    <div class="transformed-data">
                        <h4>Transformed Data for ML Model</h4>
                        <pre>${JSON.stringify(transformedData, null, 2)}</pre>
                    </div>
                </div>
            `;
            
            debugElement.innerHTML = visualizationHtml;
            
            // Add CSS for the new visualization
            const style = document.createElement('style');
            style.textContent = `
                .distribution-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .distribution-chart {
                    background: #f8fafc;
                    border-radius: 0.5rem;
                    padding: 1rem;
                }
                .histogram {
                    height: 200px;
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    padding: 1rem 0;
                    position: relative;
                }
                .histogram-bar {
                    flex: 1;
                    background: #94a3b8;
                    transition: height 0.3s ease;
                    position: relative;
                }
                .histogram-bar.frequent {
                    background: #3b82f6;
                }
                .histogram-bar.coarse {
                    background: #94a3b8;
                }
                .interval-markers {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 100%;
                    pointer-events: none;
                }
                .marker {
                    position: absolute;
                    top: -20px;
                    transform: translateX(-50%);
                    font-size: 0.75rem;
                    color: #64748b;
                }
                .marker.start {
                    left: 33%;
                }
                .marker.end {
                    left: 67%;
                }
                .histogram-stats {
                    margin-top: 1rem;
                    font-size: 0.875rem;
                    color: #64748b;
                }
                .histogram-stats p {
                    margin: 0.25rem 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Make it available globally
window.UIManager = UIManager;