/*class KeystrokeAPI {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
    }

    async sendKeystrokeData(data) {
        try {
            const response = await fetch(`${this.baseUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error sending keystroke data:', error);
            throw error;
        }
    }

    async getUserProfile(keystrokeData) {
        try {
            const result = await this.sendKeystrokeData(keystrokeData);
            return result.profile;
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
}*/

/*haadchi dialk a khay a amine ankhlih hna ta nchouf ki ndir lih*/

class KeystrokeAPI {
    constructor(baseUrl = 'placeholder') {  // Set default to placeholder
        this.baseUrl = baseUrl;
        this.processor = new DataProcessor();
    }

    async sendKeystrokeData(data) {
        try {
            // If using placeholder, return mock data
            if (this.baseUrl === 'placeholder') {
                return {
                    Age: 28,
                    Gender: 'F',
                    Handedness: 'R',
                    Class: 1
                };
            }

            // Transform raw timing data into the format expected by the model
            const transformedData = this.processor.transformToModelFormat(data.timings);
            
            // Add metadata that might be needed by the model
            const modelData = {
                ...transformedData,
                User_ID: 0,
                Password: "free_text",
            };

            console.log("Sending data to model:", modelData);

            const response = await fetch(`${this.baseUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(modelData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending keystroke data:', error);
            // If there's an error, return placeholder data
            return {
                Age: 28,
                Gender: 'F',
                Handedness: 'R',
                Class: 1
            };
        }
    }

    async getUserProfile(keystrokeData) {
        try {
            const predictionResult = await this.sendKeystrokeData(keystrokeData);
            console.log("Received prediction:", predictionResult);

            // Transform model output into user-friendly profile format
            return {
                ageRange: this.getAgeRange(predictionResult.Age),
                gender: this.getGender(predictionResult.Gender),
                handedness: this.getHandedness(predictionResult.Handedness),
                typingStyle: this.getTypingStyle(predictionResult.Class)
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    getAgeRange(age) {
        if (!age) return 'Unknown';
        
        const ageNum = Number(age);
        if (isNaN(ageNum)) return 'Unknown';
        
        const start = Math.floor(ageNum / 5) * 5;
        return `${start}-${start + 5}`;
    }

    getGender(gender) {
        if (!gender) return 'Unknown';
        
        // Handle both probability and direct label
        if (typeof gender === 'number') {
            return gender > 0.5 ? 'Female' : 'Male';
        }
        
        // Handle direct labels
        switch(gender.toUpperCase()) {
            case 'F':
                return 'Female';
            case 'M':
                return 'Male';
            default:
                return 'Unknown';
        }
    }

    getHandedness(handedness) {
        if (!handedness) return 'Unknown';
        
        // Handle both probability and direct label
        if (typeof handedness === 'number') {
            return handedness > 0.5 ? 'Right' : 'Left';
        }
        
        // Handle direct labels
        switch(handedness.toUpperCase()) {
            case 'L':
                return 'Left';
            case 'R':
                return 'Right';
            default:
                return 'Unknown';
        }
    }

    getTypingStyle(classValue) {
        if (!classValue) return 'Unknown';
        
        // Handle both probability and direct value
        if (typeof classValue === 'number') {
            // If it's a probability
            if (classValue <= 1) {
                return classValue > 0.5 ? 'One Hand' : 'Two Hands';
            }
            // If it's a direct class value (1 or 2)
            return classValue === 1 ? 'Two Hands' : 'One Hand';
        }
        
        return 'Unknown';
    }
}

// Make it available globally
window.KeystrokeAPI = KeystrokeAPI;