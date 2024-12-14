        document.getElementById("sidebarToggle").addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("show");
        });
    
document.addEventListener("DOMContentLoaded", function () {
    console.log("Scripts are running.");
  
    // Log the current localStorage content for debugging
    console.log("localStorage content:", window.localStorage);
  
    // Attempt to fetch 'facultyUsername' from localStorage
    const facultyUsername = localStorage.getItem("facultyUsername");
  
    if (facultyUsername) {
      console.log("Username found in localStorage:", facultyUsername);
      const usernameElement = document.getElementById("sidebarUserName");
  
      if (usernameElement) {
        usernameElement.innerText = facultyUsername; // Set the username in the DOM
        console.log("Username displayed on the dashboard.");
      } else {
        console.error("DOM element with ID 'sidebarUserName' not found.");
      }
    } else {
      console.error("No username found in localStorage.");
    }
  });
  