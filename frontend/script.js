document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const scanBtn = document.getElementById('scanBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const filesList = document.getElementById('filesList');
    const submitBtn = document.getElementById('submitBtn');
    const resultArea = document.getElementById('resultArea');
    
    // Store uploaded files
    let uploadedFiles = [];
    
    // Event Listeners
    scanBtn.addEventListener('click', () => {
        document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Browse button click
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up to uploadArea
        fileInput.click();
    });
    
    // File selection
    fileInput.addEventListener('change', handleFileSelection);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // Submit button
    submitBtn.addEventListener('click', handleSubmit);
    
    // Click anywhere on upload area to browse
    // Modify this to exclude clicks on child elements
    uploadArea.addEventListener('click', (e) => {
        // Only trigger if the click was directly on uploadArea and not on its children
        if (e.target === uploadArea) {
            fileInput.click();
        }
    });
    
    // Functions
    function handleFileSelection() {
        const files = fileInput.files;
        handleFiles(files);
        fileInput.value = '';
    }
    
    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.name.endsWith('.apk'));
        
        if (validFiles.length === 0) {
            showNotification('Please select valid APK files.');
            return;
        }
        
        validFiles.forEach(file => {
            // Check if file is already in the list
            if (!uploadedFiles.some(f => f.name === file.name)) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
        });
        
        // Enable submit button if there are files
        updateSubmitButton();
    }
    
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileName = file.name;
        
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-progress">
                        <div class="file-progress-bar"></div>
                    </div>
                </div>
            </div>
            <button class="delete-btn" title="Remove file">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        filesList.appendChild(fileItem);
        
        // Animate progress bar for visual feedback
        setTimeout(() => {
            const progressBar = fileItem.querySelector('.file-progress-bar');
            progressBar.style.width = '100%';
        }, 100);
        
        // Add event listener to delete button
        const deleteBtn = fileItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFile(file.name);
        });
    }
    
    function removeFile(fileName) {
        // Remove from array
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        
        // Remove from DOM
        const fileItem = document.querySelector(`.file-item[data-file-name="${fileName}"]`);
        if (fileItem) {
            // fileItem.classList.add('animate__animated');
            setTimeout(() => {
                filesList.removeChild(fileItem);
            }, 300);
        }
        
        // Update submit button state
        updateSubmitButton();
        fileInput.value = '';
        // Reset results area
        resultArea.style.display = 'none';
        resultArea.innerHTML = '';
    }
    
    function updateSubmitButton() {
        if (uploadedFiles.length > 0) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    function handleSubmit() {
        // Show loading state
        submitBtn.disabled = true;
        resultArea.style.display = 'block';
        resultArea.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <div style="margin-left: 15px;">Analyzing APK files...</div>
            </div>
        `;
        
        // Simulate API call (replace with actual fetch to your Flask backend)
        setTimeout(() => {
            simulateApiResponse();
        }, 2500);
    }
    
    function simulateApiResponse() {
        // For demo purposes, randomly decide if files are safe or not
        const isThreat = Math.random() > 0.5;
        
        if (isThreat) {
            resultArea.innerHTML = `
                <div class="result-threat result-appear">
                    <div class="result-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div>Ransomware Detected!</div>
                </div>
                <div style="margin-top: 15px; color: #ff6b6b;">
                    Malicious code detected in one or more files. We recommend not installing these APKs.
                </div>
            `;
        } else {
            resultArea.innerHTML = `
                <div class="result-safe result-appear">
                    <div class="result-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div>No Threats Detected</div>
                </div>
                <div style="margin-top: 15px; color: #a0e9af;">
                    The analyzed APK files appear to be safe and free from ransomware.
                </div>
            `;
        }
        
        // Re-enable submit button
        submitBtn.disabled = false;
    }
    
    // Animation for the statistics counters
    const statNumbers = document.querySelectorAll('.stat-number');
    const statBoxes = document.querySelectorAll('.stat-box');
    const aboutSection = document.getElementById('about');
    const progressBars = document.querySelectorAll('.progress-bar');

    // Calculate the circumference of the circle
    const radius = 45; // Same as in the SVG
    const circumference = 2 * Math.PI * radius;

    // Set initial dasharray for all progress bars
    progressBars.forEach(bar => {
        bar.style.strokeDasharray = circumference;
        bar.style.strokeDashoffset = circumference; // Initially full offset (no progress)
    });
    
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate counters when section enters view
                statNumbers.forEach((statNumber, index) => {
                    const value = parseFloat(statNumber.dataset.value);
                    const maxValue = parseFloat(statNumber.dataset.maxValue || 100);
                    const progressBar = progressBars[index];
                    document.addEventListener('DOMContentLoaded', function() {
                        // Elements
                        const scanBtn = document.getElementById('scanBtn');
                        const uploadArea = document.getElementById('uploadArea');
                        const fileInput = document.getElementById('fileInput');
                        const browseBtn = document.getElementById('browseBtn');
                        const filesList = document.getElementById('filesList');
                        const submitBtn = document.getElementById('submitBtn');
                        const resultArea = document.getElementById('resultArea');
                        
                        // Store uploaded files
                        let uploadedFiles = [];
                        
                        // Event Listeners
                        scanBtn.addEventListener('click', () => {
                            document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
                        });
                        
                        // Browse button click
                        browseBtn.addEventListener('click', (e) => {
                            e.stopPropagation(); // Prevent event from bubbling up to uploadArea
                            fileInput.click();
                        });
                        
                        // File selection
                        fileInput.addEventListener('change', handleFileSelection);
                        
                        // Drag and drop events
                        uploadArea.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            uploadArea.classList.add('active');
                        });
                        
                        uploadArea.addEventListener('dragleave', () => {
                            uploadArea.classList.remove('active');
                        });
                        
                        uploadArea.addEventListener('drop', (e) => {
                            e.preventDefault();
                            uploadArea.classList.remove('active');
                            
                            const files = e.dataTransfer.files;
                            handleFiles(files);
                        });
                        
                        // Submit button
                        submitBtn.addEventListener('click', handleSubmit);
                        
                        // Click anywhere on upload area to browse
                        uploadArea.addEventListener('click', (e) => {
                            if (e.target === uploadArea) {
                                fileInput.click();
                            }
                        });
                        
                        // Functions
                        function handleFileSelection() {
                            const files = fileInput.files;
                            handleFiles(files);
                            fileInput.value = '';
                        }
                        
                        function handleFiles(files) {
                            const validFiles = Array.from(files).filter(file => file.name.endsWith('.apk'));
                            
                            if (validFiles.length === 0) {
                                showNotification('Please select valid APK files.');
                                return;
                            }
                            
                            validFiles.forEach(file => {
                                if (!uploadedFiles.some(f => f.name === file.name)) {
                                    uploadedFiles.push(file);
                                    addFileToList(file);
                                }
                            });
                            
                            updateSubmitButton();
                        }
                        
                        function addFileToList(file) {
                            const fileItem = document.createElement('div');
                            fileItem.className = 'file-item';
                            fileItem.dataset.fileName = file.name;
                            
                            fileItem.innerHTML = `
                                <div class="file-info">
                                    <div class="file-icon">
                                        <i class="fas fa-file-code"></i>
                                    </div>
                                    <div class="file-details">
                                        <div class="file-name">${file.name}</div>
                                        <div class="file-progress">
                                            <div class="file-progress-bar"></div>
                                        </div>
                                    </div>
                                </div>
                                <button class="delete-btn" title="Remove file">
                                    <i class="fas fa-times"></i>
                                </button>
                            `;
                            
                            filesList.appendChild(fileItem);
                            
                            setTimeout(() => {
                                const progressBar = fileItem.querySelector('.file-progress-bar');
                                progressBar.style.width = '100%';
                            }, 100);
                            
                            const deleteBtn = fileItem.querySelector('.delete-btn');
                            deleteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                removeFile(file.name);
                            });
                        }
                        
                        function removeFile(fileName) {
                            uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
                            const fileItem = document.querySelector(`.file-item[data-file-name="${fileName}"]`);
                            if (fileItem) {
                                setTimeout(() => {
                                    filesList.removeChild(fileItem);
                                }, 300);
                            }
                            
                            updateSubmitButton();
                            fileInput.value = '';
                            resultArea.style.display = 'none';
                            resultArea.innerHTML = '';
                        }
                        
                        function updateSubmitButton() {
                            if (uploadedFiles.length > 0) {
                                submitBtn.disabled = false;
                                submitBtn.style.opacity = '1';
                            } else {
                                submitBtn.disabled = true;
                                submitBtn.style.opacity = '0.5';
                            }
                        }
                        
                        function formatFileSize(bytes) {
                            if (bytes < 1024) return bytes + ' bytes';
                            else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
                            else return (bytes / 1048576).toFixed(1) + ' MB';
                        }
                        
                        function showNotification(message, type = 'info') {
                            const notification = document.createElement('div');
                            notification.className = `notification ${type}`;
                            notification.textContent = message;
                            
                            document.body.appendChild(notification);
                            
                            setTimeout(() => {
                                notification.classList.add('fade-out');
                                setTimeout(() => {
                                    document.body.removeChild(notification);
                                }, 500);
                            }, 3000);
                        }
                        
                        function handleSubmit() {
                            submitBtn.disabled = true;
                            resultArea.style.display = 'block';
                            resultArea.innerHTML = `
                                <div class="loading">
                                    <div class="loading-spinner"></div>
                                    <div style="margin-left: 15px;">Analyzing APK files...</div>
                                </div>
                            `;
                            
                            setTimeout(() => {
                                simulateApiResponse();
                            }, 2500);
                        }
                        
                        function simulateApiResponse() {
                            const isThreat = Math.random() > 0.5;
                            
                            if (isThreat) {
                                resultArea.innerHTML = `
                                    <div class="result-threat result-appear">
                                        <div class="result-icon">
                                            <i class="fas fa-exclamation-triangle"></i>
                                        </div>
                                        <div>Ransomware Detected!</div>
                                    </div>
                                    <div style="margin-top: 15px; color: #ff6b6b;">
                                        Malicious code detected in one or more files. We recommend not installing these APKs.
                                    </div>
                                `;
                            } else {
                                resultArea.innerHTML = `
                                    <div class="result-safe result-appear">
                                        <div class="result-icon">
                                            <i class="fas fa-shield-alt"></i>
                                        </div>
                                        <div>No Threats Detected</div>
                                    </div>
                                    <div style="margin-top: 15px; color: #a0e9af;">
                                        The analyzed APK files appear to be safe and free from ransomware.
                                    </div>
                                `;
                            }
                            
                            submitBtn.disabled = false;
                        }
                        
                        // Improved statistics animation - now observes individual stat items
                        const statItems = document.querySelectorAll('.stat-item');
                        const radius = 45;
                        const circumference = 2 * Math.PI * radius;
                    
                        // Initialize all progress bars
                        statItems.forEach(item => {
                            const progressBar = item.querySelector('.progress-bar circle');
                            if (progressBar) {
                                progressBar.style.strokeDasharray = circumference;
                                progressBar.style.strokeDashoffset = circumference;
                            }
                        });
                    
                        const statObserver = new IntersectionObserver((entries) => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    const statNumber = entry.target.querySelector('.stat-number');
                                    const progressBar = entry.target.querySelector('.progress-bar circle');
                                    const value = parseFloat(statNumber.dataset.value);
                                    const maxValue = parseFloat(statNumber.dataset.maxValue || 100);
                                    
                                    animateValue(statNumber, 0, value, 1500, progressBar, maxValue);
                                    
                                    // Unobserve after animation to prevent retriggering while scrolling
                                    statObserver.unobserve(entry.target);
                                }
                            });
                        }, { 
                            threshold: 0.2,
                            rootMargin: '0px 0px -50px 0px'
                        });
                    
                        statItems.forEach(item => statObserver.observe(item));
                    
                        function animateValue(element, start, end, duration, progressBar, maxValue) {
                            let startTimestamp = null;
                            
                            const step = (timestamp) => {
                                if (!startTimestamp) startTimestamp = timestamp;
                                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                                
                                const currentValue = progress * (end - start) + start;
                                element.textContent = currentValue.toFixed(2);
                                
                                if (progressBar) {
                                    const dashoffset = circumference - (circumference * progress * (end / maxValue));
                                    progressBar.style.strokeDashoffset = dashoffset;
                                }
                                
                                if (progress < 1) {
                                    window.requestAnimationFrame(step);
                                }
                            };
                            
                            window.requestAnimationFrame(step);
                        }
                        
                        // Smooth scroll for internal links
                        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                            anchor.addEventListener('click', function(e) {
                                e.preventDefault();
                                const target = document.querySelector(this.getAttribute('href'));
                                if (target) {
                                    target.scrollIntoView({
                                        behavior: 'smooth'
                                    });
                                }
                            });
                        });
                    });
                    // Animate both counter and circular progress
                    animateValue(statNumber, 0, value, 1500, progressBar, maxValue);
                });
            } else {
                // Reset counters when section leaves view
                statNumbers.forEach((statNumber, index) => {
                    statNumber.textContent = '0.00';
                    
                    // Reset circular progress
                    if (progressBars[index]) {
                        progressBars[index].style.strokeDashoffset = circumference;
                    }
                });
            }
        });
    }, { threshold: 0.05 ,
        rootMargin: '0px 0px -50px 0px' // Adjust based on layout
    }); // Adjust threshold as needed

    aboutObserver.observe(aboutSection);

    function animateValue(element, start, end, duration, progressBar, maxValue) {
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Calculate current value based on progress
            const currentValue = progress * (end - start) + start;
            
            // Update counter text
            element.textContent = currentValue.toFixed(2);
            
            // Update circular progress - use the same progress value
            if (progressBar) {
                // Calculate progress proportion (from 0 to 1) for the progress bar
                // This ensures both animations complete at the same time
                const dashoffset = circumference - (circumference * progress * (end / maxValue));
                progressBar.style.strokeDashoffset = dashoffset;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }
    
    // Add a smooth scroll for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});