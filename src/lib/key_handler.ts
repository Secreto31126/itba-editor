export default function keyevents(event: KeyboardEvent): 'save' | 'next' | 'previous' | null {
	// If user presses Ctrl+S, save the file
	if (event.ctrlKey && event.key === 's') {
		event.preventDefault();
		return 'save';
	}

	// If user presses Enter, save the file
	else if (event.key === 'Enter') {
		return 'save';
	}

	// If user press ctrl+shift+tab, go to previous file
	else if (event.ctrlKey && event.shiftKey && event.key === 'Tab') {
		event.preventDefault();
		return 'previous';
	}

	// If user press ctrl+tab, go to next file
	else if (event.ctrlKey && event.key === 'Tab') {
		event.preventDefault();
		return 'next';
	}

	return null;
}
