// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.jsx';
import './styles/index.css'; // Ensure path is correct

// --- Mock Adapter Setup ---
// Only run this in development mode
import axios from 'axios'; // Import the original axios library
import MockAdapter from 'axios-mock-adapter';
import apiClient from './services/apiClient'; // Import your configured instance
/*
if (import.meta.env.MODE === 'development') { // Vite specific env variable
  console.log("[Mock Adapter] Initializing in development mode...");
  const mock = new MockAdapter(apiClient, { delayResponse: 400 }); // Use your apiClient instance! Add delay.

  // ==================================
  // Mock Data Definitions
  // ==================================

  // --- Users ---
  const loggedInMockUser = { id: 1, name: "Mock User", email: "user@example.com", role: "student" }; // Default logged-in user
  const adminMockUser = { id: 99, name: "Admin User", email: "admin@example.com", role: "admin" };
  const mockOtherUsers = [
      { id: 2, name: 'Another Alum', email: 'alum@example.com', role: 'alumnus', status: 'active' },
      { id: 3, name: 'Test Student', email: 'student@example.com', role: 'student', status: 'active' },
      { id: 4, name: 'Inactive User', email: 'inactive@example.com', role: 'alumnus', status: 'inactive' },
      { id: 5, name: 'New Student', email: 'newbie@example.com', role: 'student', status: 'active' },
  ];
  let mockManagedUsers = [...mockOtherUsers]; // Users managed by admin
  const allMockUsers = [loggedInMockUser, adminMockUser, ...mockOtherUsers];
  let nextManagedUserId = 6; // Counter for adding new users

  // Helper to get basic user details
  const getMockUserDetails = (userId) => {
      const user = allMockUsers.find(u => u.id === userId);
      return user ? { id: user.id, name: user.name, role: user.role } : null;
  };

  // --- Events ---
  let mockEvents = [
      { id: 1, title: 'Annual Alumni Meet 2025', description: 'Reconnect with fellow alumni! Share memories and network.', date: '2025-12-15T18:00:00Z', location: 'College Auditorium', createdBy: 1, attendees: [1, 3] }, // User 1 created, User 1 & 3 attending
      { id: 2, title: 'Career Guidance Session', description: 'Seniors sharing career insights for final year students.', date: '2025-11-10T14:00:00Z', location: 'Online via Zoom', createdBy: 2, attendees: [3] }, // User 2 created, User 3 attending
      { id: 3, title: 'Startup Pitch Night', description: 'Alumni entrepreneurs pitch their ideas.', date: '2025-10-25T19:00:00Z', location: 'Innovation Hub', createdBy: 1, attendees: [] }, // User 1 created, no attendees yet
  ];
  let nextEventId = 4;

  // --- Posts ---
  let mockPosts = [
      { id: 101, content: 'Excited for the upcoming Annual Alumni Meet! Who else is going?', authorId: 1, authorName: 'Mock User', createdAt: new Date(Date.now() - 86400000).toISOString(), likes: 5, comments: ['c1-101', 'c2-101'], imageUrl: null }, // Liked count, comment IDs, no image
      { id: 102, content: 'Looking for advice on transitioning into project management roles. Any tips?', authorId: 2, authorName: 'Another Alum', createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), likes: 12, comments: ['c1-102'], imageUrl: null }, // 3 hours ago
      { id: 103, content: 'Check out this photo from the reunion!', authorId: 1, authorName: 'Mock User', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), likes: 8, comments: [], imageUrl: `https://placehold.co/600x400/ABC/white?text=Reunion+Photo` }, // With image
  ];
  let nextPostId = 104;

  // --- Comments ---
  let mockCommentsData = {
      '101': [
          { id: 'c1-101', postId: 101, authorId: 2, authorName: 'Another Alum', text: 'Great question!', createdAt: new Date(Date.now() - 300000).toISOString() },
          { id: 'c2-101', postId: 101, authorId: 1, authorName: 'Mock User', text: 'Thanks!', createdAt: new Date(Date.now() - 60000).toISOString() },
      ],
      '102': [
           { id: 'c1-102', postId: 102, authorId: 1, authorName: 'Mock User', text: 'Focus on transferable skills!', createdAt: new Date(Date.now() - 120000).toISOString() },
      ],
      '103': [], // No comments for post 103 yet
  };
  let nextCommentId = 3; // Counter for new comment IDs (simple)

  // --- Follows ---
  // User 1 follows User 2. User 3 follows User 1. User 2 follows User 1.
  const mockFollowData = {
      user1_following: [2],
      user1_followers: [3, 2],
      user2_following: [1],
      user2_followers: [1],
      user3_following: [1],
      user3_followers: [],
  };


  // ==================================
  // Mock API Endpoint Handlers
  // ==================================
  console.log("[Mock Adapter] Defining handlers...");

  // --- Auth Handlers ---
  mock.onPost('/auth/login').reply((config) => {
      const credentials = JSON.parse(config.data);
      console.log("[Mock Adapter] Intercepted POST /auth/login with data:", credentials);
      if (credentials.email === loggedInMockUser.email && credentials.password === "password") {
          return [200, { user: loggedInMockUser, token: "fake-jwt-token-" + Date.now() }];
      } else if (credentials.email === adminMockUser.email && credentials.password === "adminpass") {
          return [200, { user: adminMockUser, token: "fake-admin-token-" + Date.now() }];
      } else {
          return [401, { message: "Invalid mock credentials" }];
      }
  });

  mock.onGet('/auth/me').reply((config) => {
      console.log("[Mock Adapter] Intercepted GET /auth/me");
      const token = config.headers['Authorization']?.split(' ')[1];
      if (token && token.startsWith('fake-jwt-token-')) {
          return [200, loggedInMockUser]; // Return default user for regular token
      } else if (token && token.startsWith('fake-admin-token-')) {
           return [200, adminMockUser]; // Return admin user for admin token
      } else {
          return [401, { message: "Unauthorized: Invalid or missing token" }];
      }
  });

  // --- Event Handlers ---
  mock.onGet('/events').reply(200, [...mockEvents]);

  mock.onGet(/\/events\/(\d+)/).reply((config) => {
      const eventId = parseInt(config.url.split('/').pop(), 10);
      const event = mockEvents.find(e => e.id === eventId);
      return event ? [200, { ...event }] : [404, { message: `Event ${eventId} not found` }];
  });

  mock.onPost('/events').reply((config) => {
      const eventData = JSON.parse(config.data);
      const newEvent = { ...eventData, id: nextEventId++, createdBy: 1, attendees: [] }; // Assume user 1 created
      mockEvents.push(newEvent);
      return [201, newEvent];
  });

  mock.onPut(/\/events\/(\d+)/).reply((config) => {
      const eventId = parseInt(config.url.split('/').pop(), 10);
      const updatedData = JSON.parse(config.data);
      const index = mockEvents.findIndex(e => e.id === eventId);
      if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...updatedData };
          return [200, { ...mockEvents[index] }];
      }
      return [404, { message: `Event ${eventId} not found` }];
  });

  mock.onDelete(/\/events\/(\d+)/).reply((config) => { // For creator delete
      const eventId = parseInt(config.url.split('/').pop(), 10);
      const initialLength = mockEvents.length;
      mockEvents = mockEvents.filter(e => e.id !== eventId);
      return mockEvents.length < initialLength ? [200, {}] : [404, { message: `Event ${eventId} not found` }];
  });

  mock.onPost(/\/events\/(\d+)\/join/).reply((config) => {
      const eventId = parseInt(config.url.split('/')[2], 10);
      const index = mockEvents.findIndex(e => e.id === eventId);
      if (index !== -1 && !mockEvents[index].attendees?.includes(1)) { // Assume user 1 joins
          if (!mockEvents[index].attendees) mockEvents[index].attendees = [];
          mockEvents[index].attendees.push(1);
      }
      return [200, {}];
  });

  mock.onDelete(/\/events\/(\d+)\/join/).reply((config) => {
      const eventId = parseInt(config.url.split('/')[2], 10);
      const index = mockEvents.findIndex(e => e.id === eventId);
      if (index !== -1 && mockEvents[index].attendees) { // Assume user 1 leaves
          mockEvents[index].attendees = mockEvents[index].attendees.filter(id => id !== 1);
      }
      return [200, {}];
  });


  // --- Post Handlers ---
  mock.onGet('/posts').reply(200, [...mockPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

  mock.onPost('/posts').reply((config) => {
      let content = ''; let imageUrl = null; let postData;
      try { postData = JSON.parse(config.data); content = postData.content || ''; }
      catch (e) { content = "Post with image (simulated)"; imageUrl = `https://placehold.co/600x400/D1D5DB/374151?text=Mock+Image+${Date.now()}`; }
      const newPost = { id: nextPostId++, content: content, authorId: 1, authorName: 'Mock User', createdAt: new Date().toISOString(), likes: 0, comments: [], imageUrl: imageUrl };
      mockPosts.push(newPost);
      return [201, newPost];
  });

   mock.onPut(/\/posts\/(\d+)/).reply((config) => {
      const postId = parseInt(config.url.split('/').pop(), 10);
      const updatedData = JSON.parse(config.data);
      const index = mockPosts.findIndex(p => p.id === postId);
      if (index !== -1) { mockPosts[index] = { ...mockPosts[index], ...updatedData }; return [200, { ...mockPosts[index] }]; }
      return [404, { message: `Post ${postId} not found` }];
  });

  mock.onDelete(/\/posts\/(\d+)/).reply((config) => {
      const postId = parseInt(config.url.split('/').pop(), 10);
      const initialLength = mockPosts.length;
      mockPosts = mockPosts.filter(p => p.id !== postId);
      if (mockPosts.length < initialLength) { if (mockCommentsData[postId]) delete mockCommentsData[postId]; return [200, {}]; }
      return [404, { message: `Post ${postId} not found` }];
  });

  mock.onPost(/\/posts\/(\d+)\/like/).reply((config) => {
      const postId = parseInt(config.url.split('/')[2], 10);
      const index = mockPosts.findIndex(p => p.id === postId);
      if (index !== -1) mockPosts[index].likes = (mockPosts[index].likes || 0) + 1; // Simulate increment
      return [200, {}];
  });

  mock.onDelete(/\/posts\/(\d+)\/like/).reply((config) => {
      const postId = parseInt(config.url.split('/')[2], 10);
      const index = mockPosts.findIndex(p => p.id === postId);
      if (index !== -1) mockPosts[index].likes = Math.max(0, (mockPosts[index].likes || 0) - 1); // Simulate decrement
      return [200, {}];
  });


  // --- Comment Handlers ---
  mock.onGet(/\/posts\/(\d+)\/comments/).reply((config) => {
      const postId = parseInt(config.url.split('/')[2], 10);
      const comments = mockCommentsData[postId] || [];
      return [200, [...comments]];
  });

  mock.onPost(/\/posts\/(\d+)\/comments/).reply((config) => {
      const postId = parseInt(config.url.split('/')[2], 10);
      const commentData = JSON.parse(config.data);
      const newComment = { id: `c${nextCommentId++}-${postId}`, postId: postId, authorId: 1, authorName: 'Mock User', text: commentData.text, createdAt: new Date().toISOString() };
      if (!mockCommentsData[postId]) mockCommentsData[postId] = [];
      mockCommentsData[postId].push(newComment);
      // Update comment count on post (optional)
      const postIndex = mockPosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) mockPosts[postIndex].comments = mockCommentsData[postId].map(c => c.id);
      return [201, newComment];
  });

  mock.onDelete(/\/comments\/(c\d+-\d+)/).reply((config) => {
      const commentId = config.url.split('/').pop();
      let found = false;
      for (const postId in mockCommentsData) {
          const initialLength = mockCommentsData[postId].length;
          mockCommentsData[postId] = mockCommentsData[postId].filter(c => c.id !== commentId);
          if (mockCommentsData[postId].length < initialLength) {
              found = true;
              // Update comment count on post (optional)
               const postIndex = mockPosts.findIndex(p => p.id === parseInt(postId, 10));
               if (postIndex !== -1) mockPosts[postIndex].comments = mockCommentsData[postId].map(c => c.id);
              break;
          }
      }
      return found ? [200, {}] : [404, { message: `Comment ${commentId} not found` }];
  });


  // --- Profile & Follow Handlers ---
  mock.onPut('/users/me').reply((config) => {
      const updatedData = JSON.parse(config.data);
      // Assume updating loggedInMockUser (user 1)
      const updatedUser = { ...loggedInMockUser, ...updatedData };
      // Update user in allMockUsers if needed for consistency
      const userIndex = allMockUsers.findIndex(u => u.id === loggedInMockUser.id);
      if (userIndex !== -1) allMockUsers[userIndex] = updatedUser;
      return [200, updatedUser];
  });

  mock.onGet(/\/users\/(\d+)/).reply((config) => { // Profile fetch by ID
      const userId = parseInt(config.url.split('/').pop(), 10);
      const user = allMockUsers.find(u => u.id === userId);
      return user ? [200, { ...user }] : [404, { message: `User with ID ${userId} not found (Mock)` }];
  });

  mock.onPost(/\/users\/(\d+)\/follow/).reply((config) => { // Follow user
      const userIdToFollow = parseInt(config.url.split('/')[2], 10);
      // Simulate user 1 following someone
      if (!mockFollowData.user1_following.includes(userIdToFollow)) {
          mockFollowData.user1_following.push(userIdToFollow);
      }
      // Simulate target user gaining a follower
      const targetFollowersKey = `user${userIdToFollow}_followers`;
      if (!mockFollowData[targetFollowersKey]) mockFollowData[targetFollowersKey] = [];
      if (!mockFollowData[targetFollowersKey].includes(1)) {
           mockFollowData[targetFollowersKey].push(1);
      }
      return [200, {}];
  });

  mock.onDelete(/\/users\/(\d+)\/follow/).reply((config) => { // Unfollow user
      const userIdToUnfollow = parseInt(config.url.split('/')[2], 10);
      // Simulate user 1 unfollowing someone
      mockFollowData.user1_following = mockFollowData.user1_following.filter(id => id !== userIdToUnfollow);
      // Simulate target user losing a follower
      const targetFollowersKey = `user${userIdToUnfollow}_followers`;
      if (mockFollowData[targetFollowersKey]) {
          mockFollowData[targetFollowersKey] = mockFollowData[targetFollowersKey].filter(id => id !== 1);
      }
      return [200, {}];
  });

  mock.onGet(/\/users\/(\d+)\/followers/).reply((config) => {
      const userId = parseInt(config.url.split('/')[2], 10);
      const followerIds = mockFollowData[`user${userId}_followers`] || [];
      const followers = followerIds.map(getMockUserDetails).filter(Boolean);
      return [200, followers];
  });

  mock.onGet(/\/users\/(\d+)\/following/).reply((config) => {
      const userId = parseInt(config.url.split('/')[2], 10);
      const followingIds = mockFollowData[`user${userId}_following`] || [];
      const following = followingIds.map(getMockUserDetails).filter(Boolean);
      return [200, following];
  });


  // --- Admin Handlers ---
  mock.onGet('/admin/users').reply(200, [...mockManagedUsers]);

  mock.onDelete(/\/admin\/users\/(\d+)/).reply((config) => {
      const userId = parseInt(config.url.split('/').pop(), 10);
      const initialLength = mockManagedUsers.length;
      mockManagedUsers = mockManagedUsers.filter(u => u.id !== userId);
      return mockManagedUsers.length < initialLength ? [200, {}] : [404, { message: `User ${userId} not found` }];
  });

  mock.onPost('/admin/users').reply((config) => {
      const userData = JSON.parse(config.data);
      if (mockManagedUsers.some(u => u.email === userData.email)) return [400, { message: `Email ${userData.email} exists` }];
      const newUser = { id: nextManagedUserId++, ...userData, status: 'active' };
      mockManagedUsers.push(newUser);
      // Also add to all users list if needed for profile lookups
      if (!allMockUsers.some(u => u.id === newUser.id)) allMockUsers.push(newUser);
      return [201, newUser];
  });

  mock.onPatch(/\/admin\/users\/(\d+)\/status/).reply((config) => {
      const userId = parseInt(config.url.split('/')[2], 10);
      const { status: newStatus } = JSON.parse(config.data);
      const index = mockManagedUsers.findIndex(u => u.id === userId);
      if (index !== -1 && (newStatus === 'active' || newStatus === 'inactive')) {
          mockManagedUsers[index].status = newStatus;
          // Update in allMockUsers as well
          const allIndex = allMockUsers.findIndex(u => u.id === userId);
          if (allIndex !== -1) allMockUsers[allIndex].status = newStatus;
          return [200, { ...mockManagedUsers[index] }];
      }
      return index === -1 ? [404, { message: `User ${userId} not found` }] : [400, { message: 'Invalid status' }];
  });

  mock.onDelete(/\/admin\/events\/(\d+)/).reply((config) => { // Admin remove event
      const eventId = parseInt(config.url.split('/').pop(), 10);
      const initialLength = mockEvents.length;
      mockEvents = mockEvents.filter(e => e.id !== eventId);
      return mockEvents.length < initialLength ? [200, {}] : [404, { message: `Event ${eventId} not found` }];
  });


  // --- College Registration Handler ---
  mock.onPost('/colleges/register').reply((config) => {
      const regData = JSON.parse(config.data);
      const mockResponse = { id: `college-${Date.now()}`, collegeName: regData.collegeName, status: 'pending_approval', adminEmail: regData.adminUser.email };
      return [201, mockResponse];
  });

  
// --- Mock User Search Endpoint ---

// Mock GET /search/users?q=query
mock.onGet('/search/users').reply((config) => {
    const query = config.params?.q?.toLowerCase() || ''; // Get query from params, make it lowercase
    console.log(`[Mock Adapter] Intercepted GET /search/users with query: "${query}"`);

    if (!query) {
        console.log("[Mock Adapter] Empty query, returning empty array.");
        return [200, []]; // Return empty array for empty query
    }

    // Use your existing allMockUsers array or define a specific search pool
    const allMockUsersForSearch = [
        { id: 1, name: "Mock User", role: "alumnus", email: "user@example.com" },
        { id: 2, name: 'Another Alum', role: 'alumnus', email: 'alum@example.com' },
        { id: 3, name: 'Test Student', role: 'student', email: 'student@example.com' },
        { id: 4, name: 'Admin User', role: 'admin', email: 'admin@example.com' },
        { id: 5, name: 'Jane Doe (Alumni)', role: 'alumnus', email: 'jane.doe@example.com' },
        { id: 6, name: 'John Smith (Student)', role: 'student', email: 'john.smith@example.com' },
        // Add more users if needed for testing search
    ];

    const filteredResults = allMockUsersForSearch.filter(user =>
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))
    );

    console.log(`[Mock Adapter] Replying 200 OK to /search/users with ${filteredResults.length} results.`);
    return [200, filteredResults]; // Return the filtered results
});

// --- End Mock User Search Endpoint ---

// Mock POST /donations
mock.onPost('/donations').reply((config) => {
    const donationData = JSON.parse(config.data);
    console.log("[Mock Adapter] Intercepted POST /donations with data:", donationData);

    // Simulate basic validation or processing
    if (!donationData.amount || parseFloat(donationData.amount) <= 0) {
        console.log("[Mock Adapter] Invalid donation amount. Replying 400 Bad Request.");
        return [400, { message: "Invalid donation amount provided." }];
    }
    if (!donationData.userId) {
        console.log("[Mock Adapter] User ID missing for donation. Replying 400 Bad Request.");
        return [400, { message: "User ID is required to process donation." }];
    }

    // Simulate a successful donation processing
    const mockDonationResponse = {
        transactionId: `mock-txn-${Date.now()}`,
        amount: parseFloat(donationData.amount),
        currency: "USD", // Assuming USD
        status: "success",
        message: "Donation processed successfully (Mock).",
        timestamp: new Date().toISOString(),
        userId: donationData.userId,
        paymentMethod: donationData.paymentMethod
    };

    console.log("[Mock Adapter] Successfully processed donation. Replying 201 Created with:", mockDonationResponse);
    // Return 201 Created status and the simulated response object
    return [201, mockDonationResponse];
});

// --- End Mock Donation Processing Endpoint ---


  console.log("[Mock Adapter] Handlers defined.");

} // End of if (import.meta.env.MODE === 'development')
*/
// ==================================
// Render Application
// ==================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
