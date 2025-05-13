const resetButton = document.getElementById('reset_button');
if (resetButton) {
	resetButton.addEventListener('click', (event) => {
		if (
			confirm(
				'Are you sure you want to reset your portfolio? All data will be reset.'
			)
		) {
			alert('Portfolio Reset');
		} else {
			alert('Reset request cancelled.');
		}
	});
}
