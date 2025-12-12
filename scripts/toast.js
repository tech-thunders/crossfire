
const ToastManager = {
	container: null,

	init() {
		if (this.container) return;

		this.container = document.createElement("div");
		this.container.id = "toast-container";
		document.body.appendChild(this.container);
	},

	show(message, type = "success") {
		this.init();

		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;
		toast.innerHTML = `
            <span class="toast-icon">${type === "success" ? "✔️" : "⚠️"}</span>
            <span class="toast-text">${message}</span>
        `;

		this.container.appendChild(toast);

		// Animate in
		setTimeout(() => toast.classList.add("show"), 10);

		// Remove toast
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => toast.remove(), 300);
		}, 3000);
	},

	success(message) {
		this.show(message, "success");
	},

	error(message) {
		this.show(message, "error");
	},
};
