# My Diary
A personal diary application that allows users to document their thoughts, memories, and experiences securely. This application provides a user-friendly interface to create, edit, and delete diary entries, with user authentication to ensure privacy.

## Project Overview
**Application Links:**
- [Live Application](https://diary-roan.vercel.app)
- [API Documentation](https://documenter.getpostman.com/view/44888935/2sB3BBqBqC)

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create a new user account
- `POST /api/v1/auth/login` - Authenticate user and get JWT token

### User Profile
- `GET /api/v1/profile` - Get authenticated user's profile
- `PUT /api/v1/profile` - Update authenticated user's profile

### Diary Entries
- `GET /api/v1/entries` - Get all diary entries for authenticated user
- `GET /api/v1/entries/:id` - Get specific diary entry by ID
- `POST /api/v1/entries` - Create new diary entry
- `PUT /api/v1/entries/:id` - Update existing diary entry
- `DELETE /api/v1/entries/:id` - Delete diary entry

### Reminders
- `PUT /api/v1/reminder` - Configure reminder settings
- `GET /api/v1/reminder` - Get current reminder settings


## Features

- **User Authentication**: Secure signup and login system to protect user data.
- **Diary Entries**: Create, view, edit, and delete personal diary entries with titles and content.
- **Dashboard**: A clean interface to view all entries with a welcome message for users.
- **Responsive Design**: Fully responsive layout using CSS Flexbox/Grid that adapts to mobile, tablet, and desktop screens for optimal viewing across devices.
- **Reminder Notifications**: Configure email reminders to help users maintain consistent diary habits.

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express framework
- **Database**: PostgresSQL is used. Configured via environment variables
- **Authentication**: JWT (JSON Web Tokens) for secure user sessions

## Project Structure

- **UI/**: Contains frontend files including HTML, CSS, and JavaScript for the user interface.
- **Backend/**: Includes server-side code with models, controllers, services, and routers for handling API requests.
- **tests/**: Test files for ensuring functionality of various components.

## Setup Instructions

1. **Clone the Repository**: If you haven't already, clone this repository to your local machine.
   ```bash
   git clone https://github.com/Kingsheunn/Diary.git
   cd Diary
   ```

2. **Install Dependencies**: Install the necessary npm packages.
   ```bash
   npm install
   ```

3. **Environment Configuration**: Create a `.env` file in the root directory with necessary environment variables (e.g., database connection details, JWT secret). Refer to `.env.example` if available.

4. **Run the Application**: Start the backend server.
   ```bash
   node Backend/app.js
   ```

5. **Access the Application**: Open your browser and navigate to `http://localhost:5000` to use the Diary application.

## Usage

- **Sign Up**: Create a new account by providing your name, email, and password.
- **Log In**: Access your diary by logging in with your credentials.
- **Create Entry**: Click 'New Entry' on the dashboard to write a new diary entry.
- **Edit Entry**: Use the 'Edit' button (with a pencil icon) to modify an existing entry.
- **Delete Entry**: Use the 'Delete' button (with a trash icon) to remove an entry.
- **Set And Get Notification**: Set, Update, Get notification through the pop-up settings.
- **Logout**: Click 'Logout' to end your session and return to the login page.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs, feature requests, or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if applicable).
