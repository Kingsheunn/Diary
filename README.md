# My Diary

A personal diary application that allows users to document their thoughts, memories, and experiences securely. This application provides a user-friendly interface to create, edit, and delete diary entries, with user authentication to ensure privacy.

## Features

- **User Authentication**: Secure signup and login system to protect user data.
- **Diary Entries**: Create, view, edit, and delete personal diary entries with titles and content.
- **Dashboard**: A clean interface to view all entries with a welcome message for users.
- **Responsive Design**: Styled with CSS for a pleasant user experience on various devices.
- **API Documentation**: Comprehensive Swagger documentation for all endpoints.

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

## API Documentation

The application includes Swagger API documentation. After starting the server, you can access the documentation at:

- Local development: `http://localhost:5000/api-docs`
- Production: `https://diary-roan.vercel.app/api-docs`

The documentation provides:
- Detailed endpoint descriptions
- Request/response examples
- Interactive testing capabilities

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
- **Logout**: Click 'Logout' to end your session and return to the login page.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for any bugs, feature requests, or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if applicable).
