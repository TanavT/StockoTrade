const resetButton = document.getElementById('reset_button');
if (resetButton) {
	resetButton.addEventListener('click', (event) => {
		const ok = confirm(
			'Are you sure you want to reset your portfolio? All data will be reset.'
		);
		if (!ok) {
			event.preventDefault();
			alert('Reset request cancelled.');
		} else {
			alert('Portfolio Reset');
		}
	});
}
