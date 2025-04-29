document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const addContactBtn = document.getElementById('addContactBtn');
    const saveContactBtn = document.getElementById('saveContactBtn');
    const contactForm = document.getElementById('contactForm');
    const contactsList = document.getElementById('contactsList');
    const noContactsMessage = document.getElementById('noContactsMessage');
    const contactsTable = document.getElementById('contactsTable');
    
    // Bootstrap modals
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    
    // Event listeners
    addContactBtn.addEventListener('click', function() {
        resetContactForm();
        document.getElementById('contactModalTitle').textContent = 'Add Contact';
        contactModal.show();
    });
    
    saveContactBtn.addEventListener('click', saveContact);
    
    // Initialize
    if (localStorage.getItem('authToken')) {
        loadUserContacts();
    }
    
    // Functions
    function loadUserContacts() {
        fetch('/api/kitchensink/contacts', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load contacts');
            }
            return response.json();
        })
        .then(contacts => {
            renderContacts(contacts);
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
        });
    }
    
    function renderContacts(contacts) {
        contactsList.innerHTML = '';
        
        if (contacts.length === 0) {
            noContactsMessage.style.display = 'block';
            contactsTable.style.display = 'none';
            return;
        }
        
        noContactsMessage.style.display = 'none';
        contactsTable.style.display = 'table';
        
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.phoneNumber}</td>
                <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
            `;
            
            contactsList.appendChild(row);
        });
    }
    
    function saveContact() {
        // Get form values
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const phoneNumber = document.getElementById('contactPhone').value;
        
        // Validate form
        if (!validateContactForm()) {
            return;
        }
        
        // Create contact object
        const contact = {
            name,
            email,
            phoneNumber
        };
        
        // Send request
        fetch('/api/kitchensink/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify(contact)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Failed to save contact'); });
            }
            return response.json();
        })
        .then(savedContact => {
            contactModal.hide();
            loadUserContacts();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
    
    function validateContactForm() {
        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const phone = document.getElementById('contactPhone');
        
        let isValid = true;
        
        // Reset previous validation
        name.classList.remove('is-invalid');
        email.classList.remove('is-invalid');
        phone.classList.remove('is-invalid');
        
        // Validate name
        if (!name.value || name.value.length < 2 || name.value.length > 100) {
            name.classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value || !emailRegex.test(email.value)) {
            email.classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate phone
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phone.value || !phoneRegex.test(phone.value)) {
            phone.classList.add('is-invalid');
            isValid = false;
        }
        
        return isValid;
    }
    
    function resetContactForm() {
        contactForm.reset();
        document.getElementById('contactId').value = '';
        
        // Reset validation
        document.getElementById('contactName').classList.remove('is-invalid');
        document.getElementById('contactEmail').classList.remove('is-invalid');
        document.getElementById('contactPhone').classList.remove('is-invalid');
    }
    
    // Expose functions for use in other JS files
    window.loadUserContacts = loadUserContacts;
});
