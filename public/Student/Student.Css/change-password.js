document.getElementById('changePasswordForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const responseMessage = document.getElementById('responseMessage');
    responseMessage.innerText = '';

    if (newPassword !== confirmPassword) {
        responseMessage.innerText = 'New password and confirmation do not match!';
        responseMessage.style.color = 'red';
        return;
    }

    try {
        responseMessage.innerText = 'Updating password...';
        const response = await fetch('http://localhost:3078/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            responseMessage.innerText = data.message;
            responseMessage.style.color = 'green';
        } else {
            responseMessage.innerText = data.message || 'Error updating password.';
            responseMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        responseMessage.innerText = 'An error occurred while updating the password.';
        responseMessage.style.color = 'red';
    }
});
