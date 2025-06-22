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

  // Initial route
  router();
});

// Router function
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
  if (entryId) {
    fetch(`/api/v1/entries/${entryId}`)
      .then(response => response.json())
      .then(entry => {
        document.getElementById('entry-editor').innerHTML = `
          <h2>Edit Entry</h2>
          <input type="text" id="entry-title" value="${entry.title}">
          <textarea id="entry-content">${entry.content}</textarea>
          <button onclick="saveEntry('${entryId}')">Save</button>
        `;
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
  fetch('/api/v1/entries')
    .then(response => response.json())
    .then(entries => {
      const entriesContainer = document.querySelector('.entries');
      entriesContainer.innerHTML = entries.map(entry => `
        <div class="entry">
          <div class="entry-header">
            <h3>${entry.title}</h3>
            <div class="entry-actions">
              <span class="entry-date">${new Date(entry.created_at).toLocaleString()}</span>
              <button class="edit-btn" onclick="navigateTo('/entry/${entry.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn" onclick="deleteEntry('${entry.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="note">${entry.content}</p>
        </div>
      `).join('');
    });
}

function saveEntry(entryId) {
  const title = document.getElementById('entry-title').value;
  const content = document.getElementById('entry-content').value;
  
  const method = entryId ? 'PUT' : 'POST';
  const url = entryId ? `/api/v1/entries/${entryId}` : '/api/v1/entries';
  
  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ title, content })
  })
  .then(() => {
    navigateTo('/dashboard');
  });
}

function deleteEntry(entryId) {
  fetch(`/api/v1/entries/${entryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    fetchEntries();
  });
}

// Auth functions
function handleLogin(email, password) {
  console.log('Attempting login with:', email);
  fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Login failed: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (!data.token) {
      throw new Error('No token received');
    }
    console.log('Login successful, token received');
    localStorage.setItem('token', data.token);
    navigateTo('/dashboard');
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('Login failed. Please check console for details.');
  });
}

function handleSignup(name, email, password) {
  console.log('Attempting signup with:', name, email);
  fetch('/api/v1/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Signup failed: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    if (!data.token) {
      throw new Error('No token received');
    }
    console.log('Signup successful, token received');
    localStorage.setItem('token', data.token);
    navigateTo('/dashboard');
  })
  .catch(error => {
    console.error('Signup error:', error);
    alert('Signup failed. Please check console for details.');
  });
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
