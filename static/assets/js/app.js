// assets/js/liveChat.js

document.addEventListener("DOMContentLoaded", () => {
    const chatMessages = document.querySelector(".chat-messages");
    const chatInput = document.querySelector("#message-input");
    const sendBtn = document.querySelector("#send-message-btn");
    const endChatBtn = document.getElementById("end-chat-btn");
    
    // Initialize user data
    initializeUserData();

    // Send message on button click
    sendBtn.addEventListener("click", () => {
        sendMessage();
    });

    // Send message on Enter key
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // End chat button event listener
    endChatBtn.addEventListener("click", () => {
        endChat();
    });

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (messageText === "") return;

        // Create and append customer message
        appendMessage("customer", messageText);

        // Clear input
        chatInput.value = "";

        // Disable input while waiting for response
        chatInput.disabled = true;
        sendBtn.disabled = true;

        try {
            // Make API call to Flask backend - using relative path
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: messageText
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Check if there's an error in the response
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Append the response from the API
            appendMessage("agent", data.response);
            
            // Log the intent for debugging
            console.log("Detected intent:", data.intent);
        } catch (error) {
            console.error("Error calling API:", error);
            // Show user-friendly error message
            appendMessage("agent", "I'm having trouble connecting to the support system. Please try again in a moment.");
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Append message to chat
    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);

        const messageContent = document.createElement("div");
        messageContent.classList.add("message-content");
        messageContent.textContent = text;

        const time = document.createElement("span");
        time.classList.add("message-time");
        time.textContent = getCurrentTime();

        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(time);
        chatMessages.appendChild(messageDiv);

        // Auto scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Get current time
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    }

    // Initialize user data
    function initializeUserData() {
        // Try to get user data from localStorage (simulating a logged-in user)
        const user = JSON.parse(localStorage.getItem("currentUser"));
        
        // If no user is found in localStorage, redirect to login (or use mock data for demo)
        if (!user) {
            // For demo purposes, we'll create a mock user if none exists
            createMockUser();
            return;
        }
        
        // Update profile section with user data
        updateProfileInfo(user);
        
        // Update chat header with user name
        updateChatHeader(user);
        
        // Generate AI summary based on user data
        generateAISummary(user);
    }

    // Create a mock user for demonstration
    function createMockUser() {
        // This simulates fetching user data after login
        const mockUser = {
            name: "John Smith",
            email: "john.smith@example.com",
            plan: "Pro Plan",
            joined: "Jan 15, 2024",
            status: "Active",
            lastLogin: new Date().toISOString()
        };
        
        // Store in localStorage to simulate user session
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        
        // Update UI with the user data
        updateProfileInfo(mockUser);
        updateChatHeader(mockUser);
        generateAISummary(mockUser);
    }

    // Update profile information with user data
    function updateProfileInfo(user) {
        const profileName = document.getElementById("profile-customer-name");
        const profileEmail = document.getElementById("profile-customer-email");
        const profilePlan = document.getElementById("profile-customer-plan");
        const profileJoined = document.getElementById("profile-customer-joined");
        const profileStatus = document.getElementById("profile-customer-status");
        
        if (profileName) profileName.textContent = user.name;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profilePlan) profilePlan.textContent = user.plan;
        if (profileJoined) profileJoined.textContent = user.joined;
        if (profileStatus) profileStatus.textContent = user.status;
    }

    // Update chat header with user name
    function updateChatHeader(user) {
        const chatCustomerName = document.getElementById("chat-customer-name");
        if (chatCustomerName) chatCustomerName.textContent = user.name;
    }

    // Generate AI summary based on user data
    function generateAISummary(user) {
        const aiSummaryText = document.getElementById("ai-summary-text");
        
        if (aiSummaryText) {
            // Create a personalized summary based on user data
            const summary = `Customer ${user.name} is on the ${user.plan} and has been a member since ${user.joined}. `;
            aiSummaryText.textContent = summary;
        }
    }

    // End chat functionality
    function endChat() {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.classList.add("chat-ended");
        
        // Create content
        const content = document.createElement("div");
        content.classList.add("chat-ended-content");
        
        // Add message
        const heading = document.createElement("h2");
        heading.textContent = "Chat Ended";
        
        const message = document.createElement("p");
        message.textContent = "This chat session has been ended. You can start a new chat anytime.";
        
        // Add button to close overlay
        const closeButton = document.createElement("button");
        closeButton.textContent = "OK";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            // Redirect to dashboard or other page if needed
            window.location.href = "/";
        });
        
        // Assemble content
        content.appendChild(heading);
        content.appendChild(message);
        content.appendChild(closeButton);
        
        // Add content to overlay
        overlay.appendChild(content);
        
        // Add overlay to page
        document.body.appendChild(overlay);
        
        // Disable chat functionality
        chatInput.disabled = true;
        sendBtn.disabled = true;
        endChatBtn.disabled = true;
        
        // Change end chat button appearance
        endChatBtn.style.backgroundColor = "#95a5a6";
        endChatBtn.style.cursor = "not-allowed";
    }
});