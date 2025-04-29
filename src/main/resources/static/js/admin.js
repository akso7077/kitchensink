document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const usersList = document.getElementById('usersList');
    const adminContactsList = document.getElementById('adminContactsList');
    const saveContactBtn = document.getElementById('saveContactBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Bootstrap modals
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // State
    let contactToDelete = null;
    
    // Initialize
    if (localStorage.getItem('authToken') && 
        JSON.parse(localStorage.getItem('currentUser') || '{}').roles?.includes('ROLE_ADMIN')) {
        loadAdminData();
    }
    
    // Event listeners
    saveContactBtn.addEventListener('click', function() {
        const contactId = document.getElementById('contactId').value;
        if (contactId) {
            updateContact(contactId);
        }
    });
    
    confirmDeleteBtn.addEventListener('click', function() {
        if (contactToDelete) {
            deleteContact(contactToDelete);
        }
    });
    
    // Functions
    function loadAdminData() {
        // Load users
        loadUsers();
        // Load all contacts
        loadAllContacts();
    }
    
    function loadUsers() {
        fetch('/api/admin/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load users');
            }
            return response.json();
        })
        .then(users => {
            renderUsers(users);
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
    }
    
    function renderUsers(users) {
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            const rolesBadges = user.roles.map(role => {
                const badgeClass = role === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary';
                const roleName = role.replace('ROLE_', '');
                return `<span class="badge ${badgeClass}">${roleName}</span>`;
            }).join(' ');
            
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${rolesBadges}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            `;
            
            usersList.appendChild(row);
        });
    }
    
    function loadAllContacts() {
        fetch('/api/admin/contacts', {
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
            renderAdminContacts(contacts);
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
        });
    }
    
    function renderAdminContacts(contacts) {
        adminContactsList.innerHTML = '';
        
        contacts.forEach(contact => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.phoneNumber}</td>
                <td>${contact.createdBy}</td>
                <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-contact" data-id="${contact.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-contact" data-id="${contact.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            adminContactsList.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-contact').forEach(button => {
            button.addEventListener('click', function() {
                const contactId = this.getAttribute('data-id');
                editContact(contactId);
            });
        });
        
        document.querySelectorAll('.delete-contact').forEach(button => {
            button.addEventListener('click', function() {
                const contactId = this.getAttribute('data-id');
                confirmDelete(contactId);
            });
        });
    }
    
    function editContact(contactId) {
        fetch(`/api/admin/contacts/${contactId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load contact');
            }
            return response.json();
        })
        .then(contact => {
            // Populate form
            document.getElementById('contactId').value = contact.id;
            document.getElementById('contactName').value = contact.name;
            document.getElementById('contactEmail').value = contact.email;
            document.getElementById('contactPhone').value = contact.phoneNumber;
            
            // Update modal title
            document.getElementById('contactModalTitle').textContent = 'Edit Contact';
            
            // Show modal
            contactModal.show();
        })
        .catch(error => {
            console.error('Error loading contact:', error);
            alert('Error: ' + error.message);
        });
    }
    
    function updateContact(contactId) {
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
        fetch(`/api/admin/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            },
            body: JSON.stringify(contact)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Failed to update contact'); });
            }
            return response.json();
        })
        .then(updatedContact => {
            contactModal.hide();
            loadAllContacts();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    }
    
    function confirmDelete(contactId) {
        contactToDelete = contactId;
        deleteModal.show();
    }
    
    function deleteContact(contactId) {
        fetch(`/api/admin/contacts/${contactId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete contact');
            }
            return response.json();
        })
        .then(data => {
            deleteModal.hide();
            loadAllContacts();
        })
        .catch(error => {
            console.error('Error deleting contact:', error);
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
    
    // Expose functions for use in other JS files
    window.loadAdminData = loadAdminData;
});