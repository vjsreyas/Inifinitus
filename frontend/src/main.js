// minimal JS for form submit using fetch API
const form = document.getElementById('lead-form');
const submitBtn = document.getElementById('submit-btn');
const formMsg = document.getElementById('form-msg');


form.addEventListener('submit', async (e) => {
e.preventDefault();
submitBtn.disabled = true;
formMsg.textContent = 'Submitting...';


const payload = {
name: document.getElementById('name').value,
email: document.getElementById('email').value,
message: document.getElementById('message').value,
};


try {
const res = await fetch('/api/leads', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload),
});


const data = await res.json();
if (res.ok) {
formMsg.textContent = 'Thanks! We saved your info.';
form.reset();
} else {
formMsg.textContent = data.error || 'Submission failed';
}
} catch (err) {
formMsg.textContent = 'Network error';
} finally {
submitBtn.disabled = false;
}
});


// For development: intercept enter on the button as well
submitBtn.addEventListener('click', () => form.dispatchEvent(new Event('submit')));