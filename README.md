# 🌟 Rakt - Blood Donation Website 🌟
![Screenshot from 2025-02-01 04-41-59](https://github.com/user-attachments/assets/99878bdb-f44b-47fb-a70b-8cb3494833c2)

## Overview

Rakt is a blood donation website that provides a platform for users to donate blood and find donors. The application includes basic CRUD (Create, Read, Update, Delete) functionalities, allowing users to manage donor information effectively.

### 🚀 Live Demo

You can view the live application [here](https://rakt-blood-donation.netlify.app/).

## Features

- 📝 **User  Authentication**: Signup and login functionality for users.
- 💉 **Donor Registration**: A form for users to register as blood donors.
- 🔍 **Search Functionality**: Search for donors by blood type and pincode.
- ✏️ **Update and Delete**: Manage donor information with update and delete options.
- 📱 **Responsive Design**: Optimized for various devices for a better user experience.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: Supabase
- **Hosting**: Netlify for frontend, Glitch for backend

## What I Learned

During the development of this project, I gained valuable experience in:

- **CRUD Operations**: Implemented full CRUD functionalities for managing donor information.
- **Frontend and Backend Integration**: Connected the frontend with the backend API using Fetch API for data submission and retrieval.
- **User  Authentication**: Implemented user authentication using JWT (JSON Web Tokens) to secure user sessions.
- **Database Management**: Gained hands-on experience with Supabase, including setting up tables and managing relationships.
- **Error Handling**: Improved debugging skills and learned to handle errors related to database constraints and CORS issues.

## Challenges Faced

While hosting and deploying the application, I encountered several challenges:

1. 🌐 **CORS Issues**: Resolved CORS errors when connecting the frontend hosted on Netlify with the backend on Glitch by configuring CORS settings in the Express server.
2. ⚠️ **Database Constraints**: Handled unique constraint violations when inserting donor data by implementing checks to prevent duplicate entries.
3. 🔒 **Row-Level Security**: Learned to implement row-level security in Supabase, creating appropriate policies for data insertion and retrieval.
4. 🚧 **Deployment Issues**: Ensured that my Netlify deployment reflected changes made in Glitch by keeping the deployment in sync with code changes.

## Conclusion

Building the Rakt blood donation website was a valuable experience that enhanced my skills in web development, database management, and API integration. I am excited to continue improving this project and adding more features in the future. 🌈
