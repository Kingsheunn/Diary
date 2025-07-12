// Client-side routing
const routes = {
  '/': showLogin,
  '/dashboard': showDashboard,
  '/entry/:id': showEntryEditor
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  // Handle navigation
  window.addEventListener('popstate', router);
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });

  // Form submission handlers
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    handleLogin(email, password);
  });

  // Initial route
  router();
});

function router() {
  const path = window.location.pathname;
  const match = Object.keys(routes).find(route => {
    if (route.includes(':')) {
      const routeParts = route.split('/');
      const pathParts = path.split('/');
      if (routeParts.length !== pathParts.length) return false;
      return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
    }
    return route === path;
  });

  if (match) {
    const param = match.includes(':') ? 
      path.split('/').pop() : null;
    routes[match](param);
  } else {
    // 404 - Redirect to login
    navigateTo('/');
  }
}

// Navigation helper
function navigateTo(path) {
  window.history.pushState({}, '', path);
  router();
}

// View functions
function showLogin() {
  document.getElementById('container').classList.remove('active');
}

function showDashboard() {
  fetchEntries();
  document.getElementById('container').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

function showEntryEditor(entryId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No authentication token found. Please log in again.');
    navigateTo('/');
    return;
  }
  
  if (entryId && entryId !== 'new') {
    fetch(`/api/v1/entries/${entryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`Failed to fetch entry: ${err.message || 'Unknown error'} (Status: ${response.status})`);
          });
        }
        return response.json();
      })
      .then(entry => {
        document.getElementById('entry-editor').innerHTML = `
          <h2>Edit Entry</h2>
          <input type="text" id="entry-title" value="${entry.title}">
          <textarea id="entry-content">${entry.content}</textarea>
          <button onclick="saveEntry('${entryId}')">Save</button>
        `;
      })
      .catch(error => {
        console.error('Error loading entry:', error);
        alert(`Failed to load entry: ${error.message}`);
        if (error.message.includes('No token provided') || error.message.includes('Access denied')) {
          localStorage.removeItem('token');
          navigateTo('/');
        }
      });
  } else {
    document.getElementById('entry-editor').innerHTML = `
      <h2>New Entry</h2>
      <input type="text" id="entry-title" placeholder="Title">
      <textarea id="entry-content" placeholder="Write your thoughts..."></textarea>
      <button onclick="saveEntry()">Save</button>
    `;
  }
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('entry-editor').style.display = 'block';
}

// API functions
function fetchEntries() {
  fetch('/api/v1/entries', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(`Failed to fetch entries: ${err.message || 'Unknown error'} (Status: ${response.status})`);
        });
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data.entries)) {
        throw new Error('Invalid entries data format');
      }
      const entriesContainer = document.querySelector('.entries');
      entriesContainer.innerHTML = data.entries.map(entry => `
        <div class="entry">
          <div class="entry-header">
            <h3>${entry.title}</h3>
            <div class="entry-actions">
              <span class="entry-date">${new Date(entry.created_at).toLocaleString()}</span>
              <button class="edit-btn" onclick="navigateTo('/entry/${entry.id}')">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="delete-btn" onclick="deleteEntry('${entry.id}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
          <p class="note">${entry.content}</p>
        </div>
      `).join('');
    })
    .catch(error => {
      console.error('Error fetching entries:', error);
      alert(`Failed to load entries: ${error.message}`);
    });
}

function saveEntry(entryId) {
  const title = document.getElementById('entry-title').value;
  const content = document.getElementById('entry-content').value;
  
  if (!title || !content) {
    alert('Please fill in both title and content');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No authentication token found. Please log in again.');
    navigateTo('/');
    return;
  }

  const method = entryId && entryId !== 'new' ? 'PUT' : 'POST';
  const url = entryId && entryId !== 'new' ? `/api/v1/entries/${entryId}` : '/api/v1/entries';
  
  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(`Failed to save entry: ${err.message || 'Unknown error'} (Status: ${response.status})`);
      });
    }
    return response.json();
  })
  .then(() => {
    navigateTo('/dashboard');
  })
  .catch(error => {
    console.error('Error saving entry:', error);
    alert(`Error saving entry: ${error.message}`);
    if (error.message.includes('No token provided') || error.message.includes('Access denied')) {
      localStorage.removeItem('token');
      navigateTo('/');
    }
  });
}

function deleteEntry(entryId) {
  if (!confirm('Are you sure you want to delete this entry?')) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No authentication token found. Please log in again.');
    navigateTo('/');
    return;
  }
  
  fetch(`/api/v1/entries/${entryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(`Failed to delete entry: ${err.message || 'Unknown error'} (Status: ${response.status})`);
      });
    }
    fetchEntries();
  })
  .catch(error => {
    console.error('Error deleting entry:', error);
    alert(`Failed to delete entry: ${error.message}`);
    if (error.message.includes('No token provided') || error.message.includes('Access denied')) {
      localStorage.removeItem('token');
      navigateTo('/');
    }
  });
}

function logout() {
  localStorage.removeItem('token');
  navigateTo('/');
}

// Auth functions
async function handleLogin(email, password) {
  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    if (!data.token) {
      throw new Error('Authentication token missing in response');
    }

    localStorage.setItem('token', data.token);
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    alert(`Login failed: ${error.message}`);
  }
}

async function handleSignup(name, email, password) {
  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    if (!data.token) {
      console.error('Authentication token missing in response:', data);
      throw new Error('Authentication token missing in response');
    }

    localStorage.setItem('token', data.token);
    console.log('Token saved to localStorage:', data.token);
    alert('Signup successful. Token saved.');
    navigateTo('/dashboard');
  } catch (error) {
    console.error('Signup error:', error);
    alert(`Signup failed: ${error.message}`);
  }
}

// Existing toggle functionality
const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
