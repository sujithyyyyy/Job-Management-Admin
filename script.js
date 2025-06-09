const API_BASE_URL = 'https://job-management-admin-lmqi.onrender.com/api';



// DOM Elements
const jobListingsContainer = document.getElementById('job-listings');
const filterJobType = document.getElementById('filter-job-type');
const filterLocation = document.getElementById('filter-location');
const filterKeywords = document.getElementById('filter-keywords');


const createJobBtn = document.getElementById('create-job-btn'); 
const openModalBtn = document.getElementById('open-modal-btn'); 

const jobCreationModal = document.getElementById('job-creation-modal');
const closeModalBtn = document.querySelector('.modal .close-btn');
const jobCreationForm = document.getElementById('job-creation-form');

const formJobTitle = document.getElementById('job-title');
const formCompanyName = document.getElementById('company-name');


// Assuming your modal form fields have these IDs:
const modalFormLocation = document.getElementById('location'); // from your HTML structure for the modal
const modalFormJobType = document.getElementById('job-type'); // from your HTML structure for the modal
const modalFormSalaryMin = document.querySelector('#job-creation-form #salary-min'); // More specific selector for salary min in form
const modalFormSalaryMax = document.querySelector('#job-creation-form #salary-max'); // More specific selector for salary max in form
const formJobDescription = document.getElementById('job-description');
const formApplicationDeadline = document.getElementById('application-deadline');

/**
 * Fetches jobs from the API and renders them.
 * @param {object} filters - Optional filters (job_type, location, keywords)
 */
async function fetchJobs(filters = {}) {
    let url = `${API_BASE_URL}/jobs`;
    const queryParams = new URLSearchParams();

    if (filters.job_type) {
        queryParams.append('job_type', filters.job_type);
    }
    if (filters.location) {
        queryParams.append('location', filters.location);
    }
    if (filters.keywords) {
        queryParams.append('keywords', filters.keywords);
    }
    // Add salary range to query params if they exist and are valid
    if (filters.salary_min && !isNaN(parseFloat(filters.salary_min))) {
        queryParams.append('salary_min', parseFloat(filters.salary_min));
    }
    if (filters.salary_max && !isNaN(parseFloat(filters.salary_max))) {
        queryParams.append('salary_max', parseFloat(filters.salary_max));
    }

    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }
    console.log('Fetching jobs with URL:', url); // For debugging filters

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jobs = await response.json();
        renderJobs(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        jobListingsContainer.innerHTML = '<p class="error-message">Failed to load jobs. Please try again later.</p>';
    }
}

/**
 * Renders a list of jobs to the page.
 * @param {Array<object>} jobs - Array of job objects
 */
function renderJobs(jobs) { // Keep this first definition
    jobListingsContainer.innerHTML = ''; // Clear existing listings

    if (jobs.length === 0) {
        jobListingsContainer.innerHTML = '<p>No job postings found.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = renderJobCard(job);
        jobListingsContainer.appendChild(jobCard);
    });
}

/**
 * Creates a job card element matching the specified HTML structure.
 * @param {object} job - Job data object from backend
 * @returns {HTMLElement} - The job card element
 */
function renderJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

    // --- Data from backend or defaults ---
    const timestamp = job.created_at ? timeSince(new Date(job.created_at)) : (job.timestamp || 'Just Now'); // Use a timeSince function or fallback
    const companyInitial = job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C';
    const jobTitle = job.job_title || 'Job Title Not Provided';
    const experience = job.experience || 'N/A Exp'; // Assuming 'experience' might come from DB or be a new field
    const workModel = job.job_type || 'N/A'; // e.g., Onsite, Remote, Hybrid
    
    let salaryDisplay = 'N/A';
    if (job.salary_min && job.salary_max) {
        if (job.salary_min === job.salary_max) {
            salaryDisplay = `${job.salary_min / 100000}LPA`;
        } else {
            salaryDisplay = `${job.salary_min / 100000} - ${job.salary_max / 100000}LPA`;
        }
    } else if (job.salary_min) {
        salaryDisplay = `${job.salary_min / 100000}LPA`;
    } else if (job.salary_max) {
        salaryDisplay = `${job.salary_max / 100000}LPA`;
    }
    // Ensure your salary values in the DB are stored as full annual amounts (e.g., 1200000 for 12LPA)

    // Job description bullets - try to extract from job_description or use placeholders
    let bullets = [];
    if (job.job_description) {
        // Simple split by sentences or newlines. You might need more sophisticated parsing.
        const potentialBullets = job.job_description.split(/[\.\n]/).filter(b => b.trim() !== '');
        bullets = potentialBullets.slice(0, 3); // Take up to 3
        while (bullets.length < 2) { // Pad with placeholders if less than 3
            bullets.push(`Placeholder detail about the role ${bullets.length + 1}`);
        }
    } else {
        bullets = [
            "A user-friendly interface lets you browse stunning photos and videos",
            "Filter destinations based on interests and travel style, and create personalized",
            "Travel style, and create personalized"
        ];
    }

    card.innerHTML = `
        <span class="timestamp">${timestamp}</span>
        <div class="logo-container-1">
                    <div class="logo-container">
                        <img src="a96acfcadfa915e57e5d15e9fa0669560844f362.png" alt="Company Logo" class="company-logo-img">
                    </div>
                </div>
        <h3 class="job-title">${jobTitle}</h3>
        <div class="job-details">
            <span class="detail-item">
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                    <path
                        d="M11.7 17.75C11.7 15.7618 9.28233 14.15 6.29999 14.15C3.31766 14.15 0.899994 15.7618 0.899994 17.75M15.3 15.05V12.35M15.3 12.35V9.65M15.3 12.35H12.6M15.3 12.35H18M6.29999 11.45C4.31177 11.45 2.69999 9.83822 2.69999 7.85C2.69999 5.86177 4.31177 4.25 6.29999 4.25C8.28822 4.25 9.89999 5.86177 9.89999 7.85C9.89999 9.83822 8.28822 11.45 6.29999 11.45Z"
                        stroke="#5A5A5A" stroke-width="1.6" />
                </svg>
                ${experience}
            </span>
            <span class="detail-item">
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M1.76364 16.3408H3.49091M3.49091 16.3408H12.1273M3.49091 16.3408V4.42274C3.49091 3.45538 3.49091 2.97133 3.67918 2.60185C3.84478 2.27684 4.10882 2.0128 4.43383 1.8472C4.80331 1.65894 5.28736 1.65894 6.25472 1.65894H9.36381C10.3312 1.65894 10.8142 1.65894 11.1837 1.8472C11.5087 2.0128 11.7736 2.27684 11.9392 2.60185C12.1273 2.97097 12.1273 3.45443 12.1273 4.4199V9.43166M12.1273 16.3408H17.3091M12.1273 16.3408V9.43166M17.3091 16.3408H19.0364M17.3091 16.3408V9.43166C17.3091 8.62686 17.309 8.22465 17.1775 7.90723C17.0022 7.484 16.6663 7.14754 16.243 6.97223C15.9256 6.84075 15.5228 6.84075 14.718 6.84075C13.9132 6.84075 13.5108 6.84075 13.1933 6.97223C12.7701 7.14754 12.4341 7.484 12.2588 7.90723C12.1273 8.22465 12.1273 8.62685 12.1273 9.43166M6.08182 7.70439H9.53637M6.08182 5.11348H9.53637"
                        stroke="#5A5A5A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                ${workModel}
            </span>
            <span class="detail-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18.1728 10.0001L9.99096 15.4546L1.80914 10.0001M18.1728 13.6365L9.99096 19.091L1.80914 13.6365M18.1728 6.36373L9.99096 11.8183L1.80914 6.36373L9.99096 0.90918L18.1728 6.36373Z"
                        stroke="#5A5A5A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                ${salaryDisplay}
            </span>
        </div>
        <ul class="bullet-points">
            ${bullets.map(bullet => `<li>${bullet.trim()}</li>`).join('')}
        </ul>
        <button class="apply-btn">Apply Now</button>
    `;
    
    return card;
}

// Helper function for timestamp (optional, place it somewhere suitable in your script)
function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

// Make sure to remove or comment out any other `renderJobCard` or `createJobCard` functions
// to avoid conflicts.

function createJobCard(job) { // This function seems to be an older/alternative version, ensure it's not conflicting or remove if unused.
    // Create the card element
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
        <span class="timestamp">${job.timestamp || 'Just Now'}</span>
        <div class="logo-container-1">
            <div class="logo-container">
                <span class="company-initial">${job.companyInitial || 'A'}</span>
            </div>
        </div>
        <h3 class="job-title">${job.title}</h3>
        <div class="job-details">
            <span class="detail-item">
                <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                    <path d="M11.7 17.75C11.7 15.7618 9.28233 14.15 6.29999 14.15C3.31766 14.15 0.899994 15.7618 0.899994 17.75M15.3 15.05V12.35M15.3 12.35V9.65M15.3 12.35H12.6M15.3 12.35H18M6.29999 11.45C4.31177 11.45 2.69999 9.83822 2.69999 7.85C2.69999 5.86177 4.31177 4.25 6.29999 4.25C8.28822 4.25 9.89999 5.86177 9.89999 7.85C9.89999 9.83822 8.28822 11.45 6.29999 11.45Z" stroke="#5A5A5A" stroke-width="1.6" />
                </svg>
                ${job.experience}
            </span>
            <span class="detail-item">
                <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.76364 16.3408H3.49091M3.49091 16.3408H12.1273M3.49091 16.3408V4.42274C3.49091 3.45538 3.49091 2.97133 3.67918 2.60185C3.84478 2.27684 4.10882 2.0128 4.43383 1.8472C4.80331 1.65894 5.28736 1.65894 6.25472 1.65894H9.36381C10.3312 1.65894 10.8142 1.65894 11.1837 1.8472C11.5087 2.0128 11.7736 2.27684 11.9392 2.60185C12.1273 2.97097 12.1273 3.45443 12.1273 4.4199V9.43166M12.1273 16.3408H17.3091M12.1273 16.3408V9.43166M17.3091 16.3408H19.0364M17.3091 16.3408V9.43166C17.3091 8.62686 17.309 8.22465 17.1775 7.90723C17.0022 7.484 16.6663 7.14754 16.243 6.97223C15.9256 6.84075 15.5228 6.84075 14.718 6.84075C13.9132 6.84075 13.5108 6.84075 13.1933 6.97223C12.7701 7.14754 12.4341 7.484 12.2588 7.90723C12.1273 8.22465 12.1273 8.62685 12.1273 9.43166M6.08182 7.70439H9.53637M6.08182 5.11348H9.53637" stroke="#5A5A5A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                ${job.workModel}
            </span>
            <span class="detail-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.1728 10.0001L9.99096 15.4546L1.80914 10.0001M18.1728 13.6365L9.99096 19.091L1.80914 13.6365M18.1728 6.36373L9.99096 11.8183L1.80914 6.36373L9.99096 0.90918L18.1728 6.36373Z" stroke="#5A5A5A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                ${job.salary}
            </span>
        </div>
        <ul class="bullet-points">
            ${job.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
        </ul>
        <button class="apply-btn">Apply Now</button>
    `;
    return card;
}

function addJobCard(job) { // This function also seems to be an older/alternative version.
    const container = document.querySelector('.job-listings-container');
    container.appendChild(createJobCard(job));
}


// Modal Handling
function openModal() {
    if (jobCreationModal) jobCreationModal.style.display = 'block';
}

function closeModal() {
    if (jobCreationModal) jobCreationModal.style.display = 'none';
}

if (createJobBtn) {
    createJobBtn.addEventListener('click', openModal);
}
// If you have a separate main button to open modal, uncomment and use:
// if (openModalBtn) {
//     openModalBtn.addEventListener('click', openModal);
// }

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Close modal if user clicks outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === jobCreationModal) {
        closeModal();
    }
});

// Add Event Listener for Job Creation Form Submission
if (jobCreationForm) {
    jobCreationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Job creation form submitted.'); // For debugging

        // Check if container exists before proceeding
        if (!jobListingsContainer) {
            console.error('Job listings container not found in DOM');
            alert('Error: Could not find job listings container. Please refresh the page.');
            return;
        }

        const jobData = {
            job_title: formJobTitle.value,
            company_name: formCompanyName.value,
            location: modalFormLocation.value,
            job_type: modalFormJobType.value,
            salary_min: modalFormSalaryMin.value ? parseFloat(modalFormSalaryMin.value) : null,
            salary_max: modalFormSalaryMax.value ? parseFloat(modalFormSalaryMax.value) : null,
            job_description: formJobDescription.value,
            application_deadline: formApplicationDeadline.value
        };
        console.log('Sending job data:', JSON.stringify(jobData, null, 2)); // For debugging

        try {
            const response = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData),
            });
            console.log('Response received. Status:', response.status, 'Ok:', response.ok); // For debugging

            if (!response.ok) {
                let errorData = { message: `HTTP error! status: ${response.status}` };
                try {
                    const backendError = await response.json();
                    errorData = { ...errorData, ...backendError };
                    console.error('Backend error response:', backendError);
                } catch (e) {
                    const responseText = await response.text();
                    console.error('Failed to parse backend error response as JSON. Raw response text:', responseText);
                    errorData.rawResponse = responseText; 
                }
                throw new Error(errorData.message || `Failed to submit job. Status: ${response.status}`);
            }

            const newJob = await response.json();
            console.log('Successfully created job, response from backend:', newJob); // For debugging

            if (newJob && newJob.id) { 
                try {
                    const newCard = renderJobCard(newJob);
                    // Prepend to see the new card at the top immediately
                    jobListingsContainer.prepend(newCard); 
                    console.log('New job card rendered and prepended.');
                    alert('Job created successfully and added to the list!');
                } catch (renderError) {
                    console.error('Error rendering new job card:', renderError);
                    // Fallback to fetching all jobs if rendering fails
                    fetchJobs();
                    alert('Job created successfully! Refreshing list...');
                }
            } else {
                console.warn('Backend reported success, but the created job object was not returned or was malformed. Fetching all jobs as a fallback.');
                fetchJobs(); // Fallback to fetching all jobs
                alert('Job created successfully! Refreshing list...');
            }

            closeModal();
            jobCreationForm.reset();

        } catch (error) {
            console.error('Failed to submit job due to a network or unexpected error:', error);
            alert(`Failed to submit job. Please check console for network or other critical errors. Details: ${error.message}`);
        }
    });
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchJobs(); // Fetch and display all jobs on page load
});




  const filterMinSalarySlider = document.getElementById("salary-min"); 
  const filterMaxSalarySlider = document.getElementById("salary-max");
  const sliderValueDisplay = document.getElementById("salary-slider-value"); 
  const filterTrack = document.querySelector(".slider-track");

  function formatINR(value) {
    return "₹" + (value / 1000).toLocaleString('en-IN') + "k";
  }

  function updateAndApplySalaryFilter() {
    if (!filterMinSalarySlider || !filterMaxSalarySlider || !sliderValueDisplay || !filterTrack) {
        console.warn("Salary filter elements not found. Skipping update.");
        return;
    }
    let min = parseInt(filterMinSalarySlider.value);
    let max = parseInt(filterMaxSalarySlider.value);

    if (max < min) { // Swap if min is greater than max
        [filterMinSalarySlider.value, filterMaxSalarySlider.value] = [max, min];
        // Update local min/max after swap for correct display and filtering
        min = parseInt(filterMinSalarySlider.value);
        max = parseInt(filterMaxSalarySlider.value);
    }

    sliderValueDisplay.textContent = `${formatINR(min)} - ${formatINR(max)}`;

    const minPercent = (min / 200000) * 100;
    const maxPercent = (max / 200000) * 100;

    filterTrack.style.setProperty('--min', minPercent + '%');
    filterTrack.style.setProperty('--max', maxPercent + '%');
    filterTrack.style.setProperty('background',
      `linear-gradient(to right, #ccc ${minPercent}%, #000 ${minPercent}%, #000 ${maxPercent}%, #ccc ${maxPercent}%)`);
    
    applyFilters(); // Call applyFilters after updating the slider UI
  }

  if (filterMinSalarySlider && filterMaxSalarySlider) {
      filterMinSalarySlider.addEventListener("input", updateAndApplySalaryFilter);
      filterMaxSalarySlider.addEventListener("input", updateAndApplySalaryFilter);
      // Initial call to set up slider display and potentially filter if values are not default
      // However, applyFilters() will be called by DOMContentLoaded -> fetchJobs() initially without salary filters
      // So, just update the display here.
      // To set initial display correctly without triggering a filter:
      if (sliderValueDisplay && filterTrack) { // Check if display elements exist
        let min = parseInt(filterMinSalarySlider.value);
        let max = parseInt(filterMaxSalarySlider.value);
        if (max < min) [min, max] = [max, min]; // temp swap for display logic
        sliderValueDisplay.textContent = `${formatINR(min)} - ${formatINR(max)}`;
        const minPercent = (min / 200000) * 100;
        const maxPercent = (max / 200000) * 100;
        filterTrack.style.setProperty('--min', minPercent + '%');
        filterTrack.style.setProperty('--max', maxPercent + '%');
        filterTrack.style.setProperty('background',
        `linear-gradient(to right, #ccc ${minPercent}%, #000 ${minPercent}%, #000 ${maxPercent}%, #ccc ${maxPercent}%)`);
      } else {
        console.warn("Salary slider display elements not found for initial setup.");
      }
  } else {
    console.warn("Filter salary sliders not found. Salary filtering by slider will not work.");
  }

// --- Event Listeners for Text/Select Filters ---
if (filterKeywords) {
    filterKeywords.addEventListener('input', () => {
        // Optional: Add a debounce here if you want to wait for user to stop typing
        applyFilters();
    });
}

if (filterLocation) {
    filterLocation.addEventListener('input', () => {
        // Optional: Add a debounce here
        applyFilters();
    });
}

if (filterJobType) {
    filterJobType.addEventListener('change', applyFilters); // 'change' is usually better for select elements
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch without specific filters (or applyFilters if you want to respect initial form values)
    fetchJobs(); 
    
    // Setup salary slider display initially without triggering a filter action from here,
    // as updateAndApplySalaryFilter will be called by slider input events.
    // The existing initial setup for salary slider display in your code is fine.
    if (filterMinSalarySlider && filterMaxSalarySlider && sliderValueDisplay && filterTrack) {
        let min = parseInt(filterMinSalarySlider.value);
        let max = parseInt(filterMaxSalarySlider.value);
        if (max < min) [min, max] = [max, min]; 
        sliderValueDisplay.textContent = `${formatINR(min)} - ${formatINR(max)}`;
        const minPercent = (min / parseInt(filterMinSalarySlider.max)) * 100; // Use slider's max for percentage
        const maxPercent = (max / parseInt(filterMaxSalarySlider.max)) * 100; // Use slider's max for percentage
        filterTrack.style.setProperty('--min', minPercent + '%');
        filterTrack.style.setProperty('--max', maxPercent + '%');
        filterTrack.style.setProperty('background',
        `linear-gradient(to right, #ccc ${minPercent}%, #000 ${minPercent}%, #000 ${maxPercent}%, #ccc ${maxPercent}%)`);
    } else {
        console.warn("One or more salary slider display elements (filterMinSalarySlider, filterMaxSalarySlider, sliderValueDisplay, filterTrack) not found for initial setup within DOMContentLoaded.");
    }
});



function applyFilters() {
    const filters = {
        job_type: filterJobType?.value || '',
        location: filterLocation?.value || '',
        keywords: filterKeywords?.value || '',
        salary_min: filterMinSalarySlider?.value || '',
        salary_max: filterMaxSalarySlider?.value || ''
    };

    fetchJobs(filters);
}

